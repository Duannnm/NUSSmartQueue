// Firebase configuration for NUSmartQueue
// Pre-configured for easy testing and development

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

// Demo Firebase configuration
// Note: These are demo credentials for development/testing purposes
const firebaseConfig = {
  apiKey: "demo-api-key-for-development",
  authDomain: "nusmartqueue-demo.firebaseapp.com",
  databaseURL: "https://nusmartqueue-demo-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nusmartqueue-demo",
  storageBucket: "nusmartqueue-demo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:demo-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);

export default app;

