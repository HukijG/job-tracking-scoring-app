# Job Tracking and Scoring System

Internal web application for systematically ranking and tracking recruitment jobs based on quality metrics and team consensus.

## Documentation

- **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Purpose, users, tech stack, core concepts
- **[FEATURES.md](FEATURES.md)** - Detailed feature requirements and UI specifications
- **[DATA_ARCHITECTURE.md](DATA_ARCHITECTURE.md)** - Database schema, data flow, integration patterns
- **[SCORING_MODEL.md](SCORING_MODEL.md)** - Scoring factors, weights, calculation methods, and ranking logic
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Infrastructure setup, deployment process, monitoring
- **[DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md)** - Phase-by-phase development plan with timelines
- **[GIT_WORKFLOW.md](GIT_WORKFLOW.md)** - Git branching strategy, commit guidelines, development process
- **[DECISIONS.md](DECISIONS.md)** - Log of all technical and product decisions with rationale
- **[SETUP_PROGRESS.md](SETUP_PROGRESS.md)** - Infrastructure setup status and progress tracking
- **[VERSIONS.md](VERSIONS.md)** - Package versions and update policy

## Quick Start

### Prerequisites (Already Available)
- ✓ Node.js 18+
- ✓ Cloudflare account (configured)
- ✓ Supabase account (configured)
- Recruiterflow API access (to be configured when needed)

### Initial Repository Setup
```bash
# Initialize Git repository
git init

# Create .gitignore (see GIT_WORKFLOW.md)
# Add initial files
git add .
git commit -m "Initial commit: Project documentation"

# Link to remote repository (create on GitHub/GitLab first)
git remote add origin <your-repo-url>
git push -u origin main
```

### Development Setup
```bash
# Backend (Cloudflare Workers)
cd backend
npm install
cp .env.example .dev.vars  # Configure with your credentials
npm run dev  # Starts on http://127.0.0.1:8787

# Frontend (SvelteKit)
cd frontend
npm install
cp .env.example .env  # Configure API URL
npm run dev  # Starts on http://localhost:5173
```

### Development Process
See [GIT_WORKFLOW.md](GIT_WORKFLOW.md) for:
- Creating feature branches
- Commit message guidelines
- When to update documentation
- Step-by-step feature development process

## Project Status

**Current Phase**: Infrastructure Setup

**Completed:**
- ✓ Project planning and documentation
- ✓ Supabase project created
- ✓ Cloudflare Workers backend initialized (Hono + TypeScript)
- ✓ Local development environment tested
- ✓ Frontend setup (Cloudflare Pages + SvelteKit)
- ✓ Basic routing and authentication UI
- ✓ API client and state management

**Next Steps:**
- Database schema implementation
- Backend API development (auth, jobs, scoring)
- Dashboard and scoring UI implementation

See [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md) for detailed timeline.

## Tech Stack

- **Frontend**: Cloudflare Pages + SvelteKit 2.x (Svelte 5 runes)
- **Backend**: Cloudflare Workers + Hono
- **Database**: Supabase (PostgreSQL)
- **Integration**: Recruiterflow API + Webhooks
- **Build Tools**: Vite, Wrangler v4.42.0

## Key Decisions Made

- ✓ **Frontend Framework**: SvelteKit (lightweight, excellent DX)
- ✓ **Scoring Scale**: 1-5 for all factors (open to adjustment)
- ✓ **Rank Thresholds**: Fixed (A≥4.0, B≥2.5, C<2.5)
- ✓ **Fee Range**: £10k-£50k (pulled from Recruiterflow)
- ⏳ **Factor Weights**: Pending team discussion (using equal 25% placeholders)

## Architecture

Recruiterflow serves as the source of truth for job data. This application supplements it with ranking intelligence and team scoring functionality.

See [DATA_ARCHITECTURE.md](DATA_ARCHITECTURE.md) for detailed architecture diagrams.
