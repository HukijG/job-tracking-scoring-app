# Development Roadmap - Job Tracking and Scoring System

**Current Status:** Infrastructure complete, ready for Phase 1 development

For detailed phase breakdowns, see [@project_documentation/DEVELOPMENT_ROADMAP.md](project_documentation/DEVELOPMENT_ROADMAP.md)

---

## 🎯 Current Phase: Phase 1 - Database & API Foundation

### Next Immediate Tasks

#### 1.1 Environment Configuration ⏳
- [ ] Populate `backend/.dev.vars` with Supabase credentials
- [ ] Populate `frontend/.env` with API URL and Supabase keys
- [ ] Test environment variable loading in both apps

**Files Needed:**
- `backend/.dev.vars` (create from `.env.example`)
- `frontend/.env` (create from `.env.example` if it exists)

**Supabase Credentials Location:**
- Dashboard: https://supabase.com/dashboard
- Project Settings → API (URL, anon key, service_role key)

---

#### 1.2 Database Schema Implementation 📊
- [ ] Create migration scripts for Supabase
- [ ] Implement tables:
  - `jobs` - Cached job data
  - `job_scores` - Individual scoring inputs
  - `job_rankings` - Calculated A/B/C ranks
  - `pipeline_snapshots` - Candidate pipeline data
  - `users` - Team members
  - `sync_log` - Recruiterflow sync tracking
- [ ] Set up Row Level Security (RLS) policies
- [ ] Create seed data for testing (4 users, 10-15 sample jobs)
- [ ] Test database queries

**Reference:**
- Full schema: [@project_documentation/DATA_ARCHITECTURE.md](project_documentation/DATA_ARCHITECTURE.md#database-schema-supabase)

**Tools:**
- Supabase SQL Editor (web dashboard)
- Or migration files in `backend/migrations/` (create directory)

---

#### 1.3 Recruiterflow API Exploration 🔌
- [ ] Obtain Recruiterflow API credentials
- [ ] Test key endpoints:
  - `GET /jobs` - List jobs
  - `GET /jobs/:id` - Job details
  - `GET /jobs/:id/candidates` - Pipeline data
- [ ] Document available fields and map to internal schema
- [ ] Test webhook delivery (create test endpoint)
- [ ] Verify webhook signature validation method

**Reference:**
- Integration details: [@project_documentation/DATA_ARCHITECTURE.md](project_documentation/DATA_ARCHITECTURE.md#recruiterflow-integration)

---

#### 1.4 Git Repository Initialization (Optional) 📦
- [ ] Initialize Git (`git init`)
- [ ] Create `.gitignore` (ensure `.env`, `.dev.vars` excluded)
- [ ] Initial commit
- [ ] Create GitHub/GitLab repository
- [ ] Push to remote

**Reference:**
- Git conventions: [@project_documentation/GIT_WORKFLOW.md](project_documentation/GIT_WORKFLOW.md)

---

### Phase 1 Completion Criteria ✅
- Database schema deployed to Supabase
- Sample data seeded for testing
- Recruiterflow API access confirmed
- Environment variables configured
- (Optional) Git repository initialized

**Estimated Time:** 1-2 weeks

---

## 📅 Upcoming Phases (Summary)

### Phase 2: Backend API Development (Week 3-4)
**Focus:** Core API structure, authentication, job data endpoints, Recruiterflow integration

**Key Deliverables:**
- Working API with authentication
- Job data endpoints (`GET /api/jobs`, `GET /api/jobs/:id`)
- Recruiterflow sync logic (webhook handler + scheduled sync)

**Reference:** [@project_documentation/DEVELOPMENT_ROADMAP.md](project_documentation/DEVELOPMENT_ROADMAP.md#phase-2-backend-development-week-3-4)

---

### Phase 3: Scoring System (Week 5-6)
**Focus:** Scoring calculation engine, scoring API endpoints

**Key Deliverables:**
- Score calculation functions (weighted composite, A/B/C ranking)
- Scoring endpoints (`POST /api/jobs/:id/score`, scoring history)
- Business logic (prevent duplicates, team aggregation)

**Scoring Model Details:** [@project_documentation/SCORING_MODEL.md](project_documentation/SCORING_MODEL.md)

---

### Phase 4: Dashboard Frontend (Week 7-8)
**Focus:** Job list/grid display with sorting and filtering

**Key Deliverables:**
- Dashboard view with job cards (client, title, days open, rank badge)
- Sorting and filtering controls
- Responsive layout

**Feature Requirements:** [@project_documentation/FEATURES.md](project_documentation/FEATURES.md#dashboard-view)

---

### Phase 5: Scoring Interface (Week 9-10)
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

**Last Updated:** 2025-10-07
**Next Review:** After Phase 1 completion
