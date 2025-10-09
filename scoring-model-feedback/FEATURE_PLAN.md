# Scoring Model Feedback Tool - Feature Enhancement Plan

## Overview
Enhance the scoring model feedback tool with configuration management, bulk testing capabilities, and improved UI for 27" 1080p displays.

---

## Feature 1: Settings/Config Menu

### Requirements
- Fine-grained control over scoring model configuration
- Editable criteria (add/remove/modify)
- Customizable 1-5 rating descriptions per criterion
- Adjustable rank thresholds (A/B/C)
- Support for additional custom ranks

### Implementation Plan

#### UI Components
1. **Settings Modal/Panel**
   - Triggered by gear icon in header
   - Full-screen overlay or side panel
   - Tabs for different config sections:
     - Criteria Management
     - Rating Scales
     - Rank Thresholds

2. **Criteria Management Tab**
   - List of current criteria with edit/delete buttons
   - Add new criterion button
   - For each criterion:
     - Name (editable)
     - Description (editable)
     - Default weight (editable)
     - 5 text fields for score descriptions (1-5)

3. **Rank Thresholds Tab**
   - Default ranks: A, B, C
   - Add custom rank button
   - For each rank:
     - Rank letter/name (editable)
     - Threshold value (min score)
     - Color picker for visual representation
     - Delete button (except defaults)

#### Data Structure
```javascript
{
  criteria: [
    {
      id: string,
      name: string,
      description: string,
      defaultWeight: number,
      scaleDescriptions: {
        1: string,
        2: string,
        3: string,
        4: string,
        5: string
      }
    }
  ],
  ranks: [
    {
      id: string,
      name: string,
      minScore: number,
      maxScore: number,
      color: string,
      order: number
    }
  ]
}
```

#### Storage
- LocalStorage key: `scoringModelConfig`
- Auto-save on changes
- Export/Import config as JSON file

---

## Feature 2: Bulk Testing Page

