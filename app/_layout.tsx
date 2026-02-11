import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/contexts/AuthContext';
import { WalletProvider } from '@/contexts/WalletContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <WalletProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#0a0a0a' },
            }}
          >
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="deposit" options={{ headerShown: false }} />
            <Stack.Screen name="withdraw" options={{ headerShown: false }} />
            <Stack.Screen name="transfer" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen name="notifications" options={{ headerShown: false }} />
            <Stack.Screen name="price-alert" options={{ headerShown: false }} />
            <Stack.Screen name="qr-scanner" options={{ headerShown: false }} />
            <Stack.Screen name="splash" options={{ headerShown: false }} />
          </Stack>
        </WalletProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
