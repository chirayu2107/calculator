import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
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
      // Use updateDoc to ensure that maps (like attendance) are replaced, not merged.
      // This allows unselecting/deleting items correctly.
      await updateDoc(userRef, data).catch(async (err) => {
        // If document doesn't exist yet, use setDoc
        if (err.code === 'not-found') {
          await setDoc(userRef, data);
        } else {
          throw err;
        }
      });
      console.log(`[Firebase] Data saved successfully for user: ${userId}`);
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
      console.log(`[Firebase] Attempting to load data for: ${userId}`);
      const userRef = doc(db, COLLECTION, userId);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        console.log(`[Firebase] Data found for: ${userId}`);
        return docSnap.data();
      }
      console.log(`[Firebase] No data found for: ${userId}, starting fresh.`);
      return null;
    } catch (error) {
      console.error('Error loading user data:', error);
      // If we're "offline" or auth failed, we might still want to return null instead of throwing
      // so the app can continue with local data.
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
