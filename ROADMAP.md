# Job Tracking and Scoring System: Master Roadmap

**Status:** In Progress ⚙️
**Current Phase:** Phase 4: Dashboard Frontend

---

## 1. Project Overview

This project is an internal web application for a recruitment agency to track and prioritize open jobs. It solves the problem of spreading resources across too many low-quality opportunities by implementing a systematic, team-based ranking system.

The application provides a central dashboard where team members can score jobs on multiple factors. It then calculates a weighted composite score to rank jobs into A, B, or C tiers, enabling the team to focus its efforts on the most valuable opportunities.

- **Users:** 4 internal team members (Account Manager, Sales Person, CEO, Coordinator).
- **Core Problem:** Inefficient resource allocation due to a lack of systematic focus on high-quality jobs.

---

## 2. Key Decisions & Principles

- **Source of Truth:** Recruiterflow is the absolute source of truth for all core job and candidate data. This scoring system supplements that data with ranking intelligence; it does not replace it.
- **Tech Stack:**
    - **Frontend:** SvelteKit on Cloudflare Pages
    - **Backend:** Hono on Cloudflare Workers
    - **Database:** Supabase (PostgreSQL)
- **Scoring Model:** All factors are scored on a simple **1-5 scale**. Ranks are assigned based on fixed composite score thresholds (e.g., A ≥ 4.0, B ≥ 2.5, C < 2.5) for consistency.
- **Development Workflow:** A feature-branch workflow (`feature/...`, `fix/...`) is used in Git to ensure the `main` branch remains stable.

---

## 3. Master Phased Roadmap

This roadmap outlines the major development phases from inception to launch and beyond.

- **Phase 1: Foundation & Setup** - ✅ Complete
  - *Objective:* Establish the complete project infrastructure, including Cloudflare, Supabase, Git, and a finalized database schema.

- **Phase 2: Backend Development** - ✅ Complete
  - *Objective:* Build the core API, including authentication, job data endpoints, and the initial Recruiterflow data sync mechanism.

- **Phase 3: Scoring System** - ✅ Complete
  - *Objective:* Implement the scoring calculation engine and all necessary API endpoints for submitting and retrieving scores.

- **Phase 4: Dashboard Frontend** - ⚙️ **In Progress**
  - *Objective:* Develop the primary user-facing dashboard for displaying, sorting, and filtering jobs.

- **Phase 5: Scoring Interface** - 🔜 Up Next
  - *Objective:* Build the UI for users to submit their scores for each job.

- **Phase 6: Pipeline Metrics** - 🔜 Up Next
  - *Objective:* Integrate and display candidate pipeline health metrics on the dashboard.

- **Phase 7: Testing & Refinement** - 🔜 Up Next
  - *Objective:* Conduct comprehensive integration testing, User Acceptance Testing (UAT), and final bug fixes.

- **Phase 8: Deployment & Launch** - 🔜 Up Next
  - *Objective:* Deploy the application to production, migrate data, and onboard the team.

- **Phase 9: Post-Launch & Iteration** - 🔜 Up Next
  - *Objective:* Monitor application usage, gather feedback, and implement incremental improvements.

---

## 4. Current Phase: Detailed Tasks

### Phase 4: Dashboard Frontend ⚙️

- **4.1: Dashboard Core & Setup** - ✅ Complete
  - *SvelteKit project, routing, API client, and auth UI are set up.*

- **4.2: Dashboard View, Filtering & Sorting** - ✅ Complete
  - *The main dashboard view with job cards, rank badges, and working filter/sort controls is implemented.*

- **4.3: Visual Design & Polish** - ⚙️ **Next Up**
  - *Task: Refine the UI with a clear visual hierarchy, responsive layouts, and polished loading/empty states.*

- **4.4: Dashboard Enhancements** - 🔲 To Do
  - *Task: Add UX features like "days open" indicators, pipeline health badges, and navigation to a job detail view.*

---

## 5. Progress Log

*A reverse-chronological list of major milestones.*

- **2025-10-09:** Phase 4.2 (Filtering & Sorting) completed.
- **2025-10-09:** Phase 4.1 (Dashboard Core) completed.
- **2025-10-08:** Phase 3 (Scoring System) backend logic completed.
- **2025-10-08:** Phase 2 (Backend API) completed.
- **2025-10-08:** Phase 1 (Foundation & Setup) completed.
- **2025-10-07:** Initial project setup, technical decisions, and repository creation.