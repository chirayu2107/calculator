import { daysInMonth, pad2 } from './date';

export const effectiveRates = (monthlyRates, cleaningPerWeek, year, monthIndex) => {
  const dim = daysInMonth(year, monthIndex);
  const expectedCleaningSessions = (cleaningPerWeek * dim) / 7;
  return {
    lunch: dim > 0 ? monthlyRates.lunch / dim : 0,
    dinner: dim > 0 ? monthlyRates.dinner / dim : 0,
    cleaning: expectedCleaningSessions > 0
      ? monthlyRates.cleaning / expectedCleaningSessions
      : 0,
    expectedCleaningSessions,
    daysInMonth: dim,
  };
};

export const computeMonthSummary = (
  attendance,
  year,
  monthIndex,
  monthlyRates,
  mealMode,
  cleaningPerWeek
) => {
  const prefix = `${year}-${pad2(monthIndex + 1)}-`;
  let lunchCount = 0;
  let dinnerCount = 0;
  let cleaningCount = 0;

  for (const key of Object.keys(attendance)) {
    if (!key.startsWith(prefix)) continue;
    const e = attendance[key];
    if (e.lunch) lunchCount += 1;
    if (e.dinner) dinnerCount += 1;
    if (e.cleaning) cleaningCount += 1;
  }

  const eff = effectiveRates(monthlyRates, cleaningPerWeek, year, monthIndex);
  const showLunch = mealMode !== 'dinner';
  const showDinner = mealMode !== 'lunch';

  const lunchTotal = showLunch ? lunchCount * eff.lunch : 0;
  const dinnerTotal = showDinner ? dinnerCount * eff.dinner : 0;
  const foodTotal = lunchTotal + dinnerTotal;
  const cleaningTotal = cleaningCount * eff.cleaning;

  return {
    lunchCount,
    dinnerCount,
    cleaningCount,
    lunchTotal,
    dinnerTotal,
    foodTotal,
    cleaningTotal,
    grandTotal: foodTotal + cleaningTotal,
    effectiveRates: eff,
  };
};
