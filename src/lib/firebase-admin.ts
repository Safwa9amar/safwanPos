
import * as admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

const serviceAccountConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
};

/**
 * Ensures that the Firebase Admin app is initialized and returns the Auth service.
 * This singleton pattern prevents re-initialization in serverless environments.
 */
function getAdminAuth() {
  if (!getApps().length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountConfig as admin.ServiceAccount)
    });
  }
  return admin.auth();
}

// Export the function to be used in server actions/api routes
export { getAdminAuth };
