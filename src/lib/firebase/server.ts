'use server';
import * as admin from 'firebase-admin';
import { config } from 'dotenv';

// Load environment variables from .env file
config({ path: '.env' });


export async function getAdminAuth() {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccount) {
        if (!admin.apps.length) {
            try {
                admin.initializeApp({
                    credential: admin.credential.cert(JSON.parse(serviceAccount)),
                });
            } catch (e) {
                console.error('Firebase admin initialization error', e);
                return null;
            }
        }
        return admin.auth();
    } else {
        console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin SDK not initialized.');
        return null;
    }
}
