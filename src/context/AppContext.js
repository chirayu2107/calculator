import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  loadLocalHousehold,
  saveLocalHousehold,
  clearLocalHousehold,
  loadLocalUserDataLegacy,
  clearLocalUserDataLegacy,
  clearAllLocalData,
  clearLegacyData,
  setLastHouseholdId,
  emptyUserData,
  seedFirstStaff,
  makeStaff,
  makeStaffData,
  makeCategory,
  migrateUserDataIfNeeded,
  mergeStaffPatch,
  STAFF_COLORS,
  CATEGORY_COLORS,
} from '../storage/storage';
import { firebaseService } from '../firebase/firebaseService';
import { authService } from '../firebase/authService';
import { logger } from '../utils/logger';

const AppContext = createContext(null);

const pickStaffColor = (existing) => {
  const used = new Set((existing || []).map((s) => s.color));
  return STAFF_COLORS.find((c) => !used.has(c)) || STAFF_COLORS[0];
};
const pickCategoryColor = (existing) => {
  const used = new Set((existing || []).map((c) => c.color));
  return CATEGORY_COLORS.find((c) => !used.has(c)) || CATEGORY_COLORS[0];
};

// Project household → app-local user data shape (staffList/staffData/activeStaffId).
const householdToUserData = (h) => ({
  staffList: (h && h.staffList) || [],
  staffData: (h && h.staffData) || {},
  activeStaffId: (h && h.activeStaffId) || ((h && h.staffList && h.staffList[0] && h.staffList[0].id) || null),
});

