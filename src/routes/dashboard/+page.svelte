<script lang="ts">
    import { user } from "$lib/stores";
    import { db, storage } from "$lib/firebase";
    import {
        collection,
        query,
        where,
        orderBy,
        onSnapshot,
        deleteDoc,
        doc,
    } from "firebase/firestore";
    import { ref, deleteObject } from "firebase/storage";
    import { onMount, onDestroy } from "svelte";
    import { goto } from "$app/navigation";

    let files = $state<any[]>([]);
    let loading = $state(true);
    let unsubscribe: () => void;
    let deletingId = $state<string | null>(null);

    $effect(() => {
        if (!$user && !loading) {
            goto("/login");
        }
    });

    onMount(() => {
        // Wait for auth to initialize (handled by store subscription mostly, but let's be safe)
        // Ideally we check $user immediately, but it might be null initially while loading
    });

    // Reactive subscription to files when user is available
    $effect(() => {
        if ($user) {
            const q = query(
                collection(db, "files"),
                where("ownerId", "==", $user.uid),
                orderBy("createdAt", "desc"),
            );

            unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    files = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    loading = false;
                },
                (error) => {
                    console.error("Error fetching files:", error);
                    loading = false;
                },
            );
        }
    });

    onDestroy(() => {
        if (unsubscribe) unsubscribe();
    });

    async function deleteFile(file: any) {
        if (!confirm("Are you sure you want to delete this file?")) return;

        deletingId = file.id;
        try {
            // 1. Delete from Storage
            const storageRef = ref(storage, file.storagePath);
            await deleteObject(storageRef);

            // 2. Delete from Firestore
            await deleteDoc(doc(db, "files", file.id));
        } catch (error) {
            console.error("Error deleting file:", error);
            alert("Failed to delete file.");
        } finally {
            deletingId = null;
        }
    }

    function copyLink(fileId: string) {
        const url = `${window.location.origin}/file/${fileId}`;
        navigator.clipboard.writeText(url);
        // Could show a toast here
        alert("Link copied: " + url);
    }
</script>

<div class="container mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-8">
        <div>
            <h1 class="text-3xl font-bold text-gray-900">Your Files</h1>
            <p class="text-gray-500 mt-1">
                Manage and share your presentations
            </p>
        </div>
        <a
            href="/upload"
            class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
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
                    d="M12 4v16m8-8H4"
                ></path></svg
            >
            Upload New
        </a>
    </div>

    {#if loading}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            {#each Array(3) as _}
                <div class="h-48 bg-gray-100 rounded-xl animate-pulse"></div>
            {/each}
        </div>
    {:else if files.length === 0}
        <div
            class="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200"
        >
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
                        d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    ></path></svg
                >
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
                No files uploaded yet
            </h3>
            <p class="text-gray-500 mb-6">
                Get started by uploading your first presentation.
            </p>
            <a
                href="/upload"
                class="px-6 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
                Upload File
            </a>
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each files as file (file.id)}
                <div
                    class="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative"
                >
                    <!-- File Preview / Icon -->
                    <div
                        class="h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overow-hidden"
                    >
                        {#if file.type?.includes("pdf")}
                            <svg
                                class="w-16 h-16 text-red-500 drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                ></path></svg
                            >
                        {:else}
                            <svg
                                class="w-16 h-16 text-orange-500 drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                                ></path></svg
                            >
                        {/if}

                        <!-- Status Badge -->
                        <div class="absolute top-4 right-4">
                            {#if file.isPublic}
                                <span
                                    class="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200 shadow-sm"
                                    >Public</span
                                >
                            {:else}
                                <span
                                    class="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full border border-gray-200 shadow-sm"
                                    >Private</span
                                >
                            {/if}
                        </div>
                    </div>

                    <div class="p-5">
                        <h3
                            class="font-bold text-gray-900 truncate mb-1"
                            title={file.name}
                        >
                            {file.name}
                        </h3>
                        <p class="text-xs text-gray-500 mb-4">
                            {new Date(
                                file.createdAt?.toDate(),
                            ).toLocaleDateString()} • {(
                                file.size /
                                1024 /
                                1024
                            ).toFixed(2)} MB
                        </p>

                        <div class="grid grid-cols-2 gap-2">
                            <a
                                href="/file/{file.id}"
                                class="col-span-2 px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors text-center"
                            >
                                View Details
                            </a>
                            <button
                                onclick={() => copyLink(file.id)}
                                class="px-3 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors"
                            >
                                Copy Link
                            </button>
                            <button
                                onclick={() => deleteFile(file)}
                                disabled={deletingId === file.id}
                                class="px-3 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:border-red-400 hover:text-red-500 transition-colors disabled:opacity-50"
                            >
                                {deletingId === file.id ? "..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
