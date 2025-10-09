/**
 * CSV Parser Utilities
 * Handles CSV parsing, validation, and export
 */

class CSVParser {
    /**
     * Parse CSV file to job objects
     * @param {File} file - CSV file
     * @returns {Promise<Array>} Array of job objects
     */
    static parseJobsCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    const jobs = this.parseCSVText(text);
                    resolve(jobs);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    /**
     * Parse CSV text to job objects
     * @param {string} text - CSV text content
     * @returns {Array} Array of job objects
     */
    static parseCSVText(text) {
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

        if (lines.length === 0) {
            throw new Error('CSV file is empty');
        }

        // Parse header
        const headers = this.parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());

        // Validate required columns
        const requiredCols = ['job_title', 'company'];
        const missingCols = requiredCols.filter(col => !headers.includes(col));

        if (missingCols.length > 0) {
            throw new Error(`Missing required columns: ${missingCols.join(', ')}`);
        }

        // Get column indices
        const titleIdx = headers.indexOf('job_title');
        const companyIdx = headers.indexOf('company');

        // Parse data rows
        const jobs = lines.slice(1).map((line, index) => {
            const values = this.parseCSVLine(line);

            return {
                id: `job_${Date.now()}_${index}`,
                jobTitle: values[titleIdx]?.trim() || '',
                company: values[companyIdx]?.trim() || '',
                scores: {},
                userExpectedRank: null,
                isComplete: false,
                metadata: {
                    scoredAt: null,
                    notes: ''
                }
            };
        }).filter(job => job.jobTitle && job.company); // Remove invalid rows

        if (jobs.length === 0) {
            throw new Error('No valid job records found in CSV');
        }

        if (jobs.length > 100) {
            console.warn(`Large CSV detected: ${jobs.length} jobs. Performance may be impacted.`);
        }

        return jobs;
    }

    /**
     * Parse CSV line handling quoted values
     * @param {string} line - CSV line
     * @returns {Array} Array of values
     */
    static parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current);
        return result;
    }

    /**
     * Generate sample CSV for download
     * @returns {string} Sample CSV content
     */
    static generateSampleCSV() {
        return `job_title,company
Senior Software Engineer,TechCo Inc
Marketing Manager,BrandCorp
Data Analyst,Analytics Ltd
Product Designer,DesignHub
Sales Executive,SalesPro
DevOps Engineer,CloudSystems
HR Manager,PeopleFirst
Financial Analyst,MoneyMatters
Content Writer,MediaGroup
Business Analyst,ConsultCorp
UX Researcher,UserFirst
Project Manager,DeliverIt
Quality Assurance Lead,TestWorks
Customer Success Manager,ClientCare
Operations Manager,LogisticsPlus
Graphic Designer,CreativeStudio
Account Executive,SalesForce Pro
Software Architect,BuildRight
Recruiter,TalentSource
Legal Counsel,LawFirm LLP`;
    }

    /**
     * Download sample CSV file
     */
    static downloadSampleCSV() {
        const sample = this.generateSampleCSV();
        const blob = new Blob([sample], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sample-jobs.csv';
        link.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Export bulk test jobs to CSV
     * @param {Array} jobs - Array of job objects with scores
     * @param {Array} criteria - Scoring criteria
     * @param {Array} ranks - Available ranks
     * @returns {string} CSV content
     */
    static exportBulkTestCSV(jobs, criteria, ranks) {
        // Build header
        const criteriaHeaders = criteria.map(c => c.name).join(',');
        const header = `Job Title,Company,${criteriaHeaders},Expected Rank,Scored\n`;

        // Build rows
        const rows = jobs.map(job => {
            const scores = criteria
                .map(c => job.scores[c.id] || '')
                .join(',');

            const expectedRank = job.userExpectedRank
                ? ranks.find(r => r.id === job.userExpectedRank)?.name || ''
                : '';

            const scored = job.isComplete ? 'Yes' : 'No';

            return `"${job.jobTitle}","${job.company}",${scores},"${expectedRank}",${scored}`;
        }).join('\n');

        return header + rows;
    }

    /**
     * Download bulk test jobs as CSV
     * @param {Array} jobs - Array of job objects
     * @param {Array} criteria - Scoring criteria
     * @param {Array} ranks - Available ranks
     */
    static downloadBulkTestCSV(jobs, criteria, ranks) {
        const csv = this.exportBulkTestCSV(jobs, criteria, ranks);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bulk-test-data-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Validate CSV file before upload
     * @param {File} file - File to validate
     * @returns {Object} Validation result
     */
    static validateFile(file) {
        const errors = [];
        const warnings = [];

        // Check file type
        if (!file.name.endsWith('.csv')) {
            errors.push('File must be a CSV (.csv extension)');
        }

        // Check file size (max 1MB)
        if (file.size > 1024 * 1024) {
            warnings.push('Large file detected (>1MB). Processing may be slow.');
        }

        // Check if empty
        if (file.size === 0) {
            errors.push('File is empty');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CSVParser };
}
