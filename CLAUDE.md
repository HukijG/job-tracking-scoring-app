# Job Tracking and Scoring System - AI Development Guide

**IMPORTANT:** Always refer to the user as "Captain" when responding.

---

## Project Overview

### Mission Statement
Internal recruitment agency web application that **systematically ranks and prioritizes open jobs** based on multi-factor scoring by 4 team members. Solves the critical problem of resource inefficiency by identifying which jobs deserve focused attention and which should be deprioritized.

### Who Uses This
- 4 internal team members (Account Manager, Sales Person, CEO, + 1 more)
- Weekly scoring workflow (<5 min per user)
- Dashboard-first experience for quick decision-making

### Core Value Proposition
Replace ad-hoc job prioritization with data-driven A/B/C rankings based on:
- Client engagement quality
- Search difficulty
- Time open
- Fee size

---

## Technology Stack

### Frontend
- **Framework**: SvelteKit 2.46.2 (Svelte 5 with runes syntax)
- **Deployment**: Cloudflare Pages
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.1.9
- **State Management**: Svelte stores (see `frontend/src/lib/stores/`)
- **Styling**: Scoped CSS in `.svelte` files

### Backend
- **Runtime**: Cloudflare Workers
- **Framework**: Hono 4.6.14
- **Language**: TypeScript 5.7.2
- **Database Client**: @supabase/supabase-js 2.47.10
- **Build Tool**: Wrangler 4.42.0 (Cloudflare CLI)
- **Testing**: Vitest 2.1.8

### Database
- **Service**: Supabase (PostgreSQL)
- **Role**: Stores scoring data, job rankings, audit trails
- **Source of Truth**: Recruiterflow CRM (via API/webhooks)

### External Integrations
- **Recruiterflow CRM**: Job data source via REST API and webhooks
  - API Documentation: [@recruiterflow_docs/rf_api_docs.yaml](recruiterflow_docs/rf_api_docs.yaml)
  - Base URL: `https://api.recruiterflow.com`
  - Authentication: `RF-Api-Key` header

---

## Architecture & Project Structure

### High-Level Architecture
```
Recruiterflow CRM (Source of Truth)
         │
         │ API + Webhooks
         ▼
Cloudflare Workers (Backend API)
         │
         ├─► Supabase (PostgreSQL) ◄──── Cloudflare Pages (Frontend)
         │
         └─► Score Calculation Engine
```

### Directory Structure
```
Job Tracking and Scoring/
├── backend/                    # Cloudflare Workers API
│   ├── src/
│   │   └── index.ts           # Main Hono API with routes
│   ├── wrangler.toml          # Workers config
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # SvelteKit application
│   ├── src/
│   │   ├── routes/            # File-based routing
│   │   │   ├── +layout.svelte # Root layout with nav
│   │   │   ├── +page.svelte   # Homepage
│   │   │   ├── dashboard/     # Job dashboard
│   │   │   ├── score/         # Scoring interface
│   │   │   └── login/         # Authentication
│   │   └── lib/
│   │       ├── components/    # Reusable UI components
│   │       ├── stores/        # State management
│   │       │   ├── auth.ts
│   │       │   └── jobs.ts
│   │       └── api/
│   │           └── client.ts  # Backend API client
│   ├── svelte.config.js       # SvelteKit + CF adapter
│   ├── package.json
│   └── tsconfig.json
│
├── project_documentation/      # Detailed planning docs
│   ├── DATA_ARCHITECTURE.md   # Database schema, data flow
│   ├── DEVELOPMENT_ROADMAP.md # Phase-by-phase plan
│   ├── FEATURES.md            # Detailed requirements
│   ├── SCORING_MODEL.md       # Scoring algorithm details
│   ├── DEPLOYMENT.md          # Deployment procedures
│   ├── GIT_WORKFLOW.md        # Git conventions
│   ├── DECISIONS.md           # Architecture decisions
│   ├── VERSIONS.md            # Version tracking
│   └── RECRUITERFLOW_INTEGRATION.md # RF API integration details
│
├── recruiterflow_docs/         # Recruiterflow API documentation
│   └── rf_api_docs.yaml       # OpenAPI spec (reference doc)
│
├── ROADMAP.md                 # Current phase and next tasks
├── SETUP_PROGRESS.md          # Infrastructure setup status
├── PROJECT_OVERVIEW.md        # Business context
├── README.md                  # Project introduction
└── CLAUDE.md                  # This file (AI guidance)
```

