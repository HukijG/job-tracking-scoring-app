-- Fix security issue: Set search_path for update_current_ranking function
-- This prevents SQL injection via search_path manipulation
-- Supabase Security Advisor recommendation

-- Drop existing function
DROP FUNCTION IF EXISTS update_current_ranking() CASCADE;

-- Recreate with explicit search_path
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

-- Recreate trigger
CREATE TRIGGER trigger_update_current_ranking
    AFTER INSERT ON job_rankings
    FOR EACH ROW
    EXECUTE FUNCTION update_current_ranking();

-- Completion message
DO $$
BEGIN
    RAISE NOTICE 'Security fix applied: update_current_ranking() now has search_path = public';
END $$;
