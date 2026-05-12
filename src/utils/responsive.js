import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
  sm: 480,
  md: 768,
  lg: 1024,
};

export const useBreakpoint = () => {
  const { width, height } = useWindowDimensions();
  return {
    width,
    height,
    isCompact: width < BREAKPOINTS.md, // mobile + small tablet
    isMobile: width < BREAKPOINTS.sm,
    isTablet: width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
  };
};
