import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MealModeToggle } from './MealModeToggle';
import { RateInputs } from './RateInputs';
import { useBreakpoint } from '../utils/responsive';

export const SettingsSheet = ({
  visible,
  theme,
  mealMode,
  monthlyRates,
  daysInMonth,
  cleaningPerWeek,
  onChangeMealMode,
  onChangeMonthlyRate,
  onChangeCleaningPerWeek,
  onClose,
}) => {
  const { isCompact } = useBreakpoint();
  const sheetStyle = isCompact ? styles.bottomSheet : styles.sidePanel;
  const radiusStyle = isCompact
    ? { borderTopLeftRadius: 12, borderTopRightRadius: 12 }
    : {};
  const fontFamily = theme.font;

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isCompact ? 'slide' : 'fade'}
      onRequestClose={onClose}
    >
      <Pressable
        style={[styles.backdrop, isCompact ? styles.backdropMobile : styles.backdropDesktop]}
        onPress={onClose}
      >
        <Pressable
          style={[
            sheetStyle,
            radiusStyle,
            {
              backgroundColor: theme.bg,
              borderColor: theme.border,
              boxShadow: `0 4px 16px ${theme.shadowStrong}`,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {isCompact && (
            <View style={styles.handleWrap}>
              <View style={[styles.handleBar, { backgroundColor: theme.separator }]} />
            </View>
          )}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text, fontFamily }]}>Settings</Text>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={({ pressed, hovered }) => [
                styles.closeBtn,
                hovered && { backgroundColor: theme.surfaceHover },
                pressed && { opacity: 0.6 },
              ]}
            >
              <Text style={[styles.close, { color: theme.textMuted, fontFamily }]}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.sectionLabel, { color: theme.textMuted, fontFamily }]}>
              Meal mode
            </Text>
            <MealModeToggle value={mealMode} onChange={onChangeMealMode} theme={theme} />
            <Text style={[styles.hint, { color: theme.textSubtle, fontFamily }]}>
              Which meals to track on the calendar
            </Text>

            <View style={{ height: 24 }} />
            <RateInputs
              monthlyRates={monthlyRates}
              daysInMonth={daysInMonth}
              cleaningPerWeek={cleaningPerWeek}
              onChangeMonthlyRate={onChangeMonthlyRate}
              onChangeCleaningPerWeek={onChangeCleaningPerWeek}
              theme={theme}
              compact
            />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 30, 30, 0.35)',
  },
  backdropMobile: {
    justifyContent: 'flex-end',
  },
  backdropDesktop: {
    alignItems: 'flex-end',
  },
  bottomSheet: {
    width: '100%',
    maxHeight: '94%',
    minHeight: '60%',
    borderTopWidth: 1,
    boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.1)',
    elevation: 12,
  },
  sidePanel: {
    width: 320,
    maxWidth: '100%',
    height: '100%',
    borderLeftWidth: 1,
    boxShadow: '-4px 0 16px rgba(0, 0, 0, 0.1)',
    elevation: 12,
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  closeBtn: {
    width: 26,
    height: 26,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  close: {
    fontSize: 14,
    fontWeight: '500',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginLeft: 4,
    marginBottom: 8,
  },
  hint: {
    fontSize: 11,
    marginTop: 6,
    marginLeft: 4,
  },
});
