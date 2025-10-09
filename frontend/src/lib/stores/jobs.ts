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
	allJobs: Job[]; // Raw data from API
	jobs: Job[]; // Filtered and sorted jobs
	loading: boolean;
	error: string | null;
	filters: {
		rank: string;
		search: string;
	};
	sorting: {
		sortBy: 'score' | 'days_open' | 'client_name';
		direction: 'asc' | 'desc';
	};
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
	allJobs: [],
	jobs: [],
	loading: false,
	error: null,
	filters: {
		rank: 'all',
		search: '',
	},
	sorting: {
		sortBy: 'score',
		direction: 'desc',
	},
};

function createJobsStore() {
	const { subscribe, set, update } = writable<JobsState>(initialState);

	// Helper: Calculate days open
	function calculateDaysOpen(dateOpened: string): number {
		const opened = new Date(dateOpened);
		const now = new Date();
		const diffTime = Math.abs(now.getTime() - opened.getTime());
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	}

	// Helper: Apply filters and sorting
	function applyFiltersAndSort(jobs: Job[], filters: JobsState['filters'], sorting: JobsState['sorting']): Job[] {
		let filtered = [...jobs];

		// Filter by rank
		if (filters.rank !== 'all') {
			filtered = filtered.filter((job) => job.current_rank === filters.rank);
		}

		// Filter by search query
		if (filters.search.trim()) {
			const query = filters.search.toLowerCase().trim();
			filtered = filtered.filter(
				(job) =>
					job.job_title.toLowerCase().includes(query) ||
					job.client_name.toLowerCase().includes(query)
			);
		}

		// Apply sorting
		filtered.sort((a, b) => {
			let comparison = 0;

			if (sorting.sortBy === 'score') {
				const scoreA = a.composite_score ?? 0;
				const scoreB = b.composite_score ?? 0;
				comparison = scoreB - scoreA; // Default: highest first
			} else if (sorting.sortBy === 'days_open') {
				const daysA = calculateDaysOpen(a.date_opened);
				const daysB = calculateDaysOpen(b.date_opened);
				comparison = daysB - daysA; // Default: most days first
			} else if (sorting.sortBy === 'client_name') {
				comparison = a.client_name.localeCompare(b.client_name);
			}

			return sorting.direction === 'asc' ? comparison * -1 : comparison;
		});

		return filtered;
	}

	return {
		subscribe,

		// Fetch all jobs (always fetch with status=actively_sourcing)
		async fetchJobs() {
			update((state) => ({ ...state, loading: true, error: null }));

			try {
				const endpoint = '/api/jobs?status=actively_sourcing';
				const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8787'}${endpoint}`);
				if (!response.ok) {
					throw new Error(`HTTP ${response.status}`);
				}
				const allJobs = await response.json();

				update((state) => {
					const filteredJobs = applyFiltersAndSort(allJobs, state.filters, state.sorting);
					return {
						...state,
						allJobs,
						jobs: filteredJobs,
						loading: false,
						error: null,
					};
				});
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

		// Update rank filter
		setRankFilter(rank: string) {
			update((state) => {
				const newFilters = { ...state.filters, rank };
				return {
					...state,
					filters: newFilters,
					jobs: applyFiltersAndSort(state.allJobs, newFilters, state.sorting),
				};
			});
		},

		// Update search filter
		setSearchFilter(search: string) {
			update((state) => {
				const newFilters = { ...state.filters, search };
				return {
					...state,
					filters: newFilters,
					jobs: applyFiltersAndSort(state.allJobs, newFilters, state.sorting),
				};
			});
		},

		// Update sorting
		setSorting(sortBy: JobsState['sorting']['sortBy'], direction: JobsState['sorting']['direction']) {
			update((state) => {
				const newSorting = { sortBy, direction };
				return {
					...state,
					sorting: newSorting,
					jobs: applyFiltersAndSort(state.allJobs, state.filters, newSorting),
				};
			});
		},

		// Clear all filters
		clearFilters() {
			update((state) => {
				const newFilters = { rank: 'all', search: '' };
				return {
					...state,
					filters: newFilters,
					jobs: applyFiltersAndSort(state.allJobs, newFilters, state.sorting),
				};
			});
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
