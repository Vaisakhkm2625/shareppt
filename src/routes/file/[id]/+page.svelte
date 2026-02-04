<script lang="ts">
    import { page } from "$app/stores";
    import { db } from "$lib/firebase";
    import { doc, getDoc, updateDoc } from "firebase/firestore";
    import { onMount } from "svelte";
    import { user } from "$lib/stores";

    let file = $state<any>(null);
    let loading = $state(true);
    let error = $state("");
    let isOwner = $state(false);
    let shareLink = $state("");

    const fileId = $page.params.id;

    onMount(async () => {
        try {
            // Wait a short moment for auth to initialize if not present
            // This prevents "permission denied" on reload if the SDK hasn't loaded the user token yet
            // but the file is private.

            const docRef = doc(db, "files", fileId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                file = { id: docSnap.id, ...docSnap.data() };
                shareLink = window.location.href;

                // Check if user is owner
                if ($user && $user.uid === file.ownerId) {
                    isOwner = true;
                }
            } else {
                error = "File not found";
            }
        } catch (err: any) {
            console.error(err);
            error = "Error loading file";
        } finally {
            loading = false;
        }
    });

    async function togglePublic() {
        if (!isOwner || !file) return;
        try {
            await updateDoc(doc(db, "files", file.id), {
                isPublic: !file.isPublic,
            });
            file.isPublic = !file.isPublic;
        } catch (err: any) {
            console.error(err);
            alert("Failed to update permission: " + err.message);
        }
    }

    function copyLink() {
        navigator.clipboard.writeText(shareLink);
        alert("Link copied to clipboard!");
    }

    // Simple download trigger
    function downloadFile() {
        if (!file?.url) return;
        window.open(file.url, "_blank");
    }
</script>

<div class="min-h-[80vh] flex items-center justify-center p-4">
    {#if loading}
        <div class="text-center">
            <div
                class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
            ></div>
            <h2 class="text-xl font-medium text-gray-600">
                Loading file details...
            </h2>
        </div>
    {:else if error}
        <div
            class="text-center max-w-md mx-auto p-8 bg-red-50 rounded-2xl border border-red-100"
        >
            <div
                class="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
                <svg
                    class="w-8 h-8"
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
            </div>
            <h2 class="text-xl font-bold text-gray-900 mb-2">Unavailable</h2>
            <p class="text-gray-600">{error}</p>
            <a
                href="/"
                class="inline-block mt-6 px-6 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:border-gray-300 transition-colors"
                >Go Home</a
            >
        </div>
    {:else if file}
        <div
            class="max-w-3xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
        >
            <!-- Header -->
            <div
                class="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-white text-center relative overflow-hidden"
            >
                <div
                    class="absolute inset-0 bg-white/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                ></div>

                <div class="relative z-10 flex flex-col items-center">
                    <div
                        class="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/20"
                    >
                        {#if file.type.includes("pdf")}
                            <svg
                                class="w-10 h-10 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                ></path></svg
                            >
                        {:else}
                            <svg
                                class="w-10 h-10 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                                ></path></svg
                            >
                        {/if}
                    </div>
                    <h1
                        class="text-2xl md:text-3xl font-bold mb-2 break-all px-4"
                    >
                        {file.name}
                    </h1>
                    <p class="text-blue-100 text-sm">
                        Uploaded on {new Date(
                            file.createdAt?.toDate(),
                        ).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <!-- Content -->
            <div class="p-8">
                {#if isOwner}
                    <div
                        class="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100"
                    >
                        <h3
                            class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"
                        >
                            <svg
                                class="w-5 h-5 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                ></path></svg
                            >
                            Sharing Options
                        </h3>
                        <div
                            class="flex flex-wrap gap-4 items-center justify-between"
                        >
                            <div class="flex items-center gap-3">
                                <button
                                    onclick={togglePublic}
                                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 {file.isPublic
                                        ? 'bg-green-500'
                                        : 'bg-gray-200'}"
                                >
                                    <span class="sr-only"
                                        >Enable public link</span
                                    >
                                    <span
                                        class="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition {file.isPublic
                                            ? 'translate-x-6'
                                            : 'translate-x-1'}"
                                    ></span>
                                </button>
                                <span class="text-sm font-medium text-gray-700">
                                    {file.isPublic
                                        ? "Publicly Accesssible"
                                        : "Private (Only you)"}
                                </span>
                            </div>

                            <button
                                onclick={copyLink}
                                class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm text-sm"
                            >
                                <svg
                                    class="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    ><path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                    ></path></svg
                                >
                                Copy Link
                            </button>
                        </div>
                    </div>
                {/if}

                {#if file.isPublic || isOwner}
                    <div class="flex flex-col gap-4">
                        <div
                            class="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3 text-blue-700"
                        >
                            <svg
                                class="w-5 h-5 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                ></path></svg
                            >
                            <p class="text-sm">
                                This file is ready to view or download.
                            </p>
                        </div>

                        <button
                            onclick={downloadFile}
                            class="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg flex justify-center items-center gap-2 hover:scale-[1.01]"
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
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                ></path></svg
                            >
                            Download File
                        </button>
                    </div>
                {:else}
                    <div class="text-center py-10">
                        <div
                            class="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            <svg
                                class="w-8 h-8"
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
                        <h3 class="text-lg font-medium text-gray-900 mb-2">
                            Private File
                        </h3>
                        <p class="text-gray-500">
                            You do not have permission to access this file.
                        </p>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>
