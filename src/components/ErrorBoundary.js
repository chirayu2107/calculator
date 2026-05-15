import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { logger } from '../utils/logger';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    logger.error('[ErrorBoundary]', error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    const { theme, children } = this.props;
    if (!error) return children;

    const bg = (theme && theme.bg) || '#0F172A';
    const text = (theme && theme.text) || '#F8FAFC';
    const muted = (theme && theme.textMuted) || '#94A3B8';
    const primary = (theme && theme.primary) || '#6366F1';

    return (
      <View style={[styles.root, { backgroundColor: bg }]}>
        <Text style={[styles.title, { color: text }]}>Something went wrong</Text>
        <Text style={[styles.body, { color: muted }]}>
          The app hit an unexpected error. Try restarting — your data is safe.
        </Text>
        <Pressable
          onPress={this.reset}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  body: { fontSize: 14, lineHeight: 21, textAlign: 'center', marginBottom: 24, maxWidth: 320 },
  button: { paddingHorizontal: 24, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
