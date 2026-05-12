export const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);

export const dateKey = (year, monthIndex, day) =>
  `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;

export const todayKey = () => {
  const d = new Date();
  return dateKey(d.getFullYear(), d.getMonth(), d.getDate());
};

export const monthLabel = (year, monthIndex) => {
  const names = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${names[monthIndex]} ${year}`;
};

export const daysInMonth = (year, monthIndex) =>
  new Date(year, monthIndex + 1, 0).getDate();

export const buildMonthGrid = (year, monthIndex) => {
  // Sun=0 .. Sat=6
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

export const shiftMonth = (year, monthIndex, delta) => {
  const d = new Date(year, monthIndex + delta, 1);
  return { year: d.getFullYear(), monthIndex: d.getMonth() };
};
