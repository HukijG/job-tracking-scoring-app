/**
 * Storage Manager - LocalStorage Abstraction
 * Handles all localStorage operations with error handling
 */

const STORAGE_KEYS = {
    CONFIG: 'scoringModel_config_v1',
    BULK_SESSION: 'scoringModel_bulkSession_v1',
    ACTIVE_TAB: 'scoringModel_activeTab',
    USER_WEIGHTS: 'scoringModel_userWeights_v1'
};

class StorageManager {
    /**
     * Save data to localStorage
     * @param {string} key - Storage key
     * @param {any} data - Data to save
     * @returns {boolean} Success status
     */
    static save(key, data) {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error('Storage save failed:', error);

            if (error.name === 'QuotaExceededError') {
                alert('Storage quota exceeded. Please export your data and clear old sessions.');
                return false;
            }

            throw error;
        }
    }

    /**
     * Load data from localStorage
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} Stored data or default value
     */
    static load(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage load failed:', error);
            return defaultValue;
        }
    }

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     */
    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Storage remove failed:', error);
        }
    }

    /**
     * Clear all scoring model data
     */
    static clear() {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Storage clear failed:', error);
            return false;
        }
    }

    /**
     * Export all data as JSON object
     * @returns {Object} All stored data
     */
    static exportAll() {
        const data = {};
        Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
            data[name] = this.load(key);
        });
        return data;
    }

    /**
     * Import data from JSON object
     * @param {Object} data - Data to import
     * @returns {boolean} Success status
     */
    static importAll(data) {
        try {
            Object.entries(data).forEach(([name, value]) => {
                if (STORAGE_KEYS[name]) {
                    this.save(STORAGE_KEYS[name], value);
                }
            });
            return true;
        } catch (error) {
            console.error('Storage import failed:', error);
            return false;
        }
    }

    /**
     * Get storage usage statistics
     * @returns {Object} Storage stats
     */
    static getStorageStats() {
        let totalSize = 0;
        const stats = {};

        Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
            const item = localStorage.getItem(key);
            const size = item ? item.length : 0;
            stats[name] = {
                key,
                size,
                sizeKB: (size / 1024).toFixed(2)
            };
            totalSize += size;
        });

        // Estimate total localStorage usage (approximate)
        let allKeysSize = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            allKeysSize += key.length + (value ? value.length : 0);
        }

        return {
            scoringModelData: stats,
            totalScoringModelSize: totalSize,
            totalScoringModelSizeKB: (totalSize / 1024).toFixed(2),
            totalLocalStorageSize: allKeysSize,
            totalLocalStorageSizeKB: (allKeysSize / 1024).toFixed(2),
            estimatedQuotaMB: 5, // Most browsers allow ~5MB
            usagePercentage: ((allKeysSize / (5 * 1024 * 1024)) * 100).toFixed(2)
        };
    }

    /**
     * Check if storage is available
     * @returns {boolean}
     */
    static isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StorageManager, STORAGE_KEYS };
}
