<script lang="ts">
	interface Props {
		stats: {
			total_active_jobs: number;
			jobs_by_rank: {
				A: number;
				B: number;
				C: number;
			};
		} | null;
		loading?: boolean;
	}

	let { stats, loading = false }: Props = $props();
</script>

<div class="stats-container">
	{#if loading}
		<div class="stat-card skeleton">
			<div class="skeleton-text"></div>
		</div>
		<div class="stat-card skeleton">
			<div class="skeleton-text"></div>
		</div>
		<div class="stat-card skeleton">
			<div class="skeleton-text"></div>
		</div>
		<div class="stat-card skeleton">
			<div class="skeleton-text"></div>
		</div>
	{:else if stats}
		<div class="stat-card total">
			<div class="stat-value">{stats.total_active_jobs}</div>
			<div class="stat-label">Active Jobs</div>
		</div>

		<div class="stat-card rank-a">
			<div class="stat-value">{stats.jobs_by_rank?.A || 0}</div>
			<div class="stat-label">A Rank</div>
		</div>

		<div class="stat-card rank-b">
			<div class="stat-value">{stats.jobs_by_rank?.B || 0}</div>
			<div class="stat-label">B Rank</div>
		</div>

		<div class="stat-card rank-c">
			<div class="stat-value">{stats.jobs_by_rank?.C || 0}</div>
			<div class="stat-label">C Rank</div>
		</div>
	{/if}
</div>

<style>
	.stats-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.stat-card {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		text-align: center;
		border-left: 4px solid transparent;
	}

	.stat-card.total {
		border-left-color: #3b82f6;
	}

	.stat-card.rank-a {
		border-left-color: #10b981;
	}

	.stat-card.rank-b {
		border-left-color: #f59e0b;
	}

	.stat-card.rank-c {
		border-left-color: #ef4444;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		color: #111827;
		margin-bottom: 0.25rem;
	}

	.stat-label {
		font-size: 0.875rem;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Skeleton loader */
	.stat-card.skeleton {
		position: relative;
		overflow: hidden;
		background: #f3f4f6;
		border-left-color: #e5e7eb;
	}

	.skeleton-text {
		height: 60px;
		background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
		border-radius: 4px;
	}

	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	@media (max-width: 640px) {
		.stats-container {
			grid-template-columns: repeat(2, 1fr);
		}

		.stat-value {
			font-size: 1.5rem;
		}
	}
</style>
