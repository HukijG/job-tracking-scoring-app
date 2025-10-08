import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseClient } from './lib/supabase';

// Type definitions for Cloudflare Workers environment
type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_SECRET_KEY: string;
  ENVIRONMENT: string;
  CACHE?: KVNamespace; // Optional KV namespace for caching
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS configuration
app.use('/*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Add production domain later
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Job Tracking API',
    version: '1.0.0',
    environment: c.env.ENVIRONMENT || 'development',
  });
});

// Database connection test endpoint
app.get('/api/test-db', async (c) => {
  try {
    const supabase = createClient(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_SECRET_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

    // Test query: count users
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: false });

    if (error) {
      return c.json({
        success: false,
        error: error.message,
      }, 500);
    }

    return c.json({
      success: true,
      message: 'Database connection successful',
      userCount: count,
      users: data,
    });
  } catch (err) {
    return c.json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }, 500);
  }
});

// API Routes - Phase 2.1 Implementation

// GET /api/jobs - List all jobs with rankings and filtering
app.get('/api/jobs', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);

    // Get query parameters
    const status = c.req.query('status');
    const rank = c.req.query('rank');

    // Build query
    let query = supabase
      .from('jobs')
      .select(`
        *,
        job_rankings!left(
          composite_score,
          rank,
          scoring_date,
          is_current
        )
      `)
      .eq('is_active', true);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    // Fetch data
    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return c.json({ error: 'Failed to fetch jobs' }, 500);
    }

    // Process and filter results
    let jobs = (data || []).map((job: any) => {
      // Find current ranking
      const currentRanking = job.job_rankings?.find((r: any) => r.is_current) || null;

      return {
        id: job.id,
        recruiterflow_job_id: job.recruiterflow_job_id,
        client_name: job.client_name,
        job_title: job.job_title,
        date_opened: job.date_opened,
        status: job.status,
        estimated_fee: job.estimated_fee,
        last_synced: job.last_synced,
        current_rank: currentRanking?.rank || null,
        composite_score: currentRanking?.composite_score || null,
        scoring_date: currentRanking?.scoring_date || null,
      };
    });

    // Filter by rank if specified
    if (rank) {
      jobs = jobs.filter((job: any) => job.current_rank === rank.toUpperCase());
    }

    // Sort by composite score descending (highest priority first)
    jobs.sort((a: any, b: any) => {
      if (a.composite_score === null) return 1;
      if (b.composite_score === null) return -1;
      return b.composite_score - a.composite_score;
    });

    return c.json(jobs);
  } catch (err) {
    console.error('Unexpected error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /api/jobs/:id - Get single job with full details
app.get('/api/jobs/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const supabase = getSupabaseClient(c.env);

    // Fetch job data
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (jobError) {
      if (jobError.code === 'PGRST116') {
        return c.json({ error: 'Job not found' }, 404);
      }
      console.error('Database error:', jobError);
      return c.json({ error: 'Failed to fetch job' }, 500);
    }

    // Fetch current ranking
    const { data: currentRanking } = await supabase
      .from('job_rankings')
      .select('*')
      .eq('job_id', id)
      .eq('is_current', true)
      .single();

    // Fetch score history with scorer information
    const { data: scoreHistory } = await supabase
      .from('job_scores')
      .select(`
        *,
        users (
          full_name,
          role
        )
      `)
      .eq('job_id', id)
      .order('scoring_date', { ascending: false });

    // Fetch pipeline snapshots
    const { data: pipelineSnapshots } = await supabase
      .from('pipeline_snapshots')
      .select('*')
      .eq('job_id', id)
      .order('snapshot_date', { ascending: false });

    // Format score history
    const formattedScoreHistory = (scoreHistory || []).map((score: any) => ({
      id: score.id,
      scorer_name: score.users?.full_name || 'Unknown',
      scorer_role: score.users?.role || 'unknown',
      scoring_date: score.scoring_date,
      client_engagement_score: score.client_engagement_score,
      search_difficulty_score: score.search_difficulty_score,
      time_open_score: score.time_open_score,
      fee_size_score: score.fee_size_score,
      created_at: score.created_at,
    }));

    // Build response
    const response = {
      job: {
        id: job.id,
        recruiterflow_job_id: job.recruiterflow_job_id,
        client_name: job.client_name,
        job_title: job.job_title,
        date_opened: job.date_opened,
        status: job.status,
        estimated_fee: job.estimated_fee,
        last_synced: job.last_synced,
        is_active: job.is_active,
      },
      current_ranking: currentRanking ? {
        composite_score: currentRanking.composite_score,
        rank: currentRanking.rank,
        scoring_date: currentRanking.scoring_date,
        account_manager_composite: currentRanking.account_manager_composite,
        sales_person_composite: currentRanking.sales_person_composite,
        ceo_composite: currentRanking.ceo_composite,
      } : null,
      score_history: formattedScoreHistory,
      pipeline_snapshots: pipelineSnapshots || [],
    };

    return c.json(response);
  } catch (err) {
    console.error('Unexpected error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/scores', async (c) => {
  return c.json({ message: 'Submit score endpoint - to be implemented' });
});

// GET /api/dashboard - Dashboard aggregate statistics
app.get('/api/dashboard', async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);

    // Count total active jobs
    const { count: totalActiveJobs } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get jobs by status
    const { data: jobsByStatus } = await supabase
      .from('jobs')
      .select('status')
      .eq('is_active', true);

    const statusCounts: Record<string, number> = {};
    (jobsByStatus || []).forEach((job: any) => {
      statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;
    });

    // Get current rankings for rank distribution
    const { data: rankings } = await supabase
      .from('job_rankings')
      .select('rank, job_id')
      .eq('is_current', true);

    const rankCounts: Record<string, number> = { A: 0, B: 0, C: 0 };
    (rankings || []).forEach((ranking: any) => {
      if (ranking.rank in rankCounts) {
        rankCounts[ranking.rank]++;
      }
    });

    // Get recent activity (last 10 scoring events)
    const { data: recentScores } = await supabase
      .from('job_scores')
      .select(`
        id,
        job_id,
        scoring_date,
        created_at,
        users (
          full_name
        ),
        jobs (
          job_title,
          client_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    // Format recent activity
    const recentActivity = (recentScores || []).map((score: any) => ({
      job_id: score.job_id,
      job_title: score.jobs?.job_title || 'Unknown Job',
      client_name: score.jobs?.client_name || 'Unknown Client',
      scorer_name: score.users?.full_name || 'Unknown',
      action: 'scored',
      timestamp: score.created_at,
    }));

    // Build response
    const response = {
      total_active_jobs: totalActiveJobs || 0,
      jobs_by_rank: rankCounts,
      jobs_by_status: statusCounts,
      recent_activity: recentActivity,
    };

    return c.json(response);
  } catch (err) {
    console.error('Unexpected error:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Webhook endpoint
app.post('/webhooks/recruiterflow', async (c) => {
  // Verify webhook signature
  const signature = c.req.header('X-Recruiterflow-Signature');

  // TODO: Validate signature against RECRUITERFLOW_WEBHOOK_SECRET

  return c.json({ message: 'Webhook received - to be implemented' });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
