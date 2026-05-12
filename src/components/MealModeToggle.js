import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const OPTIONS = [
  { value: 'lunch', label: 'Lunch' },
  { value: 'both', label: 'Both' },
  { value: 'dinner', label: 'Dinner' },
];

export const MealModeToggle = ({ value, onChange, theme }) => (
  <View
    style={[
      styles.wrap,
      { backgroundColor: theme.inputFill, borderColor: theme.border },
    ]}
  >
    {OPTIONS.map((opt) => {
      const active = value === opt.value;
      return (
        <Pressable
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={({ pressed, hovered }) => [
            styles.segment,
            active && {
              backgroundColor: theme.surface,
              borderColor: theme.borderStrong,
            },
            !active && hovered && { backgroundColor: theme.surfaceHover },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text
            style={[
              styles.label,
              { color: active ? theme.text : theme.textMuted, fontFamily: theme.font },
              active && styles.labelActive,
            ]}
          >
            {opt.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: 6,
    padding: 2,
    borderWidth: 1,
  },
  segment: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    boxShadow: '0 1px 1px rgba(0, 0, 0, 0.04)',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  labelActive: {
    fontWeight: '600',
  },
});
