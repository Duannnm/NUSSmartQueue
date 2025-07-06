// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDUB-YOmpFUX7MSohcvCkNQAawJW90Kd_U",
  authDomain: "nussmartqueue.firebaseapp.com",
  databaseURL: "https://nussmartqueue-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nussmartqueue",
  storageBucket: "nussmartqueue.firebasestorage.app",
  messagingSenderId: "598417204683",
  appId: "1:598417204683:web:ea88cec80377a72682024e",
  measurementId: "G-N1Q96XCZ3Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig );

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app);

export default app;
