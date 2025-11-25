import * as admin from 'firebase-admin';

// Check if the app is already initialized
if (!admin.apps.length) {
    try {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        if (!serviceAccountJson) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.');
        }

        const serviceAccount = JSON.parse(serviceAccountJson);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (e) {
        console.error('Firebase Admin Initialization Error', e);
    }
}

export const auth = admin.app();
export const adminAuth = admin.auth();
