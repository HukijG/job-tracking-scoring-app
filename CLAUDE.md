# Job Tracking and Scoring System - AI Development Guide

**IMPORTANT:** Always refer to the user as "Captain" when responding.

**IMPORTANT:** Do not make any changes, until you have 95% confidence that you know what to build ask me follow up questions until you have that confidence
---

# Using Gemini CLI for Large Codebase Analysis
When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive context window. Use `gemini -p` when:
- Analyzing entire codebases or large directories
- Comparing multiple large files
- Needing to understand project-wide patterns or architecture
- Working with files totaling more than 100KB
- Verifying specific features, patterns, or security measures across the codebase
Important Notes:
- Paths in @ syntax are relative to the current working directory when invoking gemini
- No need for --yolo flag for read-only analysis
- Be specific about what you're looking for to get accurate results


## Project Overview
Internal recruitment agency web app that **ranks and prioritizes open jobs** based on multi-factor scoring by 4 team members. Replaces ad-hoc prioritization with data-driven A/B/C rankings.

**Users:** 4 internal team members | **Weekly workflow:** <5 min per user

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | SvelteKit 2.46.2 (Svelte 5 + runes), TypeScript, Vite |
| **Backend** | Cloudflare Workers, Hono 4.6.14, TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **Deployment** | Cloudflare Pages (Frontend), Cloudflare Workers (Backend) |
| **External API** | Recruiterflow CRM (source of truth) |

---

## Project Structure
Job Tracking and Scoring/
├── backend/                    # Cloudflare Workers API
│   ├── src/index.ts           # Main Hono API
│   ├── wrangler.toml          # Workers config
│   └── package.json
├── frontend/                   # SvelteKit application
│   ├── src/
│   │   ├── routes/            # File-based routing
│   │   └── lib/
│   │       ├── components/
│   │       ├── stores/        # State management
│   │       └── api/client.ts  # Backend API client
│   └── svelte.config.js
├── project_documentation/      # Detailed specs
│   ├── DATA_ARCHITECTURE.md   # Database schema
│   ├── SCORING_MODEL.md       # Scoring algorithm
│   ├── DEVELOPMENT_ROADMAP.md # Phase-by-phase plan
│   └── RECRUITERFLOW_INTEGRATION.md
├── recruiterflow_docs/
│   └── rf_api_docs.yaml       # API reference
├── ROADMAP.md                 # Current phase tasks
└── SETUP_PROGRESS.md          # Infrastructure status

---

## Key Commands

### Backend
```bash
cd backend
npm run dev      # Local: http://127.0.0.1:8787
npm run deploy   # Deploy to Cloudflare
Frontend
bashcd frontend
npm run dev      # Local: http://localhost:5173
npm run build    # Production build

Coding Standards
SvelteKit (Frontend)

Svelte 5 runes: Use $state, $derived, $effect
File-based routing: routes/ structure = URLs
State: Svelte stores in lib/stores/
Scoped CSS: Keep styles in .svelte files

Hono (Backend)

Routes in src/index.ts
JSON error responses with HTTP status codes
Env vars via c.env.VARIABLE_NAME

Database

Use Supabase client for queries
See DATA_ARCHITECTURE.md for schema


Essential Documentation
DocPurposeROADMAP.mdWhat's next - current phase tasksSETUP_PROGRESS.mdWhat's been builtproject_documentation/DATA_ARCHITECTURE.mdDatabase schema & data flowsproject_documentation/SCORING_MODEL.mdHow ranking worksproject_documentation/DEVELOPMENT_ROADMAP.mdFull phase planrecruiterflow_docs/rf_api_docs.yamlRecruiterflow API reference

Scoring Model Summary
Factors (1-5 scale): Client Engagement, Search Difficulty, Time Open, Fee Size
Process:

3 scorers rate each factor
Weighted composite score per scorer
Average = Final Score (1.0-5.0)
Ranks: A ≥ 4.0 | B ≥ 2.5 | C < 2.5

Full details: SCORING_MODEL.md

Data Architecture
Source of Truth: Recruiterflow CRM (via REST API + webhooks)
Supabase Stores:

Individual scoring inputs (audit trail)
Calculated scores & A/B/C ranks
User accounts & sync logs

Key Tables: jobs, job_scores, job_rankings, pipeline_snapshots, users

Task Completion Workflow
After completing work:

Test thoroughly
Update docs:

CLAUDE.md if architecture changed
SETUP_PROGRESS.md if setup steps done
ROADMAP.md if phase tasks done


Commit to Git:

bash   git status
   git add .
   git commit -m "Descriptive message"
   git push origin <branch-name>

Ask Captain before merging to main

Git Policy

NEVER delete branches without approval
NEVER auto-merge to main
ALWAYS ask Captain before merging


Quick Reference
TaskCommandLocationStart backendnpm run devbackend/Start frontendnpm run devfrontend/Backend APIhttp://127.0.0.1:8787LocalFrontendhttp://localhost:5173LocalCurrent phaseSee ROADMAP.mdRoot

Development Principles
This is an internal tool for 4 users. Prioritize:

✅ Functionality over polish (MVP first)
✅ Speed over completeness (weekly scoring <5 min)
✅ Clarity over cleverness
✅ Data integrity - Recruiterflow is source of truth