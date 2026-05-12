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
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Figma-style top toolbar */}
        <View style={[styles.toolbar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
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
                  isCompact && { minWidth: 88, fontSize: 13 },
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
                style={[styles.weekday, { color: theme.textMuted, fontFamily }]}
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
    hitSlop={4}
    style={({ pressed, hovered }) => [
      styles.toolBtn,
      wide && styles.toolBtnWide,
      hovered && { backgroundColor: theme.surfaceHover },
      pressed && { opacity: 0.6 },
    ]}
  >
    <Text style={[styles.toolBtnText, { color: theme.text, fontFamily: theme.font }]}>
      {children}
    </Text>
  </Pressable>
);

const LegendItem = ({ color, label, theme }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    <Text style={[styles.legendText, { color: theme.textMuted, fontFamily: theme.font }]}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  toolbar: {
    height: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
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
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  toolDivider: {
    width: 1,
    height: 20,
    marginHorizontal: 6,
  },
  monthLabel: {
    fontSize: 13,
    fontWeight: '500',
    paddingHorizontal: 4,
    minWidth: 110,
    textAlign: 'center',
  },
  toolBtn: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 6,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolBtnWide: {
    paddingHorizontal: 10,
  },
  toolBtnText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 16,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
    maxWidth: 1180,
    width: '100%',
    alignSelf: 'center',
  },
  scrollCompact: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 24,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  legendItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  todayPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  todayPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
  },
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: 3,
    marginBottom: 4,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  summaryWrap: {
    marginTop: 16,
  },
});
