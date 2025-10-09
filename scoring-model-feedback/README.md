# Scoring Model Feedback Tool

**Internal tool for tuning and validating the job ranking model**

---

## 📋 Overview

This is a standalone web application for testing and refining the weighted scoring algorithm used to rank job opportunities (A/B/C). It allows you to:

1. **Configure** scoring criteria and rank thresholds
2. **Test** individual jobs with adjustable weights
3. **Bulk score** multiple jobs from CSV
4. **Validate** how well the model matches your expectations

---

## 🚀 Quick Start

### Open the Tool
Simply open `index.html` in your web browser. No server or installation needed!

```bash
# On Windows
start index.html

# On Mac/Linux
open index.html
```

### Basic Workflow
1. **Configure** (optional): Customize criteria in the Configuration tab
2. **Upload Jobs**: Download sample CSV or upload your own (Bulk Test tab)
3. **Score Jobs**: Rate each job 1-5 on all criteria, select expected rank
4. **Validate**: View how well the model's rankings match yours (Validation tab - Phase 3)

---

## 📊 Features

### ✅ Phase 1: Configuration Management (Complete)
- **Customize Criteria:** Add/edit/delete scoring factors
- **Edit Rating Scales:** Define what 1-5 means for each criterion
- **Adjust Thresholds:** Change A/B/C score boundaries
- **Add Custom Ranks:** Create S, A+, or other rank tiers
- **Export/Import:** Save configurations as JSON

### ✅ Phase 2: Bulk Testing (Complete)
- **CSV Upload:** Drag & drop or browse for job lists
- **Sample Data:** Download 20-job sample CSV
- **Sticky Reference:** Criteria descriptions always visible
- **Auto-Save:** Scores persist automatically
- **Smart Navigation:** "Save & Next" finds incomplete jobs
- **Progress Tracking:** See X/Y jobs completed
- **Export Results:** Download scored jobs as CSV

### 🔜 Phase 3: Validation Report (Next)
- **Match Percentage:** See how often model agrees with you
- **Mismatch Analysis:** Identify where rankings differ
- **Export Report:** CSV with full validation details
- **Weight Tuning:** Adjust weights based on results

---

## 📁 File Structure

```
scoring-model-feedback/
├── index.html              # Main app
├── css/
│   └── styles.css         # All styles
├── js/
│   ├── storage.js         # LocalStorage utilities
│   ├── config-manager.js  # Configuration CRUD
│   ├── scoring-engine.js  # Score calculations
│   ├── csv-parser.js      # CSV parsing
│   ├── bulk-test.js       # Bulk test manager
│   └── app.js             # Main application logic
├── docs/
│   ├── ROADMAP.md         # Development roadmap
│   ├── FEATURE_PLAN.md    # Feature specifications
│   └── IMPLEMENTATION_GUIDE.md  # Technical details
└── README.md              # This file
```

---

## 💾 Data Storage

All data is stored locally in your browser using **localStorage**:
- Configuration settings
- Bulk test sessions
- User weights
- Job scores and expected ranks

**Data persists across:**
- Page refreshes
- Browser restarts
- Tab switches

**Data is lost when:**
- You click "Clear All"
- You clear browser data
- You switch browsers/devices

**Tip:** Export your data regularly to avoid accidental loss!

---

## 📥 CSV Format

### Upload Format
Your CSV must have these columns:
```csv
job_title,company
Senior Software Engineer,TechCo Inc
Marketing Manager,BrandCorp
Data Analyst,Analytics Ltd
```

### Download Sample
Click "Download sample CSV" in the Bulk Test tab to get a 20-job example.

### Export Format
Exported CSVs include all scoring data:
```csv
Job Title,Company,Client Engagement,Search Difficulty,Time Open,Fee Size,Expected Rank,Scored
"Senior Software Engineer","TechCo Inc",4,3,5,4,"A",Yes
```

---

## 🎯 Usage Guide

### 1. Configuration Tab
**When to use:** First time setup or when changing criteria

**What you can do:**
- Add new scoring criteria (e.g., "Candidate Availability")
- Edit existing criteria names and descriptions
- Customize 1-5 rating descriptions
- Add new ranks (e.g., S-tier for exceptional jobs)
- Adjust rank thresholds (e.g., A = 4.5+, not 4.0+)
- Export configuration for sharing with team
- Import saved configurations

**Tips:**
- Keep 3-5 criteria for simplicity
- Make rating descriptions specific and measurable
- Align ranks with business outcomes

### 2. Single Test Tab
**When to use:** Quick testing of individual jobs

**What you can do:**
- Adjust factor weights (must total 100%)
- Score a job on all criteria (1-5)
- See calculated rank and breakdown
- Test different weight combinations

**Tips:**
- Use this to understand how weights affect rankings
- Start with equal weights (25% each for 4 criteria)
- Adjust based on which factors you think matter most

