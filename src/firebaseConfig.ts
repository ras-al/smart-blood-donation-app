// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBYB6j8NIsR5h7hyAVwe9gPOcmNLyQJKEY",
  authDomain: "blood-donation-d02ed.firebaseapp.com",
  projectId: "blood-donation-d02ed",
  storageBucket: "blood-donation-d02ed.firebasestorage.app",
  messagingSenderId: "323150174174",
  appId: "1:323150174174:web:6350ebd2357cd6c0866f4f"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);