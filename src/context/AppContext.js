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
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    
    const init = async () => {
      try {
        console.log('[AppContext] Initializing...');
        const [data, storedSyncId] = await Promise.all([
          loadAll(),
          AsyncStorage.getItem(SYNC_ID_KEY)
        ]);
        
        if (!alive) return;
        
        // Apply local data first
        setAttendance(data.attendance);
        setMonthlyRates(data.monthlyRates);
        setMealMode(data.mealMode);
        setCleaningPerWeek(data.cleaningPerWeek);
        
        if (storedSyncId) {
          console.log('[AppContext] Found stored syncId:', storedSyncId);
          setSyncId(storedSyncId);
          // Fetch latest cloud data immediately for the stored ID
          try {
            const cloudData = await firebaseService.loadUserData(storedSyncId);
            if (cloudData && alive) {
              if (cloudData.attendance) setAttendance(cloudData.attendance);
              if (cloudData.monthlyRates) setMonthlyRates(cloudData.monthlyRates);
              if (cloudData.mealMode) setMealMode(cloudData.mealMode);
              if (cloudData.cleaningPerWeek !== undefined) setCleaningPerWeek(cloudData.cleaningPerWeek);
            }
          } catch (e) {
            console.error('[AppContext] Initial cloud load failed:', e);
          }
        }
        
        setReady(true);
        setUser({ uid: 'guest' });
      } catch (err) {
        console.error("[AppContext] Init error:", err);
        if (alive) setReady(true);
      }
    };
    init();

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
    setAttendance((prev) => {
      const current = prev[dateKey] || emptyDay;
      const nextDay = { ...current, [field]: !current[field] };
      const dayIsEmpty = !nextDay.lunch && !nextDay.dinner && !nextDay.cleaning;
      
      const next = { ...prev };
      if (dayIsEmpty) delete next[dateKey];
      else next[dateKey] = nextDay;
      
      // Sync to local storage
      saveAttendance(next);
      
      // Sync to cloud
      if (syncId) {
        setSyncStatus('syncing');
        firebaseService.saveUserData(syncId, { attendance: next })
          .then(() => setSyncStatus('synced'))
          .catch(() => setSyncStatus('error'));
      }
      
      return next;
    });
  }, [syncId]);

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

  const login = useCallback((username, pin) => {
    const id = `${username}_${pin}`.toLowerCase().replace(/\s+/g, '');
    if (syncId === id) return; // Already logged in with this ID
    
    console.log('[AppContext] Login attempt with:', username);
    console.log('[AppContext] Setting syncId to:', id);
    setSyncId(id);
    
    // 2. Perform background operations
    const runBackgroundTasks = async () => {
      try {
        // Save to storage
        await AsyncStorage.setItem(SYNC_ID_KEY, id);
        console.log('[AppContext] syncId saved to storage');

        // Fetch cloud data
        setSyncStatus('syncing');
        const cloudData = await firebaseService.loadUserData(id);
        if (cloudData) {
          if (cloudData.attendance) setAttendance(cloudData.attendance);
          if (cloudData.monthlyRates) setMonthlyRates(cloudData.monthlyRates);
          if (cloudData.mealMode) setMealMode(cloudData.mealMode);
          if (cloudData.cleaningPerWeek !== undefined) setCleaningPerWeek(cloudData.cleaningPerWeek);
        }
        setSyncStatus('synced');
      } catch (err) {
        console.error('[AppContext] Background task error:', err);
        setSyncStatus('error');
      }
    };

    runBackgroundTasks();
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
      syncId,
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
