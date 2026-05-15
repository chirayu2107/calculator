import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  deleteField,
} from 'firebase/firestore';
import { db } from './config';
import { logger } from '../utils/logger';

const USERS = 'users';
const HOUSEHOLDS = 'households';
const LOOKUPS = 'household_lookups';
const ARCHIVED = 'archived_households';

const userRef = (uid) => doc(db, USERS, uid);
const householdRef = (hid) => doc(db, HOUSEHOLDS, hid);
const lookupRef = (code) => doc(db, LOOKUPS, code);
const archivedRef = (hid) => doc(db, ARCHIVED, hid);

const newId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// 6-digit numeric code, formatted "XXX-XXX"
const generateCode = () => {
  const n = Math.floor(100000 + Math.random() * 900000);
  const s = String(n);
  return `${s.slice(0, 3)}-${s.slice(3)}`;
};

export const firebaseService = {
  // ---------- USER PROFILE ----------
  async getUserProfile(uid) {
    if (!uid) return null;
    try {
      const snap = await getDoc(userRef(uid));
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      logger.error('[firebaseService] getUserProfile failed', err);
      return null;
    }
  },

  async setUserHouseholdId(uid, householdId, email) {
    if (!uid) return;
    try {
      await setDoc(
        userRef(uid),
        { householdId, email: email || null, updatedAt: serverTimestamp() },
        { merge: true }
      );
    } catch (err) {
      logger.error('[firebaseService] setUserHouseholdId failed', err);
      throw err;
    }
  },

  async ensureUserProfile(uid, email) {
    if (!uid) return null;
    try {
      const snap = await getDoc(userRef(uid));
      if (snap.exists()) return snap.data();
      const data = { email: email || null, createdAt: serverTimestamp() };
      await setDoc(userRef(uid), data);
      return data;
    } catch (err) {
      logger.error('[firebaseService] ensureUserProfile failed', err);
      return null;
    }
  },

  async deleteUserProfile(uid) {
    if (!uid) return;
    try {
      await deleteDoc(userRef(uid));
    } catch (err) {
      logger.warn('[firebaseService] deleteUserProfile failed', err);
    }
  },

  // ---------- HOUSEHOLD: LOAD / WRITE / SUBSCRIBE ----------
  async loadHousehold(hid) {
    if (!hid) return null;
    try {
      const snap = await getDoc(householdRef(hid));
      return snap.exists() ? { id: hid, ...snap.data() } : null;
    } catch (err) {
      logger.error('[firebaseService] loadHousehold failed', err);
      return null;
    }
  },

  async patchHousehold(hid, patch) {
    if (!hid) return;
    try {
      await updateDoc(householdRef(hid), { ...patch, updatedAt: serverTimestamp() });
    } catch (err) {
      logger.error('[firebaseService] patchHousehold failed', err);
      throw err;
    }
  },

  subscribeToHousehold(hid, onData, onError) {
    if (!hid) return () => {};
    return onSnapshot(
      householdRef(hid),
      (snap) => {
        if (snap.exists()) onData({ id: hid, ...snap.data() });
      },
      (err) => {
        logger.error('[firebaseService] subscribe error', err);
        if (onError) onError(err);
      }
    );
  },

  // ---------- HOUSEHOLD: CREATE + MIGRATE ----------
  // Atomically: create a new household keyed by inviteCode in lookups,
  // create the household doc, and set users/{uid}.householdId. Returns the
  // new household payload.
  async createHousehold({ uid, email, name, initialData }) {
    if (!uid) throw new Error('createHousehold: uid required');

    const hid = newId('hh');
    let code = generateCode();

    // Ensure code uniqueness with one retry; collisions are extremely unlikely.
    try {
      const existing = await getDoc(lookupRef(code));
      if (existing.exists()) code = generateCode();
    } catch {
      // ignore — fall through and let the lookup write resolve uniqueness.
    }

    const member = {
      email: email || null,
      role: 'owner',
      joinedAt: Date.now(),
    };

    const household = {
      ownerUid: uid,
      name: name || 'My Household',
      createdAt: serverTimestamp(),
      inviteCode: code,
      members: { [uid]: member },
      // Embedded shared data
      staffList: (initialData && initialData.staffList) || [],
      staffData: (initialData && initialData.staffData) || {},
      activeStaffId: (initialData && initialData.activeStaffId) || null,
    };

    await setDoc(householdRef(hid), household);
    await setDoc(lookupRef(code), {
      householdId: hid,
      createdAt: serverTimestamp(),
    });
    await this.setUserHouseholdId(uid, hid, email);

    return { id: hid, ...household };
  },

  // One-time migration: if user has legacy staff data on users/{uid} but no
  // householdId, promote it to a new household.
  async migrateUserToHousehold(uid, email, legacyDoc) {
    if (!uid) return null;
    const initialData = {
      staffList: legacyDoc.staffList || [],
      staffData: legacyDoc.staffData || {},
      activeStaffId: legacyDoc.activeStaffId || null,
    };
    const created = await this.createHousehold({
      uid,
      email,
      initialData,
    });
    // Clean up the legacy fields on users/{uid} (keep email + new householdId).
    try {
      await updateDoc(userRef(uid), {
        staffList: deleteField(),
        staffData: deleteField(),
        activeStaffId: deleteField(),
      });
    } catch {
      // best-effort cleanup
    }
    return created;
  },

  // ---------- INVITE CODE ----------
  async resolveInviteCode(code) {
    if (!code) return null;
    try {
      const snap = await getDoc(lookupRef(code));
      if (!snap.exists()) return null;
      return snap.data().householdId || null;
    } catch (err) {
      logger.error('[firebaseService] resolveInviteCode failed', err);
      return null;
    }
  },

  async regenerateInviteCode(hid) {
    if (!hid) throw new Error('regenerateInviteCode: hid required');
    const household = await this.loadHousehold(hid);
    if (!household) throw new Error('Household not found');

    const oldCode = household.inviteCode;
    let nextCode = generateCode();
    if (nextCode === oldCode) nextCode = generateCode();

    // Write new lookup before retiring the old one.
    await setDoc(lookupRef(nextCode), { householdId: hid, createdAt: serverTimestamp() });
    await updateDoc(householdRef(hid), { inviteCode: nextCode, updatedAt: serverTimestamp() });
    if (oldCode) {
      try { await deleteDoc(lookupRef(oldCode)); } catch { /* tolerate */ }
    }
    return nextCode;
  },

  // ---------- JOIN ----------
  // Adds the user to an existing household by code. Archives the user's
  // previous household-of-one if they were its only member (otherwise just
  // unlinks them).
  async joinHouseholdByCode({ uid, email, code, previousHouseholdId }) {
    if (!uid || !code) throw new Error('joinHouseholdByCode: uid + code required');

    const hid = await this.resolveInviteCode(code);
    if (!hid) return { error: 'That code didn’t match any family.' };
    if (hid === previousHouseholdId) return { error: 'You’re already in that family.' };

    // Add member to the new household.
    const memberEntry = { email: email || null, role: 'member', joinedAt: Date.now() };
    try {
      await updateDoc(householdRef(hid), {
        [`members.${uid}`]: memberEntry,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      logger.error('[firebaseService] joinHouseholdByCode add member failed', err);
      return { error: 'Could not join family. Please try again.' };
    }

    // If the user had a previous household, handle it.
    if (previousHouseholdId) {
      try {
        const prev = await this.loadHousehold(previousHouseholdId);
        if (prev) {
          const isOwner = prev.ownerUid === uid;
          const otherMemberCount = Object.keys(prev.members || {}).filter((m) => m !== uid).length;

          if (isOwner && otherMemberCount === 0) {
            // Archive the entire household — they were the only member.
            await setDoc(archivedRef(previousHouseholdId), {
              ...prev,
              archivedAt: serverTimestamp(),
              archivedBy: uid,
              reason: 'joined_other_family',
            });
            // Tear down active household + lookup.
            if (prev.inviteCode) {
              try { await deleteDoc(lookupRef(prev.inviteCode)); } catch { /* tolerate */ }
            }
            try { await deleteDoc(householdRef(previousHouseholdId)); } catch { /* tolerate */ }
          } else {
            // Just remove this user from the previous household's members.
            const patch = { [`members.${uid}`]: deleteField(), updatedAt: serverTimestamp() };
            if (isOwner) {
              // Transfer ownership to the oldest remaining member.
              const remaining = Object.entries(prev.members || {})
                .filter(([k]) => k !== uid)
                .sort((a, b) => (a[1].joinedAt || 0) - (b[1].joinedAt || 0));
              if (remaining.length > 0) patch.ownerUid = remaining[0][0];
            }
            try { await updateDoc(householdRef(previousHouseholdId), patch); } catch { /* tolerate */ }
          }
        }
      } catch (err) {
        logger.warn('[firebaseService] previous household cleanup failed (continuing)', err);
      }
    }

    await this.setUserHouseholdId(uid, hid, email);
    return { ok: true, householdId: hid };
  },

  // ---------- LEAVE / REMOVE ----------
  async leaveHousehold({ uid, hid }) {
    if (!uid || !hid) throw new Error('leaveHousehold: uid + hid required');
    const prev = await this.loadHousehold(hid);
    if (!prev) return { error: 'Household not found.' };

    const isOwner = prev.ownerUid === uid;
    const memberCount = Object.keys(prev.members || {}).length;

    if (memberCount <= 1) {
      return { error: 'You’re the only member. Sign out from Settings instead, or delete your account.' };
    }

    const patch = { [`members.${uid}`]: deleteField(), updatedAt: serverTimestamp() };

    if (isOwner) {
      const remaining = Object.entries(prev.members || {})
        .filter(([k]) => k !== uid)
        .sort((a, b) => (a[1].joinedAt || 0) - (b[1].joinedAt || 0));
      patch.ownerUid = remaining[0][0];
    }

    try {
      await updateDoc(householdRef(hid), patch);
    } catch (err) {
      logger.error('[firebaseService] leaveHousehold failed', err);
      return { error: 'Could not leave family. Please try again.' };
    }

    return { ok: true };
  },

  async removeMember({ ownerUid, hid, targetUid }) {
    if (!ownerUid || !hid || !targetUid) throw new Error('removeMember: missing args');
    if (ownerUid === targetUid) return { error: 'Use “Leave family” to remove yourself.' };
    try {
      await updateDoc(householdRef(hid), {
        [`members.${targetUid}`]: deleteField(),
        updatedAt: serverTimestamp(),
      });
      return { ok: true };
    } catch (err) {
      logger.error('[firebaseService] removeMember failed', err);
      return { error: 'Could not remove member.' };
    }
  },

  // ---------- DELETE ACCOUNT ----------
  async deleteUserAndHouseholdIfSole(uid, hid) {
    // Used by the delete-account flow. Mirrors leaveHousehold + cleans up
    // the household if the user was the sole member.
    if (!uid) return;
    if (hid) {
      try {
        const prev = await this.loadHousehold(hid);
        if (prev) {
          const memberCount = Object.keys(prev.members || {}).length;
          if (memberCount <= 1) {
            if (prev.inviteCode) {
              try { await deleteDoc(lookupRef(prev.inviteCode)); } catch { /* tolerate */ }
            }
            try { await deleteDoc(householdRef(hid)); } catch { /* tolerate */ }
          } else {
            // Just remove this user from the members map.
            await this.leaveHousehold({ uid, hid }).catch(() => {});
          }
        }
      } catch (err) {
        logger.warn('[firebaseService] household cleanup during delete failed', err);
      }
    }
    await this.deleteUserProfile(uid);
  },
};
