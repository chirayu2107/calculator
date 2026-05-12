import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const FIELDS = [
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'cleaning', label: 'Cleaning' },
];

const Stepper = ({ value, onChange, min = 1, max = 7, theme }) => (
  <View
    style={[
      styles.stepperWrap,
      { backgroundColor: theme.inputFill, borderColor: theme.border },
    ]}
  >
    <Pressable
      onPress={() => onChange(Math.max(min, value - 1))}
      disabled={value <= min}
      style={({ pressed, hovered }) => [
        styles.stepperBtn,
        { opacity: value <= min ? 0.25 : pressed ? 0.4 : 1 },
        hovered && { backgroundColor: theme.surfaceHover },
      ]}
      hitSlop={6}
    >
      <Text style={[styles.stepperGlyph, { color: theme.text }]}>−</Text>
    </Pressable>
    <Text style={[styles.stepperValue, { color: theme.text, fontFamily: theme.font }]}>
      {value}×
    </Text>
    <Pressable
      onPress={() => onChange(Math.min(max, value + 1))}
      disabled={value >= max}
      style={({ pressed, hovered }) => [
        styles.stepperBtn,
        { opacity: value >= max ? 0.25 : pressed ? 0.4 : 1 },
        hovered && { backgroundColor: theme.surfaceHover },
      ]}
      hitSlop={6}
    >
      <Text style={[styles.stepperGlyph, { color: theme.text }]}>+</Text>
    </Pressable>
  </View>
);

export const RateInputs = ({
  monthlyRates,
  daysInMonth,
  cleaningPerWeek,
  onChangeMonthlyRate,
  onChangeCleaningPerWeek,
  theme,
  hideHeading,
}) => {
  const [drafts, setDrafts] = useState({
    lunch: String(monthlyRates.lunch),
    dinner: String(monthlyRates.dinner),
    cleaning: String(monthlyRates.cleaning),
  });

  useEffect(() => {
    setDrafts({
      lunch: String(monthlyRates.lunch),
      dinner: String(monthlyRates.dinner),
      cleaning: String(monthlyRates.cleaning),
    });
  }, [monthlyRates.lunch, monthlyRates.dinner, monthlyRates.cleaning]);

  const commit = (key) => {
    const parsed = parseInt(drafts[key], 10);
    const next = Number.isFinite(parsed) && parsed >= 0 ? parsed : monthlyRates[key];
    setDrafts((d) => ({ ...d, [key]: String(next) }));
    if (next !== monthlyRates[key]) onChangeMonthlyRate(key, next);
  };

  const expectedCleaning = (cleaningPerWeek * daysInMonth) / 7;
  const fontFamily = theme.font;

  return (
    <View>
      {!hideHeading && (
        <Text style={[styles.heading, { color: theme.textMuted, fontFamily }]}>
          Monthly rates
        </Text>
      )}

      <View
        style={[
          styles.group,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        {FIELDS.map((f, idx) => {
          const isLast = idx === FIELDS.length - 1;
          return (
            <View key={f.key}>
              <View style={styles.propertyRow}>
                <Text style={[styles.propLabel, { color: theme.textMuted, fontFamily }]}>
                  {f.label}
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    { backgroundColor: theme.inputFill, borderColor: theme.border },
                  ]}
                >
                  <Text style={[styles.currency, { color: theme.textSubtle, fontFamily }]}>₹</Text>
                  <TextInput
                    style={[styles.input, { color: theme.text, fontFamily }]}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    value={drafts[f.key]}
                    onChangeText={(t) =>
                      setDrafts((d) => ({ ...d, [f.key]: t.replace(/[^0-9]/g, '') }))
                    }
                    onBlur={() => commit(f.key)}
                    returnKeyType="done"
                    onSubmitEditing={() => commit(f.key)}
                    maxLength={7}
                    placeholder="0"
                    placeholderTextColor={theme.textSubtle}
                  />
                  <Text style={[styles.unit, { color: theme.textSubtle, fontFamily }]}>/mo</Text>
                </View>
              </View>
              {!isLast && (
                <View style={[styles.separator, { backgroundColor: theme.separator }]} />
              )}
            </View>
          );
        })}
      </View>

      <Text style={[styles.hint, { color: theme.textSubtle, fontFamily }]}>
        Lunch ₹{((parseInt(drafts.lunch, 10) || 0) / daysInMonth).toFixed(2)}/day · Dinner ₹
        {((parseInt(drafts.dinner, 10) || 0) / daysInMonth).toFixed(2)}/day · {daysInMonth} days
      </Text>

      <Text style={[styles.heading, styles.headingSpaced, { color: theme.textMuted, fontFamily }]}>
        Cleaning target
      </Text>
      <View
        style={[
          styles.group,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View style={styles.propertyRow}>
          <Text style={[styles.propLabel, { color: theme.textMuted, fontFamily }]}>
            Frequency
          </Text>
          <Stepper value={cleaningPerWeek} onChange={onChangeCleaningPerWeek} theme={theme} />
        </View>
      </View>
      <Text style={[styles.hint, { color: theme.textSubtle, fontFamily }]}>
        ₹
        {expectedCleaning > 0
          ? ((parseInt(drafts.cleaning, 10) || 0) / expectedCleaning).toFixed(2)
          : '0.00'}{' '}
        / session · ~{expectedCleaning.toFixed(1)} sessions / mo
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginLeft: 4,
    marginBottom: 8,
  },
  headingSpaced: {
    marginTop: 24,
  },
  group: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
  },
  propLabel: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 130,
  },
  currency: {
    fontSize: 12,
    marginRight: 2,
  },
  input: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    paddingVertical: 2,
    outlineStyle: 'none',
  },
  unit: {
    fontSize: 11,
    marginLeft: 4,
  },
  separator: {
    height: 1,
    marginLeft: 12,
  },
  hint: {
    fontSize: 11,
    marginTop: 8,
    marginLeft: 4,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperGlyph: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 16,
  },
  stepperValue: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    minWidth: 36,
    textAlign: 'center',
  },
});
