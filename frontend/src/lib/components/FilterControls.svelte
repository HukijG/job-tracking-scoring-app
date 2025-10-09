<script lang="ts">
	interface Props {
		rankFilter?: string;
		searchQuery?: string;
		onRankChange?: (rank: string) => void;
		onSearchChange?: (query: string) => void;
		onClearFilters?: () => void;
	}

	let {
		rankFilter = 'all',
		searchQuery = '',
		onRankChange,
		onSearchChange,
		onClearFilters
	}: Props = $props();

	// Local state for inputs
	let selectedRank = $state(rankFilter);
	let searchInput = $state(searchQuery);

	// Update when props change
	$effect(() => {
		selectedRank = rankFilter;
		searchInput = searchQuery;
	});

	function handleRankChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		selectedRank = target.value;
		onRankChange?.(selectedRank);
	}

	function handleSearchInput(event: Event) {
		const target = event.target as HTMLInputElement;
		searchInput = target.value;
		onSearchChange?.(searchInput);
	}

	function handleClear() {
		selectedRank = 'all';
		searchInput = '';
		onClearFilters?.();
	}

	// Check if any filters are active
	let hasActiveFilters = $derived(selectedRank !== 'all' || searchInput.length > 0);
</script>

<div class="filter-controls">
	<div class="filter-group">
		<!-- Search Input -->
		<div class="search-input">
			<svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="11" cy="11" r="8"></circle>
				<path d="m21 21-4.35-4.35"></path>
			</svg>
			<input
				type="text"
				placeholder="Search jobs or clients..."
				value={searchInput}
				oninput={handleSearchInput}
			/>
		</div>

		<!-- Rank Filter -->
		<div class="select-wrapper">
			<label for="rank-filter">Rank:</label>
			<select id="rank-filter" value={selectedRank} onchange={handleRankChange}>
				<option value="all">All Ranks</option>
				<option value="A">A - High Priority</option>
				<option value="B">B - Medium Priority</option>
				<option value="C">C - Lower Priority</option>
			</select>
		</div>

		<!-- Clear Filters Button -->
		{#if hasActiveFilters}
			<button class="clear-btn" onclick={handleClear}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
				Clear
			</button>
		{/if}
	</div>
</div>

<style>
	.filter-controls {
		background: white;
		padding: 1rem;
		border-radius: 8px;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
		margin-bottom: 1rem;
	}

	.filter-group {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		flex-wrap: wrap;
	}

	/* Search Input */
	.search-input {
		position: relative;
		flex: 1;
		min-width: 200px;
	}

	.search-icon {
		position: absolute;
		left: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		color: #9ca3af;
	}

	.search-input input {
		width: 100%;
		padding: 0.5rem 0.75rem 0.5rem 2.5rem;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		font-size: 0.875rem;
		color: #111827;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.search-input input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.search-input input::placeholder {
		color: #9ca3af;
	}

	/* Select Wrapper */
	.select-wrapper {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.select-wrapper label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #6b7280;
		white-space: nowrap;
	}

	.select-wrapper select {
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

	.select-wrapper select:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	/* Clear Button */
	.clear-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.875rem;
		background: #f3f4f6;
		color: #6b7280;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.clear-btn:hover {
		background: #e5e7eb;
		color: #374151;
		border-color: #d1d5db;
	}

	.clear-btn svg {
		width: 14px;
		height: 14px;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.filter-group {
			flex-direction: column;
			align-items: stretch;
		}

		.search-input {
			min-width: 100%;
		}

		.select-wrapper {
			width: 100%;
		}

		.select-wrapper select {
			flex: 1;
		}

		.clear-btn {
			width: 100%;
			justify-content: center;
		}
	}
</style>
