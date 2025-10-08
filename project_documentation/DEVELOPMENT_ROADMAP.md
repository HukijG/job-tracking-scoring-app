# Development Roadmap

## Phase 1: Foundation & Setup (Week 1-2)

### 1.1 Infrastructure Setup
- [ ] Create Cloudflare account and configure
- [ ] Set up Supabase project
- [ ] Initialize Git repository
- [ ] Set up local development environment
- [ ] Configure environment variables

### 1.2 Database Design
- [ ] Finalize database schema
- [ ] Create migration scripts
- [ ] Set up RLS policies in Supabase
- [ ] Create seed data for testing (sample jobs, users)
- [ ] Test database queries

### 1.3 Recruiterflow API Exploration
- [ ] Get API credentials
- [ ] Test API endpoints (jobs, candidates)
- [ ] Document available data fields
- [ ] Map Recruiterflow fields to internal schema
- [ ] Test webhook delivery

**Deliverable**: Working database with test data, API access confirmed

---

## Phase 2: Backend Development (Week 3-4)

### 2.1 Core API Structure
- [ ] Initialize Cloudflare Workers project
- [ ] Set up Hono router
- [ ] Create database connection utilities
- [ ] Implement error handling and logging
- [ ] Set up CORS for frontend

### 2.2 Authentication
- [ ] Design authentication flow
- [ ] Implement JWT generation and validation
- [ ] Create auth middleware
- [ ] Create login endpoint
- [ ] Test with 4 user accounts

### 2.3 Job Data Endpoints
- [ ] `GET /api/jobs` - List all active jobs
- [ ] `GET /api/jobs/:id` - Get single job details
- [ ] `GET /api/jobs/:id/scores` - Get scoring history
- [ ] Test with Recruiterflow data

### 2.4 Recruiterflow Integration
- [ ] Create Recruiterflow API client
- [ ] Implement job sync logic
- [ ] Create webhook handler endpoint
- [ ] Verify webhook signature validation
- [ ] Implement scheduled sync (cron)
- [ ] Test full sync cycle

**Deliverable**: Working API that syncs job data from Recruiterflow

---

## Phase 3: Scoring System (Week 5-6)

### 3.1 Scoring Model Implementation
- [ ] Finalize scoring factor weights
- [ ] Implement score calculation functions
- [ ] Create rank assignment logic (A/B/C)
- [ ] Write unit tests for scoring calculations
- [ ] Validate calculation accuracy

### 3.2 Scoring API Endpoints
- [ ] `POST /api/jobs/:id/score` - Submit scores for a job
- [ ] `GET /api/jobs/:id/scores/history` - Get scoring history
- [ ] `GET /api/scoring/pending` - List jobs needing scores
- [ ] `GET /api/scoring/my-scores` - Get current user's scores
- [ ] Test scoring workflow

### 3.3 Scoring Business Logic
- [ ] Prevent duplicate scores in same scoring period
- [ ] Calculate team composite scores
- [ ] Update job rankings after new scores
- [ ] Handle partial scoring (not all 3 scorers done)
- [ ] Implement scoring reminders logic

**Deliverable**: Complete scoring engine with APIs

---

## Phase 4: Dashboard Frontend (Week 7-8)

### 4.1 Frontend Setup
- [ ] Initialize SvelteKit project
- [ ] Set up routing (SvelteKit file-based routing)
- [ ] Create component structure
- [ ] Set up state management (Svelte stores)
- [ ] Configure API client
- [ ] Implement authentication UI

### 4.2 Dashboard View
- [ ] Create job list/grid component
- [ ] Implement job card with all required fields:
  - Client name, job title
  - Days open
  - Candidate pipeline snapshot
  - Pipeline staleness metric
  - Job rank badge (A/B/C)
- [ ] Add sorting controls
- [ ] Add filtering controls
- [ ] Implement real-time updates (polling or Supabase realtime)

### 4.3 Dashboard Polish
- [ ] Visual hierarchy for A/B/C ranks
- [ ] Color coding and badges
- [ ] Responsive layout (mobile-friendly)
- [ ] Loading states and error handling
- [ ] Empty states (no jobs)

**Deliverable**: Functional dashboard displaying all jobs

---

## Phase 5: Scoring Interface (Week 9-10)

### 5.1 Scoring UI
- [ ] Create scoring form component
- [ ] Display job details from Recruiterflow
- [ ] Show previous scores (by this user)
- [ ] Show team average from last round
- [ ] Input fields for each scoring factor
- [ ] Factor descriptions/tooltips

### 5.2 Scoring Workflow
- [ ] List of jobs pending scoring
- [ ] Navigate between jobs easily
- [ ] Save partial progress
- [ ] Confirmation before submit
- [ ] Success feedback
- [ ] Update dashboard after scoring

### 5.3 Review & History Views
- [ ] Individual scorer patterns (CEO view)
- [ ] Scoring history for specific job
- [ ] Team scoring comparison
- [ ] Outlier detection visualization

**Deliverable**: Complete scoring interface for all users

---

## Phase 6: Pipeline Metrics (Week 11)

### 6.1 Pipeline Data Sync
- [ ] Fetch candidate pipeline from Recruiterflow
- [ ] Calculate stage transition times
- [ ] Store pipeline snapshots
- [ ] Calculate staleness metrics (avg days per stage)

### 6.2 Pipeline Display
- [ ] Show candidate count on dashboard
- [ ] Display pipeline staleness indicator
- [ ] Breakdown by stage (tooltip or expandable)
- [ ] Highlight bottlenecks (stages with long durations)

