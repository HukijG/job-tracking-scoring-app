# Implementation Guide - Scoring Model Feedback Enhancements

## Architecture Decision: Single-Page vs Multi-Page

### Recommendation: **Enhanced Single-Page Application (SPA)**

**Rationale:**
- Current implementation is already single-page HTML
- Simpler state management without page transitions
- Better for localStorage persistence
- Faster navigation between features
- Easier to share config between views

### Page Structure
```
┌─────────────────────────────────────────────────────┐
│ Header with Navigation Tabs                        │
├─────────────────────────────────────────────────────┤
│ [Factor Config] [Single Test] [Bulk Test] [Report] │
├─────────────────────────────────────────────────────┤
│                                                     │
│        Active Tab Content (toggled via JS)         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Code Organization Strategy

### Current: Single HTML File (~680 lines)
### Target: Modular Structure with Separate Concerns

```
scoring-model-feedback/
├── index.html                 # Main container + tabs
├── css/
│   └── styles.css            # Extracted + enhanced styles
├── js/
│   ├── app.js                # Main app initialization
│   ├── config-manager.js     # Config CRUD operations
│   ├── storage.js            # localStorage abstraction
│   ├── scoring-engine.js     # Score calculation logic
│   ├── bulk-test.js          # Bulk testing functionality
│   ├── validation.js         # Validation report logic
│   └── utils.js              # CSV parsing, etc.
└── docs/
    ├── FEATURE_PLAN.md       # (already created)
    └── IMPLEMENTATION_GUIDE.md # (this file)
```

---

## Data Models

### 1. Scoring Configuration
```typescript
interface ScoringConfig {
  version: string; // For future migrations
  lastModified: string; // ISO timestamp

  criteria: Criterion[];
  ranks: Rank[];
  weights: {
    [criterionId: string]: number; // Default weights
  };
}

interface Criterion {
  id: string; // e.g., 'client_engagement'
  name: string;
  description: string;
  scaleDescriptions: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
  };
  removable: boolean;
  order: number; // For display ordering
}

interface Rank {
  id: string; // e.g., 'rank_a'
  name: string; // 'A', 'B', 'C', 'S', etc.
  minScore: number; // Inclusive
  maxScore: number; // Exclusive (except top rank)
  color: string; // Hex color
  cssClass: string; // e.g., 'rank-A'
  order: number; // Display order (highest to lowest)
}
```

### 2. Bulk Test Data
```typescript
interface BulkTestSession {
  id: string; // Unique session ID
  createdAt: string;
  lastModified: string;
  configSnapshot: ScoringConfig; // Config used for this session

  jobs: TestJob[];

  metadata: {
    fileName: string; // Original CSV filename
    uploadedAt: string;
  };
}

interface TestJob {
  id: string; // Auto-generated
  jobTitle: string;
  company: string;

  scores: {
    [criterionId: string]: number; // 1-5 rating
  };

  userExpectedRank: string; // Rank ID user predicts

  // Calculated fields (not user input)
  calculatedScore?: number;
  calculatedRank?: string;
  isComplete: boolean; // All scores filled + rank predicted

  metadata: {
    scoredAt?: string;
    notes?: string; // Optional user notes
  };
}
```

### 3. Validation Report
```typescript
interface ValidationReport {
  sessionId: string;
  generatedAt: string;

  config: ScoringConfig; // Config used

  summary: {
    totalJobs: number;
    completeJobs: number;
    incompleteJobs: number;
    matchedJobs: number;
    mismatchedJobs: number;
    matchPercentage: number;
  };

  matches: JobResult[];
  mismatches: JobResult[];
  incomplete: TestJob[];
}

