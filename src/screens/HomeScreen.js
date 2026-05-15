import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { DayCell } from '../components/DayCell';
import { DayEditorModal } from '../components/DayEditorModal';
import { SummaryCards } from '../components/SummaryCards';
import { SettingsSheet } from '../components/SettingsSheet';
import { StaffPicker } from '../components/StaffPicker';
import { StaffManagerSheet } from '../components/StaffManagerSheet';
import { FamilySheet } from '../components/FamilySheet';
import { buildMonthGrid, dateKey, monthLabel, shiftMonth, todayKey } from '../utils/date';
import { computeMonthSummary } from '../utils/summary';
import { useBreakpoint } from '../utils/responsive';

const WEEKDAYS_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_MIN = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const HomeScreen = ({ theme }) => {
  const {
    staffList,
    activeStaff,
    activeStaffId,
    categories,
    attendance,
    toggle,
    addCategory,
    updateCategory,
    deleteCategory,
    syncStatus,
    addStaff,
    renameStaff,
    deleteStaff,
    setActiveStaff,
    user,
    signOut,
    deleteAccount,
    household,
    inviteCode,
    members,
    isOwner,
    joinFamily,
    regenerateInviteCode,
    removeMember,
    leaveFamily,
  } = useApp();
  const now = new Date();
  const { isCompact } = useBreakpoint();
  const [{ year, monthIndex }, setMonth] = useState({
    year: now.getFullYear(),
    monthIndex: now.getMonth(),
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [staffSheetOpen, setStaffSheetOpen] = useState(false);
  const [familySheetOpen, setFamilySheetOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);

  const totalAttendanceDays = useMemo(() => {
    let count = 0;
    for (const sd of Object.values(activeStaff ? { [activeStaff.id]: { attendance } } : {})) {
      count += Object.keys(sd.attendance || {}).length;
    }
    return count;
  }, [activeStaff, attendance]);

  const today = todayKey();
  const cells = useMemo(() => buildMonthGrid(year, monthIndex), [year, monthIndex]);
  const summary = useMemo(
    () => computeMonthSummary(categories, attendance, year, monthIndex),
    [categories, attendance, year, monthIndex]
  );
  const label = monthLabel(year, monthIndex);
  const WEEKDAYS = isCompact ? WEEKDAYS_MIN : WEEKDAYS_FULL;
  const fontFamily = theme.font;
  const activeCats = useMemo(() => categories.filter((c) => c.active), [categories]);

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <View style={[styles.blobContainer, { pointerEvents: 'none' }]}>
        <View style={[styles.blob, { backgroundColor: theme.primary, top: -180, left: -120, width: 720, height: 720, opacity: theme.mode === 'dark' ? 0.18 : 0.22 }]} />
        <View style={[styles.blob, { backgroundColor: theme.lunch, bottom: -100, right: -120, width: 620, height: 620, opacity: theme.mode === 'dark' ? 0.14 : 0.16 }]} />
        <View style={[styles.blob, { backgroundColor: theme.dinner, top: '38%', left: '28%', width: 520, height: 520, opacity: theme.mode === 'dark' ? 0.08 : 0.08 }]} />
      </View>

      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.toolbarContainer}>
          <View style={[styles.toolbar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.toolbarLeft}>
              {!isCompact && (
                <>
                  <Text style={[styles.appTitle, { color: theme.text, fontFamily }]}>Maid Tracker</Text>
                  <View style={[styles.toolDivider, { backgroundColor: theme.border }]} />
                </>
              )}
              <ToolBtn theme={theme} onPress={() => setMonth(shiftMonth(year, monthIndex, -1))}>‹</ToolBtn>
              <Pressable onPress={() => setMonth({ year: now.getFullYear(), monthIndex: now.getMonth() })}>
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
              <ToolBtn theme={theme} onPress={() => setMonth(shiftMonth(year, monthIndex, 1))}>›</ToolBtn>
            </View>
            <View style={styles.toolbarRight}>
              {!isCompact && (
                <>
                  <ToolBtn theme={theme} onPress={() => setMonth({ year: now.getFullYear(), monthIndex: now.getMonth() })} wide>
                    Today
                  </ToolBtn>
                  <View style={[styles.toolDivider, { backgroundColor: theme.border }]} />
                </>
              )}
              <ToolBtn theme={theme} onPress={() => setSettingsOpen(true)}>⚙</ToolBtn>
            </View>
          </View>
        </View>

        <StaffPicker
          staffList={staffList}
          activeStaffId={activeStaffId}
          theme={theme}
          onSelect={setActiveStaff}
          onManage={() => setStaffSheetOpen(true)}
          compact={isCompact}
        />

        <ScrollView
          contentContainerStyle={[styles.scroll, isCompact && styles.scrollCompact]}
          showsVerticalScrollIndicator={false}
        >
          {!activeStaff ? (
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyTitle, { color: theme.text, fontFamily }]}>
                Add your first staff member
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textMuted, fontFamily }]}>
                Tap "+ Add staff" above to begin tracking attendance.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.summaryWrap}>
                <SummaryCards
                  summary={summary}
                  monthName={`${activeStaff.name} · ${label}`}
                  theme={theme}
                  compact={isCompact}
                />
              </View>

              <View style={styles.legend}>
                <View style={styles.legendItems}>
                  {activeCats.map((c) => (
                    <LegendItem key={c.id} color={c.color} label={c.name} icon={c.icon} theme={theme} />
                  ))}
                </View>
                {isCompact && (
                  <Pressable
                    onPress={() => setMonth({ year: now.getFullYear(), monthIndex: now.getMonth() })}
                    style={({ pressed, hovered }) => [
                      styles.todayPill,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                      hovered && { backgroundColor: theme.surfaceHover },
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    <Text style={[styles.todayPillText, { color: theme.text, fontFamily }]}>Today</Text>
                  </Pressable>
                )}
              </View>

              <View style={styles.weekRow}>
                {WEEKDAYS.map((w, i) => (
                  <Text key={`${w}-${i}`} style={[styles.weekday, { color: theme.textSubtle, fontFamily }]}>
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
                      categories={categories}
                      theme={theme}
                      compact={isCompact}
                      onPress={() => key && setSelectedKey(key)}
                      onToggle={(catId) => key && toggle(key, catId)}
                    />
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <SettingsSheet
        visible={settingsOpen}
        theme={theme}
        categories={categories}
        syncStatus={syncStatus}
        userEmail={user ? user.email : null}
        activeStaffName={activeStaff ? activeStaff.name : null}
        memberCount={members ? members.length : 0}
        onOpenFamily={() => setFamilySheetOpen(true)}
        onAddCategory={addCategory}
        onUpdateCategory={updateCategory}
        onDeleteCategory={deleteCategory}
        onSignOut={signOut}
        onDeleteAccount={deleteAccount}
        onClose={() => setSettingsOpen(false)}
      />

      <FamilySheet
        visible={familySheetOpen}
        theme={theme}
        user={user}
        household={household}
        inviteCode={inviteCode}
        members={members}
        isOwner={isOwner}
        staffCount={staffList ? staffList.length : 0}
        attendanceDays={totalAttendanceDays}
        onRegenerateCode={regenerateInviteCode}
        onRemoveMember={removeMember}
        onJoinFamily={joinFamily}
        onLeaveFamily={leaveFamily}
        onClose={() => setFamilySheetOpen(false)}
      />

      <StaffManagerSheet
        visible={staffSheetOpen}
        theme={theme}
        staffList={staffList}
        activeStaffId={activeStaffId}
        onAdd={addStaff}
        onRename={renameStaff}
        onDelete={deleteStaff}
        onSelect={setActiveStaff}
        onClose={() => setStaffSheetOpen(false)}
      />

      <DayEditorModal
        visible={!!selectedKey}
        dateKey={selectedKey}
        entry={selectedKey ? attendance[selectedKey] : null}
        categories={categories}
        theme={theme}
        onToggle={(catId) => selectedKey && toggle(selectedKey, catId)}
        onClose={() => setSelectedKey(null)}
      />
    </View>
  );
};

const ToolBtn = ({ children, onPress, theme, wide }) => (
  <Pressable
    onPress={onPress}
    hitSlop={12}
    delayPressIn={0}
    style={({ pressed, hovered }) => [
      styles.toolBtn,
      wide && styles.toolBtnWide,
      { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
      hovered && { backgroundColor: theme.surfaceHover, transform: [{ scale: 1.05 }] },
      pressed && { transform: [{ scale: 0.92 }], opacity: 0.8 },
    ]}
  >
    <Text style={[styles.toolBtnText, { color: theme.text, fontFamily: theme.font }]}>{children}</Text>
  </Pressable>
);

const LegendItem = ({ color, label, icon, theme }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, { backgroundColor: color }]} />
    {icon ? <Text style={styles.legendIcon}>{icon}</Text> : null}
    <Text style={[styles.legendText, { color: theme.textMuted, fontFamily: theme.font }]} numberOfLines={1}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1 },
  blobContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', zIndex: -1 },
  blob: { position: 'absolute', width: 600, height: 600, borderRadius: 9999, filter: 'blur(140px)' },
  safe: { flex: 1 },
  toolbarContainer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, zIndex: 10 },
  toolbar: {
    height: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 24,
    borderWidth: 1,
  },
  toolbarLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toolbarRight: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  appTitle: { fontSize: 14, fontWeight: '700', letterSpacing: -0.3 },
  toolDivider: { width: 1, height: 20, marginHorizontal: 6, opacity: 0.5 },
  monthLabel: { fontSize: 14, fontWeight: '600', paddingHorizontal: 8, minWidth: 120, textAlign: 'center' },
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
  toolBtnWide: { paddingHorizontal: 12 },
  toolBtnText: { fontSize: 13, fontWeight: '600' },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
    maxWidth: 1000,
    width: '100%',
    alignSelf: 'center',
  },
  scrollCompact: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32 },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10, // Tightened
    paddingHorizontal: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItems: { flexDirection: 'row', alignItems: 'center', gap: 14, flexWrap: 'wrap' },
  todayPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  todayPillText: { fontSize: 12, fontWeight: '700' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendIcon: { fontSize: 12 },
  legendText: { fontSize: 12, fontWeight: '600', maxWidth: 110 },
  weekRow: { flexDirection: 'row', paddingHorizontal: 4, marginBottom: 4 }, // Tightened
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  summaryWrap: { marginBottom: 12 }, // Tightened
  emptyWrap: { padding: 40, alignItems: 'center', justifyContent: 'center', minHeight: 240 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', maxWidth: 280, lineHeight: 20 },
});
