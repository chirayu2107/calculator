import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Platform, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@maidtracker:onboarded';

const APP_ICON = require('../../assets/icon.png');

const SLIDES = [
  {
    title: 'Welcome to HomeStaff 👋',
    desc: 'The easiest way to track your household staff attendance and settle accounts without disputes.',
    isLogo: true
  },
  {
    title: '1. Add Your Staff 👥',
    desc: 'Tap "+ Add staff" to create profiles for your Maid, Cook, Driver, or Nanny with their specific monthly rates.',
    icon: '🧹'
  },
  {
    title: '2. Tap to Mark Attendance 🗓',
    desc: 'Simply tap a day on the calendar to mark them present or absent. We automatically calculate their salary!',
    icon: '👆'
  },
  {
    title: '3. Share with Family 👨‍👩‍👧‍👦',
    desc: 'Tap the gear icon ⚙️ to share your unique Family Code. Anyone in your family can mark attendance from their phone.',
    icon: '🤝'
  }
];

export const OnboardingModal = ({ theme }) => {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const onboarded = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (onboarded !== 'true') {
          setVisible(true);
        }
      } catch (e) {}
    };
    checkOnboarding();
  }, []);

  const handleNext = () => {
    if (step < SLIDES.length - 1) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (e) {}
    setVisible(false);
  };

  if (!visible) return null;

  const current = SLIDES[step];

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.mode === 'dark' ? '#1E293B' : '#ffffff', borderColor: theme.border }]}>
          {current.isLogo ? (
            <Image source={APP_ICON} style={styles.logo} resizeMode="contain" />
          ) : (
            <Text style={styles.icon}>{current.icon}</Text>
          )}
          <Text style={[styles.title, { color: theme.text }]}>{current.title}</Text>
          <Text style={[styles.desc, { color: theme.textMuted }]}>{current.desc}</Text>
          
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View 
                key={i} 
                style={[
                  styles.dot, 
                  { backgroundColor: i === step ? theme.primary : theme.border }
                ]} 
              />
            ))}
          </View>

          <View style={styles.actions}>
            {step < SLIDES.length - 1 ? (
              <Pressable onPress={handleNext} style={[styles.btn, { backgroundColor: theme.primary }]}>
                <Text style={styles.btnText}>Next</Text>
              </Pressable>
            ) : (
              <Pressable onPress={handleNext} style={[styles.btn, { backgroundColor: theme.primary }]}>
                <Text style={styles.btnText}>Get Started!</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 360, borderRadius: 24, padding: 24, borderWidth: 1, alignItems: 'center' },
  logo: { width: 80, height: 80, marginBottom: 16, borderRadius: 16 },
  icon: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  desc: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 32 },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 32 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  actions: { width: '100%' },
  btn: { height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
