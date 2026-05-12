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
const SHARED_USER_ID = 'shared_v1';
const emptyDay = { lunch: false, dinner: false, cleaning: false };

export const AppProvider = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [attendance, setAttendance] = useState(DEFAULTS.attendance);
  const [monthlyRates, setMonthlyRates] = useState(DEFAULTS.monthlyRates);
  const [mealMode, setMealMode] = useState(DEFAULTS.mealMode);
  const [cleaningPerWeek, setCleaningPerWeek] = useState(DEFAULTS.cleaningPerWeek);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'syncing' | 'error'
  
  const isInitialMount = useRef(true);

  // 1. Load local data and initialize Auth
  useEffect(() => {
    let alive = true;
    
    // Load local storage first for immediate UI
    loadAll().then((data) => {
      if (!alive) return;
      setAttendance(data.attendance);
      setMonthlyRates(data.monthlyRates);
      setMealMode(data.mealMode);
      setCleaningPerWeek(data.cleaningPerWeek);
      setReady(true);
    });

    // Initialize Auth
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        // Once authed, we could fetch from Firestore and merge
        // For simplicity, we'll just start syncing from here
      } else {
        signInAnonymously(auth).catch(err => console.error("Auth error:", err));
      }
    });

    return () => {
      alive = false;
      unsubscribeAuth();
    };
  }, []);

  // 2. Subscribe to shared Firestore data
  useEffect(() => {
    if (!ready) return;

    const unsubscribe = firebaseService.subscribeToUserData(SHARED_USER_ID, (data) => {
      if (data) {
        // Only update if data exists to avoid overwriting with empty
        if (data.attendance) setAttendance(data.attendance);
        if (data.monthlyRates) setMonthlyRates(data.monthlyRates);
        if (data.mealMode) setMealMode(data.mealMode);
        if (data.cleaningPerWeek !== undefined) setCleaningPerWeek(data.cleaningPerWeek);
      }
    });

    return unsubscribe;
  }, [ready]);

  const toggle = useCallback((dateKey, field) => {
    const current = attendance[dateKey] || emptyDay;
    const nextDay = { ...current, [field]: !current[field] };
    const dayIsEmpty = !nextDay.lunch && !nextDay.dinner && !nextDay.cleaning;
    
    const next = { ...attendance };
    if (dayIsEmpty) delete next[dateKey];
    else next[dateKey] = nextDay;
    
    setAttendance(next);
    saveAttendance(next);
    setSyncStatus('syncing');
    firebaseService.saveUserData(SHARED_USER_ID, { attendance: next })
      .then(() => setSyncStatus('synced'))
      .catch(() => setSyncStatus('error'));
  }, [attendance]);

  const updateMonthlyRate = useCallback((field, value) => {
    const next = { ...monthlyRates, [field]: value };
    setMonthlyRates(next);
    saveMonthlyRates(next);
    setSyncStatus('syncing');
    firebaseService.saveUserData(SHARED_USER_ID, { monthlyRates: next })
      .then(() => setSyncStatus('synced'))
      .catch(() => setSyncStatus('error'));
  }, [monthlyRates]);

  const updateMealMode = useCallback((mode) => {
    setMealMode(mode);
    saveMealMode(mode);
    setSyncStatus('syncing');
    firebaseService.saveUserData(SHARED_USER_ID, { mealMode: mode })
      .then(() => setSyncStatus('synced'))
      .catch(() => setSyncStatus('error'));
  }, []);

  const updateCleaningPerWeek = useCallback((n) => {
    const clamped = Math.max(1, Math.min(7, Math.round(n)));
    setCleaningPerWeek(clamped);
    saveCleaningPerWeek(clamped);
    setSyncStatus('syncing');
    firebaseService.saveUserData(SHARED_USER_ID, { cleaningPerWeek: clamped })
      .then(() => setSyncStatus('synced'))
      .catch(() => setSyncStatus('error'));
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
    }),
    [
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
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
