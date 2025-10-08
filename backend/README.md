# Job Tracking API - Cloudflare Workers

Backend API for the Job Tracking and Scoring System, built with Cloudflare Workers and Hono.

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono (Express-like web framework)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **CLI Tool**: Wrangler v4.42.0

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
For local development, create a `.dev.vars` file (not committed to git):
```bash
cp .env.example .dev.vars
# Edit .dev.vars with your actual credentials
```

### 3. Set Production Secrets
Use Wrangler CLI to set secrets in Cloudflare:
```bash
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_KEY
wrangler secret put RECRUITERFLOW_API_KEY
wrangler secret put RECRUITERFLOW_WEBHOOK_SECRET
wrangler secret put JWT_SECRET
```

## Development

### Run Locally
```bash
npm run dev
```
This starts a local development server at `http://localhost:8787`

### Test Endpoints
```bash
# Health check
curl http://localhost:8787/

# API endpoints (placeholder responses)
curl http://localhost:8787/api/jobs
curl http://localhost:8787/api/jobs/123
```

## Deployment

### Deploy to Cloudflare Workers
```bash
npm run deploy
```

### First-time Deployment Setup
1. Log in to Wrangler: `wrangler login`
2. Ensure secrets are configured (see above)
3. Deploy: `npm run deploy`

## Project Structure

```
backend/
├── src/
│   └── index.ts          # Main Worker entry point with Hono routes
├── wrangler.toml         # Cloudflare Workers configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── .env.example          # Environment variable template
```

## API Endpoints

### Health Check
- `GET /` - API health check and version info

### Jobs
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get specific job details

### Scoring
- `POST /api/scores` - Submit a score for a job

### Dashboard
- `GET /api/dashboard` - Get dashboard data

### Webhooks
- `POST /webhooks/recruiterflow` - Receive webhooks from Recruiterflow

## Status

✅ **Infrastructure Complete**
- Project initialized with Hono + TypeScript
- Wrangler v4.42.0 installed and configured
- CORS configured for frontend
- Local dev server working
- Placeholder routes created

⏳ **Next Steps (Phase 2)**
1. Implement database queries using Supabase client
2. Add authentication middleware (JWT)
3. Implement scoring calculation logic
4. Add Recruiterflow API integration
5. Set up webhook signature validation
6. Add KV cache layer (optional)

## Documentation

See main project documentation:
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Full deployment architecture
- [DATA_ARCHITECTURE.md](../DATA_ARCHITECTURE.md) - Database schema
- [PROJECT_OVERVIEW.md](../PROJECT_OVERVIEW.md) - Project context
