<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import JobCard from '$lib/components/JobCard.svelte';
	import DashboardStats from '$lib/components/DashboardStats.svelte';
	import FilterControls from '$lib/components/FilterControls.svelte';
	import SortControls from '$lib/components/SortControls.svelte';
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

	// Computed: Group jobs by rank
	let jobsByRank = $derived({
		A: jobsState.jobs.filter(job => job.current_rank === 'A'),
		B: jobsState.jobs.filter(job => job.current_rank === 'B'),
		C: jobsState.jobs.filter(job => job.current_rank === 'C'),
		unranked: jobsState.jobs.filter(job => !job.current_rank)
	});

	// Fetch data on mount
	onMount(() => {
		jobs.fetchJobs();
		dashboardStats.fetchStats();
	});

	// Handle job card click
	function handleJobClick(jobId: string) {
		goto(`/dashboard/jobs/${jobId}`);
	}

	// Filter handlers
	function handleRankChange(rank: string) {
		jobs.setRankFilter(rank);
	}

	function handleSearchChange(query: string) {
		jobs.setSearchFilter(query);
	}

	function handleClearFilters() {
		jobs.clearFilters();
	}

	// Sort handlers
	function handleSortChange(sortBy: 'score' | 'days_open' | 'client_name', direction: 'asc' | 'desc') {
		jobs.setSorting(sortBy, direction);
	}
</script>

