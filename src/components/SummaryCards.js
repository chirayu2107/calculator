import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { GlassCard } from './GlassCard';

const Card = ({ label, value, sublabel, icon, accent, theme, emphasis, compact }) => {
  const cardStyle = compact ? styles.cardCompact : styles.card;
  const labelStyle = compact ? styles.labelCompact : styles.label;
  const currencyStyle = compact ? styles.currencyCompact : styles.currency;
  const valueStyle = compact ? styles.valueCompact : styles.value;
  const sublabelStyle = compact ? styles.sublabelCompact : styles.sublabel;
  const accentBorder = emphasis
    ? { borderColor: theme.primary, borderWidth: 1.5 }
    : accent
    ? { borderColor: accent + '55' }
    : null;

  return (
    <GlassCard
      theme={theme}
      radius={compact ? 18 : 22}
      tinted={emphasis}
      style={[cardStyle, accentBorder]}
    >
      <View style={styles.headerRow}>
        {icon ? <Text style={[styles.icon, compact && styles.iconCompact]}>{icon}</Text> : null}
        {accent ? (
          <View style={[styles.accentDot, { backgroundColor: accent, boxShadow: `0 0 6px ${accent}` }]} />
        ) : null}
        <Text
          style={[labelStyle, { color: theme.textMuted, fontFamily: theme.font }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
      <View style={styles.valueRow}>
        <Text style={[currencyStyle, { color: theme.textMuted, fontFamily: theme.font }]}>₹</Text>
        <Text
          style={[valueStyle, { color: theme.text, fontFamily: theme.font }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
        >
          {Math.round(value).toLocaleString('en-IN')}
        </Text>
      </View>
      <Text
        style={[sublabelStyle, { color: theme.textSubtle, fontFamily: theme.font }]}
        numberOfLines={1}
      >
        {sublabel}
      </Text>
    </GlassCard>
  );
};

export const SummaryCards = ({ summary, monthName, theme, compact }) => {
  const activeCats = (summary.perCategory || []).filter((c) => c.active);

  const cards = (
    <>
      {activeCats.map((c) => (
        <Card
          key={c.id}
          label={c.name}
          value={c.total}
          sublabel={`${c.count} ${c.count === 1 ? 'session' : 'sessions'}`}
          icon={c.icon}
          accent={c.color}
          theme={theme}
          compact={compact}
        />
      ))}
      <Card
        label="Total"
        value={summary.grandTotal}
        sublabel={monthName}
        theme={theme}
        emphasis
        compact={compact}
      />
    </>
  );

  if (compact) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollCompact}
      >
        {cards}
      </ScrollView>
    );
  }

  return <View style={styles.row}>{cards}</View>;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  scrollCompact: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  card: {
    flex: 1,
    minWidth: 160,
    padding: 18,
  },
  cardCompact: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 144,
    width: 144,
    minWidth: 144,
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  icon: { fontSize: 14 },
  iconCompact: { fontSize: 12 },
  accentDot: { width: 8, height: 8, borderRadius: 4 },
  label: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    flexShrink: 1,
  },
  labelCompact: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    flexShrink: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
    gap: 3,
  },
  currency: {
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.55,
    fontVariant: ['tabular-nums'],
  },
  currencyCompact: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.55,
    fontVariant: ['tabular-nums'],
  },
  value: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -1.0,
    fontVariant: ['tabular-nums'],
  },
  valueCompact: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.6,
    fontVariant: ['tabular-nums'],
  },
  sublabel: {
    fontSize: 11,
    marginTop: 5,
    fontWeight: '500',
    opacity: 0.85,
    letterSpacing: 0.1,
  },
  sublabelCompact: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
    opacity: 0.85,
    letterSpacing: 0.1,
  },
});
