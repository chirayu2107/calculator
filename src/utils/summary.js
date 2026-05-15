import { daysInMonth, pad2 } from './date';
import { RATE_TYPES } from '../storage/storage';

const perOccurrenceCost = (cat, dim) => {
  if (!cat) return 0;
  switch (cat.rateType) {
    case RATE_TYPES.PER_SESSION:
      return Number(cat.ratePerSession) || 0;
    case RATE_TYPES.MONTHLY_WITH_TARGET: {
      const expectedSessions = ((Number(cat.expectedPerWeek) || 0) * dim) / 7;
      return expectedSessions > 0 ? (Number(cat.monthlyRate) || 0) / expectedSessions : 0;
    }
    case RATE_TYPES.MONTHLY:
    default:
      return dim > 0 ? (Number(cat.monthlyRate) || 0) / dim : 0;
  }
};

export const computeMonthSummary = (categories, attendance, year, monthIndex) => {
  const dim = daysInMonth(year, monthIndex);
  const prefix = `${year}-${pad2(monthIndex + 1)}-`;

  const counts = {};
  for (const cat of categories) counts[cat.id] = 0;

  for (const key of Object.keys(attendance)) {
    if (!key.startsWith(prefix)) continue;
    const day = attendance[key] || {};
    for (const catId of Object.keys(day)) {
      if (day[catId] && counts[catId] !== undefined) counts[catId] += 1;
    }
  }

  const perCategory = categories.map((cat) => {
    const count = counts[cat.id] || 0;
    const perOcc = perOccurrenceCost(cat, dim);
    const total = count * perOcc;
    return {
      id: cat.id,
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      active: cat.active,
      count,
      perOccurrence: perOcc,
      total,
    };
  });

  const grandTotal = perCategory
    .filter((c) => c.active)
    .reduce((sum, c) => sum + c.total, 0);

  return {
    perCategory,
    grandTotal,
    daysInMonth: dim,
  };
};
