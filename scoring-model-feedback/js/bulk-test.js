/**
 * Bulk Test Manager
 * Handles bulk job testing workflow
 */

class BulkTestManager {
    constructor(configManager) {
        this.configManager = configManager;
        this.session = this.loadSession();
    }

    /**
     * Create new bulk test session
     */
    static createSession() {
        return {
            id: 'session_' + Date.now(),
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            configSnapshot: null, // Will be set when session starts
            jobs: [],
            metadata: {
                fileName: '',
                uploadedAt: ''
            }
        };
    }

    /**
     * Load session from storage
     */
    loadSession() {
        const stored = StorageManager.load(STORAGE_KEYS.BULK_SESSION);
        if (stored && stored.jobs && stored.jobs.length > 0) {
            return stored;
        }
        return BulkTestManager.createSession();
    }

    /**
     * Save session to storage
     */
    saveSession() {
        this.session.lastModified = new Date().toISOString();
        return StorageManager.save(STORAGE_KEYS.BULK_SESSION, this.session);
    }

    /**
     * Get current session
     */
    getSession() {
        return this.session;
    }

    /**
     * Check if session has jobs
     */
    hasJobs() {
        return this.session.jobs && this.session.jobs.length > 0;
    }

    /**
     * Get number of jobs
     */
    getJobCount() {
        return this.session.jobs.length;
    }

    /**
     * Get number of complete jobs
     */
    getCompleteCount() {
        return this.session.jobs.filter(j => j.isComplete).length;
    }

    /**
     * Get completion percentage
     */
    getCompletionPercentage() {
        const total = this.getJobCount();
        if (total === 0) return 0;
        return Math.round((this.getCompleteCount() / total) * 100);
    }

    /**
     * Upload CSV and create jobs
     * @param {File} file - CSV file
     * @returns {Promise<number>} Number of jobs loaded
     */
    async uploadCSV(file) {
        try {
            // Validate file
            const validation = CSVParser.validateFile(file);
            if (!validation.valid) {
                throw new Error(validation.errors.join(', '));
            }

            // Show warnings
            if (validation.warnings.length > 0) {
                console.warn('CSV warnings:', validation.warnings);
            }

            // Parse CSV
            const jobs = await CSVParser.parseJobsCSV(file);

            // Create new session
            this.session = BulkTestManager.createSession();
            this.session.jobs = jobs;
            this.session.configSnapshot = this.configManager.getConfig();
            this.session.metadata.fileName = file.name;
            this.session.metadata.uploadedAt = new Date().toISOString();

            this.saveSession();

            return jobs.length;
        } catch (error) {
            throw new Error('Failed to upload CSV: ' + error.message);
        }
    }

    /**
     * Add a single job manually
     * @param {string} jobTitle - Job title
     * @param {string} company - Company name
     * @returns {boolean} Success
     */
    addManualJob(jobTitle, company) {
        try {
            // If no session exists, create one
            if (!this.session.jobs || this.session.jobs.length === 0) {
                this.session = BulkTestManager.createSession();
                this.session.configSnapshot = this.configManager.getConfig();
                this.session.metadata.fileName = 'Manual Entry';
                this.session.metadata.uploadedAt = new Date().toISOString();
            }

            // Create job object (same structure as CSV parser)
            const job = {
                id: 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                jobTitle: jobTitle,
                company: company,
                scores: {},
                userExpectedRank: null,
                isComplete: false,
                metadata: {
                    source: 'manual',
                    createdAt: new Date().toISOString(),
                    scoredAt: null
                }
            };

            // Add to session
            this.session.jobs.push(job);
            this.saveSession();

            return true;
        } catch (error) {
            console.error('Error adding manual job:', error);
            return false;
        }
    }

    /**
     * Get all jobs
     */
    getJobs() {
        return this.session.jobs || [];
    }

    /**
     * Get job by ID
     * @param {string} id - Job ID
     */
    getJob(id) {
        return this.session.jobs.find(j => j.id === id);
    }

    /**
     * Get job by index
     * @param {number} index - Job index
     */
    getJobByIndex(index) {
        return this.session.jobs[index];
    }

