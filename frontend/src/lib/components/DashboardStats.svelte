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
		display: flex;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
		background: white;
		padding: 0.875rem 1rem;
		border-radius: 8px;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	.stat-card {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.5rem 0.875rem;
		border-radius: 6px;
		border-left: 3px solid transparent;
		transition: background 0.2s;
	}

	.stat-card:hover {
		background: #f9fafb;
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
		font-size: 1.5rem;
		font-weight: 700;
		color: #111827;
		line-height: 1;
	}

	.stat-label {
		font-size: 0.75rem;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 500;
	}

	/* Skeleton loader */
	.stat-card.skeleton {
		position: relative;
		overflow: hidden;
		background: #f3f4f6;
		border-left-color: #e5e7eb;
		min-width: 100px;
		height: 48px;
	}

	.skeleton-text {
		width: 100%;
		height: 100%;
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

	@media (max-width: 768px) {
		.stats-container {
			flex-wrap: wrap;
		}

		.stat-card {
			flex: 1 1 auto;
			min-width: calc(50% - 0.375rem);
		}

		.stat-value {
			font-size: 1.25rem;
		}
	}
</style>
