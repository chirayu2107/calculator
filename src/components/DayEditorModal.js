import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const formatDateLabel = (dateKey) => {
  if (!dateKey) return '';
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const Row = ({ label, icon, active, color, onPress, theme, isLast }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed, hovered }) => [
      styles.row,
      !isLast && { borderBottomWidth: 1, borderBottomColor: theme.separator || theme.border },
      hovered && { backgroundColor: theme.surfaceHover },
      pressed && { opacity: 0.7 },
    ]}
  >
    <View
      style={[
        styles.swatch,
        { backgroundColor: active ? color : color + '22', borderColor: active ? color : color + '55' },
      ]}
    />
    {icon ? <Text style={styles.icon}>{icon}</Text> : null}
    <Text style={[styles.rowLabel, { color: theme.text, fontFamily: theme.font }]}>{label}</Text>
    <View
      style={[
        styles.toggle,
        {
          backgroundColor: active ? color : theme.surfaceAlt,
          borderColor: active ? color : theme.border,
        },
      ]}
    >
      <View
        style={[
          styles.thumb,
          { backgroundColor: '#fff', alignSelf: active ? 'flex-end' : 'flex-start' },
        ]}
      />
    </View>
  </Pressable>
);

export const DayEditorModal = ({
  visible,
  dateKey,
  entry,
  categories,
  theme,
  onToggle,
  onClose,
}) => {
  const e = entry || {};
  const items = (categories || []).filter((c) => c.active);
  const fontFamily = theme.font;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.card,
            {
              backgroundColor: theme.bg,
              borderColor: theme.border,
              boxShadow: `0 8px 24px ${theme.shadowStrong}`,
            },
          ]}
          onPress={(ev) => ev.stopPropagation()}
        >
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text, fontFamily }]}>
              {formatDateLabel(dateKey)}
            </Text>
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
          <ScrollView style={styles.scrollWrap}>
            <View
              style={[
                styles.group,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              {items.length === 0 ? (
                <Text style={[styles.empty, { color: theme.textMuted, fontFamily }]}>
                  No active categories. Add one in Settings.
                </Text>
              ) : (
                items.map((it, idx) => (
                  <Row
                    key={it.id}
                    label={it.name}
                    icon={it.icon}
                    color={it.color}
                    active={!!e[it.id]}
                    onPress={() => onToggle(it.id)}
                    theme={theme}
                    isLast={idx === items.length - 1}
                  />
                ))
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '80%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  title: { fontSize: 13, fontWeight: '600' },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  close: { fontSize: 13, fontWeight: '500' },
  scrollWrap: { maxHeight: '100%' },
  group: { margin: 12, borderRadius: 8, borderWidth: 1, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
    gap: 4,
  },
  swatch: { width: 14, height: 14, borderRadius: 4, borderWidth: 1, marginRight: 8 },
  icon: { fontSize: 14, marginRight: 4 },
  rowLabel: { fontSize: 13, fontWeight: '500', flex: 1 },
  toggle: {
    width: 36,
    height: 20,
    borderRadius: 999,
    borderWidth: 1,
    padding: 1,
    justifyContent: 'center',
  },
  thumb: {
    width: 16,
    height: 16,
    borderRadius: 999,
    boxShadow: '0 1px 1px rgba(0, 0, 0, 0.12)',
    elevation: 1,
  },
  empty: { fontSize: 13, textAlign: 'center', padding: 24 },
});
