import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DayPill } from './DayPill';
import { GlassCard } from './GlassCard';

export const DayCell = ({
  day,
  entry,
  isToday,
  categories,
  theme,
  onToggle,
  onPress,
  compact,
}) => {
  if (!day) {
    return <View style={[styles.slot, compact && styles.slotCompact]} />;
  }
  const e = entry || {};
  const activeCats = (categories || []).filter((c) => c.active);

  const dotForCompact = (active, color, key) => (
    <View
      key={key}
      style={[
        styles.indicator,
        {
          backgroundColor: active ? color : 'transparent',
          borderColor: active ? color : theme.borderStrong,
          ...(active && { boxShadow: `0 0 6px ${color}` }),
        },
      ]}
    />
  );

  if (compact) {
    return (
      <View style={[styles.slot, styles.slotCompact]}>
        <Pressable onPress={onPress}>
          {({ pressed, hovered }) => (
            <GlassCard
              theme={theme}
              radius={12}
              style={[
                styles.innerCompact,
                { backgroundColor: isToday ? 'rgba(99, 102, 241, 0.15)' : theme.surface },
                isToday && { borderColor: theme.today, borderWidth: 1.5 },
                hovered && { backgroundColor: theme.surfaceHover },
                pressed && { transform: [{ scale: 0.96 }] },
              ]}
            >
              <Text
                style={[
                  styles.dayNumberCompact,
                  { color: isToday ? theme.today : theme.text, fontFamily: theme.font },
                  isToday && { fontWeight: '700' },
                ]}
              >
                {day}
              </Text>
              <View style={styles.indicators}>
                {activeCats.map((c) => dotForCompact(!!e[c.id], c.color, c.id))}
              </View>
            </GlassCard>
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.slot}>
      <GlassCard
        theme={theme}
        radius={16}
        style={[
          styles.inner,
          isToday && { borderColor: theme.today, borderWidth: 2 },
          { backgroundColor: isToday ? 'rgba(99, 102, 241, 0.1)' : theme.surface },
        ]}
      >
        <Text
          style={[
            styles.dayNumber,
            { color: isToday ? theme.today : theme.text, fontFamily: theme.font },
            isToday && { fontWeight: '700' },
          ]}
        >
          {day}
        </Text>
        <View style={styles.pills}>
          {activeCats.map((c) => (
            <DayPill
              key={c.id}
              label={c.name}
              color={c.color}
              softColor={c.color + '22'}
              active={!!e[c.id]}
              onPress={() => onToggle(c.id)}
              theme={theme}
            />
          ))}
        </View>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  slot: {
    width: `${100 / 7}%`,
    padding: 4,
  },
  slotCompact: {
    padding: 3,
  },
  inner: {
    padding: 10,
    minHeight: 115,
  },
  innerCompact: {
    minHeight: 52,
    padding: 6,
    justifyContent: 'space-between',
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  dayNumberCompact: {
    fontSize: 13,
    fontWeight: '600',
  },
  pills: {
    gap: 6,
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
    gap: 4,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
  },
});
