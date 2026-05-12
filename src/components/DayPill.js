import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const DayPill = ({ label, color, softColor, edgeColor, active, onPress, theme, compact }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed, hovered }) => [
      styles.pill,
      compact && styles.pillCompact,
      {
        backgroundColor: active ? color : softColor,
        borderColor: active ? color : edgeColor,
      },
      pressed && { opacity: 0.65 },
      hovered && !active && { backgroundColor: softColor, borderColor: color },
    ]}
  >
    <View
      style={[
        styles.dot,
        compact && { width: 4, height: 4, borderRadius: 2 },
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
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  pillCompact: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
});
