<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = null;
		loading = true;

		try {
			const success = await auth.login(email, password);
			if (success) {
				goto('/dashboard');
			} else {
				error = 'Invalid email or password';
			}
		} catch (err: any) {
			error = err.message || 'Login failed';
		} finally {
			loading = false;
		}
	}

	let authState = $state<any>(null);

	onMount(() => {
		// Subscribe to auth store
		const unsubscribe = auth.subscribe((value) => {
			authState = value;
			// Redirect if already authenticated
			if (value.user) {
				goto('/dashboard');
			}
		});

		return unsubscribe;
	});
</script>

<div class="login">
	<div class="login-card">
		<h1>Job Tracking System</h1>
		<p class="subtitle">Internal recruitment job scoring</p>

		<form onsubmit={handleSubmit}>
			{#if error}
				<div class="error">{error}</div>
			{/if}

			<div class="form-group">
				<label for="email">Email</label>
				<input
					type="email"
					id="email"
					bind:value={email}
					placeholder="your.email@company.com"
					required
					disabled={loading}
				/>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<input
					type="password"
					id="password"
					bind:value={password}
					placeholder="Enter your password"
					required
					disabled={loading}
				/>
			</div>

			<button type="submit" disabled={loading}>
				{loading ? 'Logging in...' : 'Login'}
			</button>
		</form>
	</div>
</div>

<style>
	.login {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.login-card {
		background: white;
		padding: 3rem;
		border-radius: 8px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
		max-width: 400px;
		width: 100%;
	}

	h1 {
		color: #333;
		margin-bottom: 0.5rem;
		text-align: center;
	}

	.subtitle {
		color: #666;
		margin-bottom: 2rem;
		text-align: center;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.error {
		background: #fee;
		color: #c33;
		padding: 0.75rem;
		border-radius: 4px;
		font-size: 0.9rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		text-align: left;
	}

	label {
		font-weight: 500;
		color: #333;
		font-size: 0.9rem;
	}

	input {
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	input:focus {
		outline: none;
		border-color: #667eea;
	}

	input:disabled {
		background: #f5f5f5;
		cursor: not-allowed;
	}

	button {
		padding: 0.75rem;
		background: #667eea;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	button:hover:not(:disabled) {
		background: #5568d3;
	}

	button:disabled {
		background: #aaa;
		cursor: not-allowed;
	}
</style>
