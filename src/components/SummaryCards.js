import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlassCard } from './GlassCard';

const Card = ({ label, value, sublabel, theme, emphasis }) => (
  <GlassCard
    theme={theme}
    radius={20}
    style={[
      styles.card,
      emphasis && { borderColor: theme.primary, borderWidth: 1.5 },
    ]}
  >
    <Text style={[styles.label, { color: theme.textMuted, fontFamily: theme.font }]}>
      {label}
    </Text>
    <View style={styles.valueRow}>
      <Text style={[styles.currency, { color: theme.textMuted }]}>₹</Text>
      <Text style={[styles.value, { color: theme.text, fontFamily: theme.font }]}>
        {Math.round(value).toLocaleString('en-IN')}
      </Text>
    </View>
    <Text style={[styles.sublabel, { color: theme.textSubtle, fontFamily: theme.font }]}>
      {sublabel}
    </Text>
  </GlassCard>
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
    gap: 12,
  },
  rowCompact: {
    flexDirection: 'column',
    gap: 10,
  },
  card: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
    gap: 2,
  },
  currency: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.6,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  sublabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
    opacity: 0.8,
  },
});
