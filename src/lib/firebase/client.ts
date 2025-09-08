'use client';

import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  projectId: 'blue-sky-school-feeding-system',
  appId: '1:517057204770:web:ebc0bd181169fced3bb07b',
  storageBucket: 'blue-sky-school-feeding-system.firebasestorage.app',
  apiKey: 'AIzaSyAC2RWeLkVWF5KEMJuBaP0hGNlfC-MG_JI',
  authDomain: 'blue-sky-school-feeding-system.firebaseapp.com',
  messagingSenderId: '517057204770',
};

// Initialize Firebase
let firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export default firebaseApp;
