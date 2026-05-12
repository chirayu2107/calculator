// Figma-inspired design system.
// Clean white panels on a soft canvas, subtle 1px borders,
// muted neutrals, Figma-blue accent, compact typography.

const fontStack = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif";

export const lightTheme = {
  mode: 'light',
  font: fontStack,
  bg: '#F5F5F5',                // canvas (Figma editor bg)
  surface: '#FFFFFF',            // panels / cards
  surfaceAlt: '#FAFAFA',         // subtle background variant
  surfaceHover: '#F2F2F2',
  fieldFill: '#FFFFFF',
  inputFill: '#FFFFFF',
  text: '#1E1E1E',
  textMuted: '#757575',
  textSubtle: '#A6A6A6',
  border: '#E6E6E6',
  borderStrong: '#D6D6D6',
  separator: '#EAEAEA',
  primary: '#0D99FF',            // Figma blue
  primaryHover: '#0A87E0',
  // accents
  lunch: '#FFA629',
  lunchSoft: 'rgba(255, 166, 41, 0.12)',
  lunchEdge: 'rgba(255, 166, 41, 0.32)',
  dinner: '#14AE5C',
  dinnerSoft: 'rgba(20, 174, 92, 0.12)',
  dinnerEdge: 'rgba(20, 174, 92, 0.32)',
  cleaning: '#0D99FF',
  cleaningSoft: 'rgba(13, 153, 255, 0.12)',
  cleaningEdge: 'rgba(13, 153, 255, 0.32)',
  today: '#0D99FF',
  shadow: 'rgba(0, 0, 0, 0.04)',
  shadowStrong: 'rgba(0, 0, 0, 0.10)',
};

export const darkTheme = {
  mode: 'dark',
  font: fontStack,
  bg: '#1E1E1E',
  surface: '#2C2C2C',
  surfaceAlt: '#252525',
  surfaceHover: '#383838',
  fieldFill: '#2C2C2C',
  inputFill: '#383838',
  text: '#FFFFFF',
  textMuted: '#B3B3B3',
  textSubtle: '#7A7A7A',
  border: '#3D3D3D',
  borderStrong: '#525252',
  separator: '#383838',
  primary: '#0D99FF',
  primaryHover: '#2BABFF',
  lunch: '#FFA629',
  lunchSoft: 'rgba(255, 166, 41, 0.16)',
  lunchEdge: 'rgba(255, 166, 41, 0.40)',
  dinner: '#14AE5C',
  dinnerSoft: 'rgba(20, 174, 92, 0.16)',
  dinnerEdge: 'rgba(20, 174, 92, 0.40)',
  cleaning: '#0D99FF',
  cleaningSoft: 'rgba(13, 153, 255, 0.16)',
  cleaningEdge: 'rgba(13, 153, 255, 0.40)',
  today: '#0D99FF',
  shadow: 'rgba(0, 0, 0, 0.30)',
  shadowStrong: 'rgba(0, 0, 0, 0.45)',
};

export const getTheme = (scheme) => (scheme === 'dark' ? darkTheme : lightTheme);
