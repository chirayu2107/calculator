import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Card = ({ label, value, sublabel, theme, emphasis }) => (
  <View
    style={[
      styles.card,
      {
        backgroundColor: theme.surface,
        borderColor: theme.border,
        boxShadow: `0 1px 2px ${theme.shadow}`,
      },
      emphasis && { borderColor: theme.primary, borderWidth: 1.5 },
    ]}
  >
    <Text style={[styles.label, { color: theme.textMuted, fontFamily: theme.font }]}>
      {label}
    </Text>
    <Text style={[styles.value, { color: theme.text, fontFamily: theme.font }]}>
      ₹{Math.round(value).toLocaleString('en-IN')}
    </Text>
    <Text style={[styles.sublabel, { color: theme.textSubtle, fontFamily: theme.font }]}>
      {sublabel}
    </Text>
  </View>
);

export const SummaryCards = ({ summary, mealMode, monthName, theme, compact }) => {
  const showLunch = mealMode !== 'dinner';
  const showDinner = mealMode !== 'lunch';
  const foodSubBits = [];
  if (showLunch) foodSubBits.push(`${summary.lunchCount} lunch`);
  if (showDinner) foodSubBits.push(`${summary.dinnerCount} dinner`);

  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      <Card
        label="Food"
        value={summary.foodTotal}
        sublabel={foodSubBits.join(' · ') || 'none'}
        theme={theme}
      />
      <Card
        label="Cleaning"
        value={summary.cleaningTotal}
        sublabel={`${summary.cleaningCount} sessions`}
        theme={theme}
      />
      <Card
        label="Total"
        value={summary.grandTotal}
        sublabel={monthName}
        theme={theme}
        emphasis
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  rowCompact: {
    flexDirection: 'column',
    gap: 6,
  },
  card: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    elevation: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: -0.5,
  },
  sublabel: {
    fontSize: 11,
    marginTop: 3,
    fontWeight: '400',
  },
});
