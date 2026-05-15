// iOS Liquid Glass + Framer-grade design tokens.
//
// Surfaces are built in four layers:
//   1. base bg / mesh
//   2. blur layer (expo-blur)
//   3. gradient tint (glassTint → glassTintEnd)
//   4. specular highlight (glassSpecular) + sheen (glassSheen)
//
// Plus a multi-stop shadow so cards have weight without looking pressed-on.

const fontStack = "-apple-system, BlinkMacSystemFont, 'Outfit', 'Inter', sans-serif";

export const lightTheme = {
  mode: 'light',
  font: fontStack,
  bg: '#F6F7FB',
  bgMesh: ['#E0E7FF', '#FCE7F3', '#DBEAFE'],
  surface: 'rgba(255, 255, 255, 0.55)',
  surfaceAlt: 'rgba(255, 255, 255, 0.32)',
  surfaceHover: 'rgba(255, 255, 255, 0.78)',
  inputFill: 'rgba(255, 255, 255, 0.6)',
  separator: 'rgba(15, 23, 42, 0.06)',
  text: '#0B1220',
  textMuted: '#475569',
  textSubtle: '#94A3B8',
  border: 'rgba(15, 23, 42, 0.08)',
  borderStrong: 'rgba(15, 23, 42, 0.16)',
  glassBorder: 'rgba(255, 255, 255, 0.55)',
  // Glass layers
  glassTint: 'rgba(255, 255, 255, 0.28)',
  glassTintEnd: 'rgba(255, 255, 255, 0.04)',
  glassTintStrong: 'rgba(255, 255, 255, 0.45)',
  glassSheen: 'rgba(255, 255, 255, 0.45)',
  glassSpecular: 'rgba(255, 255, 255, 0.65)',
  primary: '#6366F1',
  primaryHover: '#4F46E5',
  lunch: '#F59E0B',
  lunchSoft: 'rgba(245, 158, 11, 0.12)',
  lunchEdge: 'rgba(245, 158, 11, 0.45)',
  dinner: '#10B981',
  dinnerSoft: 'rgba(16, 185, 129, 0.12)',
  dinnerEdge: 'rgba(16, 185, 129, 0.45)',
  cleaning: '#3B82F6',
  cleaningSoft: 'rgba(59, 130, 246, 0.12)',
  cleaningEdge: 'rgba(59, 130, 246, 0.45)',
  today: '#6366F1',
  shadow: 'rgba(15, 23, 42, 0.06)',
  shadowStrong: 'rgba(15, 23, 42, 0.12)',
  shadowAmbient: 'rgba(15, 23, 42, 0.04)',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
};

export const darkTheme = {
  mode: 'dark',
  font: fontStack,
  bg: '#0B1020',
  bgMesh: ['#1E1B4B', '#1E293B', '#0F172A'],
  surface: 'rgba(30, 41, 59, 0.42)',
  surfaceAlt: 'rgba(15, 23, 42, 0.4)',
  surfaceHover: 'rgba(51, 65, 85, 0.65)',
  inputFill: 'rgba(255, 255, 255, 0.06)',
  separator: 'rgba(255, 255, 255, 0.06)',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textSubtle: '#64748B',
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.18)',
  glassBorder: 'rgba(255, 255, 255, 0.14)',
  glassTint: 'rgba(255, 255, 255, 0.06)',
  glassTintEnd: 'rgba(255, 255, 255, 0.0)',
  glassTintStrong: 'rgba(255, 255, 255, 0.10)',
  glassSheen: 'rgba(255, 255, 255, 0.10)',
  glassSpecular: 'rgba(255, 255, 255, 0.18)',
  primary: '#818CF8',
  primaryHover: '#6366F1',
  lunch: '#FBBF24',
  lunchSoft: 'rgba(251, 191, 36, 0.16)',
  lunchEdge: 'rgba(251, 191, 36, 0.45)',
  dinner: '#34D399',
  dinnerSoft: 'rgba(52, 211, 153, 0.16)',
  dinnerEdge: 'rgba(52, 211, 153, 0.45)',
  cleaning: '#60A5FA',
  cleaningSoft: 'rgba(96, 165, 250, 0.16)',
  cleaningEdge: 'rgba(96, 165, 250, 0.45)',
  today: '#818CF8',
  shadow: 'rgba(0, 0, 0, 0.32)',
  shadowStrong: 'rgba(0, 0, 0, 0.55)',
  shadowAmbient: 'rgba(0, 0, 0, 0.2)',
  danger: '#F87171',
  success: '#34D399',
  warning: '#FBBF24',
};

export const getTheme = (scheme) => (scheme === 'dark' ? darkTheme : lightTheme);
