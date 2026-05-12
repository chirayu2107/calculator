const fontStack = "-apple-system, BlinkMacSystemFont, 'Outfit', 'Inter', sans-serif";

export const lightTheme = {
  mode: 'light',
  font: fontStack,
  bg: '#F8FAFC',
  bgMesh: ['#EEF2FF', '#F0F9FF', '#F5F3FF'],
  surface: 'rgba(255, 255, 255, 0.72)',
  surfaceAlt: 'rgba(255, 255, 255, 0.4)',
  surfaceHover: 'rgba(255, 255, 255, 0.9)',
  text: '#0F172A',
  textMuted: '#64748B',
  textSubtle: '#94A3B8',
  border: 'rgba(255, 255, 255, 0.4)',
  borderStrong: 'rgba(255, 255, 255, 0.8)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
  primary: '#6366F1',            // Indigo
  primaryHover: '#4F46E5',
  lunch: '#F59E0B',              // Amber
  lunchSoft: 'rgba(245, 158, 11, 0.12)',
  dinner: '#10B981',             // Emerald
  dinnerSoft: 'rgba(16, 185, 129, 0.12)',
  cleaning: '#3B82F6',           // Blue
  cleaningSoft: 'rgba(59, 130, 246, 0.12)',
  today: '#6366F1',
  shadow: 'rgba(0, 0, 0, 0.05)',
  shadowStrong: 'rgba(0, 0, 0, 0.1)',
};

export const darkTheme = {
  mode: 'dark',
  font: fontStack,
  bg: '#0F172A',
  bgMesh: ['#1E1B4B', '#1E293B', '#111827'],
  surface: 'rgba(30, 41, 59, 0.6)',
  surfaceAlt: 'rgba(15, 23, 42, 0.4)',
  surfaceHover: 'rgba(51, 65, 85, 0.8)',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textSubtle: '#64748B',
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.15)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  primary: '#818CF8',
  primaryHover: '#6366F1',
  lunch: '#FBBF24',
  lunchSoft: 'rgba(251, 191, 36, 0.16)',
  dinner: '#34D399',
  dinnerSoft: 'rgba(52, 211, 153, 0.16)',
  cleaning: '#60A5FA',
  cleaningSoft: 'rgba(96, 165, 250, 0.16)',
  today: '#818CF8',
  shadow: 'rgba(0, 0, 0, 0.2)',
  shadowStrong: 'rgba(0, 0, 0, 0.4)',
};

export const getTheme = (scheme) => (scheme === 'dark' ? darkTheme : lightTheme);