interface JobResult extends TestJob {
  calculatedScore: number;
  calculatedRank: string;
  matched: boolean;
  scoreDifference?: number; // If ranks have numeric values
}
```

---

## Storage Strategy

### LocalStorage Keys
```javascript
const STORAGE_KEYS = {
  CONFIG: 'scoringModel_config_v1',
  BULK_SESSION: 'scoringModel_bulkSession_v1',
  ACTIVE_TAB: 'scoringModel_activeTab',
  USER_WEIGHTS: 'scoringModel_userWeights_v1' // Current weight adjustments
};
```

### Storage Utilities (storage.js)
```javascript
class StorageManager {
  static save(key, data) {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error('Storage save failed:', error);
      if (error.name === 'QuotaExceededError') {
        // Handle storage full
        return false;
      }
      throw error;
    }
  }

  static load(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Storage load failed:', error);
      return defaultValue;
    }
  }

  static remove(key) {
    localStorage.removeItem(key);
  }

  static clear() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  static exportAll() {
    const data = {};
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      data[name] = this.load(key);
    });
    return data;
  }

  static importAll(data) {
    Object.entries(data).forEach(([name, value]) => {
      if (STORAGE_KEYS[name]) {
        this.save(STORAGE_KEYS[name], value);
      }
    });
  }
}
```

---

## UI Component Breakdown

### Tab Navigation
```html
<div class="tabs">
  <button class="tab-btn active" data-tab="config">⚙️ Configuration</button>
  <button class="tab-btn" data-tab="single">🧪 Single Test</button>
  <button class="tab-btn" data-tab="bulk">📊 Bulk Test</button>
  <button class="tab-btn" data-tab="report">📈 Validation</button>
</div>

<div class="tab-content active" id="tab-config">...</div>
<div class="tab-content" id="tab-single">...</div>
<div class="tab-content" id="tab-bulk">...</div>
<div class="tab-content" id="tab-report">...</div>
```

### Configuration Tab Components

#### 1. Criteria Editor
```html
<div class="config-section">
  <h3>Scoring Criteria</h3>
  <button onclick="addCriterion()">+ Add Criterion</button>

  <div id="criteria-list">
    <!-- Criterion Item Template -->
    <div class="criterion-item" data-criterion-id="client_engagement">
      <div class="criterion-header">
        <input type="text" class="criterion-name" value="Client Engagement">
        <button class="btn-icon" onclick="deleteCriterion('client_engagement')">🗑️</button>
      </div>

      <textarea class="criterion-description"
                placeholder="Brief description...">Quality of client relationship...</textarea>

      <div class="scale-editor">
        <h4>Rating Scale (1-5)</h4>
        <div class="scale-item">
          <label>5 (Best)</label>
          <input type="text" value="Highly Engaged: Responds within 24h...">
        </div>
        <div class="scale-item">
          <label>4</label>
          <input type="text" value="Good: Responds within 48h...">
        </div>
        <!-- ... 3, 2, 1 -->
      </div>
    </div>
  </div>
</div>
```

#### 2. Rank Editor
```html
<div class="config-section">
  <h3>Ranking Thresholds</h3>
  <button onclick="addRank()">+ Add Rank</button>

  <div id="ranks-list">
    <!-- Rank Item Template -->
    <div class="rank-item" data-rank-id="rank_a">
      <div class="rank-header">
        <input type="text" class="rank-name" value="A" maxlength="2">
        <input type="color" class="rank-color" value="#28a745">
        <button class="btn-icon" onclick="deleteRank('rank_a')">🗑️</button>
      </div>

      <div class="threshold-inputs">
        <label>Min Score: <input type="number" value="4.0" step="0.1" min="1" max="5"></label>
        <label>Max Score: <input type="number" value="5.0" step="0.1" min="1" max="5"></label>
      </div>
    </div>
  </div>
</div>
```

### Bulk Test Tab Components

#### 1. Upload Section
```html
<div class="bulk-upload">
  <div class="upload-area" id="csv-dropzone">
    <input type="file" id="csv-input" accept=".csv" hidden>
    <p>Drag & drop CSV or click to upload</p>
    <button onclick="document.getElementById('csv-input').click()">Choose File</button>
  </div>

  <div class="upload-info">
    <p>Expected columns: <code>job_title</code>, <code>company</code></p>
    <a href="#" onclick="downloadSampleCSV()">Download sample CSV</a>
  </div>
