/**
 * Configuration Manager
 * Handles scoring model configuration (criteria, ranks, weights)
 */

class ConfigManager {
    constructor() {
        this.config = this.loadConfig();
    }

    /**
     * Get default configuration
     */
    static getDefaultConfig() {
        return {
            version: '1.0.0',
            lastModified: new Date().toISOString(),

            criteria: [
                {
                    id: 'client_engagement',
                    name: 'Client Engagement',
                    description: 'Quality of client relationship and decision-making',
                    defaultWeight: 25,
                    scaleDescriptions: {
                        5: 'Highly Engaged: Responds within 24h, quick interviews',
                        4: 'Good: Responds within 48h, generally timely',
                        3: 'Moderate: Responds within a week, some delays',
                        2: 'Low: Slow responses (>1 week), minimal feedback',
                        1: 'Poor: Very unresponsive, ghosts candidates'
                    },
                    removable: false,
                    order: 1
                },
                {
                    id: 'search_difficulty',
                    name: 'Search Difficulty',
                    description: 'How hard it is to find qualified candidates',
                    defaultWeight: 25,
                    scaleDescriptions: {
                        5: 'Very Easy: Large talent pool, common skills',
                        4: 'Easy: Good talent pool, standard requirements',
                        3: 'Moderate: Limited pool, some specialized skills',
                        2: 'Difficult: Scarce talent, niche skills',
                        1: 'Very Difficult: Extremely rare skill combination'
                    },
                    removable: false,
                    order: 2
                },
                {
                    id: 'time_open',
                    name: 'Time Open',
                    description: 'How long the job has been open (urgency)',
                    defaultWeight: 25,
                    scaleDescriptions: {
                        5: 'Brand New: 0-14 days open',
                        4: 'Fresh: 15-30 days open',
                        3: 'Moderate: 31-60 days open',
                        2: 'Stale: 61-90 days open',
                        1: 'Very Stale: 90+ days open'
                    },
                    removable: false,
                    order: 3
                },
                {
                    id: 'fee_size',
                    name: 'Fee Size',
                    description: 'Revenue potential of the placement',
                    defaultWeight: 25,
                    scaleDescriptions: {
                        5: 'Excellent: £40k+ fee',
                        4: 'Good: £30k-40k fee',
                        3: 'Moderate: £20k-30k fee',
                        2: 'Low: £10k-20k fee',
                        1: 'Very Low: <£10k fee'
                    },
                    removable: false,
                    order: 4
                }
            ],

            ranks: [
                {
                    id: 'rank_a',
                    name: 'A',
                    minScore: 4.0,
                    maxScore: 5.0,
                    color: '#28a745',
                    cssClass: 'rank-A',
                    order: 1
                },
                {
                    id: 'rank_b',
                    name: 'B',
                    minScore: 2.5,
                    maxScore: 3.99,
                    color: '#ffc107',
                    cssClass: 'rank-B',
                    order: 2
                },
                {
                    id: 'rank_c',
                    name: 'C',
                    minScore: 1.0,
                    maxScore: 2.49,
                    color: '#dc3545',
                    cssClass: 'rank-C',
                    order: 3
                }
            ]
        };
    }

    /**
     * Load configuration from storage or use default
     */
    loadConfig() {
        const stored = StorageManager.load(STORAGE_KEYS.CONFIG);
        if (stored && stored.version) {
            return stored;
        }
        return ConfigManager.getDefaultConfig();
    }

    /**
     * Save current configuration to storage
     */
    saveConfig() {
        this.config.lastModified = new Date().toISOString();
        return StorageManager.save(STORAGE_KEYS.CONFIG, this.config);
    }

    /**
     * Get current configuration
     */
    getConfig() {
        return JSON.parse(JSON.stringify(this.config)); // Deep copy
    }

    /**
     * Reset to default configuration
     */
    resetToDefault() {
        if (confirm('Reset to default configuration? This will erase all custom criteria and ranks.')) {
            this.config = ConfigManager.getDefaultConfig();
            this.saveConfig();
            return true;
        }
        return false;
    }

    // --- CRITERIA MANAGEMENT ---

    /**
     * Get all criteria
     */
    getCriteria() {
        return [...this.config.criteria].sort((a, b) => a.order - b.order);
    }

    /**
     * Get criterion by ID
     */
    getCriterion(id) {
        return this.config.criteria.find(c => c.id === id);
    }

    /**
     * Add new criterion
     */
    addCriterion(name, description = '') {
        const id = 'custom_' + Date.now();
        const newCriterion = {
            id,
            name,
            description,
            defaultWeight: 0,
            scaleDescriptions: {
                5: 'Excellent',
                4: 'Good',
                3: 'Average',
                2: 'Below Average',
                1: 'Poor'
            },
            removable: true,
            order: this.config.criteria.length + 1
        };

        this.config.criteria.push(newCriterion);
        this.saveConfig();
        return newCriterion;
    }

