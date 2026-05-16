import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider } from '@/contexts/AuthContext';
import { WalletProvider } from '@/contexts/WalletContext';
import { AppLockProvider } from '@/contexts/AppLockContext';
import { AppLockOverlay } from '@/components/AppLockOverlay';
import { AlertProvider } from '@/template';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/theme';

// Routes that don't require authentication
const PUBLIC_ROUTES = new Set(['auth', 'onboarding', 'splash', '+not-found']);

/**
 * NavigationGuard sits inside all context providers so it can read auth state.
 * It redirects unauthenticated users to /auth and authenticated users away
 * from the auth/onboarding screens. Also owns the full-screen loading state
 * shown while the initial session check runs.
 */
function NavigationGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const topSegment = segments[0] as string | undefined;
    const isPublicRoute = !topSegment || PUBLIC_ROUTES.has(topSegment);

    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/auth');
    } else if (isAuthenticated && (topSegment === 'auth' || topSegment === 'onboarding')) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, router, segments]);

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#08091A' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="onboarding"        options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)"            options={{ headerShown: false }} />
      <Stack.Screen name="auth"              options={{ headerShown: false }} />
      <Stack.Screen name="deposit"           options={{ headerShown: false }} />
      <Stack.Screen name="withdraw"          options={{ headerShown: false }} />
      <Stack.Screen name="transfer"          options={{ headerShown: false }} />
      <Stack.Screen name="settings"          options={{ headerShown: false }} />
      <Stack.Screen name="notifications"     options={{ headerShown: false }} />
      <Stack.Screen name="price-alert"       options={{ headerShown: false }} />
      <Stack.Screen name="qr-scanner"        options={{ headerShown: false }} />
      <Stack.Screen name="splash"            options={{ headerShown: false }} />
      <Stack.Screen name="trading"           options={{ headerShown: false }} />
      <Stack.Screen name="price-detail"      options={{ headerShown: false }} />
      <Stack.Screen name="security-settings" options={{ headerShown: false }} />
      <Stack.Screen name="edit-profile"      options={{ headerShown: false }} />
      <Stack.Screen name="pin-setup"         options={{ headerShown: false }} />
      <Stack.Screen name="kyc"              options={{ headerShown: false }} />
      <Stack.Screen name="statements"       options={{ headerShown: false }} />
      <Stack.Screen name="change-password"  options={{ headerShown: false }} />
      <Stack.Screen name="payment-methods"  options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <WalletProvider>
            <AppLockProvider>
              <StatusBar style="light" />
              <NavigationGuard />
              <AppLockOverlay />
            </AppLockProvider>
          </WalletProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
