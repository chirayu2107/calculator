import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  DEFAULTS,
  loadAll,
  saveAttendance,
  saveCleaningPerWeek,
  saveMealMode,
  saveMonthlyRates,
} from '../storage/storage';
import { auth } from '../firebase/config';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { firebaseService } from '../firebase/firebaseService';

const AppContext = createContext(null);
const SHARED_USER_ID_DEFAULT = 'shared_v1';
const SYNC_ID_KEY = '@maidtracker:syncId';
const emptyDay = { lunch: false, dinner: false, cleaning: false };

export const AppProvider = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [attendance, setAttendance] = useState(DEFAULTS.attendance);
  const [monthlyRates, setMonthlyRates] = useState(DEFAULTS.monthlyRates);
  const [mealMode, setMealMode] = useState(DEFAULTS.mealMode);
  const [cleaningPerWeek, setCleaningPerWeek] = useState(DEFAULTS.cleaningPerWeek);
  const [syncId, setSyncId] = useState(null);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'syncing' | 'error'
  
  const isInitialMount = useRef(true);

  // 1. Load local data and initialize Auth
  useEffect(() => {
    let alive = true;
    
    // Load local storage first for immediate UI
    const init = async () => {
      try {
        const [data, storedSyncId] = await Promise.all([
          loadAll(),
          require('@react-native-async-storage/async-storage').default.getItem(SYNC_ID_KEY)
        ]);
        
        if (!alive) return;
        setAttendance(data.attendance);
        setMonthlyRates(data.monthlyRates);
        setMealMode(data.mealMode);
        setCleaningPerWeek(data.cleaningPerWeek);
        if (storedSyncId) setSyncId(storedSyncId);
        setReady(true);
      } catch (err) {
        console.error("Init error:", err);
        if (alive) setReady(true);
      }
    };
    init();

    // Initialize Auth (Disabled Anonymous Auth to avoid configuration errors)
    // We now use the custom syncId for data partitioning
    setReady(true);
    setUser({ uid: 'guest' });

    return () => {
      alive = false;
    };
  }, []);

  // 2. Subscribe to user-specific Firestore data
  useEffect(() => {
    if (!ready || !syncId) return;

    const unsubscribe = firebaseService.subscribeToUserData(
      syncId, 
      (data) => {
        if (data) {
          if (data.attendance) setAttendance(data.attendance);
          if (data.monthlyRates) setMonthlyRates(data.monthlyRates);
          if (data.mealMode) setMealMode(data.mealMode);
          if (data.cleaningPerWeek !== undefined) setCleaningPerWeek(data.cleaningPerWeek);
          setSyncStatus('synced');
        }
      },
      (err) => {
        setSyncStatus('error');
      }
    );

    return unsubscribe;
  }, [ready, user, syncId]);

  const toggle = useCallback((dateKey, field) => {
    const current = attendance[dateKey] || emptyDay;
    const nextDay = { ...current, [field]: !current[field] };
    const dayIsEmpty = !nextDay.lunch && !nextDay.dinner && !nextDay.cleaning;
    
    const next = { ...attendance };
    if (dayIsEmpty) delete next[dateKey];
    else next[dateKey] = nextDay;
    
    setAttendance(next);
    saveAttendance(next);
    if (!syncId) return;
    setSyncStatus('syncing');
    firebaseService.saveUserData(syncId, { attendance: next })
      .then(() => setSyncStatus('synced'))
      .catch(() => setSyncStatus('error'));
  }, [attendance, syncId]);

  const updateMonthlyRate = useCallback((field, value) => {
    const next = { ...monthlyRates, [field]: value };
    setMonthlyRates(next);
    saveMonthlyRates(next);
    if (!syncId) return;
    setSyncStatus('syncing');
    firebaseService.saveUserData(syncId, { monthlyRates: next })
      .then(() => setSyncStatus('synced'))
      .catch(() => setSyncStatus('error'));
  }, [monthlyRates, syncId]);

  const updateMealMode = useCallback((mode) => {
    setMealMode(mode);
    saveMealMode(mode);
    if (!syncId) return;
    setSyncStatus('syncing');
    firebaseService.saveUserData(syncId, { mealMode: mode })
      .then(() => setSyncStatus('synced'))
      .catch(() => setSyncStatus('error'));
  }, [syncId]);

  const updateCleaningPerWeek = useCallback((n) => {
    const clamped = Math.max(1, Math.min(7, Math.round(n)));
    setCleaningPerWeek(clamped);
    saveCleaningPerWeek(clamped);
    if (!syncId) return;
    setSyncStatus('syncing');
    firebaseService.saveUserData(syncId, { cleaningPerWeek: clamped })
      .then(() => setSyncStatus('synced'))
      .catch(() => setSyncStatus('error'));
  }, [syncId]);

  const login = useCallback(async (username, pin) => {
    const id = `${username}_${pin}`.toLowerCase().replace(/\s+/g, '');
    
    // 1. Set ID immediately so the UI transitions to Home Screen
    setSyncId(id);
    await require('@react-native-async-storage/async-storage').default.setItem(SYNC_ID_KEY, id);
    
    // 2. Fetch cloud data in the background
    setSyncStatus('syncing');
    try {
      const cloudData = await firebaseService.loadUserData(id);
      if (cloudData) {
        if (cloudData.attendance) setAttendance(cloudData.attendance);
        if (cloudData.monthlyRates) setMonthlyRates(cloudData.monthlyRates);
        if (cloudData.mealMode) setMealMode(cloudData.mealMode);
        if (cloudData.cleaningPerWeek !== undefined) setCleaningPerWeek(cloudData.cleaningPerWeek);
      }
      setSyncStatus('synced');
    } catch (err) {
      console.error("Background sync error:", err);
      setSyncStatus('error');
    }
  }, []);

  const logout = useCallback(async () => {
    setSyncId(null);
    await require('@react-native-async-storage/async-storage').default.removeItem(SYNC_ID_KEY);
  }, []);

  const value = useMemo(
    () => ({
      ready,
      user,
      attendance,
      monthlyRates,
      mealMode,
      cleaningPerWeek,
      syncStatus,
      toggle,
      updateMonthlyRate,
      updateMealMode,
      updateCleaningPerWeek,
      login,
      logout,
    }),
    [
      ready,
      user,
      attendance,
      monthlyRates,
      mealMode,
      cleaningPerWeek,
      syncStatus,
      syncId,
      toggle,
      updateMonthlyRate,
      updateMealMode,
      updateCleaningPerWeek,
      login,
      logout,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
