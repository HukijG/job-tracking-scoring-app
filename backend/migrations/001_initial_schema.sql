-- Job Tracking and Scoring System - Initial Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('account_manager', 'sales_person', 'ceo', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- JOBS TABLE
-- =====================================================
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiterflow_job_id TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    date_opened TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'actively_sourcing',
    estimated_fee DECIMAL(10, 2),
    last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_jobs_recruiterflow_id ON jobs(recruiterflow_job_id);
CREATE INDEX idx_jobs_is_active ON jobs(is_active);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_date_opened ON jobs(date_opened DESC);

-- =====================================================
-- JOB SCORES TABLE
-- =====================================================
CREATE TABLE job_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    scorer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scoring_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    client_engagement_score INTEGER NOT NULL CHECK (client_engagement_score BETWEEN 1 AND 5),
    search_difficulty_score INTEGER NOT NULL CHECK (search_difficulty_score BETWEEN 1 AND 5),
    time_open_score INTEGER NOT NULL CHECK (time_open_score BETWEEN 1 AND 5),
    fee_size_score INTEGER NOT NULL CHECK (fee_size_score BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, scorer_id, scoring_date)
);

CREATE INDEX idx_job_scores_job_id ON job_scores(job_id);
CREATE INDEX idx_job_scores_scorer_id ON job_scores(scorer_id);
CREATE INDEX idx_job_scores_scoring_date ON job_scores(scoring_date DESC);

-- =====================================================
-- JOB RANKINGS TABLE
-- =====================================================
CREATE TABLE job_rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    scoring_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    composite_score DECIMAL(3, 2) NOT NULL CHECK (composite_score BETWEEN 1.00 AND 5.00),
    rank TEXT NOT NULL CHECK (rank IN ('A', 'B', 'C')),
    account_manager_composite DECIMAL(3, 2),
    sales_person_composite DECIMAL(3, 2),
    ceo_composite DECIMAL(3, 2),
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_job_rankings_job_id ON job_rankings(job_id);
CREATE INDEX idx_job_rankings_is_current ON job_rankings(is_current);
CREATE INDEX idx_job_rankings_rank ON job_rankings(rank);
CREATE INDEX idx_job_rankings_composite_score ON job_rankings(composite_score DESC);

-- =====================================================
-- PIPELINE SNAPSHOTS TABLE
-- =====================================================
CREATE TABLE pipeline_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    snapshot_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    stage_name TEXT NOT NULL,
    candidate_count INTEGER NOT NULL DEFAULT 0,
    avg_days_in_stage DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pipeline_snapshots_job_id ON pipeline_snapshots(job_id);
CREATE INDEX idx_pipeline_snapshots_snapshot_date ON pipeline_snapshots(snapshot_date DESC);

-- =====================================================
-- SYNC LOG TABLE
-- =====================================================
CREATE TABLE sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sync_type TEXT NOT NULL CHECK (sync_type IN ('full', 'webhook', 'manual')),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    jobs_synced INTEGER DEFAULT 0,
    errors JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sync_log_sync_type ON sync_log(sync_type);
CREATE INDEX idx_sync_log_started_at ON sync_log(started_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;

-- For now, allow all authenticated users to read/write
-- TODO: Implement proper user authentication and refine these policies

CREATE POLICY "Allow all operations for authenticated users" ON users
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON jobs
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON job_scores
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON job_rankings
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON pipeline_snapshots
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON sync_log
    FOR ALL USING (true);

-- =====================================================
-- HELPER FUNCTION: Update is_current flags
-- =====================================================
-- When a new ranking is inserted, set all previous rankings for that job to is_current = false
CREATE OR REPLACE FUNCTION update_current_ranking()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Set all previous rankings for this job to is_current = false
    UPDATE job_rankings
    SET is_current = false
    WHERE job_id = NEW.job_id AND id != NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_current_ranking
    AFTER INSERT ON job_rankings
    FOR EACH ROW
    EXECUTE FUNCTION update_current_ranking();

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE 'Database schema created successfully!';
    RAISE NOTICE 'Next step: Run the seed data script (002_seed_data.sql)';
END $$;
