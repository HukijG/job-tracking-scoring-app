# Development Roadmap - Job Tracking and Scoring System

**Current Status:** Infrastructure complete, ready for Phase 1 development

For detailed phase breakdowns, see [@project_documentation/DEVELOPMENT_ROADMAP.md](project_documentation/DEVELOPMENT_ROADMAP.md)

---

## 🎯 Current Phase: Phase 2 Complete - Ready for Phase 3

### Phase 1 - Database & API Foundation ✅ COMPLETE

#### 1.1 Environment Configuration ✅
- [x] Populate `backend/.dev.vars` with Supabase credentials
- [x] Populate `frontend/.env` with API URL and Supabase keys
- [x] Test environment variable loading in both apps
- [x] Updated to new Supabase API key format (`sb_publishable_...` and `sb_secret_...`)

#### 1.2 Database Schema Implementation ✅
- [x] Create migration scripts for Supabase
- [x] Implement all 6 tables:
  - `users` - Team members
  - `jobs` - Cached job data
  - `job_scores` - Individual scoring inputs
  - `job_rankings` - Calculated A/B/C ranks
  - `pipeline_snapshots` - Candidate pipeline data
  - `sync_log` - Recruiterflow sync tracking
- [x] Set up Row Level Security (RLS) policies
- [x] Create seed data for testing (4 users, 15 sample jobs)
- [x] Test database queries and connection

**Completed:**
- Migration file: `backend/migrations/001_initial_schema.sql`
- Seed file: `backend/migrations/002_seed_data.sql`
- Backend test endpoint: `GET /api/test-db`

#### 1.3 Recruiterflow API Exploration 🔜
- [ ] Obtain Recruiterflow API credentials
- [ ] Test key endpoints
- [ ] Document available fields and map to internal schema
- [ ] Test webhook delivery
- [ ] Verify webhook signature validation method

**Note:** Deferred to later - focusing on core API first

---

### Phase 1 Completion Summary ✅
- ✅ Database schema deployed to Supabase
- ✅ Sample data seeded for testing
- ✅ Environment variables configured
- ✅ Backend connection to Supabase verified
- ✅ Git repository initialized and updated

**Completed:** 2025-10-08

---

## 📅 Next Steps: Phase 2 Tasks

### Phase 2.1: Core API Endpoints ✅ COMPLETE
**Priority:** HIGH | **Completed:** 2025-10-08

Implement basic CRUD endpoints for jobs data using the existing database.

#### Tasks:
- [x] **2.1.1** Create Supabase client helper function
  - Location: `backend/src/lib/supabase.ts`
  - Reusable client initialization with proper config
  - Export typed client for use across routes

- [x] **2.1.2** Implement `GET /api/jobs` endpoint
  - Fetch all active jobs from database
  - Include current ranking data (join with `job_rankings`)
  - Add query params for filtering (status, rank)
  - Sort by composite score (descending)
  - Return: Array of jobs with rankings

- [x] **2.1.3** Implement `GET /api/jobs/:id` endpoint
  - Fetch single job by ID
  - Include current ranking
  - Include scoring history (all scores for this job)
  - Include pipeline snapshots
  - Return: Job object with nested data

- [x] **2.1.4** Implement `GET /api/dashboard` endpoint
  - Aggregate data for dashboard view
  - Count jobs by rank (A/B/C)
  - Count total active jobs
  - Recent activity (latest scores/rankings)
  - Return: Dashboard summary object

- [x] **2.1.5** Test all endpoints
  - Use curl or Postman
  - Verify data structure
  - Check error handling

**Test Results:**
- ✅ `GET /api/jobs` - Returns 10 active jobs sorted by composite score
- ✅ `GET /api/jobs?rank=A` - Filter working (returns 1 A-ranked job)
- ✅ `GET /api/jobs/:id` - Returns nested data (job, ranking, score history, pipeline)
- ✅ `GET /api/dashboard` - Returns aggregated stats (10 active, 1 A, 1 B, 1 C)
- ✅ 404 error handling - Returns proper error for non-existent job ID

---

### Phase 2.2: Scoring API ✅ COMPLETE
**Priority:** HIGH | **Completed:** 2025-10-08

Implement endpoints for submitting and calculating job scores.

#### Tasks:
- [x] **2.2.1** Create scoring calculation functions
  - Location: `backend/src/lib/scoring.ts`
  - Calculate weighted composite score
  - Determine A/B/C rank based on score
  - Reference: [@project_documentation/SCORING_MODEL.md](project_documentation/SCORING_MODEL.md)

