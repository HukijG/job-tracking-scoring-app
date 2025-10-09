import { writable } from 'svelte/store';
import { api } from '$lib/api/client';

export interface Job {
	id: string;
	recruiterflow_job_id: string;
	job_title: string;
	client_name: string;
	date_opened: string;
	status: string;
	estimated_fee?: number;
	current_rank?: 'A' | 'B' | 'C' | null;
	composite_score?: number | null;
	scoring_date?: string | null;
	pipeline_snapshot?: {
		total_candidates: number;
	};
}

interface JobsState {
	jobs: Job[];
	loading: boolean;
	error: string | null;
}

interface DashboardStats {
	total_active_jobs: number;
	jobs_by_rank: {
		A: number;
		B: number;
		C: number;
	};
	jobs_by_status: {
		actively_sourcing: number;
	};
	recent_activity: any[];
}

const initialState: JobsState = {
	jobs: [],
	loading: false,
	error: null,
};

function createJobsStore() {
	const { subscribe, set, update } = writable<JobsState>(initialState);

	return {
		subscribe,

		// Fetch all jobs with optional filters
		async fetchJobs(filters?: { rank?: string; status?: string }) {
			update((state) => ({ ...state, loading: true, error: null }));

			try {
				// Build query params
				let endpoint = '/api/jobs';
				const params = new URLSearchParams();
				if (filters?.rank) params.append('rank', filters.rank);
				if (filters?.status) params.append('status', filters.status);
				const queryString = params.toString();
				if (queryString) endpoint += `?${queryString}`;

				const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8787'}${endpoint}`);
				if (!response.ok) {
					throw new Error(`HTTP ${response.status}`);
				}
				const jobs = await response.json();

				update((state) => ({
					...state,
					jobs,
					loading: false,
					error: null,
				}));
			} catch (error: any) {
				update((state) => ({
					...state,
					loading: false,
					error: error.message || 'Failed to fetch jobs',
				}));
			}
		},

		// Fetch single job
		async fetchJob(id: string) {
			try {
				return await api.getJob(id);
			} catch (error: any) {
				update((state) => ({
					...state,
					error: error.message || 'Failed to fetch job',
				}));
				return null;
			}
		},

		// Clear error
		clearError() {
			update((state) => ({ ...state, error: null }));
		},

		// Reset store
		reset() {
			set(initialState);
		},
	};
}

// Dashboard stats store
function createDashboardStatsStore() {
	const { subscribe, set, update } = writable<{
		stats: DashboardStats | null;
		loading: boolean;
		error: string | null;
	}>({
		stats: null,
		loading: false,
		error: null,
	});

	return {
		subscribe,

		async fetchStats() {
			update((state) => ({ ...state, loading: true, error: null }));

			try {
				const stats = await api.getDashboardData();
				update((state) => ({
					...state,
					stats,
					loading: false,
					error: null,
				}));
			} catch (error: any) {
				update((state) => ({
					...state,
					loading: false,
					error: error.message || 'Failed to fetch dashboard stats',
				}));
			}
		},

		reset() {
			set({ stats: null, loading: false, error: null });
		},
	};
}

export const jobs = createJobsStore();
export const dashboardStats = createDashboardStatsStore();
