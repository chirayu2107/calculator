import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GlassCard } from './GlassCard';

export const StaffPicker = ({
  staffList,
  activeStaffId,
  theme,
  onSelect,
  onManage,
}) => {
  if (!staffList || staffList.length === 0) {
    return (
      <View style={styles.row}>
        <Pressable
          onPress={onManage}
          hitSlop={8}
          delayPressIn={0}
          style={({ pressed }) => [pressed && { transform: [{ scale: 0.96 }] }]}
        >
          <GlassCard theme={theme} radius={20} style={styles.addPill}>
            <Text style={[styles.addPillText, { color: theme.text, fontFamily: theme.font }]}>
              + Add staff
            </Text>
          </GlassCard>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        decelerationRate="fast"
      >
        {staffList.map((s) => {
          const active = s.id === activeStaffId;
          return (
            <Pressable
              key={s.id}
              onPress={() => onSelect(s.id)}
              delayPressIn={0}
              style={({ pressed }) => [pressed && { transform: [{ scale: 0.96 }] }]}
            >
              <GlassCard
                theme={theme}
                radius={20}
                accentColor={active ? s.color : undefined}
                borderColor={active ? s.color : undefined}
                style={[
                  styles.pill,
                  active && {
                    borderWidth: 1.5,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    { color: theme.text, fontFamily: theme.font },
                    active && styles.pillTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {s.name}
                </Text>
              </GlassCard>
            </Pressable>
          );
        })}

        <Pressable
          onPress={onManage}
          delayPressIn={0}
          style={({ pressed }) => [pressed && { transform: [{ scale: 0.96 }] }]}
          hitSlop={8}
        >
          <GlassCard theme={theme} radius={20} style={styles.managePill}>
            <Text style={[styles.managePillText, { color: theme.textMuted, fontFamily: theme.font }]}>
              ⚙ Manage
            </Text>
          </GlassCard>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { paddingTop: 10, paddingBottom: 6 },
  scroll: { gap: 8, paddingHorizontal: 16, alignItems: 'center' },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    maxWidth: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: { fontSize: 13, fontWeight: '600', letterSpacing: -0.1 },
  pillTextActive: { fontWeight: '700' },
  addPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  addPillText: { fontSize: 13, fontWeight: '700', letterSpacing: -0.1 },
  managePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  managePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.2 },
});
