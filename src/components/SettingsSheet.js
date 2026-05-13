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
  syncStatus,
  onChangeMealMode,
  onChangeMonthlyRate,
  onChangeCleaningPerWeek,
  syncId,
  onLogout,
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

            <View style={[styles.syncFooter, { borderTopColor: theme.separator }]}>
              <View style={styles.syncInfo}>
                <View style={[styles.syncDot, { 
                  backgroundColor: syncStatus === 'synced' ? '#10B981' : syncStatus === 'syncing' ? '#F59E0B' : '#EF4444' 
                }]} />
                <Text style={[styles.syncText, { color: theme.textMuted, fontFamily }]}>
                  {syncStatus === 'synced' ? 'Cloud Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Sync Error'}
                </Text>
              </View>
              {syncId && (
                <View style={styles.accountContainer}>
                  <View style={styles.accountRow}>
                    <Text style={[styles.syncIdText, { color: theme.textSubtle, fontFamily }]}>
                      Active Sync: {syncId}
                    </Text>
                  </View>
                  <View style={{ height: 16 }} />
                  <Pressable
                    style={({ pressed }) => [
                      styles.logoutButton,
                      {
                        backgroundColor: theme.surfaceAlt,
                        borderColor: theme.danger + '40',
                        opacity: pressed ? 0.7 : 1,
                      }
                    ]}
                    onPress={onLogout}
                  >
                    <Text style={[styles.logoutText, { color: theme.danger, fontFamily }]}>Logout</Text>
                    <Text style={[styles.logoutSubtext, { color: theme.textSubtle, fontFamily }]}>
                      Disconnect this device from cloud sync
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
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
  syncFooter: {
    marginTop: 32,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  syncText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  syncIdText: {
    fontSize: 11,
    opacity: 0.8,
    textAlign: 'center',
    width: '100%',
  },
  logoutButton: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  logoutSubtext: {
    fontSize: 10,
    opacity: 0.7,
  },
  accountContainer: {
    marginTop: 8,
  },
});