### 3. Bulk Test Tab
**When to use:** Testing model with multiple real jobs

**What you can do:**
- Upload CSV with 10-20 jobs
- View criteria descriptions (collapsible reference panel)
- Score each job 1-5 on all criteria
- Select your expected rank (A/B/C)
- Navigate between jobs (dropdown or Save & Next)
- Track progress (X/Y complete)
- Export scored jobs for records

**Tips:**
- Use realistic jobs from your pipeline
- Score based on gut feel (don't overthink)
- Note any jobs where you're unsure of expected rank
- Take breaks every 5-10 jobs to maintain focus

### 4. Validation Tab (Phase 3)
**When to use:** After scoring all bulk test jobs

**What you can do:**
- See match percentage (how often model agrees with you)
- Review mismatched jobs (where model disagrees)
- Export validation report
- Return to Single Test to adjust weights
- Re-run validation with new weights

**Tips:**
- >80% match rate is good
- Focus on high-value mismatches (A vs C)
- Small mismatches (B vs C) are less critical
- Iterate: adjust weights → re-validate → repeat

---

## 🔧 Technical Details

### Browser Requirements
- **Modern browser** (Chrome, Firefox, Safari, Edge)
- **JavaScript enabled**
- **LocalStorage available** (~5MB quota)

### Performance
- **20 jobs:** Instant
- **50 jobs:** <100ms
- **100 jobs:** <300ms
- **Max recommended:** 100 jobs per session

### Storage Usage
- **20 jobs:** ~5KB
- **100 jobs:** ~25KB
- **Well within 5MB browser limit**

### Architecture
- **Vanilla JavaScript** (no frameworks)
- **ES6+ features** (classes, arrow functions, template literals)
- **Modular design** (separation of concerns)
- **Responsive CSS Grid/Flexbox**
- **No build step** (just open index.html)

---

## 🐛 Troubleshooting

### CSV Upload Fails
- **Check columns:** Must have `job_title` and `company`
- **Check file size:** <1MB recommended
- **Check format:** Plain text CSV, not Excel

### Data Not Saving
- **Check browser:** LocalStorage must be enabled
- **Check quota:** Clear old sessions if storage full
- **Check privacy mode:** Incognito/private mode may block storage

### Scores Disappear After Refresh
- **Export regularly:** Download CSV as backup
- **Check browser:** Some security settings clear on close

### Page Loads Slowly
- **Too many jobs:** Try <50 jobs per session
- **Clear old data:** Click "Clear All" in Bulk Test tab

---

## 📊 Best Practices

### Getting Started
1. Use default 4 criteria first (don't customize yet)
2. Start with equal weights (25% each)
3. Upload 10 real jobs you know well
4. Score honestly based on gut feel
5. Check validation results
6. Adjust weights if match rate <80%

### Tuning Weights
1. Look at mismatched jobs
2. Identify patterns (e.g., all high-fee mismatches)
3. Increase weight of mismatched factors
4. Decrease weight of less important factors
5. Re-validate
6. Iterate until satisfied

### Team Collaboration
1. Have each person score same 10 jobs
2. Compare expected ranks
3. Discuss disagreements
4. Align on criteria definitions
5. Export final config for all to use

---

## 📝 Changelog

### Phase 2 - 2025-10-09
- ✅ CSV upload with drag & drop
- ✅ Bulk scoring interface
- ✅ Auto-save functionality
- ✅ Progress tracking
- ✅ Export scored jobs

### Phase 1 - 2025-10-09
- ✅ Configuration management
- ✅ Criteria editor
- ✅ Rank threshold editor
- ✅ Single job testing
- ✅ Export/import configs

---

## 🎯 What's Next

### Phase 3 (In Progress)
- Validation report UI
- Match percentage calculation
- Mismatch table
- Export validation CSV

### Future Enhancements
- Multiple session support
- Historical comparison
- ML-based weight suggestions
- Integration with main app
- Dark mode

---

## 📚 Documentation

- **[ROADMAP.md](ROADMAP.md)** - Development roadmap and status
- **[FEATURE_PLAN.md](FEATURE_PLAN.md)** - Detailed feature specifications
- **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** - Technical implementation details
- **[PHASE1_COMPLETE.md](PHASE1_COMPLETE.md)** - Phase 1 completion summary
- **[PHASE2_COMPLETE.md](PHASE2_COMPLETE.md)** - Phase 2 completion summary

---

## 🤝 Support

**Questions or issues?** Contact the development team or check the documentation above.

**Want to contribute?** See ROADMAP.md for upcoming features and priorities.

---

**Version:** 0.2.0 (Phase 2 Complete)
**Last Updated:** 2025-10-09
**Status:** ✅ Ready for use (Phase 3 in development)
