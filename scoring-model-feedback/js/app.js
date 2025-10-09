/**
 * Main Application Logic
 * Coordinates UI, configuration, and scoring
 */

// Global instances
let configManager;
let scoringEngine;
let bulkTestManager;
let currentWeights = {};
let currentJobId = null; // Currently selected job in bulk test

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // Check localStorage availability
    if (!StorageManager.isAvailable()) {
        alert('LocalStorage is not available. Data will not be persisted.');
    }

    // Initialize managers
    configManager = new ConfigManager();
    scoringEngine = new ScoringEngine(configManager);
    bulkTestManager = new BulkTestManager(configManager);

    // Load user weights or defaults
    currentWeights = configManager.loadUserWeights();

    // Initialize UI
    initializeTabs();
    renderSingleTestTab();

    // Restore active tab
    const activeTab = StorageManager.load(STORAGE_KEYS.ACTIVE_TAB, 'single');
    switchTab(activeTab);
});

// --- TAB NAVIGATION ---

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${tabName}`);
    });

    // Save active tab
    StorageManager.save(STORAGE_KEYS.ACTIVE_TAB, tabName);

    // Render tab content
    switch (tabName) {
        case 'config':
            renderConfigTab();
            break;
        case 'single':
            renderSingleTestTab();
            break;
        case 'bulk':
            renderBulkTestTab();
            break;
        case 'report':
            renderReportTab();
            break;
    }
}

// --- CONFIGURATION TAB ---

function renderConfigTab() {
    const container = document.getElementById('config-content');
    const criteria = configManager.getCriteria();
    const ranks = configManager.getRanks();

    container.innerHTML = `
        <div class="config-section">
            <h3>
                Scoring Criteria
                <button class="btn-secondary" onclick="addNewCriterion()" style="padding: 6px 12px; font-size: 12px;">+ Add Criterion</button>
            </h3>
            <div id="criteria-list">
                ${criteria.map(c => renderCriterionEditor(c)).join('')}
            </div>
        </div>

        <div class="config-section">
            <h3>
                Ranking Thresholds
                <button class="btn-secondary" onclick="addNewRank()" style="padding: 6px 12px; font-size: 12px;">+ Add Rank</button>
            </h3>
            <div id="ranks-list">
                ${ranks.map(r => renderRankEditor(r)).join('')}
            </div>
        </div>

        <div class="action-buttons">
            <button class="btn-secondary" onclick="exportConfiguration()">Export Config</button>
            <button class="btn-secondary" onclick="importConfiguration()">Import Config</button>
            <button class="btn-secondary" onclick="resetConfiguration()">Reset to Default</button>
        </div>
    `;
}

function renderCriterionEditor(criterion) {
    return `
        <div class="criterion-item" data-criterion-id="${criterion.id}">
            <div class="criterion-header">
                <input type="text" class="criterion-name" value="${criterion.name}"
                       onchange="updateCriterionName('${criterion.id}', this.value)">
                ${criterion.removable ? `
                    <button class="btn-icon" onclick="deleteCriterionConfirm('${criterion.id}')" title="Delete">🗑️</button>
                ` : ''}
            </div>

            <textarea class="criterion-description"
                      placeholder="Brief description..."
                      onchange="updateCriterionDescription('${criterion.id}', this.value)">${criterion.description}</textarea>

            <div class="scale-editor">
                <h4>Rating Scale (1-5)</h4>
                ${[5, 4, 3, 2, 1].map(score => `
                    <div class="scale-item">
                        <label>${score} ${score === 5 ? '(Best)' : score === 1 ? '(Worst)' : ''}</label>
                        <input type="text" value="${criterion.scaleDescriptions[score] || ''}"
                               onchange="updateScaleDescription('${criterion.id}', ${score}, this.value)">
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderRankEditor(rank) {
    return `
        <div class="rank-item" data-rank-id="${rank.id}">
            <div class="rank-header">
                <input type="text" class="rank-name" value="${rank.name}" maxlength="3"
                       onchange="updateRankName('${rank.id}', this.value)">
                <input type="color" class="rank-color" value="${rank.color}"
                       onchange="updateRankColor('${rank.id}', this.value)">
                <button class="btn-icon" onclick="deleteRankConfirm('${rank.id}')" title="Delete">🗑️</button>
            </div>

            <div class="threshold-inputs">
                <label>
                    Min Score
                    <input type="number" value="${rank.minScore}" step="0.1" min="1" max="5"
                           onchange="updateRankThreshold('${rank.id}', 'minScore', this.value)">
                </label>
                <label>
                    Max Score
                    <input type="number" value="${rank.maxScore}" step="0.1" min="1" max="5"
                           onchange="updateRankThreshold('${rank.id}', 'maxScore', this.value)">
                </label>
            </div>
        </div>
    `;
}

// Criterion management functions
function addNewCriterion() {
    const name = prompt('Enter the name for the new criterion:');
    if (!name) return;

    const description = prompt('Enter a brief description (optional):') || '';

    configManager.addCriterion(name, description);
    renderConfigTab();
    renderSingleTestTab(); // Refresh test tab
}

function updateCriterionName(id, name) {
    configManager.updateCriterion(id, { name });
}

function updateCriterionDescription(id, description) {
    configManager.updateCriterion(id, { description });
}

function updateScaleDescription(criterionId, score, description) {
    configManager.updateScaleDescription(criterionId, score, description);
}

function deleteCriterionConfirm(id) {
    if (configManager.deleteCriterion(id)) {
        renderConfigTab();
        renderSingleTestTab(); // Refresh test tab
    }
}

// Rank management functions
function addNewRank() {
    const name = prompt('Enter rank name (e.g., S, A+):');
    if (!name) return;

    const minScore = prompt('Enter minimum score (1.0-5.0):', '3.0');
    const maxScore = prompt('Enter maximum score (1.0-5.0):', '4.0');

    if (minScore && maxScore) {
        configManager.addRank(name, minScore, maxScore);
        renderConfigTab();
    }
}

function updateRankName(id, name) {
    configManager.updateRank(id, { name, cssClass: `rank-${name}` });
}

function updateRankColor(id, color) {
    configManager.updateRank(id, { color });
}

function updateRankThreshold(id, field, value) {
    configManager.updateRank(id, { [field]: parseFloat(value) });
}

function deleteRankConfirm(id) {
    if (configManager.deleteRank(id)) {
        renderConfigTab();
    }
}

// Config export/import
function exportConfiguration() {
    configManager.exportConfig();
}

function importConfiguration() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const success = await configManager.importConfig(file);
                if (success) {
                    alert('Configuration imported successfully!');
                    renderConfigTab();
                    renderSingleTestTab();
                }
            } catch (error) {
                alert('Error importing configuration: ' + error.message);
            }
        }
    };
    input.click();
}

function resetConfiguration() {
    if (configManager.resetToDefault()) {
        currentWeights = configManager.getDefaultWeights();
        configManager.saveUserWeights(currentWeights);
        renderConfigTab();
        renderSingleTestTab();
    }
}

// --- SINGLE TEST TAB ---

function renderSingleTestTab() {
    const criteria = configManager.getCriteria();
    const ranks = configManager.getRanks();

    // Ensure weights exist for all criteria
    criteria.forEach(c => {
        if (!(c.id in currentWeights)) {
            currentWeights[c.id] = c.defaultWeight;
        }
    });

    const container = document.getElementById('single-test-content');

    container.innerHTML = `
        <div class="info-box">
            <strong>How it works:</strong> Each job is scored 1-5 on different factors. Each factor has a weight (% importance). The weighted average determines the final rank.
        </div>

        <div class="section">
            <div class="section-title">📊 Scoring Factors</div>
            <div class="section-subtitle">Adjust the weights below (must total 100%)</div>

            <div id="factors-container">
                ${criteria.map(c => renderFactorSlider(c)).join('')}
            </div>

            <div class="total-weight ${getTotalWeightClass()}" id="total-weight">
                <span>Total Weight:</span>
                <span id="total-value">${getTotalWeight()}%</span>
            </div>
        </div>

        <div class="section">
            <div class="section-title">🧪 Test Job Scoring</div>
            <div class="section-subtitle">Score a test job to see how the ranking works</div>

            <div class="job-test">
                <div class="job-input">
                    <label>Job Title (optional)</label>
                    <input type="text" id="job-title" placeholder="e.g., Senior Software Engineer">
                </div>

                <div id="score-inputs">
                    ${criteria.map(c => renderScoreInput(c)).join('')}
                </div>

                <button class="calculate-btn" onclick="calculateSingleJobRank()">Calculate Rank</button>

                <div id="result" style="display: none;"></div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">🎯 Rank Thresholds</div>
            <div class="factor">
                <div style="display: flex; gap: 20px; justify-content: space-around; text-align: center;">
                    ${ranks.map(r => `
                        <div>
                            <div class="result-rank ${r.cssClass}" style="font-size: 32px; color: ${r.color};">${r.name}</div>
                            <div style="font-size: 12px; color: #666;">Score ${r.minScore}-${r.maxScore}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderFactorSlider(criterion) {
    return `
        <div class="factor" data-factor-id="${criterion.id}">
            <div class="factor-header">
                <div class="factor-name">${criterion.name}</div>
                <div class="factor-weight" id="weight-${criterion.id}">${currentWeights[criterion.id]}%</div>
            </div>
            <div class="slider-container">
                <input type="range" min="0" max="100" value="${currentWeights[criterion.id]}"
                       oninput="updateWeight('${criterion.id}', this.value)">
            </div>
            <div class="factor-description">${criterion.description}</div>
            ${criterion.scaleDescriptions ? `
                <ul class="criteria-list">
                    ${Object.entries(criterion.scaleDescriptions)
                        .sort(([a], [b]) => b - a)
                        .map(([score, desc]) => `<li><strong>${score}:</strong> ${desc}</li>`)
                        .join('')}
                </ul>
            ` : ''}
        </div>
    `;
}

function renderScoreInput(criterion) {
    return `
        <div class="job-input">
            <label>${criterion.name} (1-5)</label>
            <input type="number" id="score-${criterion.id}" min="1" max="5" step="1" placeholder="Enter 1-5">
        </div>
    `;
}

function updateWeight(id, value) {
    currentWeights[id] = parseInt(value);

    // Update display
    const weightEl = document.getElementById(`weight-${id}`);
    if (weightEl) {
        weightEl.textContent = value + '%';
    }

    updateTotalWeight();

    // Save weights
    configManager.saveUserWeights(currentWeights);
}

function getTotalWeight() {
    return Object.values(currentWeights).reduce((sum, w) => sum + w, 0);
}

function getTotalWeightClass() {
    const total = getTotalWeight();
    if (total === 100) return 'valid';
    if (total > 0) return 'invalid';
    return '';
}

function updateTotalWeight() {
    const total = getTotalWeight();
    const valueEl = document.getElementById('total-value');
    const containerEl = document.getElementById('total-weight');

    if (valueEl) valueEl.textContent = total + '%';

    if (containerEl) {
        containerEl.className = 'total-weight ' + getTotalWeightClass();
    }
}

function calculateSingleJobRank() {
    const criteria = configManager.getCriteria();
    const scores = {};

    // Collect scores
    for (const criterion of criteria) {
        const input = document.getElementById(`score-${criterion.id}`);
        const score = parseFloat(input.value);

        if (isNaN(score) || score < 1 || score > 5) {
            alert(`Please enter a valid score (1-5) for ${criterion.name}`);
            return;
        }

        scores[criterion.id] = score;
    }

    // Calculate
    try {
        const result = scoringEngine.scoreJob(scores, currentWeights);
        displaySingleJobResult(result);
    } catch (error) {
        alert('Error calculating score: ' + error.message);
    }
}

function displaySingleJobResult(result) {
    const jobTitle = document.getElementById('job-title').value || 'Test Job';
    const resultEl = document.getElementById('result');

    resultEl.style.display = 'block';
    resultEl.innerHTML = `
        <div class="result-rank ${result.rank.cssClass}" style="color: ${result.rank.color};">
            ${result.rank.name}
        </div>
        <div class="result-score">Final Score: ${result.finalScore.toFixed(2)} / 5.0</div>
        <div style="font-size: 13px; color: #666; margin-bottom: 12px;">${jobTitle}</div>
        <div class="result-breakdown">
            <strong>Breakdown:</strong>
            ${result.breakdown.map(b => `
                <div style="margin-top: 6px; font-size: 11px;">
                    ${b.criterionName}: ${b.score} × ${b.weight}% = ${b.contribution.toFixed(2)}
                </div>
            `).join('')}
        </div>
    `;
}

// --- BULK TEST TAB ---

function renderBulkTestTab() {
    const container = document.getElementById('bulk-test-content');
    const stats = bulkTestManager.getStats();

    if (!stats.hasJobs) {
        renderBulkTestUpload(container);
    } else {
        renderBulkTestScoring(container, stats);
    }
}

function renderBulkTestUpload(container) {
    container.innerHTML = `
        <div class="info-box">
            <strong>Bulk Testing:</strong> Upload a CSV with job listings or add jobs manually to test the scoring model.
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div class="upload-area" id="csv-dropzone" onclick="triggerCSVUpload()">
                <p style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">📁 Upload CSV File</p>
                <p style="font-size: 13px; color: #666; margin-bottom: 15px;">Drag & drop or click to browse</p>
                <button class="btn-primary">Choose File</button>
                <input type="file" id="csv-input" accept=".csv" style="display: none;" onchange="handleCSVUpload(event)">
            </div>

            <div class="manual-entry-area">
                <p style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">✏️ Add Jobs Manually</p>
                <p style="font-size: 13px; color: #666; margin-bottom: 15px;">Enter jobs one at a time</p>
                <button class="btn-primary" onclick="showManualEntryForm()">Add Job</button>
            </div>
        </div>

        <div class="upload-info">
            <p><strong>CSV Required columns:</strong> <code>job_title</code>, <code>company</code></p>
            <p style="margin-top: 8px;">
                <a href="#" onclick="downloadSampleCSV(); return false;" style="color: #667eea;">Download sample CSV</a>
            </p>
        </div>

        <!-- Manual Entry Form (hidden by default) -->
        <div id="manual-entry-form" style="display: none; margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px; border: 2px solid #667eea;">
            <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 15px;">Add Job Manually</h3>
            <div class="job-input">
                <label>Job Title *</label>
                <input type="text" id="manual-job-title" placeholder="e.g., Senior Software Engineer">
            </div>
            <div class="job-input">
                <label>Company *</label>
                <input type="text" id="manual-company" placeholder="e.g., Tech Corp">
            </div>
            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button class="btn-primary" onclick="addManualJob()">Add Job</button>
                <button class="btn-secondary" onclick="hideManualEntryForm()">Cancel</button>
            </div>
        </div>
    `;

    // Add drag and drop handlers
    const dropzone = document.getElementById('csv-dropzone');
    if (dropzone) {
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.style.background = '#e3f2fd';
            dropzone.style.borderColor = '#5568d3';
        });

        dropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropzone.style.background = '#f8f9fa';
            dropzone.style.borderColor = '#667eea';
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.style.background = '#f8f9fa';
            dropzone.style.borderColor = '#667eea';

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleCSVFile(files[0]);
            }
        });
    }
}

function renderBulkTestScoring(container, stats) {
    const criteria = configManager.getCriteria();
    const ranks = configManager.getRanks();
    const jobs = bulkTestManager.getJobs();

    // Get current job or first job
    let currentJob = currentJobId ? bulkTestManager.getJob(currentJobId) : null;
    if (!currentJob && jobs.length > 0) {
        currentJob = jobs[0];
        currentJobId = currentJob.id;
    }

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <div class="info-box" style="flex: 1; margin-bottom: 0; margin-right: 15px;">
                <strong>${stats.fileName}</strong> • ${stats.complete}/${stats.total} jobs completed (${stats.completionPercentage}%)
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn-secondary" onclick="exportBulkTestData()" style="padding: 8px 16px; font-size: 13px;">Export Data</button>
                <button class="btn-secondary" onclick="clearBulkTest()" style="padding: 8px 16px; font-size: 13px;">Clear All</button>
            </div>
        </div>

        <div class="bulk-scoring-container">
            <!-- Left Panel: Criteria Reference -->
            <div class="criteria-reference">
                <h3>Scoring Reference</h3>
                ${criteria.map(c => renderCriteriaReference(c)).join('')}
            </div>

            <!-- Right Panel: Job Scoring -->
            <div class="job-scoring-area">
                <div class="job-selector">
                    <select id="job-select" onchange="selectJob(this.value)">
                        ${jobs.map((j, idx) => `
                            <option value="${j.id}" ${j.id === currentJob.id ? 'selected' : ''}>
                                ${idx + 1}. ${j.jobTitle} @ ${j.company} ${j.isComplete ? '✓' : ''}
                            </option>
                        `).join('')}
                    </select>
                    <span class="progress-badge">${stats.complete}/${stats.total} complete</span>
                </div>

                ${currentJob ? renderJobForm(currentJob, criteria, ranks) : '<p>No job selected</p>'}
            </div>
        </div>
    `;
}

function renderCriteriaReference(criterion) {
    return `
        <div class="criterion-ref" id="ref-${criterion.id}">
            <h4 onclick="toggleCriterionRef('${criterion.id}')">${criterion.name}</h4>
            <ul class="scale-ref">
                ${Object.entries(criterion.scaleDescriptions)
                    .sort(([a], [b]) => b - a)
                    .map(([score, desc]) => `<li><strong>${score}:</strong> ${desc}</li>`)
                    .join('')}
            </ul>
        </div>
    `;
}

function renderJobForm(job, criteria, ranks) {
    return `
        <div class="job-form">
            <h3>${job.jobTitle} @ ${job.company}</h3>

            <div class="score-inputs">
                ${criteria.map(c => `
                    <div class="score-input-group">
                        <label>${c.name} (1-5)</label>
                        <input type="number"
                               id="bulk-score-${c.id}"
                               min="1"
                               max="5"
                               step="1"
                               value="${job.scores[c.id] || ''}"
                               onchange="updateJobScore('${c.id}', this.value)"
                               placeholder="1-5">
                    </div>
                `).join('')}
            </div>

            <div class="rank-prediction">
                <label>Your Expected Rank:</label>
                <div class="rank-buttons">
                    ${ranks.map(r => `
                        <button class="rank-btn ${job.userExpectedRank === r.id ? 'selected' : ''}"
                                onclick="selectExpectedRank('${r.id}')"
                                style="color: ${job.userExpectedRank === r.id ? 'white' : r.color}; ${job.userExpectedRank === r.id ? `background: ${r.color}; border-color: ${r.color};` : ''}">
                            ${r.name}
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="form-actions">
                <button class="btn-secondary" onclick="saveCurrentJob()">Save</button>
                <button class="btn-primary" onclick="saveAndNextJob()">Save & Next</button>
            </div>

            ${job.isComplete ? '<div style="margin-top: 15px; padding: 10px; background: #d4edda; border-radius: 6px; color: #155724; font-size: 12px; text-align: center;">✓ Job Complete</div>' : ''}
        </div>
    `;
}

// Bulk test functions
function triggerCSVUpload() {
    document.getElementById('csv-input').click();
}

function handleCSVUpload(event) {
    const file = event.target.files[0];
    if (file) {
        handleCSVFile(file);
    }
}

async function handleCSVFile(file) {
    try {
        const jobCount = await bulkTestManager.uploadCSV(file);
        alert(`Successfully loaded ${jobCount} jobs from CSV!`);
        renderBulkTestTab();
    } catch (error) {
        alert('Error uploading CSV: ' + error.message);
    }
}

function downloadSampleCSV() {
    CSVParser.downloadSampleCSV();
}

function showManualEntryForm() {
    const form = document.getElementById('manual-entry-form');
    if (form) {
        form.style.display = 'block';
        document.getElementById('manual-job-title').focus();
    }
}

function hideManualEntryForm() {
    const form = document.getElementById('manual-entry-form');
    if (form) {
        form.style.display = 'none';
        document.getElementById('manual-job-title').value = '';
        document.getElementById('manual-company').value = '';
    }
}

function addManualJob() {
    const jobTitle = document.getElementById('manual-job-title').value.trim();
    const company = document.getElementById('manual-company').value.trim();

    if (!jobTitle || !company) {
        alert('Please enter both job title and company');
        return;
    }

    // Add job to bulk test manager
    const success = bulkTestManager.addManualJob(jobTitle, company);

    if (success) {
        // Clear form
        document.getElementById('manual-job-title').value = '';
        document.getElementById('manual-company').value = '';

        // Re-render to show the job
        renderBulkTestTab();

        // Show success message
        alert(`Added "${jobTitle}" at ${company}`);
    } else {
        alert('Failed to add job. Please try again.');
    }
}

function selectJob(jobId) {
    currentJobId = jobId;
    renderBulkTestTab();
}

function updateJobScore(criterionId, value) {
    if (!currentJobId) return;

    const score = parseInt(value);
    if (isNaN(score) || score < 1 || score > 5) return;

    const job = bulkTestManager.getJob(currentJobId);
    job.scores[criterionId] = score;
    bulkTestManager.checkJobComplete(job);
    bulkTestManager.saveSession();

    // Update completion badge
    const stats = bulkTestManager.getStats();
    const badge = document.querySelector('.progress-badge');
    if (badge) {
        badge.textContent = `${stats.complete}/${stats.total} complete`;
    }

    // Update job option checkmark
    const option = document.querySelector(`#job-select option[value="${currentJobId}"]`);
    if (option && job.isComplete) {
        const text = option.textContent;
        if (!text.includes('✓')) {
            option.textContent = text + ' ✓';
        }
    }

    // Show complete message if job is now complete
    if (job.isComplete) {
        const form = document.querySelector('.job-form');
        if (form && !form.querySelector('.complete-message')) {
            const msg = document.createElement('div');
            msg.className = 'complete-message';
            msg.style = 'margin-top: 15px; padding: 10px; background: #d4edda; border-radius: 6px; color: #155724; font-size: 12px; text-align: center;';
            msg.textContent = '✓ Job Complete';
            form.appendChild(msg);
        }
    }
}

function selectExpectedRank(rankId) {
    if (!currentJobId) return;

    bulkTestManager.updateJobExpectedRank(currentJobId, rankId);

    // Re-render rank buttons
    renderBulkTestTab();
}

function saveCurrentJob() {
    const job = bulkTestManager.getJob(currentJobId);
    if (job && job.isComplete) {
        alert('Job saved!');
    } else {
        alert('Please complete all scores and select an expected rank.');
    }
}

function saveAndNextJob() {
    const currentJob = bulkTestManager.getJob(currentJobId);

    if (!currentJob.isComplete) {
        alert('Please complete all scores and select an expected rank before moving to the next job.');
        return;
    }

    // Find next incomplete job
    const nextJob = bulkTestManager.getNextIncompleteJob(currentJobId);

    if (nextJob) {
        currentJobId = nextJob.id;
        renderBulkTestTab();
    } else {
        alert('All jobs completed! Go to the Validation tab to see results.');
    }
}

function exportBulkTestData() {
    bulkTestManager.exportBulkTestData();
}

function clearBulkTest() {
    if (bulkTestManager.clearSession()) {
        currentJobId = null;
        renderBulkTestTab();
    }
}

function toggleCriterionRef(criterionId) {
    const element = document.getElementById(`ref-${criterionId}`);
    if (element) {
        element.classList.toggle('collapsed');
    }
}

// --- REPORT TAB ---

let validationReport = null;
let reportFilter = 'all'; // 'all', 'matches', 'mismatches'
let reportSortBy = 'title'; // 'title', 'company', 'score', 'match'
let reportSortDir = 'asc'; // 'asc', 'desc'

function renderReportTab() {
    const container = document.getElementById('report-content');
    const stats = bulkTestManager.getStats();

    // Check if we have jobs
    if (!stats.hasJobs) {
        container.innerHTML = `
            <div class="info-box">
                <strong>Validation Report:</strong> See how well the model's rankings match your expectations.
                <br><br>
                <em>No bulk test data available. Upload jobs in the Bulk Test tab first.</em>
            </div>
        `;
        return;
    }

    // Check if all jobs are complete
    if (stats.complete === 0) {
        container.innerHTML = `
            <div class="info-box">
                <strong>Validation Report:</strong> See how well the model's rankings match your expectations.
                <br><br>
                <em>No completed jobs yet. Score jobs in the Bulk Test tab first.</em>
            </div>
        `;
        return;
    }

    // Generate validation report
    const jobs = bulkTestManager.getJobs();
    const scoredJobs = scoringEngine.scoreJobs(jobs, currentWeights);
    validationReport = scoringEngine.generateValidationReport(scoredJobs);

    renderValidationReport(container, validationReport);
}

function renderValidationReport(container, report) {
    const summary = report.summary;

    container.innerHTML = `
        <div class="validation-header">
            <h2>Validation Report</h2>
            <div class="header-actions">
                <button class="btn-secondary" onclick="exportValidationReport()">Export CSV</button>
                <button class="btn-secondary" onclick="switchTab('single')">Tune Weights</button>
            </div>
        </div>

        <!-- Summary Cards -->
        <div class="summary-cards">
            <div class="summary-card match-card">
                <div class="card-title">Match Rate</div>
                <div class="card-value">${summary.matchPercentage.toFixed(1)}%</div>
                <div class="card-subtitle">${summary.matchedJobs}/${summary.completeJobs} jobs</div>
            </div>

            <div class="summary-card">
                <div class="card-title">Total Jobs</div>
                <div class="card-value">${summary.totalJobs}</div>
                <div class="card-subtitle">${summary.completeJobs} complete, ${summary.incompleteJobs} incomplete</div>
            </div>

            <div class="summary-card ${summary.mismatchedJobs > 0 ? 'mismatch-card' : ''}">
                <div class="card-title">Mismatches</div>
                <div class="card-value">${summary.mismatchedJobs}</div>
                <div class="card-subtitle">${summary.mismatchedJobs > 0 ? 'Review below' : 'Perfect!'}</div>
            </div>
        </div>

        ${summary.incompleteJobs > 0 ? `
            <div class="info-box" style="background: #fff3cd; border-color: #ffc107; color: #856404;">
                <strong>⚠️ ${summary.incompleteJobs} incomplete job(s)</strong> - These are excluded from validation.
                <a href="#" onclick="switchTab('bulk'); return false;" style="color: #856404; text-decoration: underline;">Complete them in Bulk Test tab</a>
            </div>
        ` : ''}

        <!-- Filter and Sort Controls -->
        <div class="report-controls">
            <div class="filter-group">
                <label>Filter:</label>
                <button class="filter-btn ${reportFilter === 'all' ? 'active' : ''}" onclick="setReportFilter('all')">
                    All (${summary.completeJobs})
                </button>
                <button class="filter-btn ${reportFilter === 'matches' ? 'active' : ''}" onclick="setReportFilter('matches')">
                    Matches (${summary.matchedJobs})
                </button>
                <button class="filter-btn ${reportFilter === 'mismatches' ? 'active' : ''}" onclick="setReportFilter('mismatches')">
                    Mismatches (${summary.mismatchedJobs})
                </button>
            </div>

            <div class="sort-group">
                <label>Sort by:</label>
                <select id="sort-select" onchange="setReportSort(this.value)">
                    <option value="title" ${reportSortBy === 'title' ? 'selected' : ''}>Job Title</option>
                    <option value="company" ${reportSortBy === 'company' ? 'selected' : ''}>Company</option>
                    <option value="score" ${reportSortBy === 'score' ? 'selected' : ''}>Model Score</option>
                    <option value="match" ${reportSortBy === 'match' ? 'selected' : ''}>Match Status</option>
                </select>
                <button class="sort-dir-btn" onclick="toggleReportSortDir()" title="Toggle sort direction">
                    ${reportSortDir === 'asc' ? '↑' : '↓'}
                </button>
            </div>
        </div>

        <!-- Jobs Table -->
        <div class="jobs-table-container">
            ${renderJobsTable(report)}
        </div>
    `;
}

function renderJobsTable(report) {
    const criteria = configManager.getCriteria();
    const ranks = configManager.getRanks();

    // Filter jobs
    let jobs;
    if (reportFilter === 'matches') {
        jobs = report.matches;
    } else if (reportFilter === 'mismatches') {
        jobs = report.mismatches;
    } else {
        jobs = [...report.matches, ...report.mismatches];
    }

    // Sort jobs
    jobs = sortJobs(jobs);

    if (jobs.length === 0) {
        return `<div style="text-align: center; padding: 40px; color: #666;">No jobs to display</div>`;
    }

    return `
        <table class="validation-table">
            <thead>
                <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Your Rank</th>
                    <th>Model Rank</th>
                    <th>Score</th>
                    <th>Match</th>
                    <th>Details</th>
                </tr>
            </thead>
            <tbody>
                ${jobs.map(job => renderJobRow(job, criteria, ranks)).join('')}
            </tbody>
        </table>
    `;
}

function renderJobRow(job, criteria, ranks) {
    const userRank = ranks.find(r => r.id === job.userExpectedRank);
    const modelRank = ranks.find(r => r.id === job.calculatedRank);
    const matchIcon = job.matched ? '✓' : '✗';
    const matchClass = job.matched ? 'match-yes' : 'match-no';

    return `
        <tr class="${job.matched ? 'matched-row' : 'mismatched-row'}">
            <td>${job.jobTitle}</td>
            <td>${job.company}</td>
            <td>
                <span class="rank-badge" style="background: ${userRank.color}; color: white;">
                    ${userRank.name}
                </span>
            </td>
            <td>
                <span class="rank-badge" style="background: ${modelRank.color}; color: white;">
                    ${modelRank.name}
                </span>
            </td>
            <td>${job.calculatedScore.toFixed(2)}</td>
            <td class="${matchClass}">${matchIcon}</td>
            <td>
                <button class="btn-details" onclick="toggleJobDetails('${job.id}')">View</button>
            </td>
        </tr>
        <tr id="details-${job.id}" class="details-row" style="display: none;">
            <td colspan="7">
                ${renderJobDetails(job, criteria)}
            </td>
        </tr>
    `;
}

function renderJobDetails(job, criteria) {
    return `
        <div class="job-details">
            <h4>${job.jobTitle} @ ${job.company}</h4>
            <div class="details-grid">
                <div class="details-section">
                    <strong>Individual Scores:</strong>
                    <ul>
                        ${criteria.map(c => `
                            <li>${c.name}: ${job.scores[c.id]}/5</li>
                        `).join('')}
                    </ul>
                </div>
                <div class="details-section">
                    <strong>Score Breakdown:</strong>
                    <ul>
                        ${job.breakdown.map(b => `
                            <li>${b.criterionName}: ${b.score} × ${b.weight}% = ${b.contribution.toFixed(2)}</li>
                        `).join('')}
                    </ul>
                </div>
                <div class="details-section">
                    <strong>Final Calculation:</strong>
                    <p>Weighted Score: ${job.calculatedScore.toFixed(2)} / 5.0</p>
                    <p>Model Rank: ${job.calculatedRankName}</p>
                    <p>Expected Rank: ${job.userExpectedRank}</p>
                    <p>Match: ${job.matched ? 'Yes ✓' : 'No ✗'}</p>
                </div>
            </div>
        </div>
    `;
}

function sortJobs(jobs) {
    const sorted = [...jobs];

    sorted.sort((a, b) => {
        let compareA, compareB;

        switch (reportSortBy) {
            case 'title':
                compareA = a.jobTitle.toLowerCase();
                compareB = b.jobTitle.toLowerCase();
                break;
            case 'company':
                compareA = a.company.toLowerCase();
                compareB = b.company.toLowerCase();
                break;
            case 'score':
                compareA = a.calculatedScore;
                compareB = b.calculatedScore;
                break;
            case 'match':
                compareA = a.matched ? 1 : 0;
                compareB = b.matched ? 1 : 0;
                break;
            default:
                return 0;
        }

        if (compareA < compareB) return reportSortDir === 'asc' ? -1 : 1;
        if (compareA > compareB) return reportSortDir === 'asc' ? 1 : -1;
        return 0;
    });

    return sorted;
}

function setReportFilter(filter) {
    reportFilter = filter;
    renderReportTab();
}

function setReportSort(sortBy) {
    reportSortBy = sortBy;
    renderReportTab();
}

function toggleReportSortDir() {
    reportSortDir = reportSortDir === 'asc' ? 'desc' : 'asc';
    renderReportTab();
}

function toggleJobDetails(jobId) {
    const row = document.getElementById(`details-${jobId}`);
    if (row) {
        row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
    }
}

function exportValidationReport() {
    if (!validationReport) {
        alert('No validation report available');
        return;
    }

    scoringEngine.downloadValidationCSV(validationReport);
}
