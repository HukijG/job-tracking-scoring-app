<script lang="ts">
	import { page } from '$app/stores';
</script>

<nav>
	<div class="nav-content">
		<div class="logo">
			<a href="/">Job Tracker</a>
		</div>
		<div class="nav-links">
			<a href="/dashboard" class:active={$page.url.pathname === '/dashboard'}>Dashboard</a>
			<a href="/score" class:active={$page.url.pathname === '/score'}>Score Jobs</a>
		</div>
		<div class="user-menu">
			<button>Logout</button>
		</div>
	</div>
</nav>

<style>
	nav {
		background: white;
		border-bottom: 1px solid #e5e7eb;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.nav-content {
		max-width: 1400px;
		margin: 0 auto;
		padding: 1rem 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logo a {
		font-size: 1.25rem;
		font-weight: bold;
		color: #667eea;
		text-decoration: none;
	}

	.nav-links {
		display: flex;
		gap: 2rem;
	}

	.nav-links a {
		color: #666;
		text-decoration: none;
		font-weight: 500;
		transition: color 0.2s;
	}

	.nav-links a:hover,
	.nav-links a.active {
		color: #667eea;
	}

	button {
		background: transparent;
		border: 1px solid #ddd;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
		font-weight: 500;
		color: #666;
		transition: all 0.2s;
	}

	button:hover {
		background: #f5f5f5;
		border-color: #999;
	}
</style>
