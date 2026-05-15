import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: 'AIzaSyAfaIdWPjW-Y_ppeXV4bIPGvRDZ_WLksL8',
  authDomain: 'maid-calc.firebaseapp.com',
  projectId: 'maid-calc',
  storageBucket: 'maid-calc.firebasestorage.app',
  messagingSenderId: '800216677165',
  appId: '1:800216677165:web:952d089fd7b2bb38b1b1a4',
  measurementId: 'G-Q0M7Z14FN4',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

let _auth;
if (Platform.OS === 'web') {
  _auth = getAuth(app);
} else {
  try {
    _auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // initializeAuth throws if called twice (e.g. during Fast Refresh) — fall back to getAuth.
    _auth = getAuth(app);
  }
}
export const auth = _auth;
