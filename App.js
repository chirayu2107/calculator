import React from 'react';
import { ActivityIndicator, StyleSheet, useColorScheme, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { getTheme } from './src/theme/theme';

import { LoginScreen } from './src/screens/LoginScreen';

const Root = ({ theme }) => {
  const { ready, syncId } = useApp();
  
  console.log('[Root] State:', { ready, syncId });

  if (!ready) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.bg }]}>
        <ActivityIndicator color={theme.text} />
      </View>
    );
  }

  if (!syncId) {
    console.log('[Root] Rendering LoginScreen');
    return <LoginScreen theme={theme} />;
  }

  console.log('[Root] Rendering HomeScreen');
  return <HomeScreen theme={theme} />;
};

export default function App() {
  const scheme = useColorScheme();
  const theme = getTheme(scheme);

  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Root theme={theme} />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