**Deliverable**: Dashboard shows pipeline health metrics

---

## Phase 7: Testing & Refinement (Week 12-13)

### 7.1 Integration Testing
- [ ] End-to-end test: Recruiterflow → Dashboard
- [ ] End-to-end test: Scoring workflow
- [ ] Test webhook delivery and processing
- [ ] Test scheduled sync
- [ ] Load testing (simulate 50+ jobs)

### 7.2 User Acceptance Testing
- [ ] Test with all 4 team members
- [ ] Gather feedback on UI/UX
- [ ] Test on different devices (desktop, mobile)
- [ ] Test on different browsers
- [ ] Identify pain points

### 7.3 Bug Fixes & Polish
- [ ] Fix bugs identified in testing
- [ ] Performance optimization
- [ ] Improve error messages
- [ ] Add keyboard shortcuts
- [ ] Polish animations and transitions

**Deliverable**: Production-ready application

---

## Phase 8: Deployment & Launch (Week 14)

### 8.1 Production Deployment
- [ ] Deploy Workers to production
- [ ] Deploy frontend to Cloudflare Pages
- [ ] Configure custom domain (if applicable)
- [ ] Set up production secrets
- [ ] Configure Recruiterflow webhooks to production URL

### 8.2 Data Migration
- [ ] Sync all active jobs from Recruiterflow
- [ ] Verify data accuracy
- [ ] Create initial user accounts
- [ ] Test production authentication

### 8.3 Monitoring Setup
- [ ] Set up error tracking
- [ ] Configure logging
- [ ] Set up uptime monitoring
- [ ] Create admin dashboard (Cloudflare + Supabase)

### 8.4 Documentation & Training
- [ ] Write user guide
- [ ] Create video walkthrough (optional)
- [ ] Document admin procedures
- [ ] Train 4 team members
- [ ] Establish weekly scoring cadence

**Deliverable**: Live application in production use

---

## Phase 9: Post-Launch & Iteration (Week 15+)

### 9.1 Monitoring & Optimization (Week 15-16)
- [ ] Monitor usage patterns
- [ ] Gather user feedback
- [ ] Optimize slow queries
- [ ] Adjust scoring weights if needed
- [ ] Fix any production issues

### 9.2 Quick Wins (Week 17-18)
- [ ] Add most-requested features
- [ ] Improve based on usability feedback
- [ ] Add notifications (email/Slack)
- [ ] Add export functionality (CSV)

### 9.3 Future Enhancements (Ongoing)
- [ ] Automated scoring for Time Open and Fee Size
- [ ] Client Engagement scoring from Recruiterflow data
- [ ] Predictive analytics (job success probability)
- [ ] Reporting and analytics dashboard
- [ ] Integration with communication tools
- [ ] Mobile app (if needed)

---

## Success Metrics

### MVP Success Criteria
- All actively sourced jobs appear on dashboard
- 4 team members can log in and score jobs
- Scores calculate correctly and display A/B/C ranks
- Weekly scoring workflow is smooth and <5 min per user
- Historical scores persist even after jobs close

### Post-Launch KPIs
- **Adoption**: All 4 users score jobs weekly (100% participation)
- **Efficiency**: Average time to score all jobs <30 minutes per week
- **Data quality**: <5% data discrepancies between Recruiterflow and dashboard
- **Impact**: A-ranked jobs have measurably better outcomes (placement rate, time-to-fill)

---

## Risk Mitigation

### Technical Risks
- **Recruiterflow API changes**: Use API versioning, monitor changelog
- **Data sync failures**: Implement retry logic, alerting
- **Worker deployment issues**: Maintain staging environment

### User Adoption Risks
- **Low participation**: Make scoring quick and intuitive, send reminders
- **Inconsistent scoring**: Provide clear criteria, show team comparisons
- **Resistance to change**: Involve team in design, demonstrate value early

### Data Risks
- **Scoring bias**: CEO review feature to audit patterns
- **Data loss**: Regular backups, test restore procedures
- **Privacy/security**: Limit access to 4 users, HTTPS everywhere

---

## Decision Points

### ~~Framework Choice~~ ✓ DECIDED
- **Decision**: SvelteKit for frontend
- **Rationale**: Lightweight, excellent DX, good for dashboards

### ~~Scoring Scale~~ ✓ DECIDED
- **Decision**: 1-5 scale for all scoring factors
- **Note**: Open to adjustment after initial testing

### ~~Rank Thresholds~~ ✓ DECIDED
- **Decision**: Fixed thresholds (A≥4.0, B≥2.5, C<2.5)
- **Rationale**: Consistency across scoring periods

### Authentication Method (Week 3)
- **Decide**: Custom JWT vs Supabase Auth vs magic links
- **Criteria**: Security, ease of use, maintenance

### Real-time Updates (Week 7)
- **Decide**: Polling vs Supabase Realtime vs WebSockets
- **Criteria**: Cost, complexity, user experience

---

## Resource Allocation

### Development Effort Estimates
- **Backend**: 40% of development time
- **Frontend**: 35% of development time
- **Integration**: 15% of development time
- **Testing & Polish**: 10% of development time

### Weekly Time Commitment (Single Developer)
- Weeks 1-6: 15-20 hours/week (foundation + core features)
- Weeks 7-10: 20-25 hours/week (UI development)
- Weeks 11-14: 10-15 hours/week (polish + deployment)

### Total Estimated Effort
- **MVP**: 200-250 hours (~14 weeks at 15-20 hours/week)
- **With buffer**: 300 hours (~3-4 months part-time)
