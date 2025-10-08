# Data Architecture

## System Integration Overview

```
┌─────────────────┐
│  Recruiterflow  │ (Source of Truth)
│      CRM        │
└────────┬────────┘
         │
         │ API Calls (polling/on-demand)
         │ Webhooks (real-time updates)
         │
         ▼
┌─────────────────────────────────┐
│   Cloudflare Workers (Backend)  │
│   - API routes                  │
│   - Webhook handlers            │
│   - Business logic              │
│   - Score calculation           │
└────────┬────────────────────────┘
         │
         │ Read/Write
         │
         ▼
┌─────────────────┐         ┌──────────────────┐
│    Supabase     │         │  Cloudflare Pages│
│   (PostgreSQL)  │◄────────│   (Frontend)     │
│                 │  Query  │                  │
└─────────────────┘         └──────────────────┘
```

## Data Flow

### Job Data Sync (Recruiterflow → Supabase)
1. **Initial Load**: Fetch all actively sourced jobs from Recruiterflow API
2. **Real-time Updates**: Recruiterflow webhooks trigger updates:
   - New job opened → Create record in Supabase
   - Job status changed → Update job status
   - Candidate moved in pipeline → Update pipeline metrics
   - Job closed → Mark as closed but retain scoring history

### Scoring Data Flow
1. User opens job scoring interface
2. Frontend fetches:
   - Current job data (from Supabase, synced from Recruiterflow)
   - Previous scoring history (from Supabase)
3. User submits scores
4. Backend calculates composite score and rank
5. Stored in Supabase with timestamp and scorer ID
6. Dashboard updates with new rank

### Dashboard Data Flow
1. Frontend requests dashboard data
2. Backend aggregates:
   - Job data from Supabase (synced from Recruiterflow)
   - Latest ranking scores from Supabase
   - Calculated pipeline staleness metrics
3. Returns unified view to frontend

## Database Schema (Supabase)

### `jobs` table
Cached job data from Recruiterflow for performance
```sql
- id (uuid, PK)
- recruiterflow_job_id (text, unique, indexed)
- client_name (text)
- job_title (text)
- date_opened (timestamp)
- status (text) -- 'actively_sourcing', 'closed', etc.
- estimated_fee (decimal)
- last_synced (timestamp)
- is_active (boolean) -- for filtering
```

### `job_scores` table
Individual scoring inputs (audit trail)
```sql
- id (uuid, PK)
- job_id (uuid, FK → jobs.id)
- scorer_id (uuid, FK → users.id)
- scoring_date (timestamp)
- client_engagement_score (integer)
- search_difficulty_score (integer)
- time_open_score (integer)
- fee_size_score (integer)
- created_at (timestamp)
```

### `job_rankings` table
Calculated composite scores and ranks
```sql
- id (uuid, PK)
- job_id (uuid, FK → jobs.id)
- scoring_date (timestamp)
- composite_score (decimal)
- rank (text) -- 'A', 'B', or 'C'
- account_manager_composite (decimal)
- sales_person_composite (decimal)
- ceo_composite (decimal)
- is_current (boolean) -- latest ranking for this job
- created_at (timestamp)
```

### `pipeline_snapshots` table
Candidate pipeline data synced from Recruiterflow
```sql
- id (uuid, PK)
- job_id (uuid, FK → jobs.id)
- snapshot_date (timestamp)
- stage_name (text)
- candidate_count (integer)
- avg_days_in_stage (decimal)
```

### `users` table
Team members who can score jobs
```sql
- id (uuid, PK)
- email (text, unique)
- full_name (text)
- role (text) -- 'account_manager', 'sales_person', 'ceo', 'other'
- created_at (timestamp)
```

### `sync_log` table
Tracking Recruiterflow sync operations
```sql
- id (uuid, PK)
- sync_type (text) -- 'full', 'webhook', 'manual'
- started_at (timestamp)
- completed_at (timestamp)
- jobs_synced (integer)
- errors (jsonb)
```

## Recruiterflow Integration

### API Endpoints to Use
- `GET /jobs` - Fetch all jobs with filters
- `GET /jobs/:id` - Fetch single job details
- `GET /jobs/:id/candidates` - Fetch candidate pipeline
- Custom fields API - Read/write linking data

### Webhook Events to Listen For
- `job.created`
- `job.updated`
- `job.archived`
- `candidate.stage_changed`
- `candidate.added_to_job`

### Custom Fields in Recruiterflow
Consider adding custom field to jobs:
- `scoring_system_id` - Links back to Supabase job record
- `current_rank` - Syncs calculated rank back to Recruiterflow for visibility

## Data Consistency Strategy

### Source of Truth Rules
- **Job metadata** (client, title, dates, candidates): Recruiterflow
- **Scoring data** (individual scores, rankings): Supabase
- **Pipeline metrics calculation**: Derived from Recruiterflow data, cached in Supabase

### Sync Strategy
1. **Polling** (fallback): Every 15 minutes, sync all active jobs
2. **Webhooks** (primary): Real-time updates for immediate changes
3. **Manual refresh**: User-triggered resync on dashboard

### Handling Conflicts
- If job deleted in Recruiterflow: Mark as inactive in Supabase, retain scoring history
- If sync fails: Log error, display last-known data with staleness indicator
- If webhook missed: Polling catches it on next cycle

## Performance Considerations
- Index on `recruiterflow_job_id` for fast lookups
- Index on `job_id + is_current` for latest rankings
- Materialized view for dashboard aggregations if needed
- Cache frequently accessed data in Cloudflare Workers KV