### Requirements
- CSV upload for job list (job_title, company columns)
- Display ~20 jobs for scoring
- Reference panel showing score criteria descriptions
- Score each job on all criteria
- Predict rank for each job (user's expectation)
- Hide calculated scores from user
- Data persistence (localStorage + CSV export)

### Implementation Plan

#### Page Structure
```
┌─────────────────────────────────────────────────────┐
│ [Upload CSV] [Export Results] [Clear All]          │
├─────────────────┬───────────────────────────────────┤
│ CRITERIA GUIDE  │  JOB SCORING INTERFACE            │
│ (Frozen/Sticky) │                                   │
│                 │  [Job Selector Dropdown]          │
│ Client Eng.     │                                   │
│ 5 - Highly...   │  Current Job: Senior Dev @ TechCo │
│ 4 - Good...     │                                   │
│ ...             │  ┌─────────────────────────────┐  │
│                 │  │ Client Engagement: [1-5]    │  │
│ Search Diff.    │  │ Search Difficulty: [1-5]    │  │
│ 5 - Very Easy   │  │ Time Open: [1-5]            │  │
│ ...             │  │ Fee Size: [1-5]             │  │
│                 │  │                             │  │
│ [+ criteria]    │  │ Expected Rank: [A/B/C]      │  │
│                 │  │                             │  │
│                 │  │ [Save & Next Job]           │  │
│                 │  └─────────────────────────────┘  │
│                 │                                   │
│                 │  Progress: 12/20 jobs scored      │
└─────────────────┴───────────────────────────────────┘
```

#### CSV Upload
- Parse CSV with Papa Parse (or native)
- Expected columns: `job_title`, `company`
- Validation: check for required columns
- Store in `bulkTestJobs` array

#### Scoring Interface
- Dropdown/List to select job
- Number inputs (1-5) for each criterion
- Rank selector (radio buttons or dropdown)
- Visual indicator: scored vs unscored jobs
- Auto-save scores to localStorage

#### Data Structure
```javascript
{
  jobs: [
    {
      id: string,
      jobTitle: string,
      company: string,
      scores: {
        [criterionId]: number (1-5)
      },
      userExpectedRank: string,
      calculatedScore: number,
      calculatedRank: string,
      isComplete: boolean
    }
  ]
}
```

---

## Feature 3: Validation Report

### Requirements
- Button on main page to trigger validation
- Calculate match percentage: user rank vs model rank
- Show detailed breakdown
- Error handling for incomplete data

### Implementation Plan

#### UI Components
1. **Validation Button**
   - Location: Below single job test section
   - Label: "Validate Bulk Test Data"
   - Badge showing: X/Y jobs scored

2. **Results Modal/Section**
```
┌─────────────────────────────────────────────────────┐
│          VALIDATION REPORT                          │
├─────────────────────────────────────────────────────┤
│ Match Rate: 75% (15/20 jobs)                        │
│                                                     │
│ ✓ Matched: 15 jobs                                  │
│ ✗ Mismatched: 5 jobs                               │
│ ⚠ Incomplete: 0 jobs                               │
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ MISMATCHED JOBS                                 ││
│ │                                                 ││
│ │ Senior Dev @ TechCo                             ││
│ │   Your Rank: A | Model Rank: B (Score: 3.75)   ││
│ │   Client: 5, Search: 4, Time: 3, Fee: 3        ││
│ │                                                 ││
│ │ [Show All] [Export Report]                      ││
│ └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

#### Calculation Logic
```javascript
function validateBulkTest() {
  const jobs = getBulkTestJobs();
  const config = getScoringConfig();

  let matched = 0;
  let mismatched = [];
  let incomplete = 0;

  jobs.forEach(job => {
    if (!job.isComplete) {
      incomplete++;
      return;
    }

    // Calculate weighted score
    const calculatedScore = calculateScore(job.scores, config.criteria);
    const calculatedRank = getRankForScore(calculatedScore, config.ranks);

    if (calculatedRank === job.userExpectedRank) {
      matched++;
    } else {
      mismatched.push({
        ...job,
        calculatedScore,
        calculatedRank
      });
    }
  });

  return {
    totalJobs: jobs.length,
    matched,
    mismatched,
    incomplete,
    matchPercentage: (matched / (jobs.length - incomplete)) * 100
  };
}
```

#### Export Functionality
- CSV format with columns:
  - Job Title, Company, [Criterion Scores...], User Rank, Model Rank, Model Score, Match

---

## Feature 4: Visual Improvements (1080p 27")

### Target: Fit more on screen, reduce whitespace

#### Specific Changes
1. **Header**
   - Reduce padding: 30px → 20px
   - Title size: 24px → 20px
   - Add settings icon (top-right)

2. **Sections**
   - Reduce section padding: 30px → 20px
   - Factor padding: 20px → 15px
   - Reduce margins between elements

3. **Typography**
   - Section titles: 20px → 18px
   - Factor names: 16px → 14px
   - Factor weights: 24px → 20px
   - Body text: 14px → 13px

4. **Layout**
   - Use CSS Grid for better space utilization
   - Collapsible sections for criteria details
   - Two-column layout for bulk testing

5. **Components**
   - Smaller sliders (height: 44px → 36px)
   - Compact input fields
   - Tighter criteria lists

#### Responsive Breakpoints
- Target: 1920x1080px primary
- Maintain mobile compatibility (min-width: 360px)

---

## Implementation Order

### Phase 1: Settings/Config (2-3 hours)
1. Create config data structure
2. Build settings modal UI
3. Implement localStorage persistence
4. Update main page to use dynamic config

### Phase 2: Bulk Testing (3-4 hours)
1. CSV upload and parsing
2. Job scoring interface
3. Data persistence
4. Progress tracking

### Phase 3: Validation Report (1-2 hours)
1. Validation calculation logic
2. Results display UI
3. Export functionality

### Phase 4: Visual Refinements (1-2 hours)
1. Apply size reductions
2. Layout optimization
3. Test on 1080p display

### Total Estimate: 7-11 hours

---

## File Structure
```
scoring-model-feedback/
├── index.html (main page - refactored)
├── bulk-test.html (new - bulk testing page)
├── config-modal.html (template - settings)
├── styles.css (extracted shared styles)
├── scripts/
│   ├── config.js (config management)
│   ├── bulk-test.js (bulk testing logic)
│   ├── validation.js (validation report)
│   └── storage.js (localStorage utilities)
└── FEATURE_PLAN.md (this file)
```

---

## Error Handling

### Critical Scenarios
1. **CSV Upload Errors**
   - Missing columns → Clear error message
   - Invalid format → Show example format
   - Too many jobs (>50) → Warn about performance

2. **Validation Errors**
   - No bulk test data → Prompt to create/upload
   - Incomplete scores → Show which jobs need completion
   - Config mismatch → Warn if criteria changed

3. **Storage Errors**
   - LocalStorage full → Offer to clear old data
   - Parse errors → Reset to defaults with confirmation

---

## Testing Checklist

### Config Menu
- [ ] Add/edit/delete criteria
- [ ] Modify score descriptions
- [ ] Add/edit/delete ranks
- [ ] Export/import config
- [ ] Persistence across sessions

### Bulk Testing
- [ ] Upload valid CSV
- [ ] Handle invalid CSV
- [ ] Score jobs with all criteria
- [ ] Save progress automatically
- [ ] Export scored jobs

### Validation
- [ ] Calculate match percentage correctly
- [ ] Show mismatched jobs
- [ ] Handle incomplete data
- [ ] Export validation report

### Visual
- [ ] Fits well on 1080p 27" screen
- [ ] No horizontal scrolling
- [ ] Readable text sizes
- [ ] Mobile still works

---

## Future Enhancements (Not in Scope)
- Multi-user collaboration
- Historical trend tracking
- ML-based weight suggestions
- Integration with live job data
