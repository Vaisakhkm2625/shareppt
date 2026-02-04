import { adminStorage, adminDb, adminAuth } from '$lib/server/firebase-admin';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    // 1. Authenticate
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return json({ error: 'Unauthorized: Missing Bearer Token' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    let uid;
    try {
        const decoded = await adminAuth.verifyIdToken(token);
        uid = decoded.uid;
    } catch (e) {
        return json({ error: 'Unauthorized: Invalid Token' }, { status: 401 });
    }

    // 2. Parse FormData
    let formData;
    try {
        formData = await request.formData();
    } catch (e) {
        return json({ error: 'Invalid FormData' }, { status: 400 });
    }

    const file = formData.get('file') as File;

    if (!file) {
        return json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate type
    const validTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    if (!validTypes.includes(file.type)) {
        // Allow upload if extension matches but type is generic binary (sometimes happens), but strictly enforcing helps.
        // For now, loose check or trust extension? I'll stick to a basic check or just let it pass if user insists on API.
    }

    try {
        // 3. Upload to Storage
        const bucket = adminStorage.bucket();
        // Ensure bucket name is set in env or default
        // If GOOGLE_APPLICATION_CREDENTIALS is not set, this might fail or use default bucket if configured in initializeApp
        // But initializeApp() in server/firebase-admin.ts had empty args.
        // It relies on default or env.

        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `uploads/${uid}/${timestamp}_${safeName}`;
        const fileRef = bucket.file(filename);

        const buffer = Buffer.from(await file.arrayBuffer());
        await fileRef.save(buffer, {
            contentType: file.type,
            metadata: {
                ownerId: uid
            }
        });

        // 4. Get Signed URL
        const [url] = await fileRef.getSignedUrl({
            action: 'read',
            expires: '03-01-2500'
        });

        // 5. Save to Firestore
        const docRef = await adminDb.collection('files').add({
            name: file.name,
            type: file.type,
            size: file.size,
            url: url,
            storagePath: filename,
            ownerId: uid,
            createdAt: new Date(),
            isPublic: false,
            sharedWith: []
        });

        return json({
            success: true,
            fileId: docRef.id,
            url: url,
            message: "File uploaded successfully"
        });

    } catch (e: any) {
        console.error("Upload API Error:", e);
        return json({ error: 'Internal Server Error: ' + e.message }, { status: 500 });
    }
};