</div>
```

#### 2. Scoring Interface
```html
<div class="bulk-scoring-container">
  <!-- Left Panel: Criteria Reference (sticky) -->
  <div class="criteria-reference">
    <h3>Scoring Reference</h3>

    <div class="criterion-ref" data-criterion="client_engagement">
      <h4>Client Engagement</h4>
      <ul class="scale-ref">
        <li><strong>5</strong> - Highly Engaged: Responds within 24h...</li>
        <li><strong>4</strong> - Good: Responds within 48h...</li>
        <!-- ... -->
      </ul>
    </div>
    <!-- Repeat for each criterion -->
  </div>

  <!-- Right Panel: Job Scoring -->
  <div class="job-scoring-area">
    <div class="job-selector">
      <select id="job-select" onchange="loadJobForScoring(this.value)">
        <option value="">-- Select a job --</option>
        <!-- Options populated from uploaded jobs -->
      </select>
      <span class="progress-badge">12/20 complete</span>
    </div>

    <div id="current-job-form" class="job-form">
      <h3>Senior Software Engineer @ TechCo</h3>

      <div class="score-inputs">
        <div class="score-input-group">
          <label>Client Engagement (1-5)</label>
          <input type="number" min="1" max="5" step="1"
                 data-criterion="client_engagement">
        </div>
        <!-- Repeat for each criterion -->
      </div>

      <div class="rank-prediction">
        <label>Your Expected Rank:</label>
        <div class="rank-buttons">
          <button class="rank-btn" data-rank="A">A</button>
          <button class="rank-btn" data-rank="B">B</button>
          <button class="rank-btn" data-rank="C">C</button>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn-secondary" onclick="saveCurrent()">Save</button>
        <button class="btn-primary" onclick="saveAndNext()">Save & Next</button>
      </div>
    </div>
  </div>
</div>
```

### Validation Tab Components

```html
<div class="validation-report">
  <div class="report-header">
    <h2>Validation Report</h2>
    <button onclick="exportReport()">Export CSV</button>
  </div>

  <div class="report-summary">
    <div class="summary-card match">
      <div class="summary-value">75%</div>
      <div class="summary-label">Match Rate</div>
    </div>

    <div class="summary-card">
      <div class="summary-value">15/20</div>
      <div class="summary-label">Matched</div>
    </div>

    <div class="summary-card">
      <div class="summary-value">5/20</div>
      <div class="summary-label">Mismatched</div>
    </div>

    <div class="summary-card">
      <div class="summary-value">0</div>
      <div class="summary-label">Incomplete</div>
    </div>
  </div>

  <div class="report-details">
    <h3>Mismatched Jobs</h3>
    <table class="results-table">
      <thead>
        <tr>
          <th>Job</th>
          <th>Company</th>
          <th>Your Rank</th>
          <th>Model Rank</th>
          <th>Model Score</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody id="mismatch-table-body">
        <!-- Populated by JS -->
      </tbody>
    </table>
  </div>
</div>
```

---

## Scoring Engine Logic

### Core Calculation Function (scoring-engine.js)
```javascript
class ScoringEngine {
  constructor(config) {
    this.config = config;
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

    // Weighted average
    return weightedSum / totalWeight;
  }

  /**
   * Get rank for a given score
   * @param {number} score - Final score (1.0-5.0)
   * @returns {Rank} Rank object
   */
  getRankForScore(score) {
    // Sort ranks by minScore descending (highest first)
    const sortedRanks = [...this.config.ranks].sort(
      (a, b) => b.minScore - a.minScore
    );

    // Find first rank where score meets threshold
    const rank = sortedRanks.find(r => score >= r.minScore);

    if (!rank) {
      // Fallback to lowest rank
      return sortedRanks[sortedRanks.length - 1];
    }

    return rank;
  }

  /**
   * Validate that weights sum to 100
   * @param {Object} weights - { criterionId: weight }
   * @returns {boolean}
   */
  validateWeights(weights) {
    const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
    return Math.abs(total - 100) < 0.01; // Allow tiny floating point errors
  }

