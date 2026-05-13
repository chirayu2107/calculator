import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';

export const GlassCard = ({
  children,
  theme,
  style,
  radius = 24,
  borderColor,
  noShadow,
  noBorder,
}) => {
  const isWeb = Platform.OS === 'web';
  
  return (
    <View
      style={[
        {
          borderRadius: radius,
          backgroundColor: theme.surface,
          borderColor: noBorder ? 'transparent' : (borderColor ?? theme.glassBorder),
          borderWidth: noBorder ? 0 : 1,
          overflow: 'hidden',
          // Glassmorphism for Web
          ...(isWeb && {
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }),
        },
        !noShadow && {
          boxShadow: `0 8px 32px ${theme.shadow}`,
          elevation: 4,
        },
        style,
      ]}
    >
      {/* Inner Highlight for depth */}
      <View style={[styles.highlight, { borderRadius: radius }]} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  highlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    pointerEvents: 'none',
  },
});
