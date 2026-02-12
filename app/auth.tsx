import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375 || height < 667;

export default function AuthScreen() {
  const router = useRouter();
  const { login, signup, loginWithBiometric, biometricEnabled, isAuthenticated } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const checkOnboarding = async () => {
    const completed = await AsyncStorage.getItem('@cryptovault/onboarding_completed');
    if (!completed) {
      router.replace('/onboarding');
    }
  };

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleSubmit = async () => {
    setError('');
    
    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (mode === 'signup' && !formData.name) {
      setError('Please enter your name');
      return;
    }
    
    setLoading(true);

    try {
      const result = mode === 'login' 
        ? await login({ email: formData.email, password: formData.password })
        : await signup(formData);

      if (result.success) {
        router.replace('/(tabs)');
      } else {
        setError(result.error || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBiometric = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await loginWithBiometric();
      if (result.success) {
        router.replace('/(tabs)');
      } else {
        setError(result.error || 'Biometric login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={Colors.gradientBackground as any}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Hero Section */}
            <View style={styles.heroSection}>
              {/* Logo Icon */}
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#8B5CF6', '#6366F1']}
                  style={styles.logoGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialIcons name="account-balance-wallet" size={isSmallScreen ? 40 : 48} color="#FFF" />
                </LinearGradient>
                {/* Glow ring */}
                <View style={styles.logoGlow} />
              </View>

              {/* Title */}
              <Text style={styles.appName}>CryptoVault</Text>
              <Text style={styles.tagline}>Secure Digital Wallet</Text>
            </View>

            {/* Auth Card */}
            <View style={styles.authCard}>
              {/* Glassmorphism overlay */}
              <View style={styles.glassOverlay} />
              
              <View style={styles.cardContent}>
                {/* Mode Toggle */}
                <View style={styles.modeToggle}>
                  <Pressable
                    style={[styles.modeButton, mode === 'login' && styles.modeButtonActive]}
                    onPress={() => setMode('login')}
                  >
                    <LinearGradient
                      colors={mode === 'login' ? ['#8B5CF6', '#6366F1'] : ['transparent', 'transparent']}
                      style={styles.modeGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={[styles.modeText, mode === 'login' && styles.modeTextActive]}>
                        Login
                      </Text>
                    </LinearGradient>
                  </Pressable>
                  
                  <Pressable
                    style={[styles.modeButton, mode === 'signup' && styles.modeButtonActive]}
                    onPress={() => setMode('signup')}
                  >
                    <LinearGradient
                      colors={mode === 'signup' ? ['#8B5CF6', '#6366F1'] : ['transparent', 'transparent']}
                      style={styles.modeGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={[styles.modeText, mode === 'signup' && styles.modeTextActive]}>
                        Sign Up
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>

                {/* Form */}
                <View style={styles.form}>
                  {mode === 'signup' && (
                    <View style={styles.inputWrapper}>
                      <Input
                        label="Full Name"
                        value={formData.name}
                        onChangeText={(name) => setFormData({ ...formData, name })}
                        placeholder="Enter your full name"
                        autoCapitalize="words"
                        leftIcon="person-outline"
                      />
                    </View>
                  )}

                  <View style={styles.inputWrapper}>
                    <Input
                      label="Email Address"
                      value={formData.email}
                      onChangeText={(email) => setFormData({ ...formData, email })}
                      placeholder="you@example.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      leftIcon="mail-outline"
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Input
                      label="Password"
                      value={formData.password}
                      onChangeText={(password) => setFormData({ ...formData, password })}
                      placeholder="Enter your password"
                      secureTextEntry
                      leftIcon="lock-outline"
                    />
                  </View>

                  {/* Error Message */}
                  {error ? (
                    <View style={styles.errorContainer}>
                      <MaterialIcons name="error-outline" size={16} color={Colors.error} />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  ) : null}

                  {/* Submit Button */}
                  <Button
                    title={mode === 'login' ? 'Login to Dashboard' : 'Create Account'}
                    onPress={handleSubmit}
                    loading={loading}
                    style={styles.submitButton}
                  />

                  {/* Biometric Login */}
                  {mode === 'login' && biometricEnabled && (
                    <View style={styles.divider}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>OR</Text>
                      <View style={styles.dividerLine} />
                    </View>
                  )}

                  {mode === 'login' && biometricEnabled && (
                    <Pressable
                      style={styles.biometricButton}
                      onPress={handleBiometric}
                      disabled={loading}
                    >
                      <View style={styles.biometricIcon}>
                        <MaterialIcons name="fingerprint" size={28} color={Colors.primary} />
                      </View>
                      <Text style={styles.biometricText}>Use Biometric Login</Text>
                    </Pressable>
                  )}
                </View>

                {/* Footer Note */}
                <View style={styles.footerNote}>
                  <MaterialIcons name="security" size={14} color={Colors.textMuted} />
                  <Text style={styles.footerText}>
                    {mode === 'login' 
                      ? 'Your data is encrypted and secure'
                      : 'By signing up, you agree to our Terms & Privacy Policy'
                    }
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: isSmallScreen ? Spacing.md : Spacing.lg,
    paddingVertical: isSmallScreen ? Spacing.lg : Spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: isSmallScreen ? Spacing.lg : Spacing.xl,
    paddingTop: isSmallScreen ? Spacing.sm : Spacing.md,
  },
  logoContainer: {
    width: isSmallScreen ? 100 : 120,
    height: isSmallScreen ? 100 : 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    position: 'relative',
  },
  logoGradient: {
    width: isSmallScreen ? 80 : 96,
    height: isSmallScreen ? 80 : 96,
    borderRadius: isSmallScreen ? 40 : 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.xl,
  },
  logoGlow: {
    position: 'absolute',
    width: isSmallScreen ? 100 : 120,
    height: isSmallScreen ? 100 : 120,
    borderRadius: isSmallScreen ? 50 : 60,
    borderWidth: 2,
    borderColor: Colors.primaryGlow,
    opacity: 0.3,
  },
  appName: {
    fontSize: isSmallScreen ? 28 : 36,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  tagline: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: isSmallScreen ? 14 : 16,
  },
  authCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    position: 'relative',
    ...Shadows.lg,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(139, 92, 246, 0.02)',
  },
  cardContent: {
    padding: isSmallScreen ? Spacing.md : Spacing.lg,
    position: 'relative',
    zIndex: 1,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: isSmallScreen ? Spacing.md : Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeButton: {
    flex: 1,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  modeGradient: {
    paddingVertical: isSmallScreen ? Spacing.sm : Spacing.md,
    alignItems: 'center',
  },
  modeText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: isSmallScreen ? 14 : 16,
  },
  modeTextActive: {
    color: '#FFF',
  },
  form: {
    marginBottom: Spacing.md,
  },
  inputWrapper: {
    marginBottom: isSmallScreen ? Spacing.sm : Spacing.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorGlow,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    flex: 1,
    fontSize: isSmallScreen ? 12 : 14,
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: isSmallScreen ? Spacing.md : Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginHorizontal: Spacing.md,
    fontWeight: '600',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: isSmallScreen ? Spacing.sm : Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderFocus,
  },
  biometricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  biometricText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    fontSize: isSmallScreen ? 14 : 16,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerText: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    flex: 1,
    fontSize: isSmallScreen ? 11 : 12,
  },
});
