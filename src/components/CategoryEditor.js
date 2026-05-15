import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CATEGORY_COLORS, CATEGORY_ICONS, RATE_TYPES } from '../storage/storage';

const RATE_TYPE_OPTIONS = [
  { value: RATE_TYPES.MONTHLY, label: 'Monthly' },
  { value: RATE_TYPES.PER_SESSION, label: 'Per session' },
  { value: RATE_TYPES.MONTHLY_WITH_TARGET, label: 'Monthly +target' },
];

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

const RateField = ({ label, value, onChange, theme, suffix }) => {
  const [draft, setDraft] = useState(String(value ?? 0));

  React.useEffect(() => {
    setDraft(String(value ?? 0));
  }, [value]);

  const commit = () => {
    const parsed = parseInt(draft, 10);
    const next = Number.isFinite(parsed) && parsed >= 0 ? parsed : value;
    setDraft(String(next));
    if (next !== value) onChange(next);
  };

  return (
    <View style={styles.rateField}>
      <Text style={[styles.fieldLabel, { color: theme.textMuted, fontFamily: theme.font }]}>
        {label}
      </Text>
      <View
        style={[
          styles.rateInputWrap,
          { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.currency, { color: theme.textSubtle, fontFamily: theme.font }]}>₹</Text>
        <TextInput
          style={[styles.rateInput, { color: theme.text, fontFamily: theme.font }]}
          keyboardType="number-pad"
          inputMode="numeric"
          value={draft}
          onChangeText={(t) => setDraft(t.replace(/[^0-9]/g, ''))}
          onBlur={commit}
          onSubmitEditing={commit}
          returnKeyType="done"
          maxLength={7}
          placeholder="0"
          placeholderTextColor={theme.textSubtle}
        />
        {suffix && (
          <Text style={[styles.unit, { color: theme.textSubtle, fontFamily: theme.font }]}>
            {suffix}
          </Text>
        )}
      </View>
    </View>
  );
};

const Stepper = ({ value, onChange, min = 1, max = 7, theme }) => (
  <View
    style={[
      styles.stepper,
      { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
    ]}
  >
    <Pressable
      onPress={() => onChange(Math.max(min, value - 1))}
      disabled={value <= min}
      style={({ pressed }) => [styles.stepperBtn, { opacity: value <= min ? 0.3 : pressed ? 0.5 : 1 }]}
      hitSlop={6}
    >
      <Text style={[styles.stepperGlyph, { color: theme.text }]}>−</Text>
    </Pressable>
    <Text style={[styles.stepperValue, { color: theme.text, fontFamily: theme.font }]}>
      {value}
    </Text>
    <Pressable
      onPress={() => onChange(Math.min(max, value + 1))}
      disabled={value >= max}
      style={({ pressed }) => [styles.stepperBtn, { opacity: value >= max ? 0.3 : pressed ? 0.5 : 1 }]}
      hitSlop={6}
    >
      <Text style={[styles.stepperGlyph, { color: theme.text }]}>+</Text>
    </Pressable>
  </View>
);

const SegmentedControl = ({ value, options, onChange, theme }) => (
  <View style={[styles.segmented, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
    {options.map((opt) => {
      const active = value === opt.value;
      return (
        <Pressable
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={({ pressed }) => [
            styles.segment,
            active && { backgroundColor: theme.surface, borderColor: theme.borderStrong || theme.border },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              { color: active ? theme.text : theme.textMuted, fontFamily: theme.font },
              active && { fontWeight: '700' },
            ]}
          >
            {opt.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const ColorRow = ({ value, onChange, theme }) => (
  <View style={styles.swatchRow}>
    {CATEGORY_COLORS.map((c) => {
      const active = c === value;
      return (
        <Pressable
          key={c}
          onPress={() => onChange(c)}
          style={({ pressed }) => [
            styles.swatch,
            { backgroundColor: c, borderColor: active ? theme.text : 'transparent' },
            pressed && { transform: [{ scale: 0.92 }] },
          ]}
          hitSlop={4}
        />
      );
    })}
  </View>
);

const IconRow = ({ value, onChange, theme }) => (
  <View style={styles.iconRow}>
    {CATEGORY_ICONS.map((ic) => {
      const active = ic === value;
      return (
        <Pressable
          key={ic}
          onPress={() => onChange(ic)}
          style={({ pressed }) => [
            styles.iconChip,
            {
              backgroundColor: active ? theme.surface : theme.surfaceAlt,
              borderColor: active ? theme.text : theme.border,
            },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.iconChipText}>{ic}</Text>
        </Pressable>
      );
    })}
  </View>
);

const CategoryCard = ({ category, theme, onUpdate, onDelete, canDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [nameDraft, setNameDraft] = useState(category.name);

  React.useEffect(() => setNameDraft(category.name), [category.name]);

  const commitName = () => {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === category.name) {
      setNameDraft(category.name);
      return;
    }
    onUpdate({ name: trimmed });
  };

  const isMonthly = category.rateType === RATE_TYPES.MONTHLY;
  const isPerSession = category.rateType === RATE_TYPES.PER_SESSION;
  const isWithTarget = category.rateType === RATE_TYPES.MONTHLY_WITH_TARGET;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: category.active ? category.color + '55' : theme.border,
          opacity: category.active ? 1 : 0.65,
        },
      ]}
    >
      {/* Top row: color dot + icon + name + active toggle */}
      <View style={styles.cardHeader}>
        <View style={[styles.colorDot, { backgroundColor: category.color }]} />
        {category.icon ? <Text style={styles.headerIcon}>{category.icon}</Text> : null}
        <TextInput
          style={[styles.nameInput, { color: theme.text, fontFamily: theme.font }]}
          value={nameDraft}
          onChangeText={setNameDraft}
          onBlur={commitName}
          onSubmitEditing={commitName}
          maxLength={24}
          returnKeyType="done"
          placeholder="Category name"
          placeholderTextColor={theme.textSubtle}
        />
        <Switch
          value={category.active}
          onValueChange={(v) => onUpdate({ active: v })}
          trackColor={{ true: category.color, false: theme.border }}
          thumbColor="#fff"
        />
      </View>

      {/* Quick rate row (collapsed view) */}
      <View style={styles.quickRow}>
        {isPerSession ? (
          <RateField
            label="Per session"
            value={category.ratePerSession}
            onChange={(v) => onUpdate({ ratePerSession: v })}
            theme={theme}
            suffix="/use"
          />
        ) : (
          <RateField
            label={isWithTarget ? 'Monthly (target-based)' : 'Monthly'}
            value={category.monthlyRate}
            onChange={(v) => onUpdate({ monthlyRate: v })}
            theme={theme}
            suffix="/mo"
          />
        )}
      </View>

      {/* Expanded controls */}
      {expanded && (
        <View style={styles.expanded}>
          <Text style={[styles.fieldLabel, { color: theme.textMuted, fontFamily: theme.font }]}>
            Rate type
          </Text>
          <SegmentedControl
            value={category.rateType}
            options={RATE_TYPE_OPTIONS}
            onChange={(v) => onUpdate({ rateType: v })}
            theme={theme}
          />

          {isWithTarget && (
            <View style={styles.rowBetween}>
              <Text style={[styles.fieldLabel, { color: theme.textMuted, fontFamily: theme.font }]}>
                Expected per week
              </Text>
              <Stepper
                value={category.expectedPerWeek || 1}
                onChange={(v) => onUpdate({ expectedPerWeek: v })}
                theme={theme}
              />
            </View>
          )}

          <Text style={[styles.fieldLabel, { color: theme.textMuted, fontFamily: theme.font }]}>
            Color
          </Text>
          <ColorRow value={category.color} onChange={(c) => onUpdate({ color: c })} theme={theme} />

          <Text style={[styles.fieldLabel, { color: theme.textMuted, fontFamily: theme.font }]}>
            Icon
          </Text>
          <IconRow value={category.icon} onChange={(ic) => onUpdate({ icon: ic })} theme={theme} />
        </View>
      )}

      {/* Footer actions */}
      <View style={styles.cardFooter}>
        <Pressable
          onPress={() => setExpanded((e) => !e)}
          style={({ pressed }) => [styles.footerBtn, pressed && { opacity: 0.6 }]}
        >
          <Text style={[styles.footerBtnText, { color: theme.textMuted, fontFamily: theme.font }]}>
            {expanded ? '▴ Less' : '▾ More options'}
          </Text>
        </Pressable>
        {canDelete && (
          <Pressable
            onPress={() =>
              confirm(
                `Delete "${category.name}"?`,
                'This category and all its attendance entries will be removed.',
                onDelete
              )
            }
            style={({ pressed }) => [styles.footerBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={[styles.footerBtnText, { color: theme.danger, fontFamily: theme.font }]}>
              Delete
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

export const CategoryEditor = ({ categories, theme, onUpdate, onDelete, onAdd }) => {
  const [newName, setNewName] = useState('');

  const submit = () => {
    if (!newName.trim()) return;
    onAdd({ name: newName.trim() });
    setNewName('');
  };

  return (
    <View>
      {categories.map((cat) => (
        <View key={cat.id} style={{ marginBottom: 12 }}>
          <CategoryCard
            category={cat}
            theme={theme}
            onUpdate={(patch) => onUpdate(cat.id, patch)}
            onDelete={() => onDelete(cat.id)}
            canDelete={categories.length > 1}
          />
        </View>
      ))}

      <View style={[styles.addRow, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
        <TextInput
          style={[styles.addInput, { color: theme.text, fontFamily: theme.font }]}
          placeholder="New category (e.g. Breakfast, Driver, Laundry)"
          placeholderTextColor={theme.textSubtle}
          value={newName}
          onChangeText={setNewName}
          onSubmitEditing={submit}
          returnKeyType="done"
          maxLength={24}
        />
        <Pressable
          onPress={submit}
          disabled={!newName.trim()}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: theme.primary, opacity: !newName.trim() ? 0.4 : pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </Pressable>
      </View>

      <Text style={[styles.helper, { color: theme.textSubtle, fontFamily: theme.font }]}>
        Toggle the switch to hide a category without losing data. Tap "More options" to change rate type, color, or icon.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 12, gap: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  headerIcon: { fontSize: 16 },
  nameInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 4,
  },
  quickRow: { gap: 6 },
  rateField: { gap: 4 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 2,
  },
  rateInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  currency: { fontSize: 13, marginRight: 4 },
  rateInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
    outlineStyle: 'none',
  },
  unit: { fontSize: 11, marginLeft: 4 },
  expanded: { gap: 8, paddingTop: 4 },
  segmented: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
  },
  segment: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentText: { fontSize: 11, fontWeight: '600' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  stepperBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  stepperGlyph: { fontSize: 16, fontWeight: '500' },
  stepperValue: { fontSize: 13, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  swatchRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  swatch: { width: 24, height: 24, borderRadius: 12, borderWidth: 2 },
  iconRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  iconChip: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  iconChipText: { fontSize: 16 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  footerBtn: { paddingVertical: 4, paddingHorizontal: 4 },
  footerBtnText: { fontSize: 12, fontWeight: '600' },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addInput: { flex: 1, height: 36, paddingHorizontal: 8, fontSize: 13, outlineStyle: 'none' },
  addBtn: { paddingHorizontal: 14, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  helper: { fontSize: 11, marginTop: 12, paddingHorizontal: 4, lineHeight: 16, opacity: 0.85 },
});
