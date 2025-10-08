# Job Scoring Model

## Overview
The scoring model converts subjective assessments from 3 team members into an objective A/B/C ranking for each job. This enables data-driven resource allocation and historical analysis of scoring patterns.

## Scoring Factors

**Scale**: All factors use a 1-5 scale (open to adjustment after initial testing)

### 1. Client Engagement (Weight: TBD)
**What it measures**: Quality of the client relationship and decision-making process

**Scoring criteria** (1-5 scale):
- **5 - Highly Engaged**: Responds within 24h, schedules interviews quickly, provides detailed feedback
- **4 - Good**: Responds within 48h, generally timely, provides feedback
- **3 - Moderate**: Responds within a week, some delays in process, basic feedback
- **2 - Low**: Slow responses (>1 week), frequent delays, minimal feedback
- **1 - Poor**: Very unresponsive, extended delays, no feedback, ghost candidates

**Data sources**:
- Manual assessment by account manager
- (Future) Automated from Recruiterflow timestamps

---

### 2. Search Difficulty (Weight: TBD)
**What it measures**: How hard it is to find qualified candidates

**Scoring criteria** (1-5 scale):
- **5 - Very Easy**: Large talent pool, common skill set, flexible requirements
- **4 - Easy**: Good talent pool, standard requirements
- **3 - Moderate**: Limited talent pool, some specialized skills required
- **2 - Difficult**: Scarce talent, niche skills, competitive market
- **1 - Very Difficult**: Extremely rare skill combination, severe constraints (location, compensation, etc.)

**Data sources**:
- Manual assessment by sales person and account manager
- (Future) Historical fill rates for similar roles

---

### 3. Time Open (Weight: TBD)
**What it measures**: Urgency and historical commitment

**Scoring criteria** (inverse scoring - longer open = lower score):
- **5 - Brand New**: 0-14 days open
- **4 - Fresh**: 15-30 days open
- **3 - Moderate**: 31-60 days open
- **2 - Stale**: 61-90 days open
- **1 - Very Stale**: 90+ days open

**Data sources**:
- Automated calculation from `date_opened` in Recruiterflow
- Can be manually adjusted if needed (e.g., job was paused)

---

### 4. Fee Size (Weight: TBD)
**What it measures**: Revenue potential of the placement

**Scoring criteria** (based on typical fee range £10k-£50k):
- **5 - Excellent**: £40k+ fee
- **4 - Good**: £30k-40k fee
- **3 - Moderate**: £20k-30k fee
- **2 - Low**: £10k-20k fee
- **1 - Very Low**: <£10k fee

**Data sources**:
- Estimated fee from Recruiterflow (pulled automatically)
- Can be manually adjusted if estimate changes

---

### 5. [Future Factors]
Placeholder for additional scoring dimensions:
- **Client Payment History**: Do they pay invoices on time?
- **Hiring Manager Quality**: Is the hiring manager effective?
- **Strategic Value**: Does this open doors to more business?

---

## Weighting System

### Initial Weights (Total = 100%)
**NOTE**: These are placeholders pending team discussion and agreement.

- **Client Engagement**: TBD%
  - Rationale: Great clients make everything easier and lead to repeat business

- **Fee Size**: TBD%
  - Rationale: Revenue is critical, but not everything

- **Search Difficulty**: TBD%
  - Rationale: Difficulty impacts time investment, but solvable with effort

- **Time Open**: TBD%
  - Rationale: Signals urgency but shouldn't override other factors

**Configuration**: Store weights in database or config file for easy adjustment

### Example Weighting Options (for reference)
- **Equal weighting**: 25% each (neutral starting point)
- **Revenue-focused**: Client 30%, Fee 35%, Difficulty 20%, Time 15%
- **Client-focused**: Client 40%, Fee 25%, Difficulty 20%, Time 15%

---

## Score Calculation

### Per-Scorer Composite Score
For each individual scorer (Account Manager, Sales Person, CEO):

```
Composite_Score = (Client_Engagement × W1) +
                  (Fee_Size × W2) +
                  (Search_Difficulty × W3) +
                  (Time_Open × W4)
```

Where W1, W2, W3, W4 are the weights (TBD, must sum to 1.0)

Since each factor is scored 1-5, the composite score range is **1.0 to 5.0**

---

### Aggregated Team Score
Average the three scorers' composite scores:

```
Final_Score = (AM_Composite + Sales_Composite + CEO_Composite) / 3
```

Final score range: **1.0 to 5.0**

---

### Rank Assignment (A / B / C)

**Method**: Fixed Thresholds
- **A Rank**: Final_Score ≥ 4.0
- **B Rank**: 2.5 ≤ Final_Score < 4.0
- **C Rank**: Final_Score < 2.5

This provides consistency across scoring periods. Can be adjusted to percentile-based ranking if needed in future.

---

## Scoring Workflow

### Weekly Evaluation Process
1. System identifies all jobs with status "actively sourcing" in Recruiterflow
2. Notifications sent to 3 scorers (or accessible dashboard list)
3. Each scorer reviews jobs needing evaluation:
   - New jobs (never scored)
   - Jobs with scores >7 days old
4. Scorer views job details and previous scores (for consistency)
5. Scorer inputs scores for each factor
6. System calculates composite and final scores
7. Dashboard updates with new rankings

### Scoring Interface Requirements
- Show job details from Recruiterflow
- Display previous scores by this scorer (with date)
- Display team average from last scoring round
- Allow saving partial progress
- Confirmation before submitting (scores locked after submit)

---

## Audit and Review

### CEO Review Capabilities
- View individual scorer patterns:
  - Average scores by scorer across all jobs
  - Score variance (is someone always harsh/generous?)
  - Outlier detection (scores that differ significantly from team)
- Historical scoring for specific jobs
- Scoring consistency over time

### Reporting Metrics
- Distribution of A/B/C ranks over time
- Correlation between rank and successful placements
- Average time-to-fill by rank
- Revenue by rank

---

## Future Automation Possibilities

### Automated Factor Scoring
- **Client Engagement**: Calculate from response times in Recruiterflow
- **Search Difficulty**: Use historical fill times for similar roles
- **Time Open**: Already automated
- **Fee Size**: Already from Recruiterflow

### Machine Learning Enhancements
- Predict job success probability based on historical outcomes
- Suggest optimal score adjustments based on similar jobs
- Flag jobs likely to become problematic early

---

## Configuration Management

### Adjustable Parameters (stored in database or config)
```javascript
{
  "weights": {
    "client_engagement": 0.25,  // PLACEHOLDER - awaiting team decision
    "search_difficulty": 0.25,   // PLACEHOLDER - awaiting team decision
    "time_open": 0.25,           // PLACEHOLDER - awaiting team decision
    "fee_size": 0.25             // PLACEHOLDER - awaiting team decision
  },
  "rank_thresholds": {
    "A": 4.0,
    "B": 2.5,
    "C": 0.0
  },
  "score_scale": {
    "min": 1,
    "max": 5
  },
  "time_open_ranges": {
    "5": 14,
    "4": 30,
    "3": 60,
    "2": 90,
    "1": 999
  },
  "fee_size_ranges": {
    "5": 40000,
    "4": 30000,
    "3": 20000,
    "2": 10000,
    "1": 0
  }
}
```

This allows tuning without code changes.
