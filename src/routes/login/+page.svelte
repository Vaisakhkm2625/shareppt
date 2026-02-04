<script lang="ts">
    import { auth } from "$lib/firebase";
    import {
        signInWithEmailAndPassword,
        GoogleAuthProvider,
        signInWithPopup,
    } from "firebase/auth";
    import { goto } from "$app/navigation";

    let email = $state("");
    let password = $state("");
    let error = $state("");
    let loading = $state(false);

    async function handleGoogleLogin() {
        loading = true;
        error = "";
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            goto("/");
        } catch (err: any) {
            console.error(err);
            error = err.message || "Failed to login with Google";
        } finally {
            loading = false;
        }
    }

    async function handleLogin(e: Event) {
        e.preventDefault();
        loading = true;
        error = "";

        try {
            await signInWithEmailAndPassword(auth, email, password);
            goto("/");
        } catch (err: any) {
            console.error(err);
            error = err.message || "Failed to login";
        } finally {
            loading = false;
        }
    }
</script>

<div
    class="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-gray-50"
>
    <div
        class="max-w-md w-full bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8 transform transition-all hover:shadow-2xl"
    >
        <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p class="text-gray-500">Sign in to continue sharing your files</p>
        </div>

        {#if error}
            <div
                class="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2 animate-pulse"
            >
                <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path></svg
                >
                {error}
            </div>
        {/if}

        <form onsubmit={handleLogin} class="space-y-6">
            <div>
                <label
                    class="block text-sm font-medium text-gray-700 mb-2"
                    for="email">Email Address</label
                >
                <input
                    type="email"
                    id="email"
                    bind:value={email}
                    required
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 bg-white/50"
                    placeholder="you@example.com"
                />
            </div>

            <div>
                <label
                    class="block text-sm font-medium text-gray-700 mb-2"
                    for="password">Password</label
                >
                <input
                    type="password"
                    id="password"
                    bind:value={password}
                    required
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 bg-white/50"
                    placeholder="••••••••"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                class="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
                {#if loading}
                    <svg
                        class="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        ><circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                        ></circle><path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path></svg
                    >
                    Signing in...
                {:else}
                    Sign In
                {/if}
            </button>

            <div class="relative flex items-center justify-center my-6">
                <div class="border-t border-gray-200 w-full"></div>
                <div class="absolute bg-white px-3 text-sm text-gray-400">
                    Or continue with
                </div>
            </div>

            <button
                type="button"
                onclick={handleGoogleLogin}
                class="w-full py-3 px-4 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all duration-200 shadow-sm flex justify-center items-center gap-2"
            >
                <svg class="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                    />
                </svg>
                Sign in with Google
            </button>
        </form>

        <div class="mt-8 text-center text-sm text-gray-500">
            Don't have an account?
            <a
                href="/register"
                class="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >Create account</a
            >
        </div>
    </div>
</div>
