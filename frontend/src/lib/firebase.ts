import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB-Sjp1l4wqVnSxzJvC0ANSKiHRMDcQGBc",
  authDomain: "flashsynqai-6780f.firebaseapp.com",
  projectId: "flashsynqai-6780f",
  storageBucket: "flashsynqai-6780f.firebasestorage.app",
  messagingSenderId: "729432232378",
  appId: "1:729432232378:web:9568e9b19131f4cfdf0d83",
  measurementId: "G-H08Q21S7RB"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
