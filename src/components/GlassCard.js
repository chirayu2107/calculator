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
  const blurIntensity = intensity ?? (tinted || accentColor ? 15 : 10);

  // When an accent color is given, the gradient tint is the accent color at
  // low opacity — that's what gives the iOS "tinted glass" / colored bubble
  // look. Otherwise fall back to the neutral white-ish glass.
  const tintTop = accentColor
    ? `${accentColor}14` // ~8% opacity
    : tinted
    ? theme.glassTintStrong
    : theme.glassTint;
  const tintBottom = accentColor ? `${accentColor}05` : theme.glassTintEnd; // ~2%

  return (
    <View
      style={[
        {
          borderRadius: radius,
          borderWidth: noBorder ? 0 : StyleSheet.hairlineWidth,
          borderColor: noBorder ? 'transparent' : (borderColor ?? theme.glassBorder),
          // Adding a tiny bit of solid color helps Safari's backdrop-filter anchor
          backgroundColor: 'rgba(255, 255, 255, 0.01)',
        },
        style,
      ]}
    >
      {/* 1 — Blur backdrop */}
      {/* Temporarily disabling BlurView to diagnose visibility issues */}
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            borderRadius: radius,
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)',
          }
        ]}
      />

      {/* 2 — Gradient tint */}
      <LinearGradient
        colors={[tintTop, tintBottom]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { borderRadius: radius }]}
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
