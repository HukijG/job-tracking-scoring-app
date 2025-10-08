# Deployment Architecture

## Infrastructure Overview

### Cloudflare Platform
All Cloudflare services deploy through a single dashboard and integrate seamlessly.

```
┌─────────────────────────────────────────────────┐
│              Cloudflare Platform                │
│                                                 │
│  ┌──────────────┐         ┌─────────────────┐  │
│  │   Pages      │         │    Workers      │  │
│  │  (Frontend)  │◄────────│   (Backend)     │  │
│  │              │   API   │                 │  │
│  └──────────────┘         └────────┬────────┘  │
│                                    │            │
│  ┌──────────────┐                  │            │
│  │  Workers KV  │◄─────────────────┘            │
│  │   (Cache)    │                               │
│  └──────────────┘                               │
│                                                 │
└────────────────────────┬────────────────────────┘
                         │
                         │ HTTPS
                         ▼
              ┌──────────────────┐
              │    Supabase      │
              │   (PostgreSQL)   │
              └────────┬─────────┘
                       │
                       │ API/Webhooks
                       ▼
              ┌──────────────────┐
              │  Recruiterflow   │
              │      CRM         │
              └──────────────────┘
```

---

## Frontend - Cloudflare Pages

### What It Does
- Serves the web application UI
- Static site hosting with edge caching
- Automatic HTTPS and global CDN
- Git-based deployments

### Setup Steps
1. Create Cloudflare Pages project
2. Connect to GitHub/GitLab repository
3. Configure build settings:
   ```yaml
   Build command: npm run build
   Build output directory: build
   Root directory: frontend
   Node version: 18
   ```
4. Set environment variables:
   - `PUBLIC_API_URL`
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`

### Framework
**SvelteKit** - Chosen for lightweight performance, excellent developer experience, and suitability for dashboard applications

### Deployment
- **Automatic**: Push to `main` branch → auto-deploy production
- **Preview**: Every PR gets preview URL for testing
- **Rollback**: One-click rollback to previous deployments

### Custom Domain
- Point your domain to Cloudflare Pages
- Automatic SSL certificate provisioning

---

## Backend - Cloudflare Workers

### What It Does
- API endpoints for frontend
- Business logic and score calculations
- Webhook receiver for Recruiterflow
- Database query orchestration
- Authentication middleware

### Architecture Pattern
Use **Hono** framework (lightweight, fast router for Workers):

```typescript
// Example structure
import { Hono } from 'hono'

const app = new Hono()

// API Routes
app.get('/api/jobs', listJobs)
app.get('/api/jobs/:id', getJob)
app.post('/api/scores', submitScore)
app.get('/api/dashboard', getDashboard)

// Webhook Routes
app.post('/webhooks/recruiterflow', handleWebhook)

// Auth middleware
app.use('/api/*', authMiddleware)

export default app
```

### Setup Steps
1. Initialize Workers project:
   ```bash
   npm create cloudflare@latest backend
   cd backend
   npm install hono
   ```

2. Configure `wrangler.toml`:
   ```toml
   name = "job-tracking-api"
   main = "src/index.ts"
   compatibility_date = "2024-01-01"

   [vars]
   ENVIRONMENT = "production"

   [[kv_namespaces]]
   binding = "CACHE"
   id = "your-kv-namespace-id"
   ```

3. Set secrets (via `wrangler secret put`):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY` (for backend auth)
   - `RECRUITERFLOW_API_KEY`
   - `RECRUITERFLOW_WEBHOOK_SECRET`
   - `JWT_SECRET` (for user authentication)

### Deployment
```bash
npm run deploy  # or: wrangler deploy
```

### Workers KV (Optional Cache)
Use for caching frequently accessed data:
- Job list cache (invalidate on webhook)
- User session data
- Rate limiting counters

---

## Database - Supabase

### What It Does
- PostgreSQL database for storing scores and rankings
- Real-time subscriptions (optional, for live updates)
- Row-level security for data access control
- Auto-generated REST API
- Authentication (optional, or handle in Workers)

### Setup Steps
1. Create Supabase project at https://supabase.com
2. Note your project URL and keys
3. Run database migrations (see [DATA_ARCHITECTURE.md](DATA_ARCHITECTURE.md) for schema)

### Migration Setup
Use Supabase CLI or SQL editor to create tables:

```sql
-- See DATA_ARCHITECTURE.md for full schema
-- Run migrations in Supabase SQL editor or via CLI
```

### Connection from Workers
Use Supabase JavaScript client:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY  // Use service key for backend
)
```

### Security
- Enable Row Level Security (RLS) policies
- Use service key in Workers (bypasses RLS)
- Use anon key in frontend (enforces RLS)

### Backups
- Automatic daily backups on paid plans
- Point-in-time recovery available
- Export data via `pg_dump` if needed

---

## Recruiterflow Integration

### API Authentication
Store API key in Cloudflare Workers secrets:
```bash
wrangler secret put RECRUITERFLOW_API_KEY
```

### Webhook Setup
1. Configure webhook endpoint in Recruiterflow dashboard:
   - URL: `https://your-worker.workers.dev/webhooks/recruiterflow`
   - Events: `job.created`, `job.updated`, `candidate.stage_changed`
   - Secret: Generate and store in both systems

