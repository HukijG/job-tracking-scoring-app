<script lang="ts">
	// Job card component for displaying job summary
	interface Props {
		job: {
			id: string;
			title: string;
			client: string;
			daysOpen: number;
			rank?: 'A' | 'B' | 'C';
			score?: number;
		};
	}

	let { job }: Props = $props();
</script>

<div class="job-card">
	<div class="header">
		<h3>{job.title}</h3>
		{#if job.rank}
			<span class="rank rank-{job.rank.toLowerCase()}">{job.rank}</span>
		{/if}
	</div>
	<p class="client">{job.client}</p>
	<div class="meta">
		<span>Days open: {job.daysOpen}</span>
		{#if job.score}
			<span>Score: {job.score.toFixed(1)}</span>
		{/if}
	</div>
</div>

<style>
	.job-card {
		background: white;
		padding: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.job-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: start;
		margin-bottom: 0.5rem;
	}

	h3 {
		margin: 0;
		color: #333;
		font-size: 1.1rem;
	}

	.rank {
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		font-weight: bold;
		font-size: 0.9rem;
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
		color: #666;
		margin: 0.5rem 0;
	}

	.meta {
		display: flex;
		gap: 1rem;
		color: #888;
		font-size: 0.9rem;
		margin-top: 1rem;
	}
</style>