    /**
     * Update job
     * @param {string} id - Job ID
     * @param {Object} updates - Updates to apply
     */
    updateJob(id, updates) {
        const index = this.session.jobs.findIndex(j => j.id === id);
        if (index === -1) return false;

        this.session.jobs[index] = {
            ...this.session.jobs[index],
            ...updates
        };

        // Check if complete
        this.checkJobComplete(this.session.jobs[index]);

        this.saveSession();
        return true;
    }

    /**
     * Update job scores
     * @param {string} id - Job ID
     * @param {Object} scores - Scores object { criterionId: score }
     */
    updateJobScores(id, scores) {
        const job = this.getJob(id);
        if (!job) return false;

        job.scores = { ...job.scores, ...scores };
        this.checkJobComplete(job);
        this.saveSession();
        return true;
    }

    /**
     * Update job expected rank
     * @param {string} id - Job ID
     * @param {string} rankId - Rank ID
     */
    updateJobExpectedRank(id, rankId) {
        const job = this.getJob(id);
        if (!job) return false;

        job.userExpectedRank = rankId;
        this.checkJobComplete(job);
        this.saveSession();
        return true;
    }

    /**
     * Check if job is complete and update status
     * @param {Object} job - Job object
     */
    checkJobComplete(job) {
        const criteria = this.configManager.getCriteria();

        // Check all criteria have scores
        const hasAllScores = criteria.every(c => {
            const score = job.scores[c.id];
            return score !== undefined && score !== null && score >= 1 && score <= 5;
        });

        // Check expected rank is set
        const hasExpectedRank = job.userExpectedRank !== null;

        job.isComplete = hasAllScores && hasExpectedRank;

        if (job.isComplete && !job.metadata.scoredAt) {
            job.metadata.scoredAt = new Date().toISOString();
        }
    }

    /**
     * Get next incomplete job
     * @param {string} currentId - Current job ID (optional)
     * @returns {Object|null} Next job or null
     */
    getNextIncompleteJob(currentId = null) {
        let startIndex = 0;

        if (currentId) {
            const currentIndex = this.session.jobs.findIndex(j => j.id === currentId);
            if (currentIndex !== -1) {
                startIndex = currentIndex + 1;
            }
        }

        // Search from current position to end
        for (let i = startIndex; i < this.session.jobs.length; i++) {
            if (!this.session.jobs[i].isComplete) {
                return this.session.jobs[i];
            }
        }

        // Search from beginning to current position
        for (let i = 0; i < startIndex; i++) {
            if (!this.session.jobs[i].isComplete) {
                return this.session.jobs[i];
            }
        }

        return null;
    }

    /**
     * Clear current session
     */
    clearSession() {
        if (confirm('Clear all bulk test data? This cannot be undone.')) {
            this.session = BulkTestManager.createSession();
            this.saveSession();
            return true;
        }
        return false;
    }

    /**
     * Export bulk test data as CSV
     */
    exportBulkTestData() {
        const criteria = this.configManager.getCriteria();
        const ranks = this.configManager.getRanks();

        CSVParser.downloadBulkTestCSV(this.session.jobs, criteria, ranks);
    }

    /**
     * Get session statistics
     */
    getStats() {
        const total = this.getJobCount();
        const complete = this.getCompleteCount();
        const incomplete = total - complete;

        return {
            total,
            complete,
            incomplete,
            completionPercentage: this.getCompletionPercentage(),
            hasJobs: this.hasJobs(),
            fileName: this.session.metadata.fileName,
            uploadedAt: this.session.metadata.uploadedAt
        };
    }

    /**
     * Validate session config matches current config
     * @returns {Object} Validation result
     */
    validateConfigMatch() {
        if (!this.session.configSnapshot) {
            return { valid: true, warnings: [] };
        }

        const currentConfig = this.configManager.getConfig();
        const sessionConfig = this.session.configSnapshot;

        const warnings = [];

        // Check criteria count
        if (currentConfig.criteria.length !== sessionConfig.criteria.length) {
            warnings.push('Number of criteria has changed since session was created');
        }

        // Check criteria IDs
        const currentIds = currentConfig.criteria.map(c => c.id).sort();
        const sessionIds = sessionConfig.criteria.map(c => c.id).sort();

        if (JSON.stringify(currentIds) !== JSON.stringify(sessionIds)) {
            warnings.push('Criteria have been added/removed since session was created');
        }

        return {
            valid: warnings.length === 0,
            warnings
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BulkTestManager };
}
