import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';

export const LoginScreen = ({ theme }) => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    console.log('[LoginScreen] handleLogin triggered');
    if (!username || !pin) {
      setError('Please enter both username and pin');
      return;
    }
    setError('');
    
    console.log('[LoginScreen] Calling login context function...');
    login(username, pin);
    console.log('[LoginScreen] login context function called');
  };

  const fontFamily = theme.font;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.bg }]}
    >
      <View style={styles.meshContainer}>
        {theme.bgMesh.map((color, i) => (
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

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text, fontFamily }]}>MaidTracker</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted, fontFamily }]}>
            Enter your details to sync data across devices
          </Text>
        </View>

        <GlassCard theme={theme} style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textMuted, fontFamily }]}>Username</Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.surfaceAlt,
                  borderColor: theme.border,
                  fontFamily,
                },
              ]}
              placeholder="e.g. user"
              placeholderTextColor={theme.textSubtle}
              value={username}
              onChangeText={(t) => {
                setUsername(t);
                setError('');
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textMuted, fontFamily }]}>Passcode / PIN</Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.surfaceAlt,
                  borderColor: theme.border,
                  fontFamily,
                },
              ]}
              placeholder="e.g. maidcalc"
              placeholderTextColor={theme.textSubtle}
              value={pin}
              onChangeText={(t) => {
                setPin(t);
                setError('');
              }}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
          </View>

          {error ? (
            <Text style={[styles.errorText, { fontFamily }]}>{error}</Text>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: theme.primary },
              pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.buttonText, { fontFamily }]}>Start Syncing</Text>
            )}
          </Pressable>

          <Text style={[styles.hint, { color: theme.textSubtle, fontFamily }]}>
            Use the same credentials on other devices to keep your data consistent.
          </Text>
        </GlassCard>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  meshContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  meshCircle: {
    position: 'absolute',
    borderRadius: 999,
    filter: 'blur(80px)',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  card: {
    padding: 24,
    borderRadius: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  button: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
});
