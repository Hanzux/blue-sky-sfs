'use server';
import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

let adminAuth: admin.auth.Auth;

if (serviceAccount) {
    if (!admin.apps.length) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(JSON.parse(serviceAccount)),
            });
        } catch (e) {
            console.error('Firebase admin initialization error', e);
        }
    }
    adminAuth = admin.auth();
} else {
    console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin SDK not initialized.');
    // Mock adminAuth to avoid breaking the app
    adminAuth = {} as admin.auth.Auth;
}

export { adminAuth };
