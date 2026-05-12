import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DayPill } from './DayPill';

export const DayCell = ({ day, entry, isToday, mealMode, theme, onToggle, onPress, compact }) => {
  if (!day) {
    return <View style={[styles.slot, compact && styles.slotCompact]} />;
  }
  const showLunch = mealMode !== 'dinner';
  const showDinner = mealMode !== 'lunch';
  const e = entry || { lunch: false, dinner: false, cleaning: false };

  const innerStyle = [
    styles.inner,
    {
      backgroundColor: theme.surface,
      borderColor: theme.border,
    },
    compact && styles.innerCompact,
    isToday && { borderColor: theme.today, borderWidth: 1.5 },
  ];

  const dotForCompact = (active, color) => (
    <View
      style={[
        styles.indicator,
        {
          backgroundColor: active ? color : 'transparent',
          borderColor: active ? color : theme.borderStrong,
        },
      ]}
    />
  );

  if (compact) {
    return (
      <View style={[styles.slot, styles.slotCompact]}>
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [innerStyle, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text
            style={[
              styles.dayNumberCompact,
              { color: isToday ? theme.today : theme.text, fontFamily: theme.font },
              isToday && { fontWeight: '600' },
            ]}
          >
            {day}
          </Text>
          <View style={styles.indicators}>
            {showLunch && dotForCompact(e.lunch, theme.lunch)}
            {showDinner && dotForCompact(e.dinner, theme.dinner)}
            {dotForCompact(e.cleaning, theme.cleaning)}
          </View>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.slot}>
      <View style={innerStyle}>
        <Text
          style={[
            styles.dayNumber,
            { color: isToday ? theme.today : theme.text, fontFamily: theme.font },
            isToday && { fontWeight: '600' },
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
              edgeColor={theme.lunchEdge}
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
              edgeColor={theme.dinnerEdge}
              active={e.dinner}
              onPress={() => onToggle('dinner')}
              theme={theme}
            />
          )}
          <DayPill
            label="Clean"
            color={theme.cleaning}
            softColor={theme.cleaningSoft}
            edgeColor={theme.cleaningEdge}
            active={e.cleaning}
            onPress={() => onToggle('cleaning')}
            theme={theme}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slot: {
    width: `${100 / 7}%`,
    padding: 3,
  },
  slotCompact: {
    padding: 2,
  },
  inner: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    minHeight: 108,
  },
  innerCompact: {
    minHeight: 50,
    padding: 5,
    borderRadius: 6,
    justifyContent: 'space-between',
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  dayNumberCompact: {
    fontSize: 12,
    fontWeight: '500',
  },
  pills: {
    gap: 4,
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  indicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    borderWidth: 1,
    marginRight: 3,
  },
});
