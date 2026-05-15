import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

const KEYS = {
  // Legacy v2 cache (uid-keyed user doc). Kept readable so migration can pick
  // it up, but no longer written.
  userDataLegacy: '@maidtracker:v2:userData',
  // v3 cache: keyed by householdId so multiple households on one device don't
  // collide (e.g. when a user joins a different family).
  householdPrefix: '@maidtracker:v3:household:',
  // Last-seen household id, for cold-start.
  lastHouseholdId: '@maidtracker:v3:lastHouseholdId',
  legacy: {
    attendance: '@maidtracker:attendance:v1',
    monthlyRates: '@maidtracker:monthlyRates:v1',
    mealMode: '@maidtracker:mealMode:v1',
    cleaningPerWeek: '@maidtracker:cleaningPerWeek:v1',
    syncId: '@maidtracker:syncId',
  },
};

// Legacy defaults retained so the migration path is well-defined.
export const DEFAULT_STAFF_RATES = { lunch: 1500, dinner: 1500, cleaning: 1200 };
export const DEFAULT_MEAL_MODE = 'both';
export const DEFAULT_CLEANING_PER_WEEK = 3;

export const STAFF_COLORS = ['#6366F1', '#F59E0B', '#10B981', '#EC4899', '#3B82F6', '#F43F5E'];

export const CATEGORY_COLORS = [
  '#F59E0B', // amber
  '#10B981', // emerald
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#EF4444', // red
  '#14B8A6', // teal
  '#F97316', // orange
];

export const CATEGORY_ICONS = ['🍽', '🍳', '☕', '🧹', '🧺', '🚗', '👶', '🛒', '📚', '🐶', '🌿', '🔧'];

export const RATE_TYPES = {
  MONTHLY: 'monthly',                     // rate / daysInMonth → per-day cost
  PER_SESSION: 'per_session',             // rate × occurrences
  MONTHLY_WITH_TARGET: 'monthly_with_target', // rate / expected sessions per month
};

export const newStaffId = () => `staff_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
export const newCategoryId = () => `cat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const makeStaff = (name, color = STAFF_COLORS[0]) => ({
  id: newStaffId(),
  name: name || 'Staff',
  color,
  archived: false,
});

export const makeCategory = ({
  id,
  name = 'Category',
  color = CATEGORY_COLORS[0],
  icon = '',
  rateType = RATE_TYPES.MONTHLY,
  monthlyRate = 0,
  ratePerSession = 0,
  expectedPerWeek = 3,
  active = true,
} = {}) => ({
  id: id || newCategoryId(),
  name,
  color,
  icon,
  rateType,
  monthlyRate,
  ratePerSession,
  expectedPerWeek,
  active,
});

const defaultCategoriesForNewStaff = () => [
  makeCategory({ id: 'lunch', name: 'Lunch', color: '#F59E0B', icon: '🍽', rateType: RATE_TYPES.MONTHLY, monthlyRate: 1500 }),
  makeCategory({ id: 'dinner', name: 'Dinner', color: '#10B981', icon: '🍲', rateType: RATE_TYPES.MONTHLY, monthlyRate: 1500 }),
  makeCategory({ id: 'cleaning', name: 'Cleaning', color: '#3B82F6', icon: '🧹', rateType: RATE_TYPES.MONTHLY_WITH_TARGET, monthlyRate: 1200, expectedPerWeek: 3 }),
];

export const makeStaffData = () => ({
  categories: defaultCategoriesForNewStaff(),
  attendance: {},
});

export const emptyUserData = () => ({
  staffList: [],
  staffData: {},
  activeStaffId: null,
});

export const seedFirstStaff = (name = 'My Staff') => {
  const staff = makeStaff(name, STAFF_COLORS[0]);
  return {
    staffList: [staff],
    staffData: { [staff.id]: makeStaffData() },
    activeStaffId: staff.id,
  };
};