    /**
     * Update criterion
     */
    updateCriterion(id, updates) {
        const index = this.config.criteria.findIndex(c => c.id === id);
        if (index === -1) return false;

        this.config.criteria[index] = {
            ...this.config.criteria[index],
            ...updates
        };

        this.saveConfig();
        return true;
    }

    /**
     * Delete criterion
     */
    deleteCriterion(id) {
        const criterion = this.getCriterion(id);
        if (!criterion) return false;

        if (!criterion.removable) {
            alert('Cannot delete default criteria');
            return false;
        }

        if (confirm(`Delete criterion "${criterion.name}"?`)) {
            this.config.criteria = this.config.criteria.filter(c => c.id !== id);
            this.saveConfig();
            return true;
        }

        return false;
    }

    /**
     * Update scale description for a criterion
     */
    updateScaleDescription(criterionId, score, description) {
        const criterion = this.getCriterion(criterionId);
        if (!criterion) return false;

        criterion.scaleDescriptions[score] = description;
        this.saveConfig();
        return true;
    }

    // --- RANK MANAGEMENT ---

    /**
     * Get all ranks sorted by order
     */
    getRanks() {
        return [...this.config.ranks].sort((a, b) => a.order - b.order);
    }

    /**
     * Get rank by ID
     */
    getRank(id) {
        return this.config.ranks.find(r => r.id === id);
    }

    /**
     * Add new rank
     */
    addRank(name, minScore, maxScore, color = '#667eea') {
        const id = 'rank_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();

        const newRank = {
            id,
            name,
            minScore: parseFloat(minScore),
            maxScore: parseFloat(maxScore),
            color,
            cssClass: `rank-${name}`,
            order: this.config.ranks.length + 1
        };

        this.config.ranks.push(newRank);
        this.saveConfig();
        return newRank;
    }

    /**
     * Update rank
     */
    updateRank(id, updates) {
        const index = this.config.ranks.findIndex(r => r.id === id);
        if (index === -1) return false;

        // Parse numeric values
        if (updates.minScore !== undefined) {
            updates.minScore = parseFloat(updates.minScore);
        }
        if (updates.maxScore !== undefined) {
            updates.maxScore = parseFloat(updates.maxScore);
        }

        this.config.ranks[index] = {
            ...this.config.ranks[index],
            ...updates
        };

        this.saveConfig();
        return true;
    }

    /**
     * Delete rank
     */
    deleteRank(id) {
        const rank = this.getRank(id);
        if (!rank) return false;

        if (this.config.ranks.length <= 2) {
            alert('Must have at least 2 ranks');
            return false;
        }

        if (confirm(`Delete rank "${rank.name}"?`)) {
            this.config.ranks = this.config.ranks.filter(r => r.id !== id);
            this.saveConfig();
            return true;
        }

        return false;
    }

    /**
     * Get rank for a given score
     */
    getRankForScore(score) {
        const sortedRanks = this.getRanks().sort((a, b) => b.minScore - a.minScore);

        for (const rank of sortedRanks) {
            if (score >= rank.minScore) {
                return rank;
            }
        }

        // Fallback to lowest rank
        return sortedRanks[sortedRanks.length - 1];
    }

    // --- WEIGHTS MANAGEMENT ---

    /**
     * Get default weights from criteria
     */
    getDefaultWeights() {
        const weights = {};
        this.config.criteria.forEach(c => {
            weights[c.id] = c.defaultWeight;
        });
        return weights;
    }

    /**
     * Load user's current weight adjustments
     */
    loadUserWeights() {
        const stored = StorageManager.load(STORAGE_KEYS.USER_WEIGHTS);
        if (stored) {
            // Ensure all current criteria have a weight
            const weights = this.getDefaultWeights();
            return { ...weights, ...stored };
        }
        return this.getDefaultWeights();
    }

    /**
     * Save user's weight adjustments
     */
    saveUserWeights(weights) {
        return StorageManager.save(STORAGE_KEYS.USER_WEIGHTS, weights);
    }

    /**
     * Validate that weights sum to 100
     */
    validateWeights(weights) {
        const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
        return Math.abs(total - 100) < 0.01;
    }

    // --- EXPORT/IMPORT ---

    /**
     * Export configuration as JSON file
     */
    exportConfig() {
        const dataStr = JSON.stringify(this.config, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `scoring-config-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Import configuration from JSON file
     */
    importConfig(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);

                    // Validate structure
                    if (!imported.criteria || !imported.ranks) {
                        throw new Error('Invalid configuration file');
                    }

                    if (confirm('Import this configuration? Current config will be overwritten.')) {
                        this.config = imported;
                        this.config.lastModified = new Date().toISOString();
                        this.saveConfig();
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                } catch (error) {
                    reject(new Error('Failed to parse configuration file: ' + error.message));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ConfigManager };
}
