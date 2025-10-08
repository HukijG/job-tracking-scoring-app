# Database Migrations

This directory contains SQL migration files for the Job Tracking and Scoring System database.

## Migration Files

### 001_initial_schema.sql
**Status:** Applied
**Purpose:** Initial database schema setup
- Creates all 6 core tables (users, jobs, job_scores, job_rankings, pipeline_snapshots, sync_log)
- Sets up indexes for performance
- Creates RLS policies for security
- Creates `update_current_ranking()` trigger function

### 002_seed_data.sql
**Status:** Applied
**Purpose:** Development seed data
- 4 test users (account manager, sales person, CEO, coordinator)
- 10 sample jobs with various statuses
- Sample scores and rankings for testing

### 003_fix_function_security.sql
**Status:** Ready to apply
**Purpose:** Security hardening
- Fixes Supabase security warning for `update_current_ranking()` function
- Adds `SECURITY DEFINER` and explicit `search_path = public`
- Prevents SQL injection via search_path manipulation
- **Action Required:** Run this in Supabase SQL Editor

## How to Apply Migrations

### Using Supabase SQL Editor:
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of the migration file
3. Paste and run
4. Verify success message

### Migration Order:
1. `001_initial_schema.sql` ✅ (already applied)
2. `002_seed_data.sql` ✅ (already applied)
3. `003_fix_function_security.sql` ⚠️ **Apply this next**

## Security Notes

**003_fix_function_security.sql** addresses a PostgreSQL security best practice:
- Functions with `SECURITY DEFINER` should have explicit `search_path`
- Prevents malicious search_path manipulation attacks
- Does not affect application functionality
- Resolves Supabase Security Advisor warning

## Future Migrations

New migration files should be numbered sequentially:
- `004_description.sql`
- `005_description.sql`
- etc.

Always include:
- Clear comments explaining the purpose
- Rollback instructions if applicable
- Success/completion messages