<div class="dashboard">
	<header>
		<h1>Job Dashboard</h1>
		<p class="subtitle">Track and manage your active job rankings</p>
	</header>

	<!-- Dashboard Stats -->
	<DashboardStats stats={statsState.stats} loading={statsState.loading} />

	<!-- Filter and Sort Controls -->
	<div class="controls-row">
		<FilterControls
			rankFilter={jobsState.filters.rank}
			searchQuery={jobsState.filters.search}
			onRankChange={handleRankChange}
			onSearchChange={handleSearchChange}
			onClearFilters={handleClearFilters}
		/>
		<SortControls
			sortBy={jobsState.sorting.sortBy}
			sortDirection={jobsState.sorting.direction}
			onSortChange={handleSortChange}
		/>
	</div>

	<!-- Jobs Swimlanes -->
	<div class="swimlanes-container">
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
			<!-- A Rank Swimlane -->
			<div class="swimlane rank-a">
				<div class="swimlane-header">
					<h2>🔥 A Rank</h2>
					<span class="count">{jobsByRank.A.length}</span>
				</div>
				<div class="swimlane-content">
					{#if jobsByRank.A.length === 0}
						<div class="empty-swimlane">No A-ranked jobs</div>
					{:else}
						{#each jobsByRank.A as job (job.id)}
							<JobCard {job} onclick={() => handleJobClick(job.id)} />
						{/each}
					{/if}
				</div>
			</div>

			<!-- B Rank Swimlane -->
			<div class="swimlane rank-b">
				<div class="swimlane-header">
					<h2>⚡ B Rank</h2>
					<span class="count">{jobsByRank.B.length}</span>
				</div>
				<div class="swimlane-content">
					{#if jobsByRank.B.length === 0}
						<div class="empty-swimlane">No B-ranked jobs</div>
					{:else}
						{#each jobsByRank.B as job (job.id)}
							<JobCard {job} onclick={() => handleJobClick(job.id)} />
						{/each}
					{/if}
				</div>
			</div>

			<!-- C Rank Swimlane -->
			<div class="swimlane rank-c">
				<div class="swimlane-header">
					<h2>📉 C Rank</h2>
					<span class="count">{jobsByRank.C.length}</span>
				</div>
				<div class="swimlane-content">
					{#if jobsByRank.C.length === 0}
						<div class="empty-swimlane">No C-ranked jobs</div>
					{:else}
						{#each jobsByRank.C as job (job.id)}
							<JobCard {job} onclick={() => handleJobClick(job.id)} />
						{/each}
					{/if}
				</div>
			</div>

			<!-- Unranked Swimlane -->
			{#if jobsByRank.unranked.length > 0}
				<div class="swimlane unranked">
					<div class="swimlane-header">
						<h2>⏳ Pending Ranking</h2>
						<span class="count">{jobsByRank.unranked.length}</span>
					</div>
					<div class="swimlane-content">
						{#each jobsByRank.unranked as job (job.id)}
							<JobCard {job} onclick={() => handleJobClick(job.id)} />
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.dashboard {
		max-width: 100%;
		margin: 0;
		padding: 1.5rem;
		min-height: 100vh;
		background: #f3f4f6;
	}

	header {
		margin-bottom: 1.25rem;
	}

	h1 {
		color: #111827;
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0 0 0.25rem 0;
	}

	.subtitle {
		color: #6b7280;
		font-size: 0.875rem;
		margin: 0;
	}

	/* Controls Row */
	.controls-row {
		display: flex;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.controls-row :global(.filter-controls) {
		flex: 2;
	}

	.controls-row :global(.sort-controls) {
		flex: 1;
		min-width: 300px;
	}

	/* Swimlanes Container */
	.swimlanes-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1rem;
		align-items: start;
	}

	.swimlane {
		background: #ffffff;
		border-radius: 10px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
		display: flex;
		flex-direction: column;
		max-height: calc(100vh - 200px);
		border-top: 4px solid transparent;
	}

	.swimlane.rank-a {
		border-top-color: #10b981;
	}

	.swimlane.rank-b {
		border-top-color: #f59e0b;
	}

	.swimlane.rank-c {
		border-top-color: #ef4444;
	}

	.swimlane.unranked {
		border-top-color: #9ca3af;
	}

	/* Swimlane Header */
	.swimlane-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid #e5e7eb;
		background: #fafafa;
		border-radius: 10px 10px 0 0;
	}

	.swimlane-header h2 {
		font-size: 1rem;
		font-weight: 600;
		color: #111827;
		margin: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.swimlane-header .count {
		background: #e5e7eb;
		color: #374151;
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.25rem 0.625rem;
		border-radius: 12px;
		min-width: 24px;
		text-align: center;
	}

	.rank-a .swimlane-header .count {
		background: #d1fae5;
		color: #065f46;
	}

	.rank-b .swimlane-header .count {
		background: #fef3c7;
		color: #92400e;
	}

	.rank-c .swimlane-header .count {
		background: #fee2e2;
		color: #991b1b;
	}

	/* Swimlane Content */
	.swimlane-content {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.swimlane-content::-webkit-scrollbar {
		width: 6px;
	}

	.swimlane-content::-webkit-scrollbar-track {
		background: #f3f4f6;
	}

	.swimlane-content::-webkit-scrollbar-thumb {
		background: #d1d5db;
		border-radius: 3px;
	}

	.swimlane-content::-webkit-scrollbar-thumb:hover {
		background: #9ca3af;
	}

	.empty-swimlane {
		text-align: center;
		padding: 2rem 1rem;
		color: #9ca3af;
		font-size: 0.875rem;
		font-style: italic;
	}

	/* Loading state */
	.loading {
		grid-column: 1 / -1;
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
		grid-column: 1 / -1;
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
		grid-column: 1 / -1;
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
	@media (max-width: 1024px) {
		.controls-row {
			flex-direction: column;
		}

		.controls-row :global(.sort-controls) {
			min-width: 100%;
		}

		.swimlanes-container {
			grid-template-columns: repeat(2, 1fr);
		}

		.swimlane {
			max-height: calc(50vh - 100px);
		}
	}

	@media (max-width: 768px) {
		.dashboard {
			padding: 1rem;
		}

		h1 {
			font-size: 1.5rem;
		}

		.swimlanes-container {
			grid-template-columns: 1fr;
		}

		.swimlane {
			max-height: 400px;
		}
	}
</style>
