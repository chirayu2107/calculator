import React from 'react';
import { ActivityIndicator, StyleSheet, useColorScheme, View, Platform } from 'react-native';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  document.title = 'HomeStaff';
}
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { getTheme } from './src/theme/theme';

const Root = ({ theme }) => {
  const { authReady, user, dataReady } = useApp();

  if (!authReady) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.bg }]}>
        <ActivityIndicator color={theme.text} />
      </View>
    );
  }

  if (!user) return <AuthScreen theme={theme} />;

  if (!dataReady) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.bg }]}>
        <ActivityIndicator color={theme.text} />
      </View>
    );
  }

  return <HomeScreen theme={theme} />;
};

export default function App() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);

  return (
    <SafeAreaProvider>
      <ErrorBoundary theme={theme}>
        <AppProvider>
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
          <Root theme={theme} />
        </AppProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
