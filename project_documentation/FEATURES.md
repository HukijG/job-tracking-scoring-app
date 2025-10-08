# Features & Requirements

## Dashboard View

### Job List Display
Each job card/row shows:
- **Client Name**
- **Job Title/Name**
- **Days Open** (calculated from job creation date)
- **Candidate Pipeline Snapshot**
  - Total candidates in pipeline
  - Breakdown by stage (if applicable)
- **Pipeline Staleness Metric**
  - Average time candidates spend at each stage
  - Highlights bottlenecks in client decision-making
- **Job Rank Badge** (A / B / C)
  - Visually prominent
  - Color-coded for quick scanning

### Dashboard Organization
- Sortable by Job Rank (A → B → C)
- Filterable by:
  - Client
  - Rank
  - Days open
  - Pipeline status
- Visual hierarchy emphasizing A-ranked jobs

## Job Ranking System

### Scoring Factors
Each job is scored by 3 team members (Account Manager, Sales Person, CEO) on:

1. **Client Engagement**
   - Responsiveness
   - Decision-making speed
   - Partnership quality

2. **Search Difficulty**
   - Talent market availability
   - Technical requirements complexity
   - Location constraints

3. **Time Open**
   - Days since job opened
   - Historical time-to-fill for similar roles

4. **Fee Size**
   - Estimated placement fee
   - Revenue potential

5. **[Future factors]**
   - Extensible for additional criteria

### Scoring Mechanism
- Each scorer rates each factor (scale TBD - suggest 1-5 or 1-10)
- Individual scores are weighted by factor importance
- Scores are aggregated across the 3 scorers
- Composite score determines A/B/C rank
- **Score ranges for ranks** (to be defined in scoring model)

### Scoring Workflow
- Weekly evaluation cadence for all actively sourced jobs
- Each team member accesses scoring interface per job
- Previous scores visible to maintain consistency
- CEO can review individual scoring patterns for fairness

## Data Requirements

### From Recruiterflow (via API/Webhooks)
- Job ID (primary key for linking)
- Client name
- Job title
- Job status (actively sourcing vs. other states)
- Date opened
- Candidate pipeline data:
  - Candidate count by stage
  - Stage transition timestamps
- Estimated fee size
- Custom fields (for bidirectional linking if needed)

### Stored in Supabase
- Job ranking scores:
  - Job ID (FK to Recruiterflow)
  - Scorer ID (which team member)
  - Scoring date
  - Individual factor scores
  - Composite score
  - Final rank (A/B/C)
- Historical scoring data (persists even after job closes in Recruiterflow)
- User preferences/settings

## Non-Functional Requirements

### Performance
- Dashboard loads in <2 seconds
- Real-time updates from webhooks reflected within 30 seconds

### Usability
- Mobile-responsive (team may score on phones)
- Intuitive navigation requiring minimal training
- Keyboard shortcuts for power users

### Accessibility
- Easy access for all 4 team members
- Single sign-on or simple authentication
- Works across modern browsers

## Future Enhancements (Out of Scope for MVP)
- Automated scoring based on historical data
- Predictive analytics for job success probability
- Email notifications for ranking changes
- Integration with team communication tools (Slack, Teams)
- Custom reporting and analytics dashboard
