import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './config';

const COLLECTION = 'users';

export const firebaseService = {
  /**
   * Saves the entire user state to Firestore.
   */
  async saveUserData(userId, data) {
    if (!userId) return;
    try {
      const userRef = doc(db, COLLECTION, userId);
      await setDoc(userRef, data, { merge: true });
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  },

  /**
   * Loads user data from Firestore once.
   */
  async loadUserData(userId) {
    if (!userId) return null;
    try {
      const userRef = doc(db, COLLECTION, userId);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error loading user data:', error);
      return null;
    }
  },

  /**
   * Subscribes to user data changes.
   */
  subscribeToUserData(userId, callback, onError) {
    if (!userId) return () => {};
    const userRef = doc(db, COLLECTION, userId);
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    }, (error) => {
      console.error('Firestore subscription error:', error);
      if (onError) onError(error);
    });
  }
};
