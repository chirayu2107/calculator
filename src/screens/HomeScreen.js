import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { DayCell } from '../components/DayCell';
import { DayEditorModal } from '../components/DayEditorModal';
import { SummaryCards } from '../components/SummaryCards';
import { SettingsSheet } from '../components/SettingsSheet';
import { buildMonthGrid, dateKey, daysInMonth, monthLabel, shiftMonth, todayKey } from '../utils/date';
import { computeMonthSummary } from '../utils/summary';
import { useBreakpoint } from '../utils/responsive';

const WEEKDAYS_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_MIN = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const HomeScreen = ({ theme }) => {
  const {
    attendance,
    mealMode,
    monthlyRates,
    cleaningPerWeek,
    toggle,
    updateMonthlyRate,
    updateMealMode,
    updateCleaningPerWeek,
  } = useApp();
  const now = new Date();
  const { isCompact } = useBreakpoint();
  const [{ year, monthIndex }, setMonth] = useState({
    year: now.getFullYear(),
    monthIndex: now.getMonth(),
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);

  const today = todayKey();
  const cells = useMemo(() => buildMonthGrid(year, monthIndex), [year, monthIndex]);
  const dim = useMemo(() => daysInMonth(year, monthIndex), [year, monthIndex]);
  const summary = useMemo(
    () => computeMonthSummary(attendance, year, monthIndex, monthlyRates, mealMode, cleaningPerWeek),
    [attendance, year, monthIndex, monthlyRates, mealMode, cleaningPerWeek]
  );
  const label = monthLabel(year, monthIndex);
  const WEEKDAYS = isCompact ? WEEKDAYS_MIN : WEEKDAYS_FULL;
  const fontFamily = theme.font;

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      {/* Background Blobs for Glass depth */}
      <View style={styles.blobContainer}>
        <View style={[styles.blob, { backgroundColor: theme.primary, top: -100, left: -50, opacity: 0.15 }]} />
        <View style={[styles.blob, { backgroundColor: theme.lunch, bottom: 50, right: -50, opacity: 0.1 }]} />
        <View style={[styles.blob, { backgroundColor: theme.dinner, top: '40%', left: '30%', opacity: 0.05, width: 400, height: 400 }]} />
      </View>

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Futuristic Floating Toolbar */}
        <View style={styles.toolbarContainer}>
          <View style={[styles.toolbar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.toolbarLeft}>
              {!isCompact && (
                <>
                  <Text style={[styles.appTitle, { color: theme.text, fontFamily }]}>
                    Maid Tracker
                  </Text>
                  <View style={[styles.toolDivider, { backgroundColor: theme.border }]} />
                </>
              )}
              <ToolBtn theme={theme} onPress={() => setMonth(shiftMonth(year, monthIndex, -1))}>
                ‹
              </ToolBtn>
              <Pressable
                onPress={() =>
                  setMonth({ year: now.getFullYear(), monthIndex: now.getMonth() })
                }
              >
                <Text
                  style={[
                    styles.monthLabel,
                    { color: theme.text, fontFamily },
                    isCompact && { minWidth: 88, fontSize: 14 },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
              <ToolBtn theme={theme} onPress={() => setMonth(shiftMonth(year, monthIndex, 1))}>
                ›
              </ToolBtn>
            </View>
            <View style={styles.toolbarRight}>
              {!isCompact && (
                <>
                  <ToolBtn
                    theme={theme}
                    onPress={() =>
                      setMonth({ year: now.getFullYear(), monthIndex: now.getMonth() })
                    }
                    wide
                  >
                    Today
                  </ToolBtn>
                  <View style={[styles.toolDivider, { backgroundColor: theme.border }]} />
                </>
              )}
              <ToolBtn theme={theme} onPress={() => setSettingsOpen(true)}>
                ⚙
              </ToolBtn>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, isCompact && styles.scrollCompact]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.legend}>
            <View style={styles.legendItems}>
              {mealMode !== 'dinner' && <LegendItem color={theme.lunch} label="Lunch" theme={theme} />}
              {mealMode !== 'lunch' && <LegendItem color={theme.dinner} label="Dinner" theme={theme} />}
              <LegendItem color={theme.cleaning} label="Cleaning" theme={theme} />
            </View>
            {isCompact && (
              <Pressable
                onPress={() =>
                  setMonth({ year: now.getFullYear(), monthIndex: now.getMonth() })
                }
                style={({ pressed, hovered }) => [
                  styles.todayPill,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  hovered && { backgroundColor: theme.surfaceHover },
                  pressed && { opacity: 0.6 },
                ]}
              >
                <Text style={[styles.todayPillText, { color: theme.text, fontFamily }]}>
                  Today
                </Text>
              </Pressable>
            )}
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((w, i) => (
              <Text
                key={`${w}-${i}`}
                style={[styles.weekday, { color: theme.textSubtle, fontFamily }]}
              >
                {w}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((day, idx) => {
              const key = day ? dateKey(year, monthIndex, day) : null;
              return (
                <DayCell
                  key={`${idx}-${day || 'blank'}`}
                  day={day}
                  entry={key ? attendance[key] : null}
                  isToday={key === today}
                  mealMode={mealMode}
                  theme={theme}
                  compact={isCompact}
                  onPress={() => key && setSelectedKey(key)}
                  onToggle={(field) => key && toggle(key, field)}
                />
              );
            })}
          </View>

          <View style={styles.summaryWrap}>
            <SummaryCards
              summary={summary}
              mealMode={mealMode}
              monthName={label}
              theme={theme}
              compact={isCompact}
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      <SettingsSheet
        visible={settingsOpen}
        theme={theme}
        mealMode={mealMode}
        monthlyRates={monthlyRates}
        daysInMonth={dim}
        cleaningPerWeek={cleaningPerWeek}
        onChangeMealMode={updateMealMode}
        onChangeMonthlyRate={updateMonthlyRate}
        onChangeCleaningPerWeek={updateCleaningPerWeek}
        onClose={() => setSettingsOpen(false)}
      />

      <DayEditorModal
        visible={!!selectedKey}
        dateKey={selectedKey}
        entry={selectedKey ? attendance[selectedKey] : null}
        mealMode={mealMode}
        theme={theme}
        onToggle={(field) => selectedKey && toggle(selectedKey, field)}
        onClose={() => setSelectedKey(null)}
      />
    </View>
  );
};

const ToolBtn = ({ children, onPress, theme, wide }) => (
  <Pressable
    onPress={onPress}
    hitSlop={8}
    style={({ pressed, hovered }) => [
      styles.toolBtn,
      wide && styles.toolBtnWide,
      { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
      hovered && { backgroundColor: theme.surfaceHover, transform: [{ scale: 1.05 }] },
      pressed && { transform: [{ scale: 0.95 }] },
    ]}
  >
    <Text style={[styles.toolBtnText, { color: theme.text, fontFamily: theme.font }]}>
      {children}
    </Text>
  </Pressable>
);

const LegendItem = ({ color, label, theme }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color, boxShadow: `0 0 8px ${color}` }]} />
    <Text style={[styles.legendText, { color: theme.textMuted, fontFamily: theme.font }]}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1 },
  blobContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: -1,
  },
  blob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    filter: 'blur(80px)',
  },
  safe: { flex: 1 },
  toolbarContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    zIndex: 10,
  },
  toolbar: {
    height: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 24,
    borderWidth: 1,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  appTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  toolDivider: {
    width: 1,
    height: 20,
    marginHorizontal: 6,
    opacity: 0.5,
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 8,
    minWidth: 120,
    textAlign: 'center',
  },
  toolBtn: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  toolBtnWide: {
    paddingHorizontal: 12,
  },
  toolBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
    maxWidth: 1000,
    width: '100%',
    alignSelf: 'center',
  },
  scrollCompact: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  legendItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  todayPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  todayPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  summaryWrap: {
    marginTop: 32,
  },
});
