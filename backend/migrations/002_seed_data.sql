-- Job Tracking and Scoring System - Seed Data
-- Run this AFTER running 001_initial_schema.sql

-- =====================================================
-- SEED USERS (4 team members)
-- =====================================================
INSERT INTO users (email, full_name, role) VALUES
('account.manager@example.com', 'Alice Manager', 'account_manager'),
('sales.person@example.com', 'Bob Salesperson', 'sales_person'),
('ceo@example.com', 'Charlie Executive', 'ceo'),
('coordinator@example.com', 'Diana Coordinator', 'other');

-- =====================================================
-- SEED JOBS (15 sample jobs)
-- =====================================================
INSERT INTO jobs (recruiterflow_job_id, client_name, job_title, date_opened, status, estimated_fee, is_active) VALUES
-- Active jobs (10)
('RF-JOB-001', 'TechCorp Industries', 'Senior Software Engineer', NOW() - INTERVAL '5 days', 'actively_sourcing', 25000.00, true),
('RF-JOB-002', 'Global Finance Ltd', 'VP of Engineering', NOW() - INTERVAL '12 days', 'actively_sourcing', 45000.00, true),
('RF-JOB-003', 'StartupXYZ', 'Product Manager', NOW() - INTERVAL '3 days', 'actively_sourcing', 20000.00, true),
('RF-JOB-004', 'MegaRetail Co', 'Data Scientist', NOW() - INTERVAL '20 days', 'actively_sourcing', 30000.00, true),
('RF-JOB-005', 'HealthTech Solutions', 'DevOps Lead', NOW() - INTERVAL '8 days', 'actively_sourcing', 28000.00, true),
('RF-JOB-006', 'AutoMotive Group', 'Senior Backend Developer', NOW() - INTERVAL '15 days', 'actively_sourcing', 22000.00, true),
('RF-JOB-007', 'EduPlatform Inc', 'Frontend Architect', NOW() - INTERVAL '2 days', 'actively_sourcing', 27000.00, true),
('RF-JOB-008', 'CloudServices Ltd', 'Site Reliability Engineer', NOW() - INTERVAL '30 days', 'actively_sourcing', 35000.00, true),
('RF-JOB-009', 'FinTech Innovations', 'Security Engineer', NOW() - INTERVAL '7 days', 'actively_sourcing', 32000.00, true),
('RF-JOB-010', 'MediaStream Co', 'Full Stack Developer', NOW() - INTERVAL '18 days', 'actively_sourcing', 24000.00, true),

-- Closed jobs (5) - retained for historical scoring data
('RF-JOB-011', 'Legacy Systems Inc', 'Solutions Architect', NOW() - INTERVAL '60 days', 'closed', 40000.00, false),
('RF-JOB-012', 'Old Tech Corp', 'Engineering Manager', NOW() - INTERVAL '90 days', 'closed', 38000.00, false),
('RF-JOB-013', 'Past Client LLC', 'Mobile Developer', NOW() - INTERVAL '45 days', 'closed', 26000.00, false),
('RF-JOB-014', 'Historical Ventures', 'QA Lead', NOW() - INTERVAL '75 days', 'closed', 23000.00, false),
('RF-JOB-015', 'Archive Industries', 'Tech Lead', NOW() - INTERVAL '120 days', 'closed', 36000.00, false);

-- =====================================================
-- SEED JOB SCORES (sample scoring data for 3 jobs)
-- =====================================================
-- Get user IDs for scoring
DO $$
DECLARE
    user_am_id UUID;
    user_sp_id UUID;
    user_ceo_id UUID;
    job_001_id UUID;
    job_002_id UUID;
    job_005_id UUID;
BEGIN
    -- Get user IDs
    SELECT id INTO user_am_id FROM users WHERE role = 'account_manager' LIMIT 1;
    SELECT id INTO user_sp_id FROM users WHERE role = 'sales_person' LIMIT 1;
    SELECT id INTO user_ceo_id FROM users WHERE role = 'ceo' LIMIT 1;

    -- Get job IDs
    SELECT id INTO job_001_id FROM jobs WHERE recruiterflow_job_id = 'RF-JOB-001';
    SELECT id INTO job_002_id FROM jobs WHERE recruiterflow_job_id = 'RF-JOB-002';
    SELECT id INTO job_005_id FROM jobs WHERE recruiterflow_job_id = 'RF-JOB-005';

    -- Job 001: High priority (should rank A)
    INSERT INTO job_scores (job_id, scorer_id, scoring_date, client_engagement_score, search_difficulty_score, time_open_score, fee_size_score)
    VALUES
        (job_001_id, user_am_id, NOW() - INTERVAL '1 day', 5, 4, 4, 4),
        (job_001_id, user_sp_id, NOW() - INTERVAL '1 day', 5, 5, 4, 4),
        (job_001_id, user_ceo_id, NOW() - INTERVAL '1 day', 4, 4, 5, 5);

    -- Job 002: Medium priority (should rank B)
    INSERT INTO job_scores (job_id, scorer_id, scoring_date, client_engagement_score, search_difficulty_score, time_open_score, fee_size_score)
    VALUES
        (job_002_id, user_am_id, NOW() - INTERVAL '2 days', 3, 3, 3, 5),
        (job_002_id, user_sp_id, NOW() - INTERVAL '2 days', 4, 3, 3, 4),
        (job_002_id, user_ceo_id, NOW() - INTERVAL '2 days', 3, 4, 2, 5);

    -- Job 005: Lower priority (should rank C)
    INSERT INTO job_scores (job_id, scorer_id, scoring_date, client_engagement_score, search_difficulty_score, time_open_score, fee_size_score)
    VALUES
        (job_005_id, user_am_id, NOW() - INTERVAL '3 days', 2, 2, 3, 3),
        (job_005_id, user_sp_id, NOW() - INTERVAL '3 days', 2, 3, 2, 2),
        (job_005_id, user_ceo_id, NOW() - INTERVAL '3 days', 1, 2, 2, 3);
