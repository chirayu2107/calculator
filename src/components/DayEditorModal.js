import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

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

const Row = ({ label, active, color, softColor, edgeColor, onPress, theme, isLast }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed, hovered }) => [
      styles.row,
      !isLast && { borderBottomWidth: 1, borderBottomColor: theme.separator },
      hovered && { backgroundColor: theme.surfaceHover },
      pressed && { opacity: 0.7 },
    ]}
  >
    <View
      style={[
        styles.swatch,
        { backgroundColor: active ? color : softColor, borderColor: active ? color : edgeColor },
      ]}
    />
    <Text style={[styles.rowLabel, { color: theme.text, fontFamily: theme.font }]}>{label}</Text>
    <View
      style={[
        styles.toggle,
        {
          backgroundColor: active ? color : theme.inputFill,
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

export const DayEditorModal = ({ visible, dateKey, entry, mealMode, theme, onToggle, onClose }) => {
  const showLunch = mealMode !== 'dinner';
  const showDinner = mealMode !== 'lunch';
  const e = entry || { lunch: false, dinner: false, cleaning: false };

  const items = [];
  if (showLunch)
    items.push({ key: 'lunch', label: 'Lunch', color: theme.lunch, softColor: theme.lunchSoft, edgeColor: theme.lunchEdge, active: e.lunch });
  if (showDinner)
    items.push({ key: 'dinner', label: 'Dinner', color: theme.dinner, softColor: theme.dinnerSoft, edgeColor: theme.dinnerEdge, active: e.dinner });
  items.push({ key: 'cleaning', label: 'Cleaning', color: theme.cleaning, softColor: theme.cleaningSoft, edgeColor: theme.cleaningEdge, active: e.cleaning });

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
          onPress={(e) => e.stopPropagation()}
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
          <View
            style={[
              styles.group,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            {items.map((it, idx) => (
              <Row
                key={it.key}
                label={it.label}
                color={it.color}
                softColor={it.softColor}
                edgeColor={it.edgeColor}
                active={it.active}
                onPress={() => onToggle(it.key)}
                theme={theme}
                isLast={idx === items.length - 1}
              />
            ))}
          </View>
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
    maxWidth: 360,
    borderRadius: 10,
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
  title: {
    fontSize: 13,
    fontWeight: '600',
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  close: {
    fontSize: 13,
    fontWeight: '500',
  },
  group: {
    margin: 12,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 10,
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
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
});
