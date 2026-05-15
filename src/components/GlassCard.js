import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

// iOS-26-style Liquid Glass surface, four layers thick:
//   1. Gaussian blur of whatever is behind it (expo-blur, falls back to backdrop-filter on web)
//   2. Vertical gradient tint — gives the "glass thickness" feel
//   3. Specular border highlight on the top + left inner edge
//   4. Subtle sheen across the top 1/4 — fakes refraction
//
// Plus a multi-stop drop shadow so the card has weight on light backgrounds
// and a halo on dark ones, without looking like a flat box-shadow.
export const GlassCard = ({
  children,
  theme,
  style,
  radius = 24,
  borderColor,
  noShadow,
  noBorder,
  intensity,
  tinted = false,
  accentColor, // hex like '#6366F1' — washes the whole surface in that color
}) => {
  const isDark = theme.mode === 'dark';
  const isWeb = Platform.OS === 'web';
  const blurIntensity = intensity ?? (tinted || accentColor ? 35 : 25);

  // When an accent color is given, the gradient tint is the accent color at
  // low opacity — that's what gives the iOS "tinted glass" / colored bubble
  // look. Otherwise fall back to the neutral white-ish glass.
  const tintTop = accentColor
    ? `${accentColor}26` // ~15% opacity
    : tinted
    ? theme.glassTintStrong
    : theme.glassTint;
  const tintBottom = accentColor ? `${accentColor}08` : theme.glassTintEnd; // ~3%

  return (
    <View
      style={[
        {
          borderRadius: radius,
          overflow: 'hidden',
          borderWidth: noBorder ? 0 : StyleSheet.hairlineWidth,
          borderColor: noBorder ? 'transparent' : (borderColor ?? theme.glassBorder),
        },
        style,
      ]}
    >
      {/* 1 — Blur backdrop */}
      <BlurView
        intensity={blurIntensity}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFillObject}
      />

      {/* 2 — Gradient tint */}
      <LinearGradient
        colors={[tintTop, tintBottom]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* 3 — Specular highlight removed for clarity */}
      {/* 4 — Top sheen removed for clarity */}

      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  specular: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 36,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
