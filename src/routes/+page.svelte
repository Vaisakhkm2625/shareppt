<script lang="ts">
    import { user } from "$lib/stores";
    import { fade } from "svelte/transition";
</script>

<div class="flex flex-col min-h-[calc(100vh-4rem)]">
    <!-- Hero Section -->
    <header class="relative overflow-hidden bg-white pt-16 pb-32">
        <div
            class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent opacity-50"
        ></div>
        <div
            class="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-100 via-transparent to-transparent opacity-50"
        ></div>

        <div class="container mx-auto px-4 relative z-10 text-center">
            <div
                class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-8 animate-fade-in-up"
            >
                <span class="relative flex h-2 w-2">
                    <span
                        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"
                    ></span>
                    <span
                        class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"
                    ></span>
                </span>
                Secure File Sharing Reimagined
            </div>

            <h1
                class="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 mb-6 tracking-tight leading-tight"
            >
                Share Presentations <br class="hidden md:block" />
                <span
                    class="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"
                    >Without Limits</span
                >
            </h1>

            <p
                class="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
                Upload your PDFs and PowerPoints securely. Share them with a
                simple link. Control access with a single click.
            </p>

            <div
                class="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
                {#if $user}
                    <a
                        href="/dashboard"
                        class="px-8 py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg shadow-gray-900/20 hover:bg-gray-800 hover:scale-105 transition-all duration-200 flex items-center gap-2"
                    >
                        Go to Dashboard
                        <svg
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                            ></path></svg
                        >
                    </a>
                    <a
                        href="/upload"
                        class="px-8 py-4 bg-white text-gray-900 font-bold border border-gray-200 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all duration-200 flex items-center gap-2"
                    >
                        Upload New File
                    </a>
                {:else}
                    <a
                        href="/register"
                        class="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200 flex items-center gap-2"
                    >
                        Get Started for Free
                        <svg
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                            ></path></svg
                        >
                    </a>
                    <a
                        href="/login"
                        class="px-8 py-4 bg-white text-gray-700 font-bold border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                        Sign In
                    </a>
                {/if}
            </div>
        </div>
    </header>

    <!-- Features Grid -->
    <section class="py-24 bg-gray-50/50">
        <div class="container mx-auto px-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div
                    class="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                    <div
                        class="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6"
                    >
                        <svg
                            class="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            ></path></svg
                        >
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">
                        Seamless Uploads
                    </h3>
                    <p class="text-gray-500 leading-relaxed">
                        Drag and drop your presentations. We support PDF and
                        PPTX formats with lightning-fast processing.
                    </p>
                </div>

                <div
                    class="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                    <div
                        class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6"
                    >
                        <svg
                            class="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            ></path></svg
                        >
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">
                        Privacy First
                    </h3>
                    <p class="text-gray-500 leading-relaxed">
                        Your files are private by default. Toggle public access
                        only when you want to share with the world.
                    </p>
                </div>

                <div
                    class="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                    <div
                        class="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center mb-6"
                    >
                        <svg
                            class="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                            ></path></svg
                        >
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">
                        Instant Sharing
                    </h3>
                    <p class="text-gray-500 leading-relaxed">
                        Generate a unique, permanent link for every file. One
                        click to copy and share anywhere.
                    </p>
                </div>
            </div>
        </div>
    </section>
</div>

<style>
    @keyframes fade-in-up {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .animate-fade-in-up {
        animation: fade-in-up 0.8s ease-out forwards;
    }
</style>
