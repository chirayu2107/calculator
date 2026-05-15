import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';

const APP_ICON = require('../../assets/icon.png');

const MODE = { LOGIN: 'login', SIGNUP: 'signup', RESET: 'reset' };

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || '');

const DEFAULT_EMAIL = __DEV__ ? 'test@local.dev' : '';
const DEFAULT_PASSWORD = __DEV__ ? 'test1234' : '';

export const AuthScreen = ({ theme }) => {
  const { signIn, signUp, sendReset } = useApp();
  const [mode, setMode] = useState(MODE.LOGIN);
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [confirm, setConfirm] = useState(DEFAULT_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const fontFamily = theme.font;
  const isReset = mode === MODE.RESET;
  const isSignup = mode === MODE.SIGNUP;

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setInfo('');
  };

  const handleSubmit = async () => {
    setError('');
    setInfo('');
    if (!isValidEmail(email)) {
      setError('Please enter a valid email.');
      return;
    }
    if (!isReset) {
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (isSignup && password !== confirm) {
        setError('Passwords do not match.');
        return;
      }
    }
    setLoading(true);
    try {
      let res;
      if (isReset) res = await sendReset(email);
      else if (isSignup) res = await signUp(email, password);
      else res = await signIn(email, password);

      if (res && res.error) setError(res.error);
      else if (isReset) setInfo('Check your inbox for a password reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.bg }]}
    >
      <View style={styles.meshContainer} pointerEvents="none">
        {(theme.bgMesh || []).map((color, i) => (
          <View
            key={i}
            style={[
              styles.meshCircle,
              {
                backgroundColor: color,
                top: `${20 + i * 25}%`,
                left: `${10 + i * 30}%`,
                width: 300 + i * 100,
                height: 300 + i * 100,
                opacity: 0.4,
              },
            ]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Image source={APP_ICON} style={styles.logo} resizeMode="contain" />
            <Text style={[styles.title, { color: theme.text, fontFamily }]}>Maid Tracker</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted, fontFamily }]}>
              {isSignup
                ? 'Create an account to sync across devices'
                : isReset
                ? 'We’ll email you a reset link'
                : 'Sign in to your account'}
            </Text>
          </View>

          <GlassCard theme={theme} style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textMuted, fontFamily }]}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, backgroundColor: theme.surfaceAlt, borderColor: theme.border, fontFamily },
                ]}
                placeholder="you@example.com"
                placeholderTextColor={theme.textSubtle}
                value={email}
                onChangeText={(t) => { setEmail(t); setError(''); }}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                autoCorrect={false}
                textContentType="emailAddress"
              />
            </View>

            {!isReset && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textMuted, fontFamily }]}>Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    { color: theme.text, backgroundColor: theme.surfaceAlt, borderColor: theme.border, fontFamily },
                  ]}
                  placeholder="At least 6 characters"
                  placeholderTextColor={theme.textSubtle}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setError(''); }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                  textContentType={isSignup ? 'newPassword' : 'password'}
                />
              </View>
            )}

            {isSignup && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textMuted, fontFamily }]}>Confirm password</Text>
                <TextInput
                  style={[
                    styles.input,
                    { color: theme.text, backgroundColor: theme.surfaceAlt, borderColor: theme.border, fontFamily },
                  ]}
                  placeholder="Re-enter password"
                  placeholderTextColor={theme.textSubtle}
                  value={confirm}
                  onChangeText={(t) => { setConfirm(t); setError(''); }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry
                />
              </View>
            )}

            {error ? <Text style={[styles.errorText, { fontFamily }]}>{error}</Text> : null}
            {info ? <Text style={[styles.infoText, { color: theme.primary, fontFamily }]}>{info}</Text> : null}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: theme.primary },
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.buttonText, { fontFamily }]}>
                  {isReset ? 'Send reset link' : isSignup ? 'Create account' : 'Sign in'}
                </Text>
              )}
            </Pressable>

            <View style={styles.linkRow}>
              {mode === MODE.LOGIN && (
                <>
                  <Pressable onPress={() => switchMode(MODE.RESET)} hitSlop={8}>
                    <Text style={[styles.linkText, { color: theme.textMuted, fontFamily }]}>Forgot password?</Text>
                  </Pressable>
                  <Pressable onPress={() => switchMode(MODE.SIGNUP)} hitSlop={8}>
                    <Text style={[styles.linkText, { color: theme.primary, fontFamily }]}>Create account</Text>
                  </Pressable>
                </>
              )}
              {mode === MODE.SIGNUP && (
                <Pressable onPress={() => switchMode(MODE.LOGIN)} hitSlop={8} style={styles.linkCenter}>
                  <Text style={[styles.linkText, { color: theme.primary, fontFamily }]}>
                    Already have an account? Sign in
                  </Text>
                </Pressable>
              )}
              {mode === MODE.RESET && (
                <Pressable onPress={() => switchMode(MODE.LOGIN)} hitSlop={8} style={styles.linkCenter}>
                  <Text style={[styles.linkText, { color: theme.primary, fontFamily }]}>
                    Back to sign in
                  </Text>
                </Pressable>
              )}
            </View>

            <Text style={[styles.legal, { color: theme.textSubtle, fontFamily }]}>
              By continuing, you agree to our Terms and Privacy Policy.
            </Text>
          </GlassCard>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  meshContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  meshCircle: { position: 'absolute', borderRadius: 999, filter: 'blur(80px)' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  content: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  header: { alignItems: 'center', marginBottom: 28 },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 20,
    marginBottom: 16,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 18px 40px rgba(99, 102, 241, 0.35)' }
      : {
          shadowColor: '#6366F1',
          shadowOpacity: 0.35,
          shadowOffset: { width: 0, height: 14 },
          shadowRadius: 28,
          elevation: 10,
        }),
  },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -1, marginBottom: 6 },
  subtitle: { fontSize: 14, textAlign: 'center', opacity: 0.85 },
  card: { padding: 22, borderRadius: 22 },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginLeft: 4,
  },
  input: { height: 48, borderRadius: 10, paddingHorizontal: 14, fontSize: 15, borderWidth: 1 },
  button: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  errorText: { color: '#EF4444', fontSize: 13, marginBottom: 10, textAlign: 'center' },
  infoText: { fontSize: 13, marginBottom: 10, textAlign: 'center' },
  linkRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  linkCenter: { width: '100%', alignItems: 'center' },
  linkText: { fontSize: 13, fontWeight: '600' },
  legal: { fontSize: 11, textAlign: 'center', marginTop: 18, opacity: 0.8 },
});
