'use server';
import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccount!)),
    });
  } catch (e) {
    console.error('Firebase admin initialization error', e);
  }
}

export const adminAuth = admin.auth();