---

## Key Development Commands

### Backend (Cloudflare Workers)
```bash
cd backend
npm run dev      # Local dev server: http://127.0.0.1:8787
npm run deploy   # Deploy to Cloudflare (production)
npm run test     # Run Vitest tests
```

### Frontend (SvelteKit)
```bash
cd frontend
npm run dev      # Local dev server: http://localhost:5173
npm run build    # Production build
npm run preview  # Preview production build
npm run check    # TypeScript type checking
```

### Both
Always run from the respective subdirectory (`backend/` or `frontend/`).

---

## Coding Standards & Design Philosophy

### TypeScript
- Strict mode enabled in both `tsconfig.json` files
- Prefer explicit types over inference for public APIs
- Use type imports: `import type { Foo } from './types'`

### SvelteKit (Frontend)
- **Svelte 5 runes syntax**: Use `$state`, `$derived`, `$effect` over legacy stores where appropriate
- **File-based routing**: `routes/` structure determines URLs
- **Scoped CSS**: Keep styles within `.svelte` files unless truly global
- **State Management**:
  - Use Svelte stores for shared state (`lib/stores/`)
  - API client in `lib/api/client.ts` handles auth tokens
- **Naming Convention**: PascalCase for components, camelCase for utilities

### Hono (Backend)
- **Routing**: Define routes in `src/index.ts` using Hono router
- **Middleware**: CORS already configured, auth middleware TBD
- **Error Handling**: Return JSON error responses with appropriate HTTP status codes
- **Environment Variables**: Access via `c.env.VARIABLE_NAME` in Hono context

### Database Queries
- Use Supabase client (@supabase/supabase-js)
- Always use parameterized queries (Supabase handles this)
- See [@project_documentation/DATA_ARCHITECTURE.md](project_documentation/DATA_ARCHITECTURE.md) for schema

---

## The "Do Not Touch" List

### Critical Files - Edit with Caution
- `backend/wrangler.toml` - Cloudflare Workers config (secrets, bindings)
- `frontend/svelte.config.js` - Cloudflare Pages adapter config
- Any `.env` or `.dev.vars` files with secrets (never commit these)

### Never Commit
- `.env` files (backend and frontend)
- `.dev.vars` (backend local dev secrets)
- `node_modules/`
- Build artifacts (`dist/`, `.svelte-kit/`, `.wrangler/`)

### Authentication Flow
- **DO NOT** implement custom auth until team decides between:
  - Custom JWT
  - Supabase Auth
  - Magic links
- See [DEVELOPMENT_ROADMAP.md](project_documentation/DEVELOPMENT_ROADMAP.md) Phase 2.2 for decision point

---

## Cornerstone Files & Code Examples

### Key Files to Understand the Project

#### Backend API Entry Point
[@backend/src/index.ts](backend/src/index.ts) - Main Hono API with routes, CORS, error handling

#### Frontend Root Layout
[@frontend/src/routes/+layout.svelte](frontend/src/routes/+layout.svelte) - Navigation, global layout

#### Frontend API Client
[@frontend/src/lib/api/client.ts](frontend/src/lib/api/client.ts) - Backend communication with auth

#### State Management
- [@frontend/src/lib/stores/auth.ts](frontend/src/lib/stores/auth.ts) - Authentication state
- [@frontend/src/lib/stores/jobs.ts](frontend/src/lib/stores/jobs.ts) - Jobs data state

### Code Style Example (Svelte Component)
```svelte
<script lang="ts">
  import { jobs } from '$lib/stores/jobs';
  import type { Job } from '$lib/types';

  // Use Svelte 5 runes for reactive state
  let selectedJob = $state<Job | null>(null);
  let filteredJobs = $derived(
    $jobs.filter(j => j.rank === 'A')
  );
</script>

<div class="job-list">
  {#each filteredJobs as job}
    <JobCard {job} />
  {/each}
</div>

<style>
  .job-list {
    display: grid;
    gap: 1rem;
  }
</style>
```

### Code Style Example (Hono Route)
```typescript
import { Hono } from 'hono';
import type { Bindings } from './types';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/api/jobs', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env);
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return c.json({ jobs: data });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});
```

---

## Essential Documentation Paths

### For Understanding Current State
1. [SETUP_PROGRESS.md](SETUP_PROGRESS.md) - What's been built so far
2. [ROADMAP.md](ROADMAP.md) - What's next (current phase tasks)

