import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  attendance: '@maidtracker:attendance:v1',
  monthlyRates: '@maidtracker:monthlyRates:v1',
  mealMode: '@maidtracker:mealMode:v1',
  cleaningPerWeek: '@maidtracker:cleaningPerWeek:v1',
};

export const DEFAULTS = {
  attendance: {},
  monthlyRates: { lunch: 1500, dinner: 1500, cleaning: 1200 },
  mealMode: 'both',
  cleaningPerWeek: 3,
};

const safeParse = (raw, fallback) => {
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const loadAll = async () => {
  const entries = await AsyncStorage.multiGet([
    KEYS.attendance,
    KEYS.monthlyRates,
    KEYS.mealMode,
    KEYS.cleaningPerWeek,
  ]);
  const map = Object.fromEntries(entries);
  return {
    attendance: safeParse(map[KEYS.attendance], DEFAULTS.attendance),
    monthlyRates: {
      ...DEFAULTS.monthlyRates,
      ...safeParse(map[KEYS.monthlyRates], DEFAULTS.monthlyRates),
    },
    mealMode: safeParse(map[KEYS.mealMode], DEFAULTS.mealMode),
    cleaningPerWeek: safeParse(map[KEYS.cleaningPerWeek], DEFAULTS.cleaningPerWeek),
  };
};

export const saveAttendance = (a) => AsyncStorage.setItem(KEYS.attendance, JSON.stringify(a));
export const saveMonthlyRates = (r) => AsyncStorage.setItem(KEYS.monthlyRates, JSON.stringify(r));
export const saveMealMode = (m) => AsyncStorage.setItem(KEYS.mealMode, JSON.stringify(m));
export const saveCleaningPerWeek = (n) =>
  AsyncStorage.setItem(KEYS.cleaningPerWeek, JSON.stringify(n));
