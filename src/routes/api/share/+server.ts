import { adminDb, adminAuth } from '$lib/server/firebase-admin';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    // Authenticate
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    let uid;
    try {
        const decoded = await adminAuth.verifyIdToken(token);
        uid = decoded.uid;
    } catch {
        return json({ error: 'Invalid token' }, { status: 401 });
    }

    const { fileId, isPublic } = await request.json();

    if (!fileId) {
        return json({ error: 'Missing fileId' }, { status: 400 });
    }

    try {
        const docRef = adminDb.collection('files').doc(fileId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return json({ error: 'File not found' }, { status: 404 });
        }

        const data = docSnap.data();
        if (data?.ownerId !== uid) {
            return json({ error: 'Forbidden' }, { status: 403 });
        }

        await docRef.update({
            isPublic: !!isPublic
        });

        return json({ success: true, isPublic: !!isPublic });
    } catch (e: any) {
        return json({ error: e.message }, { status: 500 });
    }
};
