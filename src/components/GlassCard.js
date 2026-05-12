import React from 'react';
import { StyleSheet, View } from 'react-native';

// Plain iOS-style card — no blur, no gradient, just clean surface + soft shadow.
// Kept as "GlassCard" for backward import compatibility.
export const GlassCard = ({
  children,
  theme,
  style,
  radius = 14,
  borderColor,
  noShadow,
  noBorder,
}) => (
  <View
    style={[
      {
        borderRadius: radius,
        backgroundColor: theme.surface,
        borderColor: noBorder ? 'transparent' : (borderColor ?? theme.border),
        borderWidth: noBorder ? 0 : StyleSheet.hairlineWidth,
        overflow: 'hidden',
      },
      !noShadow && {
        boxShadow: `0 1px 3px ${theme.shadow}`,
        elevation: 1,
      },
      style,
    ]}
  >
    {children}
  </View>
);
