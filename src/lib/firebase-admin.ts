
import * as admin from 'firebase-admin';

// Check if the app is already initialized to prevent re-initialization
if (!admin.apps.length) {
    try {
        const serviceAccount = {
            type: process.env.FIREBASE_TYPE as string,
            project_id: process.env.FIREBASE_PROJECT_ID as string,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID as string,
            private_key: (process.env.FIREBASE_PRIVATE_KEY as string).replace(/\\n/g, '\n'),
            client_email: process.env.FIREBASE_CLIENT_EMAIL as string,
            client_id: process.env.FIREBASE_CLIENT_ID as string,
            auth_uri: process.env.FIREBASE_AUTH_URI as string,
            token_uri: process.env.FIREBASE_TOKEN_URI as string,
            auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL as string,
            client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL as string,
            universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN as string,
        };

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (e) {
        console.error('Firebase Admin Initialization Error', e);
    }
}

export const adminAuth = admin.auth();
