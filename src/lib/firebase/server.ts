'use server';
import * as admin from 'firebase-admin';

// NOTE: dotenv is not needed here. Next.js automatically loads .env files.
// config({ path: '.env' });

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
