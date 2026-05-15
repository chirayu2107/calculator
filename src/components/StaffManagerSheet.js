import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useBreakpoint } from '../utils/responsive';

const confirm = (title, message, onYes) => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) onYes();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onYes },
  ]);
};

const StaffRow = ({ staff, isActive, theme, onRename, onDelete, onSelect, canDelete }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(staff.name);

  const commit = () => {
    setEditing(false);
    if (name.trim() && name.trim() !== staff.name) onRename(staff.id, name.trim());
    else setName(staff.name);
  };

  return (
    <View
      style={[
        styles.row,
        { borderColor: theme.border, backgroundColor: isActive ? theme.surfaceHover : theme.surface },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: staff.color }]} />
      {editing ? (
        <TextInput
          style={[styles.nameInput, { color: theme.text, fontFamily: theme.font, borderColor: theme.border }]}
          value={name}
          onChangeText={setName}
          onBlur={commit}
          onSubmitEditing={commit}
          autoFocus
          maxLength={32}
          returnKeyType="done"
        />
      ) : (
        <Pressable style={styles.nameWrap} onPress={() => onSelect(staff.id)}>
          <Text style={[styles.name, { color: theme.text, fontFamily: theme.font }]} numberOfLines={1}>
            {staff.name}
          </Text>
          {isActive && (
            <Text style={[styles.activeTag, { color: theme.primary, fontFamily: theme.font }]}>active</Text>
          )}
        </Pressable>
      )}
      <View style={styles.actions}>
        <Pressable
          onPress={() => setEditing(true)}
          hitSlop={6}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.iconText, { color: theme.textMuted }]}>✎</Text>
        </Pressable>
        {canDelete && (
          <Pressable
            onPress={() =>
              confirm(
                `Delete ${staff.name}?`,
                'This permanently removes their attendance, rates, and history.',
                () => onDelete(staff.id)
              )
            }
            hitSlop={6}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={[styles.iconText, { color: theme.danger }]}>🗑</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

export const StaffManagerSheet = ({
  visible,
  theme,
  staffList,
  activeStaffId,
  onAdd,
  onRename,
  onDelete,
  onSelect,
  onClose,
}) => {
  const { isCompact } = useBreakpoint();
  const [newName, setNewName] = useState('');
  const fontFamily = theme.font;

  const submitNew = () => {
    if (!newName.trim()) return;
    onAdd(newName.trim());
    setNewName('');
  };

  const sheetStyle = isCompact ? styles.bottomSheet : styles.sidePanel;

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
            { backgroundColor: theme.bg, borderColor: theme.border },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {isCompact && (
            <View style={styles.handleWrap}>
              <View style={[styles.handleBar, { backgroundColor: theme.separator || theme.border }]} />
            </View>
          )}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text, fontFamily }]}>Manage staff</Text>
            <Pressable onPress={onClose} hitSlop={10} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
              <Text style={[styles.close, { color: theme.textMuted, fontFamily }]}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.addRow}>
              <TextInput
                style={[
                  styles.addInput,
                  { color: theme.text, fontFamily, backgroundColor: theme.surfaceAlt, borderColor: theme.border },
                ]}
                placeholder="Add staff member (e.g. Cook, Driver)"
                placeholderTextColor={theme.textSubtle}
                value={newName}
                onChangeText={setNewName}
                onSubmitEditing={submitNew}
                returnKeyType="done"
                maxLength={32}
              />
              <Pressable
                onPress={submitNew}
                style={({ pressed }) => [
                  styles.addBtn,
                  { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
                ]}
                disabled={!newName.trim()}
              >
                <Text style={styles.addBtnText}>Add</Text>
              </Pressable>
            </View>

            <View style={{ height: 16 }} />

            {staffList.length === 0 ? (
              <Text style={[styles.empty, { color: theme.textMuted, fontFamily }]}>
                No staff yet — add one above to get started.
              </Text>
            ) : (
              staffList.map((s) => (
                <StaffRow
                  key={s.id}
                  staff={s}
                  isActive={s.id === activeStaffId}
                  theme={theme}
                  onSelect={onSelect}
                  onRename={onRename}
                  onDelete={onDelete}
                  canDelete={staffList.length > 1}
                />
              ))
            )}

            <Text style={[styles.hint, { color: theme.textSubtle, fontFamily }]}>
              Each staff member has their own rates, meal mode, and attendance history.
            </Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(30,30,30,0.35)' },
  backdropMobile: { justifyContent: 'flex-end' },
  backdropDesktop: { alignItems: 'flex-end' },
  bottomSheet: {
    width: '100%',
    maxHeight: '90%',
    minHeight: '50%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
  },
  sidePanel: {
    width: 360,
    maxWidth: '100%',
    height: '100%',
    borderLeftWidth: 1,
  },
  handleWrap: { alignItems: 'center', paddingVertical: 8 },
  handleBar: { width: 36, height: 4, borderRadius: 2 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 15, fontWeight: '700' },
  close: { fontSize: 16, fontWeight: '500' },
  scroll: { padding: 16, gap: 8 },
  addRow: { flexDirection: 'row', gap: 8 },
  addInput: { flex: 1, height: 44, borderRadius: 10, paddingHorizontal: 12, fontSize: 14, borderWidth: 1 },
  addBtn: { paddingHorizontal: 16, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  nameWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
  activeTag: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  nameInput: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  actions: { flexDirection: 'row', gap: 4 },
  iconBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 14 },
  empty: { fontSize: 13, textAlign: 'center', paddingVertical: 24 },
  hint: { fontSize: 11, textAlign: 'center', marginTop: 12, opacity: 0.8, paddingHorizontal: 8 },
});