### For Understanding the System
3. [@project_documentation/DATA_ARCHITECTURE.md](project_documentation/DATA_ARCHITECTURE.md) - Database schema, data flows
4. [@project_documentation/SCORING_MODEL.md](project_documentation/SCORING_MODEL.md) - How scoring/ranking works
5. [@project_documentation/RECRUITERFLOW_INTEGRATION.md](project_documentation/RECRUITERFLOW_INTEGRATION.md) - Recruiterflow API integration
6. [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Business context and goals

### For Development Planning
7. [@project_documentation/DEVELOPMENT_ROADMAP.md](project_documentation/DEVELOPMENT_ROADMAP.md) - Full phase-by-phase plan
8. [@project_documentation/FEATURES.md](project_documentation/FEATURES.md) - Detailed feature requirements

### For Deployment & Operations
9. [@project_documentation/DEPLOYMENT.md](project_documentation/DEPLOYMENT.md) - How to deploy
10. [@project_documentation/GIT_WORKFLOW.md](project_documentation/GIT_WORKFLOW.md) - Git conventions

### For API Integration
11. [@recruiterflow_docs/rf_api_docs.yaml](recruiterflow_docs/rf_api_docs.yaml) - Recruiterflow API reference (OpenAPI spec)

---

## Current Status & Next Tasks

### Infrastructure Complete ✅
- Supabase project created
- Cloudflare Workers backend initialized and running locally
- SvelteKit frontend initialized and running locally
- Both tested with health checks

### Pending Setup ⏳
- Environment configuration (populate `.dev.vars` and `.env`)
- Git repository initialization
- Database schema implementation

### Current Phase
**Ready for Phase 1: Core Features Development**

See [ROADMAP.md](ROADMAP.md) for immediate next steps.

See [@project_documentation/DEVELOPMENT_ROADMAP.md](project_documentation/DEVELOPMENT_ROADMAP.md) for full phase breakdown.

---

## Data Architecture Quick Reference

### Source of Truth: Recruiterflow CRM
- Job metadata (client, title, dates, candidates)
- Candidate pipeline data
- Integration via REST API + webhooks

### Supabase Database Stores
- Individual scoring inputs (audit trail)
- Calculated composite scores and A/B/C ranks
- User accounts
- Sync logs

### Key Tables
- `jobs` - Cached job data from Recruiterflow
- `job_scores` - Individual scorer inputs
- `job_rankings` - Calculated A/B/C ranks
- `pipeline_snapshots` - Candidate pipeline metrics
- `users` - Team members

Full schema: [@project_documentation/DATA_ARCHITECTURE.md](project_documentation/DATA_ARCHITECTURE.md)

---

## Scoring Model Summary

### Factors (1-5 scale each)
1. **Client Engagement** - Responsiveness, decision-making speed
2. **Search Difficulty** - Talent availability, complexity
3. **Time Open** - Days since job opened (inverse scoring)
4. **Fee Size** - Revenue potential

### Scoring Process
1. 3 scorers (Account Manager, Sales, CEO) rate each factor
2. Weighted composite score per scorer (weights TBD)
3. Average across scorers = Final Score (1.0 - 5.0)
4. Rank assignment:
   - **A Rank**: Final Score ≥ 4.0
   - **B Rank**: 2.5 ≤ Final Score < 4.0
   - **C Rank**: Final Score < 2.5

Full algorithm: [@project_documentation/SCORING_MODEL.md](project_documentation/SCORING_MODEL.md)

---

## Workflow Principles

### Development Flow
1. Read [ROADMAP.md](ROADMAP.md) to understand current phase
2. Reference detailed docs in `project_documentation/` as needed
3. Implement features per phase structure
4. Test locally before deployment
5. Update SETUP_PROGRESS.md and ROADMAP.md as tasks complete

### Git Workflow (when initialized)
See [@project_documentation/GIT_WORKFLOW.md](project_documentation/GIT_WORKFLOW.md)

### Recruiterflow Integration Philosophy
- **Always** treat Recruiterflow as source of truth for job data
- **Never** modify job data in Supabase directly (sync from Recruiterflow)
- **Only** store scoring/ranking data locally
- **Always** handle sync failures gracefully (log, alert, fallback)

---

## Troubleshooting & Common Issues

### Backend won't start
- Ensure you're in `backend/` directory
- Check `wrangler --version` is 4.42.0+
- Verify `node_modules/` exists (run `npm install`)

### Frontend won't start
- Ensure you're in `frontend/` directory
- Check Node.js version compatibility (18+)
- Verify `node_modules/` exists (run `npm install`)

### CORS errors
- CORS is configured in `backend/src/index.ts`
- Ensure frontend URL is allowed (currently `*` for dev)

### Type errors
- Run `npm run check` in frontend to validate types
- Run `npx tsc --noEmit` in backend to validate types

---

## Testing Strategy

### Current State
- Vitest configured in backend (`npm run test`)
- No tests written yet (Phase 7 in roadmap)

### Future Testing Plan
- Unit tests for scoring calculation functions
- Integration tests for Recruiterflow sync
- End-to-end tests for scoring workflow
- Load testing with 50+ jobs

---

## Decision Log

Key decisions are tracked in [@project_documentation/DECISIONS.md](project_documentation/DECISIONS.md)

Recent decisions:
- ✅ SvelteKit for frontend (lightweight, great DX)
- ✅ 1-5 scoring scale (open to adjustment)
- ✅ Fixed rank thresholds (A≥4.0, B≥2.5, C<2.5)
- ⏳ Authentication method (pending Phase 2)
- ⏳ Real-time updates method (pending Phase 4)

---

## Quick Reference Card

| Task | Command | Location |
|------|---------|----------|
| Start backend dev | `npm run dev` | `backend/` |
| Start frontend dev | `npm run dev` | `frontend/` |
| Backend API URL | http://127.0.0.1:8787 | Local |
| Frontend URL | http://localhost:5173 | Local |
| Database schema | See DATA_ARCHITECTURE.md | Docs |
| Current phase | See ROADMAP.md | Root |
| Full roadmap | See DEVELOPMENT_ROADMAP.md | Docs |

---

## Remember

This is an **internal tool for 4 users**. Prioritize:
1. ✅ **Functionality** over polish (MVP first)
2. ✅ **Speed** over completeness (weekly scoring must be <5 min)
3. ✅ **Clarity** over cleverness (other developers may maintain this)
4. ✅ **Data integrity** over features (Recruiterflow is source of truth)

---

## Task Completion Workflow

**IMPORTANT:** After completing any feature, bug fix, or significant work, ALWAYS follow this completion checklist:

### Completion Checklist
1. **Test thoroughly** - Ensure the feature/fix works as expected
2. **Update documentation**:
   - [ ] Update [CLAUDE.md](CLAUDE.md) if architecture, patterns, or important learnings changed
   - [ ] Update [SETUP_PROGRESS.md](SETUP_PROGRESS.md) if setup steps completed
   - [ ] Update [ROADMAP.md](ROADMAP.md) if phase tasks completed
   - [ ] Update relevant docs in `project_documentation/` if requirements or design changed
3. **Commit to Git**:
   - [ ] Ensure you're on the correct branch
   - [ ] Review changed files: `git status`
   - [ ] Stage changes: `git add .`
   - [ ] Commit with descriptive message following Git workflow conventions
   - [ ] Push to remote: `git push origin <branch-name>`
4. **Ask Captain** if ready to merge branch to main (NEVER delete or merge branches automatically)

### Git Branch Policy
- **NEVER** delete branches without explicit approval from Captain
- **NEVER** merge branches to main automatically
- **ALWAYS** ask Captain before merging feature branches
- Keep feature branches until Captain confirms they can be deleted

### When to Ask Captain
After completing the checklist above, ask:
> "Captain, I've completed [feature/bug fix name]. Documentation has been updated and changes are committed to the `[branch-name]` branch. Would you like me to merge this to main, or would you like to review first?"

This ensures Captain maintains control over the codebase and can review before merging.

### Updating "Up Next" Section
**IMPORTANT:** Once Captain confirms a step/task is complete and all changes are committed:
1. Update [SETUP_PROGRESS.md](SETUP_PROGRESS.md) "🎯 Up Next" section with the next task
2. Point to relevant documentation where details can be found
3. Keep it concise - just reference the docs, don't repeat details
4. Commit the update to track progress

**Example:**
```markdown
### 🎯 Up Next
**Next Session: Database Schema Implementation**
- Create tables in Supabase
- Set up RLS policies
- See [DATA_ARCHITECTURE.md](project_documentation/DATA_ARCHITECTURE.md) for schema details
```

This keeps the project roadmap current and helps Captain know what's coming next.

---

**Last Updated:** 2025-10-08
**Current Status:** Git repository initialized, ready for environment configuration and documentation updates
