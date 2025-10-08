import { writable } from 'svelte/store';
import { api } from '$lib/api/client';

interface Job {
	id: string;
	title: string;
	client: string;
	daysOpen: number;
	rank?: 'A' | 'B' | 'C';
	score?: number;
	fee?: number;
	status: string;
}

interface JobsState {
	jobs: Job[];
	loading: boolean;
	error: string | null;
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

		// Fetch all jobs
		async fetchJobs() {
			update((state) => ({ ...state, loading: true, error: null }));

			try {
				const jobs = await api.getJobs();
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

export const jobs = createJobsStore();