END $$;

-- =====================================================
-- SEED JOB RANKINGS (calculated from scores above)
-- =====================================================
DO $$
DECLARE
    job_001_id UUID;
    job_002_id UUID;
    job_005_id UUID;
BEGIN
    -- Get job IDs
    SELECT id INTO job_001_id FROM jobs WHERE recruiterflow_job_id = 'RF-JOB-001';
    SELECT id INTO job_002_id FROM jobs WHERE recruiterflow_job_id = 'RF-JOB-002';
    SELECT id INTO job_005_id FROM jobs WHERE recruiterflow_job_id = 'RF-JOB-005';

    -- Job 001: Rank A (composite score ~4.5)
    INSERT INTO job_rankings (job_id, scoring_date, composite_score, rank, account_manager_composite, sales_person_composite, ceo_composite, is_current)
    VALUES (job_001_id, NOW() - INTERVAL '1 day', 4.50, 'A', 4.25, 4.50, 4.75, true);

    -- Job 002: Rank B (composite score ~3.3)
    INSERT INTO job_rankings (job_id, scoring_date, composite_score, rank, account_manager_composite, sales_person_composite, ceo_composite, is_current)
    VALUES (job_002_id, NOW() - INTERVAL '2 days', 3.33, 'B', 3.50, 3.50, 3.00, true);

    -- Job 005: Rank C (composite score ~2.3)
    INSERT INTO job_rankings (job_id, scoring_date, composite_score, rank, account_manager_composite, sales_person_composite, ceo_composite, is_current)
    VALUES (job_005_id, NOW() - INTERVAL '3 days', 2.33, 'C', 2.50, 2.25, 2.00, true);
END $$;

-- =====================================================
-- SEED PIPELINE SNAPSHOTS (sample candidate data)
-- =====================================================
DO $$
DECLARE
    job_001_id UUID;
    job_002_id UUID;
BEGIN
    -- Get job IDs
    SELECT id INTO job_001_id FROM jobs WHERE recruiterflow_job_id = 'RF-JOB-001';
    SELECT id INTO job_002_id FROM jobs WHERE recruiterflow_job_id = 'RF-JOB-002';

    -- Job 001 pipeline
    INSERT INTO pipeline_snapshots (job_id, snapshot_date, stage_name, candidate_count, avg_days_in_stage)
    VALUES
        (job_001_id, NOW(), 'Sourced', 12, 2.5),
        (job_001_id, NOW(), 'Screening', 5, 3.0),
        (job_001_id, NOW(), 'Client Interview', 2, 5.0);

    -- Job 002 pipeline
    INSERT INTO pipeline_snapshots (job_id, snapshot_date, stage_name, candidate_count, avg_days_in_stage)
    VALUES
        (job_002_id, NOW(), 'Sourced', 8, 4.0),
        (job_002_id, NOW(), 'Screening', 3, 6.0),
        (job_002_id, NOW(), 'Client Interview', 1, 8.0);
END $$;

-- =====================================================
-- SEED SYNC LOG (sample sync records)
-- =====================================================
INSERT INTO sync_log (sync_type, started_at, completed_at, jobs_synced, errors)
VALUES
    ('full', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '30 seconds', 15, NULL),
    ('webhook', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours' + INTERVAL '1 second', 1, NULL),
    ('webhook', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours' + INTERVAL '1 second', 2, NULL);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE 'Seed data inserted successfully!';
    RAISE NOTICE '- 4 users created';
    RAISE NOTICE '- 15 jobs created (10 active, 5 closed)';
    RAISE NOTICE '- 3 jobs scored with rankings (A, B, C examples)';
    RAISE NOTICE '- Pipeline snapshots for 2 jobs';
    RAISE NOTICE '- 3 sync log entries';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test queries in Supabase SQL Editor';
    RAISE NOTICE '2. Set up backend/.dev.vars with Supabase credentials';
    RAISE NOTICE '3. Test backend connection';
END $$;
