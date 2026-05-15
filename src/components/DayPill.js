import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const DayPill = ({ label, color, softColor, active, onPress, theme, compact }) => (
  <Pressable
    onPress={onPress}
    delayPressIn={0}
    style={({ pressed, hovered }) => [
      styles.pill,
      compact && styles.pillCompact,
      {
        backgroundColor: active ? color : 'rgba(255,255,255,0.05)',
        borderColor: active ? color : theme.border,
      },
      pressed && { transform: [{ scale: 0.95 }] },
      hovered && !active && { backgroundColor: 'rgba(255,255,255,0.1)' },
    ]}
  >
    <View
      style={[
        styles.dot,
        compact && { width: 5, height: 5, borderRadius: 2.5 },
        { backgroundColor: active ? '#fff' : color },
      ]}
    />
    {!compact && (
      <Text
        style={[
          styles.label,
          { color: active ? '#fff' : theme.text, fontFamily: theme.font },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    )}
  </Pressable>
);

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
    transition: 'all 0.2s ease',
  },
  pillCompact: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
