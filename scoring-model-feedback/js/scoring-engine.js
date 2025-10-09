/**
 * Scoring Engine
 * Handles score calculations and ranking logic
 */

class ScoringEngine {
    constructor(configManager) {
        this.configManager = configManager;
    }

    /**
     * Calculate weighted score for a job
     * @param {Object} scores - { criterionId: score (1-5) }
     * @param {Object} weights - { criterionId: weight (0-100) }
     * @returns {number} Final score (1.0-5.0)
     */
    calculateScore(scores, weights) {
        let weightedSum = 0;
        let totalWeight = 0;

        Object.entries(scores).forEach(([criterionId, score]) => {
            const weight = weights[criterionId] || 0;
            weightedSum += score * weight;
            totalWeight += weight;
        });

        if (totalWeight === 0) {
            throw new Error('Total weight cannot be zero');
        }

        // Weighted average: (sum of score*weight) / total weight * 100
        // Since weights are percentages (0-100), divide by 100
        return weightedSum / totalWeight;
    }

    /**
     * Get rank for a given score
     * @param {number} score - Final score (1.0-5.0)
     * @returns {Object} Rank object
     */
    getRankForScore(score) {
        return this.configManager.getRankForScore(score);
    }

    /**
     * Calculate score and rank for a single job
     * @param {Object} scores - { criterionId: score }
     * @param {Object} weights - { criterionId: weight }
     * @returns {Object} { score, rank, breakdown }
     */
    scoreJob(scores, weights) {
        // Validate weights
        if (!this.configManager.validateWeights(weights)) {
            throw new Error('Weights must sum to 100%');
        }

        // Validate all criteria have scores
        const criteria = this.configManager.getCriteria();
        const missingScores = criteria.filter(c => !(c.id in scores));
        if (missingScores.length > 0) {
            throw new Error(`Missing scores for: ${missingScores.map(c => c.name).join(', ')}`);
        }

        // Calculate weighted score
        const finalScore = this.calculateScore(scores, weights);
        const rank = this.getRankForScore(finalScore);

        // Generate breakdown
        const breakdown = [];
        criteria.forEach(criterion => {
            const score = scores[criterion.id];
            const weight = weights[criterion.id];
            const contribution = (score * weight) / 100;

            breakdown.push({
                criterionId: criterion.id,
                criterionName: criterion.name,
                score,
                weight,
                contribution
            });
        });

        return {
            finalScore,
            rank,
            breakdown
        };
    }

    /**
     * Score multiple jobs (bulk test)
     * @param {Array} jobs - Array of job objects with scores
     * @param {Object} weights - { criterionId: weight }
     * @returns {Array} Scored jobs with results
     */
    scoreJobs(jobs, weights) {
        if (!this.configManager.validateWeights(weights)) {
            throw new Error('Weights must sum to 100%');
        }

        return jobs.map(job => {
            if (!job.isComplete) {
                return {
                    ...job,
                    calculatedScore: null,
                    calculatedRank: null,
                    matched: null
                };
            }

            try {
                const result = this.scoreJob(job.scores, weights);

                return {
                    ...job,
                    calculatedScore: result.finalScore,
                    calculatedRank: result.rank.id,
                    calculatedRankName: result.rank.name,
                    matched: job.userExpectedRank === result.rank.id,
                    breakdown: result.breakdown
                };
            } catch (error) {
                console.error(`Error scoring job ${job.id}:`, error);
                return {
                    ...job,
                    calculatedScore: null,
                    calculatedRank: null,
                    matched: null,
                    error: error.message
                };
            }
        });
    }

    /**
     * Generate validation report for bulk test
     * @param {Array} scoredJobs - Jobs that have been scored
     * @returns {Object} Validation report
     */
    generateValidationReport(scoredJobs) {
        const complete = scoredJobs.filter(j => j.isComplete && j.calculatedScore !== null);
        const incomplete = scoredJobs.filter(j => !j.isComplete);
        const errors = scoredJobs.filter(j => j.isComplete && j.error);

        const matched = complete.filter(j => j.matched);
        const mismatched = complete.filter(j => !j.matched);

        const matchPercentage = complete.length > 0
            ? (matched.length / complete.length) * 100
            : 0;

        return {
            generatedAt: new Date().toISOString(),
            summary: {
                totalJobs: scoredJobs.length,
                completeJobs: complete.length,
                incompleteJobs: incomplete.length,
                errorJobs: errors.length,
                matchedJobs: matched.length,
                mismatchedJobs: mismatched.length,
                matchPercentage: matchPercentage
            },
            matches: matched,
            mismatches: mismatched,
            incomplete: incomplete,
            errors: errors
        };
    }

    /**
     * Export validation report as CSV
     * @param {Object} report - Validation report
     * @returns {string} CSV content
     */
    exportValidationCSV(report) {
        const config = this.configManager.getConfig();

        // Build header
        const criteriaHeaders = config.criteria.map(c => c.name).join(',');
        const header = `Job Title,Company,${criteriaHeaders},User Rank,Model Rank,Model Score,Match\n`;

        // Build rows
        const allJobs = [...report.matches, ...report.mismatches];
        const rows = allJobs.map(job => {
            const scores = config.criteria
                .map(c => job.scores[c.id] || '')
                .join(',');

            const match = job.matched ? 'Yes' : 'No';
            const modelScore = job.calculatedScore ? job.calculatedScore.toFixed(2) : '';

            return `"${job.jobTitle}","${job.company}",${scores},${job.userExpectedRank || ''},${job.calculatedRankName || ''},${modelScore},${match}`;
        }).join('\n');

        return header + rows;
    }

    /**
     * Download validation report as CSV file
     * @param {Object} report - Validation report
     */
    downloadValidationCSV(report) {
        const csv = this.exportValidationCSV(report);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `validation-report-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ScoringEngine };
}
