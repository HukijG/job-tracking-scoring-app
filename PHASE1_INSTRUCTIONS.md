# Phase 1: Database Setup Instructions

Follow these steps to complete Phase 1 setup for the Job Tracking and Scoring System.

---

## Step 1: Get Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **Settings** → **API**
4. Note down:
   - **Project URL** (e.g., `https://abcdefghijk.supabase.co`)
   - **Publishable key** (starts with `sb_publishable_...`, safe for frontend)
   - **Secret key** (starts with `sb_secret_...`, backend only - NEVER commit to Git)

**Note:** Use the new `sb_publishable_...` and `sb_secret_...` keys, NOT the legacy `anon` or `service_role` JWT keys.

---

## Step 2: Configure Environment Variables

### Backend Configuration

1. **Create `backend/.dev.vars`** (copy from template):
   ```bash
   cp backend/.dev.vars.example backend/.dev.vars
   ```

2. **Edit `backend/.dev.vars`** and replace placeholders:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SECRET_KEY=sb_secret_your_key_here
   ```

3. **Verify `.gitignore`** excludes `.dev.vars` (already configured)

### Frontend Configuration

1. **Edit `frontend/.env`** (already exists) and update Supabase variables:
   ```
   VITE_API_URL=http://localhost:8787
   PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
   VITE_ENVIRONMENT=development
   ```

2. **Verify `.gitignore`** excludes `.env` (already configured)

---

## Step 3: Run Database Migrations

### Create Schema (Tables, Indexes, RLS)

1. Open https://supabase.com/dashboard
2. Go to **SQL Editor**
3. Click **New query**
4. Open `backend/migrations/001_initial_schema.sql` in your text editor
5. **Copy the entire contents** and paste into Supabase SQL Editor
6. Click **Run** (bottom right)
7. Verify success message: "Database schema created successfully!"

**What this creates:**
- 6 tables: `users`, `jobs`, `job_scores`, `job_rankings`, `pipeline_snapshots`, `sync_log`
- Indexes for performance
- Row Level Security (RLS) policies
- Trigger function to manage `is_current` flags

### Add Seed Data (Test Users & Jobs)

1. In Supabase SQL Editor, click **New query**
2. Open `backend/migrations/002_seed_data.sql` in your text editor
3. **Copy the entire contents** and paste into Supabase SQL Editor
4. Click **Run**
5. Verify success message with counts:
   - 4 users created
   - 15 jobs created (10 active, 5 closed)
   - 3 jobs scored with rankings (A, B, C examples)

**What this creates:**
- 4 test users (Account Manager, Salesperson, CEO, Coordinator)
- 15 sample jobs with realistic data
- 3 scored jobs with rankings (A, B, C examples)
- Pipeline snapshots for 2 jobs
- Sample sync log entries

---

## Step 4: Verify Database Setup

### Check Tables

1. In Supabase Dashboard, go to **Table Editor**
2. Verify all 6 tables exist:
   - ✅ users
   - ✅ jobs
   - ✅ job_scores
   - ✅ job_rankings
   - ✅ pipeline_snapshots
   - ✅ sync_log

### Test Queries

Run these in **SQL Editor** to verify data:

```sql
-- Check users
SELECT * FROM users;
-- Should return 4 users

-- Check active jobs
SELECT * FROM jobs WHERE is_active = true;
-- Should return 10 jobs

-- Check rankings
SELECT
  j.client_name,
  j.job_title,
  jr.rank,
  jr.composite_score
FROM jobs j
JOIN job_rankings jr ON j.id = jr.job_id
WHERE jr.is_current = true
ORDER BY jr.composite_score DESC;
-- Should return 3 jobs with ranks A, B, C
```

---

## Step 5: Test Backend Connection

### Start Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
⎔ Starting local server...
[wrangler:inf] Ready on http://127.0.0.1:8787
```

### Test Health Check

Open browser or use curl:
```bash
curl http://127.0.0.1:8787/
```

Expected response:
```json
{
  "message": "Job Tracking API is running",
  "version": "1.0.0"
}
```

### Test Supabase Connection

We'll add a test endpoint in the next step to verify Supabase connectivity.

---

## Step 6: Test Frontend Connection

### Start Frontend Server

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE vX.X.X  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

### Verify Environment Variables Loaded

Open browser console at http://localhost:5173/ and check if Supabase client initializes without errors.

---

## Troubleshooting

### "relation does not exist" error
- Make sure you ran `001_initial_schema.sql` successfully
- Check Supabase logs for specific table name

### "duplicate key value violates unique constraint"
- Seed data already exists, safe to ignore if re-running
- Or delete data first: `TRUNCATE users, jobs, job_scores, job_rankings, pipeline_snapshots, sync_log CASCADE;`

### Backend can't connect to Supabase
- Verify `SUPABASE_URL` format: `https://your-id.supabase.co` (no trailing slash)
- Verify `SUPABASE_SECRET_KEY` starts with `sb_secret_...` (NOT the legacy service_role JWT)
- Check `.dev.vars` file exists in `backend/` directory

### Frontend can't connect
- Verify `PUBLIC_SUPABASE_URL` in `.env`
- Verify `PUBLIC_SUPABASE_PUBLISHABLE_KEY` starts with `sb_publishable_...` (NOT legacy anon JWT)
- Restart dev server after editing `.env`

---

## Phase 1 Completion Checklist

- [ ] Supabase credentials obtained
- [ ] `backend/.dev.vars` created and populated
- [ ] `frontend/.env` updated with Supabase credentials
- [ ] Database schema created (6 tables)
- [ ] Seed data inserted (4 users, 15 jobs)
- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] Test queries return expected data

---

## Next Steps

Once Phase 1 is complete:

1. **Phase 2: Backend API Development**
   - Implement Supabase client in backend
   - Create actual API endpoints (GET /api/jobs, etc.)
   - Add authentication middleware
   - Test all endpoints

2. **Phase 3: Scoring System**
   - Implement scoring calculation logic
   - Create POST /api/jobs/:id/score endpoint
   - Add validation for score inputs

See [ROADMAP.md](ROADMAP.md) for detailed phase breakdown.

---

**Questions or issues?** Check [SETUP_PROGRESS.md](SETUP_PROGRESS.md) for current status.