  /**
   * Calculate scores for multiple jobs (bulk test)
   * @param {TestJob[]} jobs
   * @param {Object} weights
   * @returns {JobResult[]}
   */
  scoreJobs(jobs, weights) {
    if (!this.validateWeights(weights)) {
      throw new Error('Weights must sum to 100%');
    }

    return jobs.map(job => {
      if (!job.isComplete) {
        return { ...job, calculatedScore: null, calculatedRank: null };
      }

      const calculatedScore = this.calculateScore(job.scores, weights);
      const calculatedRank = this.getRankForScore(calculatedScore);

      return {
        ...job,
        calculatedScore,
        calculatedRank: calculatedRank.id,
        matched: job.userExpectedRank === calculatedRank.id
      };
    });
  }
}
```

---

## CSV Parsing & Export

### Import CSV (utils.js)
```javascript
/**
 * Parse CSV file to job objects
 * @param {File} file - CSV file
 * @returns {Promise<TestJob[]>}
 */
async function parseJobsCSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

      if (lines.length === 0) {
        reject(new Error('CSV file is empty'));
        return;
      }

      // Parse header
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      // Validate required columns
      const requiredCols = ['job_title', 'company'];
      const missingCols = requiredCols.filter(col => !headers.includes(col));

      if (missingCols.length > 0) {
        reject(new Error(`Missing required columns: ${missingCols.join(', ')}`));
        return;
      }

      // Get column indices
      const titleIdx = headers.indexOf('job_title');
      const companyIdx = headers.indexOf('company');

      // Parse data rows
      const jobs = lines.slice(1).map((line, index) => {
        const values = parseCSVLine(line); // Handle quoted values

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

      resolve(jobs);
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Parse CSV line handling quoted values
 */
function parseCSVLine(line) {
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
```

### Export Results CSV
```javascript
/**
 * Export validation report as CSV
 * @param {ValidationReport} report
 */
function exportValidationCSV(report) {
  const config = report.config;

  // Build header
  const criteriaHeaders = config.criteria.map(c => c.name).join(',');
  const header = `Job Title,Company,${criteriaHeaders},User Rank,Model Rank,Model Score,Match\n`;

  // Build rows
  const allJobs = [...report.matches, ...report.mismatches];
  const rows = allJobs.map(job => {
    const scores = config.criteria.map(c => job.scores[c.id] || '').join(',');
    const match = job.matched ? 'Yes' : 'No';

    return `"${job.jobTitle}","${job.company}",${scores},${job.userExpectedRank},${job.calculatedRank},${job.calculatedScore.toFixed(2)},${match}`;
  }).join('\n');

  const csv = header + rows;

  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `validation-report-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Generate sample CSV for download
 */
function downloadSampleCSV() {
  const sample = `job_title,company
Senior Software Engineer,TechCo Inc
Marketing Manager,BrandCorp
Data Analyst,Analytics Ltd
Product Designer,DesignHub
Sales Executive,SalesPro`;

  const blob = new Blob([sample], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sample-jobs.csv';
  link.click();
  URL.revokeObjectURL(url);
}
```

---

## Visual Improvements for 1080p

### CSS Adjustments

```css
/* Compact spacing for 1080p displays */
@media (min-width: 1440px) {
  .container {
    max-width: 1400px; /* Utilize more width */
  }

  .header {
    padding: 20px 30px; /* Reduced from 30px */
  }

  .header h1 {
    font-size: 20px; /* Reduced from 24px */
    margin-bottom: 5px;
  }

  .header p {
    font-size: 13px; /* Reduced from 14px */
  }

  .content {
    padding: 20px 30px; /* Reduced from 30px */
  }

  .section {
    margin-bottom: 20px; /* Reduced from 30px */
    padding-bottom: 20px;
  }

  .section-title {
    font-size: 18px; /* Reduced from 20px */
    margin-bottom: 12px;
  }

  .section-subtitle {
    font-size: 13px;
    margin-bottom: 15px;
  }

  .factor {
    padding: 15px; /* Reduced from 20px */
    margin-bottom: 12px;
  }

  .factor-name {
    font-size: 14px; /* Reduced from 16px */
  }

  .factor-weight {
    font-size: 20px; /* Reduced from 24px */
  }

  .slider-container {
    margin-top: 10px;
    padding: 8px 0;
  }

  input[type="range"] {
    height: 36px; /* Reduced from 44px */
  }

  .criteria-list li {
    font-size: 11px; /* Reduced from 12px */
    margin-bottom: 4px;
  }
}

/* Two-column layout for bulk testing */
.bulk-scoring-container {
  display: grid;
  grid-template-columns: 300px 1fr; /* Fixed left panel, flexible right */
  gap: 20px;
  height: calc(100vh - 300px); /* Viewport height minus header/tabs */
}

.criteria-reference {
  position: sticky;
  top: 20px;
  height: fit-content;
  max-height: calc(100vh - 320px);
  overflow-y: auto;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

/* Collapsible criteria details */
.criterion-ref {
  margin-bottom: 15px;
}

.criterion-ref h4 {
  font-size: 13px;
  cursor: pointer;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.criterion-ref h4::after {
  content: '▼';
  font-size: 10px;
  transition: transform 0.2s;
}

.criterion-ref.collapsed h4::after {
  transform: rotate(-90deg);
}

.criterion-ref .scale-ref {
  font-size: 11px;
  padding-left: 15px;
  line-height: 1.4;
}

.criterion-ref.collapsed .scale-ref {
  display: none;
}
```

---

## Migration Plan from Current Implementation

### Step 1: Extract CSS
- Move inline styles to `css/styles.css`
- Keep structure similar to ease transition

### Step 2: Modularize JavaScript
- Extract functions to separate files
- Use ES6 modules (or simple script includes)
- Keep global `factors` array initially, refactor to config object

### Step 3: Add Tab Navigation
- Wrap existing content in tab
- Add empty tabs for new features

### Step 4: Build New Features Incrementally
- Config tab first (allows testing other features)
- Bulk test second
- Validation last

### Step 5: Apply Visual Refinements
- Adjust spacing/sizing
- Test on 1080p display
- Ensure mobile still works

---

## Testing Strategy

### Manual Test Cases

#### Config Management
1. Add new criterion → save → reload page → verify persisted
2. Delete default criterion → verify not removable
3. Edit scale descriptions → verify shown in reference panel
4. Add rank "S" with threshold 4.5 → test job scoring
5. Export config → import on another device → verify identical

#### Bulk Testing
1. Upload valid CSV → verify all jobs loaded
2. Upload CSV missing columns → verify error message
3. Score 5 jobs → refresh page → verify scores persist
4. Navigate between jobs → verify scores saved automatically
5. Export scored jobs → verify CSV format correct

#### Validation
1. Score 10 jobs with expected ranks → run validation → verify match %
2. Adjust weights → re-run validation → verify results change
3. Export validation report → verify all columns present
4. Handle incomplete jobs → verify warning displayed

#### Visual
1. View on 1080p 27" → verify no scrolling needed
2. View on mobile → verify usable
3. Collapse/expand criteria in reference → verify toggle works
4. Check all text readable at new sizes

---

## Performance Considerations

### Large Job Lists (50+ jobs)
- Virtual scrolling for job selector dropdown
- Lazy render job details (only show selected job)
- Debounce auto-save (300ms delay)

### LocalStorage Limits
- Monitor storage usage
- Warn at 80% capacity
- Offer to export/clear old sessions

### CSV Parsing
- Stream large files (>1MB)
- Show progress indicator
- Limit to 100 jobs (warn if exceeded)

---

## Accessibility

### Keyboard Navigation
- Tab through all interactive elements
- Enter to submit forms
- Arrow keys in sliders
- Escape to close modals

### Screen Readers
- ARIA labels on all inputs
- Role attributes on custom components
- Live regions for dynamic content updates

### Visual
- Minimum contrast ratio 4.5:1
- Focus indicators on all interactive elements
- No color-only information (use icons + text)

---

## Next Steps

1. Review plan with Captain
2. Get approval on architecture decisions
3. Begin Phase 1: Configuration management
4. Iterate with feedback

---

**Estimated Total Implementation: 7-11 hours**