2. Verify webhook signatures in Worker:
   ```typescript
   const signature = request.headers.get('X-Recruiterflow-Signature')
   // Validate against RECRUITERFLOW_WEBHOOK_SECRET
   ```

### Polling Fallback
Schedule Worker to sync every 15 minutes:
```toml
# wrangler.toml
[triggers]
crons = ["*/15 * * * *"]  # Every 15 minutes
```

---

## Authentication

### Recommended Approach: Simple JWT
For 4 internal users, keep it simple:

1. **Workers handles auth**:
   - Hardcode 4 user emails
   - Magic link or simple password auth
   - Issue JWT tokens

2. **Frontend stores token**:
   - LocalStorage or sessionStorage
   - Send in Authorization header

3. **Workers validates token**:
   - Middleware checks JWT signature
   - Extracts user ID and role

### Alternative: Supabase Auth
Let Supabase handle authentication:
- Email/password or magic links
- Frontend uses Supabase Auth UI
- Workers validate Supabase JWT

---

## Environment Variables

### Frontend (Cloudflare Pages)
```
PUBLIC_API_URL=https://your-worker.workers.dev
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (Cloudflare Workers - Secrets)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
RECRUITERFLOW_API_KEY=your-api-key
RECRUITERFLOW_WEBHOOK_SECRET=your-webhook-secret
JWT_SECRET=your-jwt-secret
```

---

## Monitoring & Logging

### Cloudflare Workers Analytics
- Request volume and latency
- Error rates
- CPU time usage

### Supabase Monitoring
- Database connections
- Query performance
- Storage usage

### Custom Logging
Use Workers logging:
```typescript
console.log('Webhook received:', event.type)
// Appears in Cloudflare Workers dashboard
```

### Error Tracking (Optional)
Consider integrating:
- Sentry (error tracking)
- LogFlare (structured logging)

---

## Cost Estimates

### Cloudflare
- **Pages**: Free tier (500 builds/month, unlimited requests)
- **Workers**: Free tier (100k requests/day), $5/month for 10M requests
- **Workers KV**: Free tier (1GB, 1M reads/day)

### Supabase
- **Free tier**: 500MB database, 1GB file storage, 2GB bandwidth
- **Pro**: $25/month for 8GB database, 100GB bandwidth

### Estimated Monthly Cost
- **Free tier**: $0 (if under limits)
- **Light usage**: $5-10/month
- **Typical usage**: $25-35/month

---

## Deployment Checklist

### Initial Setup
- [x] Create Cloudflare account ✓
- [x] Create Supabase project ✓
- [ ] Set up Recruiterflow API access
- [ ] Configure custom domain (if needed)

### Database
- [ ] Run schema migrations in Supabase
- [ ] Set up RLS policies
- [ ] Create initial user records

### Backend
- [x] Initialize Workers project ✓
- [x] Install dependencies (Hono, Supabase client) ✓
- [x] Test local development server ✓
- [ ] Configure secrets (via wrangler secret put)
- [ ] Deploy Workers to Cloudflare
- [ ] Test deployed API endpoints

### Frontend
- [ ] Initialize frontend project
- [ ] Configure build settings
- [ ] Set environment variables
- [ ] Deploy to Pages
- [ ] Test authentication flow

### Integration
- [ ] Configure Recruiterflow webhooks
- [ ] Test webhook delivery
- [ ] Set up cron job for polling
- [ ] Verify data sync

### Testing
- [ ] Test scoring workflow end-to-end
- [ ] Verify dashboard displays correct data
- [ ] Test with all 4 user accounts
- [ ] Load test (simulate multiple jobs)

---

## Disaster Recovery

### Backup Strategy
- **Database**: Supabase automatic backups (daily)
- **Code**: Git repository (GitHub/GitLab)
- **Secrets**: Store encrypted copy securely offline

### Recovery Scenarios
1. **Worker deployment failure**: Rollback via Cloudflare dashboard
2. **Database corruption**: Restore from Supabase backup
3. **Recruiterflow API down**: App continues with cached data, shows staleness indicator
4. **Complete infrastructure loss**: Redeploy from Git, restore DB from backup

---

## Future Scaling Considerations

### If User Base Grows
- Workers scale automatically (serverless)
- Supabase: Upgrade plan for more connections
- Add caching layer (Workers KV or Cloudflare Cache API)

### If Data Volume Grows
- Database indexing optimization
- Partition historical scores by date
- Archive old jobs to separate table

### If Request Volume Grows
- Workers scale seamlessly
- Add rate limiting (Workers KV)
- Use Cloudflare Cache API for GET endpoints
