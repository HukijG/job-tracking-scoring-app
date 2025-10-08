import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Database types for type safety
export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string;
          recruiterflow_job_id: string;
          client_name: string;
          job_title: string;
          date_opened: string;
          status: string;
          estimated_fee: number;
          last_synced: string;
          is_active: boolean;
        };
      };
      job_scores: {
        Row: {
          id: string;
          job_id: string;
          scorer_id: string;
          scoring_date: string;
          client_engagement_score: number;
          search_difficulty_score: number;
          time_open_score: number;
          fee_size_score: number;
          created_at: string;
        };
      };
      job_rankings: {
        Row: {
          id: string;
          job_id: string;
          scoring_date: string;
          composite_score: number;
          rank: string;
          account_manager_composite: number | null;
          sales_person_composite: number | null;
          ceo_composite: number | null;
          is_current: boolean;
          created_at: string;
        };
      };
      pipeline_snapshots: {
        Row: {
          id: string;
          job_id: string;
          snapshot_date: string;
          stage_name: string;
          candidate_count: number;
          avg_days_in_stage: number;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: string;
          created_at: string;
        };
      };
      sync_log: {
        Row: {
          id: string;
          sync_type: string;
          started_at: string;
          completed_at: string | null;
          jobs_synced: number | null;
          errors: any | null;
        };
      };
    };
  };
}

/**
 * Creates a typed Supabase client instance
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase service key (use service_role key for backend)
 * @returns Typed Supabase client
 */
export function createSupabaseClient(
  supabaseUrl: string,
  supabaseKey: string
): SupabaseClient<Database> {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and key are required');
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Helper to get Supabase client from environment variables
 * @param env - Environment variables (from Hono context)
 * @returns Typed Supabase client
 */
export function getSupabaseClient(env: {
  SUPABASE_URL: string;
  SUPABASE_SECRET_KEY: string;
}): SupabaseClient<Database> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
    throw new Error('Missing Supabase credentials in environment');
  }

  return createSupabaseClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY);
}
