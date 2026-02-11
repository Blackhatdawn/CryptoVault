import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

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
    const completed = await AsyncStorage.getItem('onboarding_completed');
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Hero Image */}
          <Image
            source={require('@/assets/images/onboarding-hero.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>CryptoVault</Text>
            <Text style={styles.subtitle}>Your secure crypto wallet</Text>
          </View>

          {/* Mode Toggle */}
          <View style={styles.modeToggle}>
            <Pressable
              style={[styles.modeButton, mode === 'login' && styles.modeButtonActive]}
              onPress={() => setMode('login')}
            >
              <Text style={[styles.modeText, mode === 'login' && styles.modeTextActive]}>
                Login
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeButton, mode === 'signup' && styles.modeButtonActive]}
              onPress={() => setMode('signup')}
            >
              <Text style={[styles.modeText, mode === 'signup' && styles.modeTextActive]}>
                Sign Up
              </Text>
            </Pressable>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {mode === 'signup' && (
              <Input
                label="Full Name"
                value={formData.name}
                onChangeText={(name) => setFormData({ ...formData, name })}
                placeholder="John Doe"
                autoCapitalize="words"
              />
            )}

            <Input
              label="Email"
              value={formData.email}
              onChangeText={(email) => setFormData({ ...formData, email })}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              value={formData.password}
              onChangeText={(password) => setFormData({ ...formData, password })}
              placeholder="••••••••"
              secureTextEntry
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              title={mode === 'login' ? 'Login' : 'Create Account'}
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
            />

            {/* Biometric Login */}
            {mode === 'login' && biometricEnabled && (
              <Pressable
                style={styles.biometricButton}
                onPress={handleBiometric}
              >
                <MaterialIcons name="fingerprint" size={32} color={Colors.primary} />
                <Text style={styles.biometricText}>Use biometric login</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  heroImage: {
    width: '100%',
    height: 250,
    marginBottom: Spacing.lg,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  modeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  modeButtonActive: {
    backgroundColor: Colors.primary,
  },
  modeText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  modeTextActive: {
    color: Colors.background,
  },
  form: {
    marginBottom: Spacing.lg,
  },
  error: {
    ...Typography.caption,
    color: Colors.error,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  biometricText: {
    ...Typography.body,
    color: Colors.primary,
    marginLeft: Spacing.sm,
    fontWeight: '600',
  },
});
