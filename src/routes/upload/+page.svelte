<script lang="ts">
    import { user } from "$lib/stores";
    import { goto } from "$app/navigation";
    import { storage, db } from "$lib/firebase";
    import {
        ref,
        uploadBytesResumable,
        getDownloadURL,
    } from "firebase/storage";
    import { collection, addDoc, serverTimestamp } from "firebase/firestore";

    let dragOver = $state(false);
    let files = $state<File[]>([]);
    let uploading = $state(false);
    let progress = $state(0);
    let uploadSuccess = $state(false);
    let uploadedFileId = $state<string | null>(null);
    let error = $state("");

    // File Input Helper
    let fileInput: HTMLInputElement;

    function handleDragOver(e: DragEvent) {
        e.preventDefault();
        dragOver = true;
    }

    function handleDragLeave() {
        dragOver = false;
    }

    function handleDrop(e: DragEvent) {
        e.preventDefault();
        dragOver = false;
        if (e.dataTransfer?.files) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    }

    function onFileSelect(e: Event) {
        const target = e.target as HTMLInputElement;
        if (target.files) {
            handleFiles(Array.from(target.files));
        }
    }

    function handleFiles(newFiles: File[]) {
        const allowedTypes = [
            "application/pdf",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ];

        const validFiles = newFiles.filter((f) =>
            allowedTypes.includes(f.type),
        );

        if (validFiles.length > 0) {
            files = [validFiles[0]]; // Single file for now
            error = "";
            uploadSuccess = false;
            uploadedFileId = null;
        } else {
            error = "Please upload only PDF or PowerPoint files.";
        }
    }

    async function uploadFile() {
        if (!$user) {
            error = "You must be signed in to upload.";
            return;
        }
        if (!files.length) return;

        uploading = true;
        progress = 0;
        const file = files[0];
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const storageRef = ref(
            storage,
            `uploads/${$user.uid}/${timestamp}_${safeName}`,
        );
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            },
            (err) => {
                console.error(err);
                error = "Upload failed: " + err.message;
                uploading = false;
            },
            async () => {
                // Success
                try {
                    const downloadURL = await getDownloadURL(
                        uploadTask.snapshot.ref,
                    );

                    const docRef = await addDoc(collection(db, "files"), {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        url: downloadURL,
                        storagePath: uploadTask.snapshot.ref.fullPath,
                        ownerId: $user.uid,
                        ownerEmail: $user.email,
                        createdAt: serverTimestamp(),
                        isPublic: false,
                        sharedWith: [],
                    });

                    uploadedFileId = docRef.id;
                    uploadSuccess = true;
                    files = [];
                } catch (err: any) {
                    error = "Failed to save file metadata: " + err.message;
                } finally {
                    uploading = false;
                }
            },
        );
    }
</script>

<div class="max-w-3xl mx-auto py-12 px-4">
    <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Upload File</h1>
        <p class="text-gray-500">
            Share your presentations and documents securely
        </p>
    </div>

    <!-- Upload Card -->
    <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <!-- Drop Zone -->
        <div
            class="p-12 border-2 border-dashed transition-all duration-200 text-center relative group
            {dragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}
            {uploading ? 'opacity-50 pointer-events-none' : ''}"
            ondragover={handleDragOver}
            ondragleave={handleDragLeave}
            ondrop={handleDrop}
            role="button"
            tabindex="0"
            aria-label="Upload Drop Zone"
        >
            <input
                type="file"
                bind:this={fileInput}
                onchange={onFileSelect}
                class="hidden"
                accept=".pdf,.ppt,.pptx"
            />

            <div class="pointer-events-none">
                <div
                    class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
                >
                    <svg
                        class="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                    </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-1">
                    Drag & drop your file here
                </h3>
                <p class="text-gray-400 text-sm mb-6">
                    Supports PDF, PPT, PPTX
                </p>
                <button
                    onclick={() => fileInput.click()}
                    class="pointer-events-auto px-6 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm"
                >
                    Browse Files
                </button>
            </div>
        </div>

        <!-- Selected File & Progress -->
        {#if files.length > 0 || uploading || uploadSuccess}
            <div class="bg-gray-50 p-6 border-t border-gray-100">
                {#if files.length > 0}
                    <div
                        class="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 mb-4"
                    >
                        <div class="flex items-center gap-4">
                            <div
                                class="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center"
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
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    ></path></svg
                                >
                            </div>
                            <div>
                                <p
                                    class="font-medium text-gray-900 truncate max-w-xs"
                                >
                                    {files[0].name}
                                </p>
                                <p class="text-xs text-gray-500">
                                    {(files[0].size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                        </div>
                        {#if !uploading}
                            <button
                                onclick={() => (files = [])}
                                class="text-gray-400 hover:text-red-500 transition-colors"
                                aria-label="Remove selected file"
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
                                        d="M6 18L18 6M6 6l12 12"
                                    ></path></svg
                                >
                            </button>
                        {/if}
                    </div>
                {/if}

                {#if uploading}
                    <div class="space-y-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-700 font-medium"
                                >Uploading...</span
                            >
                            <span class="text-blue-600 font-bold"
                                >{Math.round(progress)}%</span
                            >
                        </div>
                        <div
                            class="h-2 bg-gray-200 rounded-full overflow-hidden"
                        >
                            <div
                                class="h-full bg-blue-600 transition-all duration-300 ease-out"
                                style="width: {progress}%"
                            ></div>
                        </div>
                    </div>
                {/if}

                {#if uploadSuccess}
                    <div
                        class="p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 flex items-center justify-between animate-fade-in-up"
                    >
                        <div class="flex items-center gap-3">
                            <div
                                class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
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
                                        d="M5 13l4 4L19 7"
                                    ></path></svg
                                >
                            </div>
                            <div>
                                <p class="font-bold">Upload Complete!</p>
                                <p class="text-sm opacity-90">
                                    Your file is ready to share.
                                </p>
                            </div>
                        </div>
                        {#if uploadedFileId}
                            <a
                                href="/file/{uploadedFileId}"
                                class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                            >
                                View & Share
                            </a>
                        {/if}
                    </div>
                {/if}

                {#if error}
                    <div
                        class="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2"
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

                {#if files.length > 0 && !uploading && !uploadSuccess}
                    <button
                        onclick={uploadFile}
                        class="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all duration-200 flex justify-center items-center gap-2 group"
                    >
                        <span>Start Upload</span>
                        <svg
                            class="w-5 h-5 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                            ></path></svg
                        >
                    </button>
                {/if}
            </div>
        {/if}
    </div>

    <div
        class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-sm text-gray-500"
    >
        <div class="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <div
                class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3"
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    ></path></svg
                >
            </div>
            <h4 class="font-medium text-gray-900 mb-1">Secure Storage</h4>
            <p>Your files are encrypted and stored safely.</p>
        </div>
        <div class="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <div
                class="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3"
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
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    ></path></svg
                >
            </div>
            <h4 class="font-medium text-gray-900 mb-1">Easy Sharing</h4>
            <p>Share with anyone via a simple link or email.</p>
        </div>
        <div class="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <div
                class="w-10 h-10 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-3"
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                    ></path></svg
                >
            </div>
            <h4 class="font-medium text-gray-900 mb-1">Fast Uploads</h4>
            <p>Optimized for large PDF and PPT files.</p>
        </div>
    </div>
</div>

<style>
    /* Custom animations if needed, though Tailwind covers most */
    @keyframes fade-in-up {
        0% {
            opacity: 0;
            transform: translateY(10px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .animate-fade-in-up {
        animation: fade-in-up 0.5s ease-out forwards;
    }
</style>
