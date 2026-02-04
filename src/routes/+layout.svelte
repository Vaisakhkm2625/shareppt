<script lang="ts">
	import "./layout.css";
	import { onMount } from "svelte";
	import { auth } from "$lib/firebase";
	import { user } from "$lib/stores";
	import { goto } from "$app/navigation";
	import { signOut } from "firebase/auth";

	// @ts-ignore
	let { children } = $props();

	onMount(() => {
		const unsubscribe = auth.onAuthStateChanged((u) => {
			user.set(u);
		});
		return unsubscribe;
	});

	async function logout() {
		try {
			await signOut(auth);
			goto("/login");
		} catch (error) {
			console.error("Logout failed", error);
		}
	}
</script>

<div class="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
	<nav
		class="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100"
	>
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<!-- Logo -->
				<div class="flex items-center">
					<a href="/" class="flex items-center gap-2 group">
						<div
							class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300"
						>
							S
						</div>
						<span
							class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300"
						>
							SharePPT
						</span>
					</a>
				</div>

				<!-- Actions -->
				<div class="flex items-center space-x-4">
					{#if $user}
						<div
							class="hidden sm:flex items-center text-sm text-gray-500 mr-4"
						>
							{$user.email}
						</div>
						<a
							href="/upload"
							class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
						>
							Upload
						</a>
						<button
							onclick={logout}
							class="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
						>
							Logout
						</button>
					{:else}
						<a
							href="/login"
							class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
						>
							Sign In
						</a>
						<a
							href="/register"
							class="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
						>
							Get Started
						</a>
					{/if}
				</div>
			</div>
		</div>
	</nav>

	<main class="flex-grow">
		{@render children()}
	</main>

	<footer class="bg-white border-t border-gray-100 py-8 mt-auto">
		<div class="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
			&copy; {new Date().getFullYear()} SharePPT. All rights reserved.
		</div>
	</footer>
</div>
