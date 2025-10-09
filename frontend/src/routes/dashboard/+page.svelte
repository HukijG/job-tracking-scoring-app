<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import JobCard from '$lib/components/JobCard.svelte';
	import DashboardStats from '$lib/components/DashboardStats.svelte';
	import { jobs, dashboardStats } from '$lib/stores/jobs';

	// Subscribe to stores
	let jobsState = $state($jobs);
	let statsState = $state($dashboardStats);

	// Reactive subscriptions
	$effect(() => {
		jobsState = $jobs;
	});

	$effect(() => {
		statsState = $dashboardStats;
	});

	// Fetch data on mount
	onMount(() => {
		jobs.fetchJobs({ status: 'actively_sourcing' });
		dashboardStats.fetchStats();
	});

	// Handle job card click
	function handleJobClick(jobId: string) {
		goto(`/dashboard/jobs/${jobId}`);
	}
</script>

<div class="dashboard">
	<header>
		<h1>Job Dashboard</h1>
		<p class="subtitle">Track and manage your active job rankings</p>
	</header>

	<!-- Dashboard Stats -->
	<DashboardStats stats={statsState.stats} loading={statsState.loading} />

	<!-- Jobs Grid -->
	<div class="jobs-section">
		{#if jobsState.loading}
			<div class="loading">
				<div class="spinner"></div>
				<p>Loading jobs...</p>
			</div>
		{:else if jobsState.error}
			<div class="error">
				<p>❌ {jobsState.error}</p>
				<button onclick={() => jobs.fetchJobs({ status: 'active' })}>
					Retry
				</button>
			</div>
		{:else if jobsState.jobs.length === 0}
			<div class="empty-state">
				<p>📋 No active jobs found</p>
				<p class="empty-subtitle">Jobs will appear here once they're added to the system.</p>
			</div>
		{:else}
			<div class="jobs-grid">
				{#each jobsState.jobs as job (job.id)}
					<JobCard {job} onclick={() => handleJobClick(job.id)} />
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.dashboard {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
		min-height: 100vh;
		background: #f9fafb;
	}

	header {
		margin-bottom: 2rem;
	}

	h1 {
		color: #111827;
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
	}

	.subtitle {
		color: #6b7280;
		font-size: 1rem;
		margin: 0;
	}

	.jobs-section {
		margin-top: 2rem;
	}

	.jobs-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1.5rem;
	}

	/* Loading state */
	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		color: #6b7280;
	}

	.spinner {
		width: 48px;
		height: 48px;
		border: 4px solid #e5e7eb;
		border-top-color: #3b82f6;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Error state */
	.error {
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 8px;
		padding: 2rem;
		text-align: center;
	}

	.error p {
		color: #991b1b;
		margin: 0 0 1rem 0;
		font-size: 1rem;
	}

	.error button {
		background: #dc2626;
		color: white;
		border: none;
		padding: 0.5rem 1.5rem;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.error button:hover {
		background: #b91c1c;
	}

	/* Empty state */
	.empty-state {
		background: white;
		border: 2px dashed #e5e7eb;
		border-radius: 8px;
		padding: 4rem 2rem;
		text-align: center;
	}

	.empty-state p {
		color: #6b7280;
		font-size: 1.1rem;
		margin: 0;
	}

	.empty-subtitle {
		font-size: 0.875rem;
		color: #9ca3af;
		margin-top: 0.5rem;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.dashboard {
			padding: 1rem;
		}

		h1 {
			font-size: 1.5rem;
		}

		.jobs-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
	}
</style>