- [x] **2.2.2** Implement `POST /api/jobs/:id/score` endpoint
  - Accept scoring data (4 factors, 1-5 scale)
  - Validate input (required fields, value ranges)
  - Insert into `job_scores` table
  - Recalculate job ranking
  - Insert/update `job_rankings` table
  - Return: Updated job with new ranking

- [x] **2.2.3** Implement `GET /api/jobs/:id/scores` endpoint
  - Fetch all scores for a job
  - Include scorer information (user name, role)
  - Sort by date (newest first)
  - Return: Array of score objects
  - **Note:** Already implemented as part of `GET /api/jobs/:id` endpoint

- [x] **2.2.4** Add validation and error handling
  - Check if job exists
  - Prevent duplicate scores (same user, same date)
  - Validate scorer_id against `users` table
  - Return appropriate HTTP status codes

**Test Results:**
- ✅ Valid score submission - Returns 200 with updated ranking
- ✅ Duplicate score detection - Returns 409 Conflict
- ✅ Invalid job ID - Returns 404 Not Found
- ✅ Invalid scorer ID - Returns 400 Bad Request
- ✅ Score out of range (6) - Returns 400 with validation error
- ✅ Missing required fields - Returns 400 with clear message
- ✅ Multi-scorer aggregation - Correctly calculates average composite score
- ✅ Rank calculation - A (≥4.0), B (≥2.5), C (<2.5) working correctly

---

### Phase 2.3: Authentication (Optional for MVP) 🔐
**Priority:** MEDIUM | **Estimated Time:** 1-2 days

Simple authentication to identify users when scoring.

#### Tasks:
- [ ] **2.3.1** Implement basic API key or JWT validation
  - Simple middleware for protected routes
  - Match user ID from token to `users` table
  - OR use Supabase Auth (simpler)

- [ ] **2.3.2** Protect scoring endpoints
  - Require authentication for POST /api/jobs/:id/score
  - Read-only endpoints can remain open for MVP

**Note:** Can be deferred if testing with hardcoded user IDs first

---

### Phase 2 Completion Criteria ✅
- [x] All job endpoints working and tested
- [x] Scoring submission and calculation working
- [x] Dashboard endpoint returns aggregated data
- [x] Error handling implemented
- [x] Ready to connect frontend

**Completed:** 2025-10-08

---

---

## 🎯 Current Phase: Phase 4 - Dashboard Frontend

**Status:** Phase 4.1 Complete ✅ | **Next:** Phase 4.2 - Filtering & Sorting

### Phase 4.1: Dashboard Core ✅ COMPLETE
**Priority:** HIGH | **Completed:** 2025-10-09

Build the main dashboard view that displays all jobs with rankings.

#### Tasks:
- [x] **4.1.1** Create JobCard component (`frontend/src/lib/components/JobCard.svelte`)
  - Display job title, client name
  - Show rank badge (A/B/C with color coding)
  - Display days open (calculated from date_opened)
  - Show candidate pipeline count (if available)
  - Add click handler to navigate to job details
  - Responsive design (mobile-friendly)

- [x] **4.1.2** Create Dashboard page (`frontend/src/routes/dashboard/+page.svelte`)
  - Import and use JobCard component
  - Grid/list layout for job cards
  - Header with page title and stats summary
  - Loading state while fetching data
  - Error handling for API failures

- [x] **4.1.3** Implement data fetching
  - Updated jobs store (`frontend/src/lib/stores/jobs.ts`)
  - Fetch from `GET /api/jobs` endpoint
  - Transform API response to component format
  - Handle empty state (no jobs)
  - Fixed status filter (actively_sourcing)

- [x] **4.1.4** Create DashboardStats component
  - Total active jobs count
  - Breakdown by rank (A: X, B: Y, C: Z)
  - Fetch from `GET /api/dashboard` endpoint
  - Display as summary cards/badges

**Test Results:**
- ✅ Dashboard displays all 10 active jobs from seed data
- ✅ Rank badges show correct colors (A=green, B=yellow, C=red)
- ✅ Days open calculates correctly
- ✅ Stats show: 10 total, 1 A, 1 B, 1 C
- ✅ Responsive grid layout working
- ✅ Loading and error states implemented

**Completed:** 2025-10-09

---

### Phase 4.2: Filtering & Sorting ⚙️
**Priority:** HIGH | **Estimated:** 2-3 days

Add controls to filter and sort the job list.

#### Tasks:
- [ ] **4.2.1** Create FilterControls component
  - Dropdown for rank filter (All, A, B, C)
  - Dropdown for status filter (Active, Closed, All)
  - Clear filters button
  - Update URL params to persist filters

- [ ] **4.2.2** Create SortControls component
  - Sort by composite score (default, descending)
  - Sort by days open (ascending/descending)
  - Sort by client name (alphabetical)
  - Toggle sort direction

