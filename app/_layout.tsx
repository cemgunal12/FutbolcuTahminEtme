// Expo Router kök layout dosyası.
// NativeWind CSS import'u ve Stack navigatör burada tanımlanır.
// Tüm sayfalar bu layout içinde render edilir.

import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0f172a' },
          animation: 'slide_from_right',
        }}
      />
    </>
  );
}