const safeParse = (raw, fallback) => {
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

// ---- Migration: legacy single-staff fields → categories array ----
//
// Old per-staff data shape (still in some Firestore docs):
//   { monthlyRates:{lunch,dinner,cleaning}, mealMode, cleaningPerWeek, attendance }
// New per-staff data shape:
//   { categories:[...], attendance }
//
// Also handles per-day attendance values like { lunch:true, dinner:false, cleaning:true } —
// those keys already align with the migrated category ids (lunch/dinner/cleaning), so the
// attendance map carries over without rewriting keys.
export const migrateStaffDataIfNeeded = (sd) => {
  if (!sd || typeof sd !== 'object') return makeStaffData();
  if (Array.isArray(sd.categories)) return sd; // already new

  const monthlyRates = sd.monthlyRates || DEFAULT_STAFF_RATES;
  const mealMode = sd.mealMode || DEFAULT_MEAL_MODE;
  const cleaningPerWeek = sd.cleaningPerWeek ?? DEFAULT_CLEANING_PER_WEEK;
  const attendance = sd.attendance || {};

  const categories = [
    makeCategory({
      id: 'lunch',
      name: 'Lunch',
      color: '#F59E0B',
      icon: '🍽',
      rateType: RATE_TYPES.MONTHLY,
      monthlyRate: monthlyRates.lunch ?? 0,
      active: mealMode !== 'dinner',
    }),
    makeCategory({
      id: 'dinner',
      name: 'Dinner',
      color: '#10B981',
      icon: '🍲',
      rateType: RATE_TYPES.MONTHLY,
      monthlyRate: monthlyRates.dinner ?? 0,
      active: mealMode !== 'lunch',
    }),
    makeCategory({
      id: 'cleaning',
      name: 'Cleaning',
      color: '#3B82F6',
      icon: '🧹',
      rateType: RATE_TYPES.MONTHLY_WITH_TARGET,
      monthlyRate: monthlyRates.cleaning ?? 0,
      expectedPerWeek: cleaningPerWeek,
      active: true,
    }),
  ];

  return { categories, attendance };
};

export const migrateUserDataIfNeeded = (data) => {
  if (!data || typeof data !== 'object') return data;
  if (!data.staffData) return data;
  const nextStaffData = {};
  for (const [id, sd] of Object.entries(data.staffData)) {
    nextStaffData[id] = migrateStaffDataIfNeeded(sd);
  }
  return { ...data, staffData: nextStaffData };
};

// ---- v3 (household-keyed) ----
const householdKey = (hid) => `${KEYS.householdPrefix}${hid}`;

export const getLastHouseholdId = async () => {
  try {
    return await AsyncStorage.getItem(KEYS.lastHouseholdId);
  } catch {
    return null;
  }
};

export const setLastHouseholdId = (hid) =>
  hid
    ? AsyncStorage.setItem(KEYS.lastHouseholdId, hid)
    : AsyncStorage.removeItem(KEYS.lastHouseholdId);

export const loadLocalHousehold = async (hid) => {
  if (!hid) return null;
  const raw = await AsyncStorage.getItem(householdKey(hid));
  const parsed = safeParse(raw, null);
  return parsed ? migrateUserDataIfNeeded(parsed) : null;
};

export const saveLocalHousehold = (hid, data) =>
  hid ? AsyncStorage.setItem(householdKey(hid), JSON.stringify(data)) : Promise.resolve();

export const clearLocalHousehold = (hid) =>
  hid ? AsyncStorage.removeItem(householdKey(hid)) : Promise.resolve();

// ---- v2 (legacy uid-keyed) — read-only, used by migration path ----
export const loadLocalUserDataLegacy = async () => {
  const raw = await AsyncStorage.getItem(KEYS.userDataLegacy);
  const parsed = safeParse(raw, null);
  return parsed ? migrateUserDataIfNeeded(parsed) : null;
};

export const clearLocalUserDataLegacy = () => AsyncStorage.removeItem(KEYS.userDataLegacy);

// Convenience: wipe everything local on sign-out.
export const clearAllLocalData = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter(
      (k) => k.startsWith(KEYS.householdPrefix) || k === KEYS.lastHouseholdId || k === KEYS.userDataLegacy
    );
    if (ours.length) await AsyncStorage.multiRemove(ours);
  } catch (err) {
    logger.warn('[storage] clearAllLocalData failed', err);
  }
};

export const clearLegacyData = async () => {
  try {
    await AsyncStorage.multiRemove(Object.values(KEYS.legacy));
  } catch (err) {
    logger.warn('[storage] clearLegacyData failed', err);
  }
};

export const mergeStaffPatch = (userData, staffId, patch) => {
  const prevStaff = userData.staffData[staffId] || makeStaffData();
  return {
    ...userData,
    staffData: {
      ...userData.staffData,
      [staffId]: { ...prevStaff, ...patch },
    },
  };
};