- [ ] **4.2.3** Implement filter logic
  - Add filter state to jobs store
  - Apply filters to job list reactively
  - Update API call with query params (`?rank=A`, `?status=active`)
  - Show "No results" message when filters yield empty

- [ ] **4.2.4** Implement sort logic
  - Add sort state to jobs store
  - Sort jobs client-side after fetch
  - Persist sort preference in localStorage
  - Visual indicator for active sort

- [ ] **4.2.5** Add search functionality (optional)
  - Search input field
  - Filter by job title or client name
  - Real-time filtering as user types

**Test Criteria:**
- Filter by rank A shows only A-ranked job(s)
- Sort by days open reorders jobs correctly
- URL updates with filter params (shareable links)
- Search filters jobs in real-time

---

### Phase 4.3: Visual Design & Polish ⚙️
**Priority:** MEDIUM | **Estimated:** 2 days

Polish the UI for production-ready appearance.

#### Tasks:
- [ ] **4.3.1** Design rank badge system
  - A badge: Green (#10B981 or similar), bold
  - B badge: Yellow (#F59E0B), medium weight
  - C badge: Red (#EF4444), visible but not alarming
  - Consistent sizing and placement

- [ ] **4.3.2** Responsive layout
  - Desktop: 3-4 column grid
  - Tablet: 2 column grid
  - Mobile: Single column list
  - Test on common screen sizes

- [ ] **4.3.3** Loading states
  - Skeleton loader for job cards
  - Loading spinner for dashboard stats
  - Smooth transition when data loads

- [ ] **4.3.4** Empty states
  - "No jobs found" with illustration or icon
  - "No jobs match filters" with clear filters CTA
  - First-time user message (optional)

- [ ] **4.3.5** Visual hierarchy
  - Emphasize A-ranked jobs (larger, prominent)
  - Subtle styling for C-ranked jobs
  - Clear typography and spacing
  - Consistent color scheme

**Test Criteria:**
- Dashboard looks professional and polished
- Colors are accessible (WCAG AA contrast)
- Responsive on mobile, tablet, desktop
- Loading states appear during data fetch

---

### Phase 4.4: Dashboard Enhancements ⚙️
**Priority:** MEDIUM | **Estimated:** 1-2 days

Add nice-to-have features for better UX.

#### Tasks:
- [ ] **4.4.1** Days open indicator
  - Calculate from `created_at` field
  - Visual urgency indicator (e.g., >30 days = warning color)
  - Tooltip with exact date opened

- [ ] **4.4.2** Pipeline indicators
  - Show candidate count badge on job card
  - Color code by pipeline health (many candidates = green, few = yellow)
  - Link to pipeline detail view (future phase)

- [ ] **4.4.3** Job detail navigation
  - Click job card to view full details
  - Create stub job detail page (`/dashboard/jobs/[id]`)
  - Display full job info + scoring history (basic view)

- [ ] **4.4.4** Refresh and data staleness
  - Manual refresh button
  - Auto-refresh every 60 seconds (configurable)
  - "Last updated" timestamp
  - Visual indicator when data is stale

**Test Criteria:**
- Days open displays correctly for all jobs
- Click job card navigates to detail page
- Refresh button fetches latest data
- Pipeline counts display when available

---

### Phase 4 Completion Criteria ✅
- [ ] Dashboard displays all active jobs from database
- [ ] Filtering by rank (A/B/C) works correctly
- [ ] Sorting by score/days open works
- [ ] Rank badges are visually clear and color-coded
- [ ] Responsive layout works on mobile and desktop
- [ ] Loading and error states handled gracefully
- [ ] Ready for user testing with team

**Estimated Completion:** 1-2 weeks

---

## 📅 Alternative Next Steps

**Option A: Complete Phase 4** (Recommended)
- Provides immediate visual value
- Allows user testing and feedback
- Validates backend API with real UI

**Option B: Phase 3 - Scoring System Refinement**
- Add analytics and score history views
- Implement advanced scoring logic
- Build scoring comparison tools

**Option C: Phase 1.3 - Recruiterflow Integration**
- Sync real job data from Recruiterflow
- Set up webhooks for live updates
- Replace seed data with production data

---

## 📅 Upcoming Phases (Summary)

### Phase 3: Scoring System Refinement
**Focus:** Scoring calculation engine optimization, business rules

**Key Deliverables:**
- Advanced scoring logic (time-based factors)
- Score history and analytics
- Team aggregation and comparison

**Scoring Model Details:** [@project_documentation/SCORING_MODEL.md](project_documentation/SCORING_MODEL.md)

---

### Phase 4: Dashboard Frontend
**Focus:** Job list/grid display with sorting and filtering

**Key Deliverables:**
- Dashboard view with job cards (client, title, days open, rank badge)
- Sorting and filtering controls
- Responsive layout

**Feature Requirements:** [@project_documentation/FEATURES.md](project_documentation/FEATURES.md#dashboard-view)

---

### Phase 5: Scoring Interface
**Focus:** Scoring form, workflow, history views

**Key Deliverables:**
- Scoring form with factor inputs (1-5 scale)
- Job-by-job navigation
- Score history and team comparison views

---

### Phase 6: Pipeline Metrics (Week 11)
**Focus:** Candidate pipeline data sync and display

**Key Deliverables:**
- Pipeline data sync from Recruiterflow
- Staleness metrics (days per stage)
- Pipeline health indicators on dashboard

---

### Phase 7: Testing & Refinement (Week 12-13)
**Focus:** Integration testing, UAT, bug fixes

**Key Deliverables:**
- End-to-end tests for key workflows
- User acceptance testing with 4 team members
- Performance optimization

---

### Phase 8: Deployment & Launch (Week 14)
**Focus:** Production deployment, monitoring, training

**Key Deliverables:**
- Live application on Cloudflare (Workers + Pages)
- Production Recruiterflow webhooks configured
- Team trained and onboarded

**Deployment Guide:** [@project_documentation/DEPLOYMENT.md](project_documentation/DEPLOYMENT.md)

---

### Phase 9: Post-Launch Iteration (Week 15+)
**Focus:** Monitor usage, gather feedback, quick wins

**Key Enhancements:**
- Notifications (email/Slack)
- Export functionality (CSV)
- Automated scoring for time-based factors

---

## 🎯 Success Metrics

### MVP Success (Post-Phase 8)
- ✅ All active jobs appear on dashboard
- ✅ 4 team members can score jobs (<5 min per user)
- ✅ A/B/C ranks calculate correctly
- ✅ Historical scores persist after job closure

### Post-Launch KPIs (Phase 9+)
- 100% participation (all 4 users score weekly)
- <30 min total scoring time per week
- <5% data discrepancies vs. Recruiterflow
- A-ranked jobs show better outcomes (placement rate, time-to-fill)

---

## 📚 Documentation Index

### Quick Reference (High-Level)
- [CLAUDE.md](CLAUDE.md) - AI development guide (start here!)
- [SETUP_PROGRESS.md](SETUP_PROGRESS.md) - Current infrastructure status
- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Business context

### Detailed Planning (project_documentation/)
- [DEVELOPMENT_ROADMAP.md](project_documentation/DEVELOPMENT_ROADMAP.md) - Full phase breakdown
- [DATA_ARCHITECTURE.md](project_documentation/DATA_ARCHITECTURE.md) - Database schema, data flows
- [SCORING_MODEL.md](project_documentation/SCORING_MODEL.md) - Scoring algorithm
- [FEATURES.md](project_documentation/FEATURES.md) - Detailed requirements
- [DEPLOYMENT.md](project_documentation/DEPLOYMENT.md) - Deployment procedures
- [GIT_WORKFLOW.md](project_documentation/GIT_WORKFLOW.md) - Git conventions
- [DECISIONS.md](project_documentation/DECISIONS.md) - Architecture decisions
- [VERSIONS.md](project_documentation/VERSIONS.md) - Version tracking

---

## 🚀 Getting Started for Development

### 1. Review Context
- Read [CLAUDE.md](CLAUDE.md) - Understand tech stack and architecture
- Check [SETUP_PROGRESS.md](SETUP_PROGRESS.md) - See what's already built

### 2. Set Up Environment
- Follow **Phase 1.1** tasks above (environment configuration)
- Get Supabase credentials from dashboard
- Test both backend and frontend locally

### 3. Implement Database
- Follow **Phase 1.2** tasks above (database schema)
- Use [@project_documentation/DATA_ARCHITECTURE.md](project_documentation/DATA_ARCHITECTURE.md) as reference

### 4. Connect to Recruiterflow
- Follow **Phase 1.3** tasks above (API exploration)
- Test integration before building features

### 5. Proceed to Phase 2
- Once Phase 1 complete, move to backend development
- Reference [@project_documentation/DEVELOPMENT_ROADMAP.md](project_documentation/DEVELOPMENT_ROADMAP.md#phase-2-backend-development-week-3-4)

---

**Last Updated:** 2025-10-08
**Current Branch:** `feature/phase-2.1-core-api-endpoints` (ready to merge)
**Next Phase:** Phase 4 - Dashboard Frontend (recommended)
