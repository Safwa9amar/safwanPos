
import * as admin from "firebase-admin";
import {initializeApp} from "firebase-admin/app"
// import serviceAccount from  "./firebase-server-account.json"
const serviceAccount: admin.ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
};
console.log(admin.apps, serviceAccount)
if (!admin.apps.length) {
    initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
   
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
