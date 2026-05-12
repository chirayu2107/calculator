import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Replace these with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAfaIdWPjW-Y_ppeXV4bIPGvRDZ_WLksL8",
  authDomain: "maid-calc.firebaseapp.com",
  projectId: "maid-calc",
  storageBucket: "maid-calc.firebasestorage.app",
  messagingSenderId: "800216677165",
  appId: "1:800216677165:web:952d089fd7b2bb38b1b1a4",
  measurementId: "G-Q0M7Z14FN4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
