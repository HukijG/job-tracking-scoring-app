import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { api, setAuthToken, getAuthToken } from '$lib/api/client';

interface User {
	id: string;
	email: string;
	name: string;
	role: 'CEO' | 'Consultant';
}

interface AuthState {
	user: User | null;
	loading: boolean;
	error: string | null;
}

const initialState: AuthState = {
	user: null,
	loading: true,
	error: null,
};

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(initialState);

	return {
		subscribe,

		// Initialize auth state from stored token
		async init() {
			if (!browser) return;

			const token = getAuthToken();
			if (!token) {
				update((state) => ({ ...state, loading: false }));
				return;
			}

			try {
				// TODO: Validate token with backend
				// For now, just mark as not loading
				update((state) => ({ ...state, loading: false }));
			} catch (error) {
				console.error('Auth init error:', error);
				setAuthToken(null);
				update((state) => ({
					...state,
					loading: false,
					error: 'Session expired',
				}));
			}
		},

		// Login
		async login(email: string, password: string) {
			update((state) => ({ ...state, loading: true, error: null }));

			try {
				const response = await api.login(email, password);
				setAuthToken(response.token);

				update((state) => ({
					...state,
					user: response.user,
					loading: false,
					error: null,
				}));

				return true;
			} catch (error: any) {
				update((state) => ({
					...state,
					loading: false,
					error: error.message || 'Login failed',
				}));
				return false;
			}
		},

		// Logout
		async logout() {
			await api.logout();
			set(initialState);
		},

		// Clear error
		clearError() {
			update((state) => ({ ...state, error: null }));
		},
	};
}

export const auth = createAuthStore();