export const AppProvider = ({ children }) => {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);
  const [household, setHousehold] = useState(null); // { id, ownerUid, members, inviteCode, ... }
  const [userData, setUserData] = useState(emptyUserData());
  const [dataReady, setDataReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState('synced');

  const unsubscribeRef = useRef(null);

  // Auth listener
  useEffect(() => {
    const unsub = authService.onChange(async (fbUser) => {
      setUser(fbUser);
      setAuthReady(true);
      if (!fbUser) {
        setHousehold(null);
        setUserData(emptyUserData());
        setDataReady(false);
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
        clearLegacyData();
      }
    });
    return unsub;
  }, []);

  // Bootstrap: figure out which household this user belongs to, migrating
  // from the legacy users/{uid}.staffList path if necessary, then subscribe.
  useEffect(() => {
    if (!user) return;
    let alive = true;

    const init = async () => {
      try {
        // 1. Make sure users/{uid} exists.
        const profile = await firebaseService.ensureUserProfile(user.uid, user.email);
        if (!alive) return;

        let hid = profile && profile.householdId;

        // 2. Legacy migration: profile has staff data but no householdId yet.
        if (!hid && profile && (profile.staffList || profile.staffData)) {
          const created = await firebaseService.migrateUserToHousehold(
            user.uid,
            user.email,
            profile
          );
          hid = created && created.id;
        }

        // 3. Legacy local cache fallback: if cloud has nothing but device
        // does, push it up and create a household from it.
        if (!hid) {
          const localLegacy = await loadLocalUserDataLegacy();
          if (localLegacy && localLegacy.staffList && localLegacy.staffList.length > 0) {
            const created = await firebaseService.migrateUserToHousehold(
              user.uid,
              user.email,
              localLegacy
            );
            hid = created && created.id;
            clearLocalUserDataLegacy();
          }
        }

        // 4. Brand-new user: seed and create a fresh household-of-one.
        if (!hid) {
          const seeded = seedFirstStaff('My Staff');
          const created = await firebaseService.createHousehold({
            uid: user.uid,
            email: user.email,
            initialData: seeded,
          });
          hid = created && created.id;
        }

        // 5. Prime UI from local cache while cloud sub spins up.
        if (hid) {
          await setLastHouseholdId(hid);
          const cached = await loadLocalHousehold(hid);
          if (cached) setUserData(cached);
        }

        // 6. Subscribe to the household doc.
        if (hid) {
          unsubscribeRef.current = firebaseService.subscribeToHousehold(
            hid,
            (h) => {
              const ud = householdToUserData(migrateUserDataIfNeeded(h));
              setHousehold(h);
              setUserData(ud);
              saveLocalHousehold(hid, ud);
              setSyncStatus('synced');
            },
            () => setSyncStatus('error')
          );
        }

        setDataReady(true);
      } catch (err) {
        logger.error('[AppContext] init error', err);
        if (alive) setDataReady(true);
      }
    };

    init();

    return () => {
      alive = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user]);

  // Push patches to the active household doc + local cache.
  const persist = useCallback(
    async (next, cloudPatch) => {
      setUserData(next);
      if (household && household.id) saveLocalHousehold(household.id, next);
      if (!user || !household || !household.id) return;
      setSyncStatus('syncing');
      try {
        await firebaseService.patchHousehold(household.id, cloudPatch);
        setSyncStatus('synced');
      } catch {
        setSyncStatus('error');
      }
    },
    [user, household]
  );

  const activeStaff = useMemo(() => {
    if (!userData.activeStaffId) return null;
    return userData.staffList.find((s) => s.id === userData.activeStaffId) || null;
  }, [userData.activeStaffId, userData.staffList]);

  const activeStaffData = useMemo(() => {
    if (!userData.activeStaffId) return null;
    return userData.staffData[userData.activeStaffId] || makeStaffData();
  }, [userData.activeStaffId, userData.staffData]);

  const categories = useMemo(
    () => (activeStaffData && activeStaffData.categories) || [],
    [activeStaffData]
  );

  const attendance = useMemo(
    () => (activeStaffData && activeStaffData.attendance) || {},
    [activeStaffData]
  );

  // ---------- Day toggle ----------
  const toggleDay = useCallback(
    (dateKey, categoryId) => {
      const sid = userData.activeStaffId;
      if (!sid) return;
      const sd = userData.staffData[sid] || makeStaffData();
      const current = sd.attendance[dateKey] || {};
      const isOn = !!current[categoryId];
      const nextDay = { ...current };
      if (isOn) delete nextDay[categoryId];
      else nextDay[categoryId] = true;
      const nextAttendance = { ...sd.attendance };
      if (Object.keys(nextDay).length === 0) delete nextAttendance[dateKey];
      else nextAttendance[dateKey] = nextDay;
      const next = mergeStaffPatch(userData, sid, { attendance: nextAttendance });
      persist(next, { [`staffData.${sid}.attendance`]: nextAttendance });
    },
    [userData, persist]
  );

  // ---------- Category CRUD ----------
  const addCategory = useCallback(
    (partial) => {
      const sid = userData.activeStaffId;
      if (!sid) return null;
      const sd = userData.staffData[sid] || makeStaffData();
      const cat = makeCategory({
        ...partial,
        color: partial.color || pickCategoryColor(sd.categories),
      });
      const nextCategories = [...sd.categories, cat];
      const next = mergeStaffPatch(userData, sid, { categories: nextCategories });
      persist(next, { [`staffData.${sid}.categories`]: nextCategories });
      return cat.id;
    },
    [userData, persist]
  );

  const updateCategory = useCallback(
    (categoryId, patch) => {
      const sid = userData.activeStaffId;
      if (!sid) return;
      const sd = userData.staffData[sid] || makeStaffData();
      const nextCategories = sd.categories.map((c) =>
        c.id === categoryId ? { ...c, ...patch } : c
      );
      const next = mergeStaffPatch(userData, sid, { categories: nextCategories });
      persist(next, { [`staffData.${sid}.categories`]: nextCategories });
    },
    [userData, persist]
  );

  const deleteCategory = useCallback(
    (categoryId) => {
      const sid = userData.activeStaffId;
      if (!sid) return;
      const sd = userData.staffData[sid] || makeStaffData();
      const nextCategories = sd.categories.filter((c) => c.id !== categoryId);
      const nextAttendance = {};
      for (const [date, day] of Object.entries(sd.attendance)) {
        const { [categoryId]: _, ...rest } = day;
        if (Object.keys(rest).length > 0) nextAttendance[date] = rest;
      }
      const next = mergeStaffPatch(userData, sid, {
        categories: nextCategories,
        attendance: nextAttendance,
      });
      persist(next, {
        [`staffData.${sid}.categories`]: nextCategories,
        [`staffData.${sid}.attendance`]: nextAttendance,
      });
    },
    [userData, persist]
  );

  // ---------- Staff CRUD ----------
  const addStaff = useCallback(
    (name) => {
      const trimmed = (name || '').trim();
      if (!trimmed) return null;
      const staff = makeStaff(trimmed, pickStaffColor(userData.staffList));
      const nextList = [...userData.staffList, staff];
      const nextStaffData = { ...userData.staffData, [staff.id]: makeStaffData() };
      const next = {
        ...userData,
        staffList: nextList,
        staffData: nextStaffData,
        activeStaffId: staff.id,
      };
      persist(next, {
        staffList: nextList,
        [`staffData.${staff.id}`]: nextStaffData[staff.id],
        activeStaffId: staff.id,
      });
      return staff.id;
    },
    [userData, persist]
  );

  const renameStaff = useCallback(
    (staffId, name) => {
      const trimmed = (name || '').trim();
      if (!trimmed) return;
      const nextList = userData.staffList.map((s) =>
        s.id === staffId ? { ...s, name: trimmed } : s
      );
      const next = { ...userData, staffList: nextList };
      persist(next, { staffList: nextList });
    },
    [userData, persist]
  );

  const deleteStaff = useCallback(
    (staffId) => {
      const remainingList = userData.staffList.filter((s) => s.id !== staffId);
      const nextStaffData = { ...userData.staffData };
      delete nextStaffData[staffId];
      const nextActive =
        userData.activeStaffId === staffId
          ? (remainingList[0] && remainingList[0].id) || null
          : userData.activeStaffId;
      const next = {
        ...userData,
        staffList: remainingList,
        staffData: nextStaffData,
        activeStaffId: nextActive,
      };
      persist(next, {
        staffList: remainingList,
        staffData: nextStaffData,
        activeStaffId: nextActive,
      });
    },
    [userData, persist]
  );

  const setActiveStaff = useCallback(
    (staffId) => {
      if (!userData.staffList.find((s) => s.id === staffId)) return;
      const next = { ...userData, activeStaffId: staffId };
      persist(next, { activeStaffId: staffId });
    },
    [userData, persist]
  );

  // ---------- Family operations ----------
  const isOwner = useMemo(
    () => !!(user && household && household.ownerUid === user.uid),
    [user, household]
  );

  const members = useMemo(() => {
    if (!household || !household.members) return [];
    return Object.entries(household.members)
      .map(([uid, info]) => ({ uid, ...info, isYou: user && uid === user.uid }))
      .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
  }, [household, user]);

  const joinFamily = useCallback(
    async (code) => {
      if (!user) return { error: 'Not signed in.' };
      const previousHouseholdId = household && household.id;
      // Switch off the current subscription so we don't double-listen mid-swap.
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      const result = await firebaseService.joinHouseholdByCode({
        uid: user.uid,
        email: user.email,
        code,
        previousHouseholdId,
      });
      if (result.error) {
        // Re-subscribe to the previous household so the UI keeps working.
        if (previousHouseholdId) {
          unsubscribeRef.current = firebaseService.subscribeToHousehold(
            previousHouseholdId,
            (h) => {
              setHousehold(h);
              setUserData(householdToUserData(migrateUserDataIfNeeded(h)));
              setSyncStatus('synced');
            },
            () => setSyncStatus('error')
          );
        }
        return result;
      }
      if (previousHouseholdId) clearLocalHousehold(previousHouseholdId);
      await setLastHouseholdId(result.householdId);
      unsubscribeRef.current = firebaseService.subscribeToHousehold(
        result.householdId,
        (h) => {
          const ud = householdToUserData(migrateUserDataIfNeeded(h));
          setHousehold(h);
          setUserData(ud);
          saveLocalHousehold(result.householdId, ud);
          setSyncStatus('synced');
        },
        () => setSyncStatus('error')
      );
      return result;
    },
    [user, household]
  );

  const regenerateInviteCode = useCallback(async () => {
    if (!household || !household.id) return { error: 'No household.' };
    if (!isOwner) return { error: 'Only the owner can regenerate the code.' };
    try {
      const next = await firebaseService.regenerateInviteCode(household.id);
      return { ok: true, code: next };
    } catch (err) {
      logger.error('[AppContext] regenerateInviteCode failed', err);
      return { error: 'Could not regenerate code.' };
    }
  }, [household, isOwner]);

  const removeMember = useCallback(
    async (targetUid) => {
      if (!user || !household || !household.id) return { error: 'No household.' };
      if (!isOwner) return { error: 'Only the owner can remove members.' };
      return firebaseService.removeMember({
        ownerUid: user.uid,
        hid: household.id,
        targetUid,
      });
    },
    [user, household, isOwner]
  );

  const leaveFamily = useCallback(async () => {
    if (!user || !household || !household.id) return { error: 'No household.' };
    const hid = household.id;
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    const result = await firebaseService.leaveHousehold({ uid: user.uid, hid });
    if (result.error) {
      // Re-subscribe to keep the UI alive.
      unsubscribeRef.current = firebaseService.subscribeToHousehold(
        hid,
        (h) => {
          setHousehold(h);
          setUserData(householdToUserData(migrateUserDataIfNeeded(h)));
          setSyncStatus('synced');
        },
        () => setSyncStatus('error')
      );
      return result;
    }
    // Create a new household-of-one for the leaver so they keep a working app.
    const seeded = seedFirstStaff('My Staff');
    try {
      const created = await firebaseService.createHousehold({
        uid: user.uid,
        email: user.email,
        initialData: seeded,
      });
      clearLocalHousehold(hid);
      await setLastHouseholdId(created.id);
      unsubscribeRef.current = firebaseService.subscribeToHousehold(
        created.id,
        (h) => {
          const ud = householdToUserData(migrateUserDataIfNeeded(h));
          setHousehold(h);
          setUserData(ud);
          saveLocalHousehold(created.id, ud);
          setSyncStatus('synced');
        },
        () => setSyncStatus('error')
      );
      return { ok: true };
    } catch (err) {
      logger.error('[AppContext] post-leave household creation failed', err);
      return { ok: true, warning: 'Left family but could not create a new one. Reopen the app.' };
    }
  }, [user, household]);

  // ---------- Auth ----------
  const signUp = useCallback((email, password) => authService.signUp(email, password), []);
  const signIn = useCallback((email, password) => authService.signIn(email, password), []);
  const sendReset = useCallback((email) => authService.sendReset(email), []);
  const signOut = useCallback(async () => {
    await authService.signOut();
    await clearAllLocalData();
  }, []);

  const deleteAccount = useCallback(
    async (currentPassword) => {
      if (!user) return { error: 'Not signed in.' };
      try {
        await firebaseService.deleteUserAndHouseholdIfSole(user.uid, household && household.id);
      } catch (err) {
        logger.warn('[AppContext] deleteUserAndHouseholdIfSole failed (continuing)', err);
      }
      const result = await authService.deleteAccount(currentPassword);
      if (result.ok) await clearAllLocalData();
      return result;
    },
    [user, household]
  );

  const value = useMemo(
    () => ({
      authReady,
      dataReady,
      syncStatus,
      user,
      // Household
      household,
      inviteCode: household && household.inviteCode,
      members,
      isOwner,
      joinFamily,
      regenerateInviteCode,
      removeMember,
      leaveFamily,
      // Staff
      staffList: userData.staffList,
      activeStaff,
      activeStaffData,
      activeStaffId: userData.activeStaffId,
      addStaff,
      renameStaff,
      deleteStaff,
      setActiveStaff,
      // Categories
      categories,
      attendance,
      addCategory,
      updateCategory,
      deleteCategory,
      // Day toggle
      toggle: toggleDay,
      // Auth
      signUp,
      signIn,
      sendReset,
      signOut,
      deleteAccount,
    }),
    [
      authReady,
      dataReady,
      syncStatus,
      user,
      household,
      members,
      isOwner,
      joinFamily,
      regenerateInviteCode,
      removeMember,
      leaveFamily,
      userData.staffList,
      userData.activeStaffId,
      activeStaff,
      activeStaffData,
      categories,
      attendance,
      addStaff,
      renameStaff,
      deleteStaff,
      setActiveStaff,
      addCategory,
      updateCategory,
      deleteCategory,
      toggleDay,
      signUp,
      signIn,
      sendReset,
      signOut,
      deleteAccount,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
