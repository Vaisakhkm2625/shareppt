import { adminDb, adminAuth } from '$lib/server/firebase-admin';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, params }) => {
    // Optional Auth (if public)
    const authHeader = request.headers.get('Authorization');
    let uid = null;
    if (authHeader?.startsWith('Bearer ')) {
        try {
            const token = authHeader.split('Bearer ')[1];
            const decoded = await adminAuth.verifyIdToken(token);
            uid = decoded.uid;
        } catch { }
    }

    const fileId = params.id;
    if (!fileId) return json({ error: 'Missing ID' }, { status: 400 });

    try {
        const docSnap = await adminDb.collection('files').doc(fileId).get();
        if (!docSnap.exists) {
            return json({ error: 'File not found' }, { status: 404 });
        }

        const data = docSnap.data();

        // Access Control
        const isOwner = uid && data?.ownerId === uid;
        const isPublic = data?.isPublic;

        if (!isPublic && !isOwner) {
            return json({ error: 'Forbidden' }, { status: 403 });
        }

        return json({
            id: docSnap.id,
            name: data?.name,
            type: data?.type,
            size: data?.size,
            url: data?.url,
            isPublic: data?.isPublic,
            createdAt: data?.createdAt?.toDate()
        });
    } catch (e: any) {
        return json({ error: e.message }, { status: 500 });
    }
};
