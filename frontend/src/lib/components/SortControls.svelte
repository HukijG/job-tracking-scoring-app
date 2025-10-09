<script lang="ts">
	interface Props {
		sortBy?: string;
		sortDirection?: 'asc' | 'desc';
		onSortChange?: (sortBy: string, direction: 'asc' | 'desc') => void;
	}

	let { sortBy = 'score', sortDirection = 'desc', onSortChange }: Props = $props();

	// Local state
	let selectedSort = $state(sortBy);
	let direction = $state(sortDirection);

	// Update when props change
	$effect(() => {
		selectedSort = sortBy;
		direction = sortDirection;
	});

	function handleSortChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		selectedSort = target.value;

		// Auto-adjust direction based on sort type
		if (selectedSort === 'score') {
			direction = 'desc'; // Highest score first
		} else if (selectedSort === 'days_open') {
			direction = 'desc'; // Most days open first
		} else if (selectedSort === 'client_name') {
			direction = 'asc'; // Alphabetical
		}

		onSortChange?.(selectedSort, direction);
	}

	function toggleDirection() {
		direction = direction === 'asc' ? 'desc' : 'asc';
		onSortChange?.(selectedSort, direction);
	}

	// Label for current sort direction
	let directionLabel = $derived({
		score: direction === 'desc' ? 'Highest First' : 'Lowest First',
		days_open: direction === 'desc' ? 'Most Days' : 'Least Days',
		client_name: direction === 'asc' ? 'A → Z' : 'Z → A'
	}[selectedSort] || '');
</script>

<div class="sort-controls">
	<div class="sort-group">
		<label for="sort-by">Sort by:</label>
		<select id="sort-by" value={selectedSort} onchange={handleSortChange}>
			<option value="score">Composite Score</option>
			<option value="days_open">Days Open</option>
			<option value="client_name">Client Name</option>
		</select>

		<!-- Direction Toggle Button -->
		<button class="direction-btn" onclick={toggleDirection} title="Toggle sort direction">
			{#if direction === 'desc'}
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 5v14M19 12l-7 7-7-7"/>
				</svg>
			{:else}
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 19V5M5 12l7-7 7 7"/>
				</svg>
			{/if}
			<span class="direction-label">{directionLabel}</span>
		</button>
	</div>
</div>

<style>
	.sort-controls {
		background: white;
		padding: 0.875rem 1rem;
		border-radius: 8px;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
		margin-bottom: 1rem;
	}

	.sort-group {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #6b7280;
		white-space: nowrap;
	}

	select {
		padding: 0.5rem 2rem 0.5rem 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		font-size: 0.875rem;
		color: #111827;
		background: white;
		cursor: pointer;
		transition: border-color 0.2s, box-shadow 0.2s;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.5rem center;
	}

	select:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.direction-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.875rem;
		background: #f9fafb;
		color: #374151;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.direction-btn:hover {
		background: #f3f4f6;
		border-color: #d1d5db;
	}

	.direction-btn svg {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
	}

	.direction-label {
		white-space: nowrap;
		font-size: 0.8125rem;
		color: #6b7280;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.sort-group {
			flex-wrap: wrap;
		}

		select {
			flex: 1;
			min-width: 150px;
		}

		.direction-btn {
			flex: 1;
			justify-content: center;
		}
	}
</style>
