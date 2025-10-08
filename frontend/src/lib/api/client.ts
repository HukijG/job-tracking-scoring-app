// API client for backend communication
import { browser } from '$app/environment';

// Get API URL from environment or use default
const API_BASE_URL = browser
	? import.meta.env.VITE_API_URL || 'http://localhost:8787'
	: '';

// Auth token management
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
	authToken = token;
	if (browser) {
		if (token) {
			localStorage.setItem('auth_token', token);
		} else {
			localStorage.removeItem('auth_token');
		}
	}
}

export function getAuthToken(): string | null {
	if (browser && !authToken) {
		authToken = localStorage.getItem('auth_token');
	}
	return authToken;
}

// Generic API request helper
async function apiRequest<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<T> {
	const token = getAuthToken();
	const headers: HeadersInit = {
		'Content-Type': 'application/json',
		...(options.headers || {}),
	};

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		...options,
		headers,
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ error: 'Request failed' }));
		throw new Error(error.error || `HTTP ${response.status}`);
	}

	return response.json();
}

// API methods
export const api = {
	// Health check
	async health() {
		return apiRequest<{ message: string; version: string; environment: string }>('/');
	},

	// Authentication
	async login(email: string, password: string) {
		return apiRequest<{ token: string; user: any }>('/api/auth/login', {
			method: 'POST',
			body: JSON.stringify({ email, password }),
		});
	},

	async logout() {
		setAuthToken(null);
	},

	// Jobs
	async getJobs() {
		return apiRequest<any[]>('/api/jobs');
	},

	async getJob(id: string) {
		return apiRequest<any>(`/api/jobs/${id}`);
	},

	async getJobScores(id: string) {
		return apiRequest<any[]>(`/api/jobs/${id}/scores`);
	},

	// Scoring
	async submitScore(jobId: string, scores: any) {
		return apiRequest<any>('/api/scores', {
			method: 'POST',
			body: JSON.stringify({ jobId, ...scores }),
		});
	},

	async getPendingScores() {
		return apiRequest<any[]>('/api/scoring/pending');
	},

	async getMyScores() {
		return apiRequest<any[]>('/api/scoring/my-scores');
	},

	// Dashboard
	async getDashboardData() {
		return apiRequest<any>('/api/dashboard');
	},
};

export default api;
