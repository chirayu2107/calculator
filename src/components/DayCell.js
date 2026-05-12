import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DayPill } from './DayPill';
import { GlassCard } from './GlassCard';

export const DayCell = ({ day, entry, isToday, mealMode, theme, onToggle, onPress, compact }) => {
  if (!day) {
    return <View style={[styles.slot, compact && styles.slotCompact]} />;
  }
  const showLunch = mealMode !== 'dinner';
  const showDinner = mealMode !== 'lunch';
  const e = entry || { lunch: false, dinner: false, cleaning: false };

  const dotForCompact = (active, color) => (
    <View
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
                {showLunch && dotForCompact(e.lunch, theme.lunch)}
                {showDinner && dotForCompact(e.dinner, theme.dinner)}
                {dotForCompact(e.cleaning, theme.cleaning)}
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
          {showLunch && (
            <DayPill
              label="Lunch"
              color={theme.lunch}
              softColor={theme.lunchSoft}
              active={e.lunch}
              onPress={() => onToggle('lunch')}
              theme={theme}
            />
          )}
          {showDinner && (
            <DayPill
              label="Dinner"
              color={theme.dinner}
              softColor={theme.dinnerSoft}
              active={e.dinner}
              onPress={() => onToggle('dinner')}
              theme={theme}
            />
          )}
          <DayPill
            label="Clean"
            color={theme.cleaning}
            softColor={theme.cleaningSoft}
            active={e.cleaning}
            onPress={() => onToggle('cleaning')}
            theme={theme}
          />
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
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    marginRight: 4,
  },
});
