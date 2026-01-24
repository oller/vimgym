-- Auto-Refresh Materialized View with pg_cron
-- Run this in Supabase Dashboard → SQL Editor

-- ============================================
-- 1. Enable pg_cron extension
-- ============================================
-- Note: pg_cron is already enabled in Supabase free tier
-- This is just to verify it's available
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================
-- 2. Create cron job to refresh level_stats
-- ============================================

-- Drop existing job if it exists (safe to fail if doesn't exist)
DO $$
BEGIN
  PERFORM cron.unschedule('refresh-level-stats');
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignore error if job doesn't exist
END $$;

-- Schedule refresh every 5 minutes
SELECT cron.schedule(
  'refresh-level-stats',           -- Job name
  '*/5 * * * *',                   -- Cron schedule: every 5 minutes
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY level_stats$$
);

-- ============================================
-- 3. Verify the cron job
-- ============================================

-- View all scheduled jobs
SELECT * FROM cron.job;

-- You should see:
-- jobid | schedule     | command                                           | nodename  | ...
-- 1     | */5 * * * *  | REFRESH MATERIALIZED VIEW CONCURRENTLY level_stats | localhost | ...

-- ============================================
-- 4. Cron Schedule Options
-- ============================================

-- If you want different schedules, modify the cron pattern:
--
-- Every 1 minute:   '* * * * *'
-- Every 5 minutes:  '*/5 * * * *'
-- Every 15 minutes: '*/15 * * * *'
-- Every hour:       '0 * * * *'
-- Every 6 hours:    '0 */6 * * *'
-- Once daily:       '0 0 * * *'  (midnight UTC)
--
-- To change schedule, re-run this script with a different cron pattern

-- ============================================
-- 5. Manual Refresh (if needed)
-- ============================================

-- You can still manually refresh anytime:
-- REFRESH MATERIALIZED VIEW CONCURRENTLY level_stats;

-- ============================================
-- 6. Monitor Cron Job Runs
-- ============================================

-- View recent cron job runs and status:
-- SELECT * FROM cron.job_run_details 
-- WHERE jobid = 1 
-- ORDER BY start_time DESC 
-- LIMIT 10;
