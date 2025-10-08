<script lang="ts">
	import Navigation from '$lib/components/Navigation.svelte';
	import { page } from '$app/stores';

	let { children }: { children: any } = $props();

	// Don't show navigation on login page
	let showNav = $derived($page.url.pathname !== '/login');
</script>

{#if showNav}
	<Navigation />
{/if}

<div class="app">
	{@render children()}
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		background: #f5f5f5;
	}

	.app {
		min-height: 100vh;
	}
</style>
