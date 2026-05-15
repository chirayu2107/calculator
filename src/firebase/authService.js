import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { auth } from './config';

const friendlyError = (err) => {
  const code = err && err.code;
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address is not valid.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email or password is incorrect.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again in a few minutes.';
    case 'auth/network-request-failed':
      return 'No internet connection.';
    case 'auth/requires-recent-login':
      return 'Please sign in again to confirm this action.';
    default:
      return (err && err.message) || 'Something went wrong. Please try again.';
  }
};

export const authService = {
  current: () => auth.currentUser,

  onChange: (cb) => onAuthStateChanged(auth, cb),

  async signUp(email, password) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      return { user: cred.user };
    } catch (err) {
      return { error: friendlyError(err), code: err && err.code };
    }
  },

  async signIn(email, password) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      return { user: cred.user };
    } catch (err) {
      return { error: friendlyError(err), code: err && err.code };
    }
  },

  async signOut() {
    await signOut(auth);
  },

  async sendReset(email) {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { ok: true };
    } catch (err) {
      return { error: friendlyError(err) };
    }
  },

  async deleteAccount(currentPassword) {
    const user = auth.currentUser;
    if (!user) return { error: 'Not signed in.' };
    try {
      if (currentPassword && user.email) {
        const cred = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, cred);
      }
      await deleteUser(user);
      return { ok: true };
    } catch (err) {
      return { error: friendlyError(err), code: err && err.code };
    }
  },
};
