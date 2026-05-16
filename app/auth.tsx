import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, Pressable, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn, ZoomIn } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

const { width, height } = Dimensions.get('window');
const isSmall  = width < 375 || height < 667;

const FEATURES = [
  { icon: 'security',            label: 'Bank-grade security'         },
  { icon: 'bolt',                label: 'Instant transfers'           },
  { icon: 'show-chart',          label: 'Real-time price tracking'    },
  { icon: 'fingerprint',         label: 'Biometric authentication'    },
];

export default function AuthScreen() {
  const router = useRouter();
  const { login, signup, loginWithBiometric, biometricEnabled, isAuthenticated } = useAuth();
  const [mode, setMode]       = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

  useEffect(() => {
    (async () => {
      const done = await AsyncStorage.getItem('@cryptovault/onboarding_completed');
      if (!done) router.replace('/onboarding');
    })();
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) router.replace('/(tabs)');
  }, [isAuthenticated, router]);

  const handleSubmit = async () => {
    setError('');
    if (!formData.email || !formData.password) { setError('Please fill in all fields'); return; }
    if (mode === 'signup' && !formData.name)     { setError('Please enter your name');    return; }
    setLoading(true);
    try {
      const result = mode === 'login'
        ? await login({ email: formData.email, password: formData.password })
        : await signup(formData);
      if (result.success) router.replace('/(tabs)');
      else setError(result.error || 'Authentication failed');
    } finally { setLoading(false); }
  };

  const handleBiometric = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await loginWithBiometric();
      if (result.success) router.replace('/(tabs)');
      else setError(result.error || 'Biometric login failed');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#08091A','#0F1128','#08091A']} style={StyleSheet.absoluteFill} />

      {/* Glow decorations */}
      <View style={[styles.glowBlob, styles.blob1]} />
      <View style={[styles.glowBlob, styles.blob2]} />

      <SafeAreaView style={styles.safe} edges={['top','bottom']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* ─── Logo / Branding ────────────────────────────────────── */}
            <Animated.View entering={FadeIn.duration(600)} style={styles.brand}>
              <View style={styles.logoRingOuter}>
                <View style={styles.logoRingInner}>
                  <LinearGradient colors={['#7C3AED','#4F46E5','#2563EB']} style={styles.logoGrad}>
                    <MaterialIcons name="account-balance-wallet" size={isSmall ? 36 : 44} color="#FFF" />
                  </LinearGradient>
                </View>
              </View>
              <Text style={styles.appName}>CryptoVault</Text>
              <Text style={styles.tagline}>Enterprise Digital Wallet</Text>

              {/* Feature pills */}
              <View style={styles.featurePills}>
                {FEATURES.map((f, i) => (
                  <Animated.View key={i} entering={ZoomIn.delay(300 + i * 80).springify()}>
                    <View style={styles.pill}>
                      <MaterialIcons name={f.icon as any} size={13} color={Colors.primary} />
                      <Text style={styles.pillText}>{f.label}</Text>
                    </View>
                  </Animated.View>
                ))}
              </View>
            </Animated.View>

            {/* ─── Auth Card ──────────────────────────────────────────── */}
            <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.card}>
              {/* Glass overlay */}
              <View style={styles.cardGlass} />

              {/* Mode toggle */}
              <View style={styles.toggle}>
                {(['login','signup'] as const).map(m => (
                  <Pressable key={m} style={styles.toggleItem} onPress={() => { setMode(m); setError(''); }}>
                    <LinearGradient
                      colors={mode === m ? ['#7C3AED','#4F46E5'] : ['transparent','transparent']}
                      style={styles.toggleGrad}
                    >
                      <Text style={[styles.toggleText, mode === m && styles.toggleTextActive]}>
                        {m === 'login' ? 'Sign In' : 'Sign Up'}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                ))}
              </View>

              {/* Form */}
              <View style={styles.form}>
                {mode === 'signup' && (
                  <Animated.View entering={FadeInDown.duration(250)} style={styles.inputWrap}>
                    <Input
                      label="Full Name"
                      value={formData.name}
                      onChangeText={v => setFormData({ ...formData, name: v })}
                      placeholder="John Doe"
                      autoCapitalize="words"
                      leftIcon="person-outline"
                    />
                  </Animated.View>
                )}
                <View style={styles.inputWrap}>
                  <Input
                    label="Email Address"
                    value={formData.email}
                    onChangeText={v => setFormData({ ...formData, email: v })}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon="mail-outline"
                  />
                </View>
                <View style={styles.inputWrap}>
                  <Input
                    label="Password"
                    value={formData.password}
                    onChangeText={v => setFormData({ ...formData, password: v })}
                    placeholder={mode === 'login' ? 'Enter your password' : 'Min. 8 characters'}
                    secureTextEntry
                    leftIcon="lock-outline"
                  />
                </View>

                {/* Error */}
                {error ? (
                  <Animated.View entering={FadeInDown.duration(200)} style={styles.errorBox}>
                    <MaterialIcons name="error-outline" size={16} color={Colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </Animated.View>
                ) : null}

                {/* Submit */}
                <Button
                  title={mode === 'login' ? 'Sign In to Dashboard' : 'Create Account'}
                  onPress={handleSubmit}
                  loading={loading}
                  style={styles.submitBtn}
                />

                {/* Biometric */}
                {mode === 'login' && biometricEnabled && (
                  <>
                    <View style={styles.divider}>
                      <View style={styles.divLine} />
                      <Text style={styles.divText}>OR</Text>
                      <View style={styles.divLine} />
                    </View>
                    <Pressable style={styles.bioBtn} onPress={handleBiometric} disabled={loading}>
                      <LinearGradient colors={[Colors.primaryGlow2, 'transparent']} style={styles.bioGrad}>
                        <View style={styles.bioIcon}>
                          <MaterialIcons name="fingerprint" size={28} color={Colors.primary} />
                        </View>
                        <View>
                          <Text style={styles.bioTitle}>Biometric Login</Text>
                          <Text style={styles.bioSub}>Use Face ID or fingerprint</Text>
                        </View>
                      </LinearGradient>
                    </Pressable>
                  </>
                )}
              </View>

              {/* Footer note */}
              <View style={styles.note}>
                <MaterialIcons name="shield" size={13} color={Colors.textMuted} />
                <Text style={styles.noteText}>
                  {mode === 'login'
                    ? 'Your data is end-to-end encrypted and secure'
                    : 'By signing up, you agree to our Terms & Privacy Policy'}
                </Text>
              </View>
            </Animated.View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  glowBlob: { position: 'absolute', borderRadius: 9999, opacity: 0.12 },
  blob1: { width: 280, height: 280, top: -60,  left: -80,  backgroundColor: Colors.primary },
  blob2: { width: 200, height: 200, bottom: 60, right: -60, backgroundColor: Colors.info   },

  scroll: {
    flexGrow: 1, paddingHorizontal: isSmall ? Spacing.md : Spacing.lg,
    paddingVertical: isSmall ? Spacing.md : Spacing.lg,
  },

  // Branding
  brand: { alignItems: 'center', marginBottom: Spacing.xl, paddingTop: isSmall ? Spacing.sm : Spacing.lg },
  logoRingOuter: {
    width: isSmall ? 110 : 130, height: isSmall ? 110 : 130,
    borderRadius: isSmall ? 55 : 65,
    backgroundColor: 'rgba(124,58,237,0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  logoRingInner: {
    width: isSmall ? 88 : 104, height: isSmall ? 88 : 104,
    borderRadius: isSmall ? 44 : 52,
    backgroundColor: 'rgba(124,58,237,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoGrad: {
    width: isSmall ? 70 : 84, height: isSmall ? 70 : 84,
    borderRadius: isSmall ? 35 : 42,
    alignItems: 'center', justifyContent: 'center', ...Shadows.primaryGlow,
  },
  appName:  { fontSize: isSmall ? 26 : 32, fontWeight: '800', color: Colors.text, letterSpacing: -0.8, marginBottom: 4 },
  tagline:  { ...Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.md },
  featurePills: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.xs, maxWidth: 320 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.full,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.border,
  },
  pillText: { ...Typography.micro, color: Colors.textSecondary, fontWeight: '600' },

  // Card
  card: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.xxl,
    borderWidth: 1, borderColor: Colors.borderMedium,
    overflow: 'hidden', position: 'relative', ...Shadows.xl,
  },
  cardGlass: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(124,58,237,0.025)' },

  // Toggle
  toggle: {
    flexDirection: 'row', margin: Spacing.lg, marginBottom: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    padding: 4, borderWidth: 1, borderColor: Colors.border,
  },
  toggleItem: { flex: 1, borderRadius: BorderRadius.sm, overflow: 'hidden' },
  toggleGrad: { paddingVertical: isSmall ? 10 : Spacing.md, alignItems: 'center' },
  toggleText: { ...Typography.bodyBold, color: Colors.textSecondary, fontSize: isSmall ? 14 : 16 },
  toggleTextActive: { color: '#FFF' },

  // Form
  form: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  inputWrap: { marginBottom: isSmall ? Spacing.sm : Spacing.md },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    backgroundColor: Colors.errorGlow2, borderRadius: BorderRadius.md,
    padding: Spacing.sm, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: `${Colors.error}40`,
  },
  errorText: { ...Typography.caption, color: Colors.error, flex: 1, fontSize: isSmall ? 12 : 14 },
  submitBtn: { marginTop: Spacing.xs },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.md },
  divLine:  { flex: 1, height: 1, backgroundColor: Colors.border },
  divText:  { ...Typography.caption, color: Colors.textMuted, marginHorizontal: Spacing.md, fontWeight: '600' },

  // Biometric
  bioBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.borderFocus },
  bioGrad: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  bioIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primaryGlow2, alignItems: 'center', justifyContent: 'center',
  },
  bioTitle: { ...Typography.bodyBold, color: Colors.primary },
  bioSub:   { ...Typography.caption,  color: Colors.textMuted, marginTop: 2 },

  // Note
  note: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  noteText: { ...Typography.caption, color: Colors.textMuted, flex: 1, fontSize: isSmall ? 11 : 12 },
});
