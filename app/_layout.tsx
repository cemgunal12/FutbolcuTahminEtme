// Expo Router kök layout — SafeAreaProvider, Stack navigatör ve StatusBar.

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0a0d0a' },
          animation: 'slide_from_right',
        }}
      />
    </SafeAreaProvider>
  );
}
