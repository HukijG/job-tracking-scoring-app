<script lang="ts">
	// Job card component for displaying job summary
	interface Props {
		job: {
			id: string;
			job_title: string;
			client_name: string;
			date_opened: string;
			status: string;
			current_rank?: 'A' | 'B' | 'C' | null;
			composite_score?: number | null;
			pipeline_snapshot?: {
				total_candidates: number;
			};
			onclick?: () => void;
		};
	}

	let { job }: Props = $props();

	// Calculate days open from date_opened
	function calculateDaysOpen(createdAt: string): number {
		const created = new Date(createdAt);
		const now = new Date();
		const diffTime = Math.abs(now.getTime() - created.getTime());
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	}

	const daysOpen = calculateDaysOpen(job.date_opened);
	const isUrgent = daysOpen > 30;
</script>

<button class="job-card" onclick={job.onclick} type="button">
	<div class="header">
		<h3>{job.job_title}</h3>
		{#if job.current_rank}
			<span class="rank rank-{job.current_rank.toLowerCase()}">{job.current_rank}</span>
		{/if}
	</div>
	<p class="client">{job.client_name}</p>
	<div class="meta">
		<span class:urgent={isUrgent}>
			📅 {daysOpen} day{daysOpen !== 1 ? 's' : ''} open
		</span>
		{#if job.composite_score}
			<span>⭐ {job.composite_score.toFixed(2)}</span>
		{/if}
		{#if job.pipeline_snapshot?.total_candidates}
			<span>👥 {job.pipeline_snapshot.total_candidates} candidates</span>
		{/if}
	</div>
</button>

<style>
	.job-card {
		all: unset;
		display: block;
		width: 100%;
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s, box-shadow 0.2s;
		cursor: pointer;
		text-align: left;
		border: 1px solid #e5e7eb;
	}

	.job-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
		border-color: #d1d5db;
	}

	.job-card:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: start;
		margin-bottom: 0.5rem;
		gap: 0.5rem;
	}

	h3 {
		margin: 0;
		color: #111827;
		font-size: 1.1rem;
		font-weight: 600;
		flex: 1;
	}

	.rank {
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		font-weight: bold;
		font-size: 0.9rem;
		flex-shrink: 0;
	}

	.rank-a {
		background: #10b981;
		color: white;
	}

	.rank-b {
		background: #f59e0b;
		color: white;
	}

	.rank-c {
		background: #ef4444;
		color: white;
	}

	.client {
		color: #6b7280;
		margin: 0.5rem 0;
		font-size: 0.95rem;
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		color: #9ca3af;
		font-size: 0.875rem;
		margin-top: 1rem;
	}

	.meta span {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.meta .urgent {
		color: #ef4444;
		font-weight: 600;
	}
</style>
