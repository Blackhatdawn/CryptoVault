import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, Pressable, Dimensions, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInDown, FadeIn, ZoomIn, useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withSequence, withRepeat, interpolate,
  Extrapolation, runOnJS, withDelay, FadeOut, SlideInRight, SlideOutLeft,
  SlideInLeft, SlideOutRight,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

const { width, height } = Dimensions.get('window');
const isSmall = width < 375 || height < 667;

// ─── Password strength ────────────────────────────────────────────────────────
function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { score: 1, label: 'Weak',   color: Colors.error   },
    { score: 2, label: 'Fair',   color: Colors.warning  },
    { score: 3, label: 'Good',   color: Colors.info     },
    { score: 4, label: 'Strong', color: Colors.success  },
  ];
  return levels[score - 1] ?? { score: 0, label: '', color: 'transparent' };
}

// ─── Animated floating-label input ───────────────────────────────────────────
interface FloatInputProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  secureTextEntry?: boolean;
  icon: string;
  autoFocus?: boolean;
}

const FloatInput: React.FC<FloatInputProps> = ({
  label, value, onChangeText, keyboardType = 'default',
  autoCapitalize = 'none', secureTextEntry: isSecure = false,
  icon, autoFocus,
}) => {
  const [focused, setFocused] = useState(false);
  const [secure, setSecure] = useState(isSecure);
  const floatAnim  = useSharedValue(value ? 1 : 0);
  const borderAnim = useSharedValue(0);
  const scaleAnim  = useSharedValue(1);

  const active = focused || !!value;

  useEffect(() => {
    floatAnim.value  = withTiming(active ? 1 : 0, { duration: 200 });
    borderAnim.value = withTiming(focused ? 1 : 0, { duration: 200 });
  }, [focused, active]);

  const labelStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(floatAnim.value, [0, 1], [0, -22], Extrapolation.CLAMP) },
      { scale:      interpolate(floatAnim.value, [0, 1], [1, 0.82], Extrapolation.CLAMP) },
    ],
    color: interpolate(
      borderAnim.value, [0, 1],
      [Colors.textMuted as any, Colors.primary as any],
    ) as any,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(124,58,237,${interpolate(borderAnim.value, [0, 1], [0.12, 0.7])})`,
    backgroundColor: `rgba(15,17,40,${interpolate(borderAnim.value, [0, 1], [1, 0.9])})`,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(borderAnim.value, [0, 1], [0.45, 1]),
    transform: [{ scale: interpolate(borderAnim.value, [0, 1], [1, 1.1]) }],
  }));

  const handleFocus = () => {
    setFocused(true);
    scaleAnim.value = withSequence(
      withTiming(1.015, { duration: 100 }),
      withTiming(1,     { duration: 100 }),
    );
  };
  const handleBlur = () => setFocused(false);

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  return (
    <Animated.View style={wrapStyle}>
      <Animated.View style={[styles.inputWrap, containerStyle]}>
        {/* Icon */}
        <Animated.View style={[styles.inputIconBox, iconStyle]}>
          <MaterialIcons name={icon as any} size={18} color={focused ? Colors.primary : Colors.textMuted} />
        </Animated.View>

        {/* Floating label */}
        <View style={styles.inputInner}>
          <Animated.Text style={[styles.floatLabel, labelStyle]}>{label}</Animated.Text>
          <TextInput
            style={styles.textInput}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            secureTextEntry={secure}
            autoFocus={autoFocus}
            placeholderTextColor="transparent"
            placeholder=" "
          />
        </View>

        {/* Eye toggle */}
        {isSecure && (
          <Pressable onPress={() => setSecure(s => !s)} style={styles.eyeBtn} hitSlop={8}>
            <MaterialIcons
              name={secure ? 'visibility-off' : 'visibility'}
              size={18}
              color={focused ? Colors.primary : Colors.textMuted}
            />
          </Pressable>
        )}
      </Animated.View>
    </Animated.View>
  );
};

// ─── Password strength bar ────────────────────────────────────────────────────
const StrengthBar: React.FC<{ password: string }> = ({ password }) => {
  const { score, label, color } = getPasswordStrength(password);
  if (!password) return null;
  return (
    <Animated.View entering={FadeInDown.duration(200)} style={styles.strengthWrap}>
      <View style={styles.strengthBars}>
        {[1,2,3,4].map(i => (
          <Animated.View
            key={i}
            style={[
              styles.strengthBar,
              { backgroundColor: i <= score ? color : Colors.surfaceHighlight },
            ]}
          />
        ))}
      </View>
      {label ? <Text style={[styles.strengthLabel, { color }]}>{label}</Text> : null}
    </Animated.View>
  );
};

// ─── Animated tab indicator ───────────────────────────────────────────────────
const TABS = ['login', 'signup'] as const;
type Mode = typeof TABS[number];

const TabToggle: React.FC<{ mode: Mode; onChange: (m: Mode) => void }> = ({ mode, onChange }) => {
  const indicatorX = useSharedValue(mode === 'login' ? 0 : 1);
  const [slotWidth, setSlotWidth] = useState(0);

  useEffect(() => {
    indicatorX.value = withSpring(mode === 'login' ? 0 : 1, { damping: 20, stiffness: 200 });
  }, [mode]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value * slotWidth }],
    width: slotWidth,
  }));

  return (
    <View
      style={styles.tabRow}
      onLayout={e => setSlotWidth(e.nativeEvent.layout.width / 2)}
    >
      {/* Sliding indicator */}
      <Animated.View style={[styles.tabIndicator, indicatorStyle]}>
        <LinearGradient colors={['#7C3AED','#4F46E5']} style={StyleSheet.absoluteFill as any} />
      </Animated.View>

      {TABS.map(t => (
        <Pressable
          key={t}
          style={styles.tabItem}
          onPress={() => onChange(t)}
          hitSlop={4}
        >
          <Text style={[styles.tabLabel, mode === t && styles.tabLabelActive]}>
            {t === 'login' ? 'Sign In' : 'Sign Up'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function AuthScreen() {
  const router = useRouter();
  const { login, signup, loginWithBiometric, biometricEnabled, isAuthenticated } = useAuth();

  const [mode, setMode]         = useState<Mode>('login');
  const [prevMode, setPrevMode] = useState<Mode>('login');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

  // shake animation
  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));

  // logo pulse
  const logoPulse = useSharedValue(1);
  useEffect(() => {
    logoPulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 2000 }),
        withTiming(1,    { duration: 2000 }),
      ),
      -1, true,
    );
  }, []);
  const logoPulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: logoPulse.value }] }));

  const triggerShake = () => {
    shakeX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withRepeat(withTiming(10, { duration: 80 }), 4, true),
      withTiming(0,  { duration: 50 }),
    );
  };

  useEffect(() => {
    (async () => {
      const done = await AsyncStorage.getItem('@cryptovault/onboarding_completed');
      if (!done) router.replace('/onboarding');
    })();
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) router.replace('/(tabs)');
  }, [isAuthenticated, router]);

  const handleModeChange = (m: Mode) => {
    if (m === mode) return;
    setPrevMode(mode);
    setMode(m);
    setError('');
    setFormData({ email: '', password: '', name: '' });
  };

  const handleSubmit = async () => {
    setError('');
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      triggerShake();
      return;
    }
    if (mode === 'signup' && !formData.name) {
      setError('Please enter your name');
      triggerShake();
      return;
    }
    setLoading(true);
    try {
      const result = mode === 'login'
        ? await login({ email: formData.email, password: formData.password })
        : await signup(formData);
      if (result.success) router.replace('/(tabs)');
      else {
        setError(result.error || 'Authentication failed');
        triggerShake();
      }
    } finally { setLoading(false); }
  };

  const handleBiometric = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await loginWithBiometric();
      if (result.success) router.replace('/(tabs)');
      else {
        setError(result.error || 'Biometric login failed');
        triggerShake();
      }
    } finally { setLoading(false); }
  };

  const enterAnim = mode !== prevMode
    ? (mode === 'signup' ? SlideInRight.springify().damping(22) : SlideInLeft.springify().damping(22))
    : FadeIn.duration(300);
  const exitAnim = mode !== prevMode
    ? (mode === 'signup' ? SlideOutLeft.springify().damping(22) : SlideOutRight.springify().damping(22))
    : FadeOut.duration(150);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#08091A','#0F1128','#08091A']} style={StyleSheet.absoluteFill} />

      {/* Ambient glows */}
      <View style={[styles.glow, styles.glow1]} />
      <View style={[styles.glow, styles.glow2]} />
      <View style={[styles.glow, styles.glow3]} />

      <SafeAreaView style={styles.safe} edges={['top','bottom']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >

            {/* ─── Hero Logo ─────────────────────────────────── */}
            <Animated.View entering={FadeIn.duration(700)} style={styles.hero}>
              <Animated.View style={logoPulseStyle}>
                <View style={styles.logoRingOuter}>
                  <View style={styles.logoRingInner}>
                    <LinearGradient colors={['#7C3AED','#4F46E5','#2563EB']} style={styles.logoGrad}>
                      <MaterialIcons name="account-balance-wallet" size={isSmall ? 34 : 42} color="#FFF" />
                    </LinearGradient>
                  </View>
                </View>
              </Animated.View>

              <Animated.Text entering={FadeInDown.delay(200).springify()} style={styles.appName}>
                CryptoVault
              </Animated.Text>
              <Animated.Text entering={FadeInDown.delay(300).springify()} style={styles.tagline}>
                Enterprise Digital Wallet
              </Animated.Text>

              {/* Trust badges */}
              <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.badges}>
                {[
                  { icon: 'security',    text: 'Bank-grade security' },
                  { icon: 'bolt',        text: 'Instant transfers'   },
                  { icon: 'fingerprint', text: 'Biometric auth'      },
                ].map((b, i) => (
                  <Animated.View key={i} entering={ZoomIn.delay(480 + i * 70).springify()}>
                    <View style={styles.badge}>
                      <MaterialIcons name={b.icon as any} size={12} color={Colors.primary} />
                      <Text style={styles.badgeText}>{b.text}</Text>
                    </View>
                  </Animated.View>
                ))}
              </Animated.View>
            </Animated.View>

            {/* ─── Auth Card ─────────────────────────────────── */}
            <Animated.View entering={FadeInDown.delay(250).springify()} style={styles.card}>
              {/* Card shimmer top */}
              <LinearGradient
                colors={['rgba(124,58,237,0.18)','transparent']}
                style={styles.cardTopShimmer}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              />

              {/* Tab Toggle */}
              <View style={styles.tabArea}>
                <TabToggle mode={mode} onChange={handleModeChange} />
              </View>

              {/* Form fields — slide between modes */}
              <Animated.View style={[styles.formArea, shakeStyle]}>

                {mode === 'signup' && (
                  <Animated.View
                    key="name"
                    entering={FadeInDown.delay(50).springify()}
                    style={styles.fieldRow}
                  >
                    <FloatInput
                      label="Full Name"
                      value={formData.name}
                      onChangeText={v => setFormData(f => ({ ...f, name: v }))}
                      icon="person-outline"
                      autoCapitalize="words"
                      autoFocus
                    />
                  </Animated.View>
                )}

                <View style={styles.fieldRow}>
                  <FloatInput
                    label="Email Address"
                    value={formData.email}
                    onChangeText={v => setFormData(f => ({ ...f, email: v }))}
                    icon="mail-outline"
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.fieldRow}>
                  <FloatInput
                    label="Password"
                    value={formData.password}
                    onChangeText={v => setFormData(f => ({ ...f, password: v }))}
                    icon="lock-outline"
                    secureTextEntry
                  />
                </View>

                {/* Password strength (signup only) */}
                {mode === 'signup' && formData.password.length > 0 && (
                  <StrengthBar password={formData.password} />
                )}

                {/* Forgot password */}
                {mode === 'login' && (
                  <Pressable style={styles.forgotWrap}>
                    <Text style={styles.forgotText}>Forgot password?</Text>
                  </Pressable>
                )}

                {/* Error */}
                {error ? (
                  <Animated.View entering={FadeInDown.duration(200)} style={styles.errorBox}>
                    <MaterialIcons name="error-outline" size={15} color={Colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </Animated.View>
                ) : null}

                {/* CTA */}
                <SubmitButton
                  label={mode === 'login' ? 'Sign In to Dashboard' : 'Create Account'}
                  onPress={handleSubmit}
                  loading={loading}
                />

                {/* Biometric */}
                {mode === 'login' && biometricEnabled && (
                  <Animated.View entering={FadeInDown.delay(100).springify()}>
                    <View style={styles.dividerRow}>
                      <View style={styles.divLine} />
                      <Text style={styles.divText}>OR</Text>
                      <View style={styles.divLine} />
                    </View>
                    <BiometricButton onPress={handleBiometric} disabled={loading} />
                  </Animated.View>
                )}
              </Animated.View>

              {/* Footer */}
              <View style={styles.footer}>
                <MaterialIcons name="shield" size={12} color={Colors.textMuted} />
                <Text style={styles.footerText}>
                  {mode === 'login'
                    ? 'Protected with end-to-end encryption'
                    : 'By continuing you agree to our Terms & Privacy Policy'}
                </Text>
              </View>
            </Animated.View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ─── Submit button with pulse feedback ───────────────────────────────────────
const SubmitButton: React.FC<{ label: string; onPress: () => void; loading: boolean }> = ({ label, onPress, loading }) => {
  const scale = useSharedValue(1);
  const glow  = useSharedValue(0);

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.97, { duration: 80 }),
      withSpring(1,    { damping: 10, stiffness: 300 }),
    );
    glow.value = withSequence(
      withTiming(1, { duration: 120 }),
      withTiming(0, { duration: 400 }),
    );
    onPress();
  };

  const btnStyle  = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.6,
  }));

  return (
    <Animated.View style={[styles.submitWrap, btnStyle]}>
      {/* Glow layer */}
      <Animated.View style={[styles.submitGlow, glowStyle]} />
      <Pressable
        onPress={handlePress}
        disabled={loading}
        style={({ pressed }) => [
          styles.submitPressable,
          pressed && { opacity: 0.9 },
          loading && styles.submitDisabled,
        ]}
      >
        <LinearGradient
          colors={['#7C3AED','#4F46E5']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.submitGrad}
        >
          {/* Shine */}
          <View style={styles.submitShine} />
          {loading
            ? <LoadingDots />
            : <Text style={styles.submitLabel}>{label}</Text>}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

// ─── Loading dots ─────────────────────────────────────────────────────────────
const LoadingDots: React.FC = () => {
  const d1 = useSharedValue(0), d2 = useSharedValue(0), d3 = useSharedValue(0);
  useEffect(() => {
    const anim = (sv: typeof d1, delay: number) => {
      sv.value = withDelay(delay, withRepeat(
        withSequence(withTiming(1, { duration: 300 }), withTiming(0, { duration: 300 })),
        -1, false,
      ));
    };
    anim(d1, 0); anim(d2, 150); anim(d3, 300);
  }, []);
  const dotStyle = (sv: typeof d1) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedStyle(() => ({
      opacity: interpolate(sv.value, [0, 1], [0.3, 1]),
      transform: [{ translateY: interpolate(sv.value, [0, 1], [0, -4]) }],
    }));
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[d1, d2, d3].map((sv, i) => (
        <Animated.View key={i} style={[styles.dot, dotStyle(sv)]} />
      ))}
    </View>
  );
};

// ─── Biometric button ─────────────────────────────────────────────────────────
const BiometricButton: React.FC<{ onPress: () => void; disabled: boolean }> = ({ onPress, disabled }) => {
  const scale = useSharedValue(1);
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(1.12, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1, true,
    );
  }, []);

  const btnStyle    = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const pulseStyle  = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: interpolate(pulse.value, [1, 1.12], [0.4, 0]),
  }));

  return (
    <Pressable
      onPress={() => {
        scale.value = withSequence(
          withTiming(0.95, { duration: 80 }),
          withSpring(1,    { damping: 12, stiffness: 260 }),
        );
        onPress();
      }}
      disabled={disabled}
    >
      <Animated.View style={[styles.bioBtn, btnStyle]}>
        <View style={styles.bioIconWrap}>
          {/* Pulse ring */}
          <Animated.View style={[styles.bioPulseRing, pulseStyle]} />
          <View style={styles.bioIconCircle}>
            <MaterialIcons name="fingerprint" size={26} color={Colors.primary} />
          </View>
        </View>
        <View>
          <Text style={styles.bioTitle}>Biometric Login</Text>
          <Text style={styles.bioSub}>Face ID or fingerprint</Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} style={{ marginLeft: 'auto' }} />
      </Animated.View>
    </Pressable>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  glow:  { position: 'absolute', borderRadius: 9999 },
  glow1: { width: 340, height: 340, top: -120, left: -100, backgroundColor: 'rgba(124,58,237,0.13)' },
  glow2: { width: 220, height: 220, bottom: 80, right: -80, backgroundColor: 'rgba(59,130,246,0.1)'  },
  glow3: { width: 160, height: 160, top: '40%', left: '50%', backgroundColor: 'rgba(79,70,229,0.07)'  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: isSmall ? Spacing.md : Spacing.lg,
    paddingVertical:   isSmall ? Spacing.md : Spacing.lg,
  },

  // ── Hero
  hero: { alignItems: 'center', marginBottom: Spacing.xl, paddingTop: isSmall ? Spacing.sm : Spacing.lg },
  logoRingOuter: {
    width: isSmall ? 108 : 128, height: isSmall ? 108 : 128,
    borderRadius: isSmall ? 54 : 64,
    backgroundColor: 'rgba(124,58,237,0.08)',
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  logoRingInner: {
    width: isSmall ? 86 : 102, height: isSmall ? 86 : 102,
    borderRadius: isSmall ? 43 : 51,
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.28)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoGrad: {
    width: isSmall ? 68 : 82, height: isSmall ? 68 : 82,
    borderRadius: isSmall ? 34 : 41,
    alignItems: 'center', justifyContent: 'center', ...Shadows.primaryGlow,
  },
  appName: {
    fontSize: isSmall ? 26 : 32, fontWeight: '800', color: Colors.text,
    letterSpacing: -0.8, marginBottom: 4,
  },
  tagline: {
    ...Typography.caption, color: Colors.textSecondary, marginBottom: Spacing.md,
  },
  badges: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, maxWidth: 320 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.full,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.border,
  },
  badgeText: { ...Typography.micro, color: Colors.textSecondary, fontWeight: '600' },

  // ── Card
  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1, borderColor: Colors.borderMedium,
    overflow: 'hidden',
    ...Shadows.xl,
  },
  cardTopShimmer: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
  },

  // ── Tabs
  tabArea: { padding: Spacing.lg, paddingBottom: Spacing.md },
  tabRow: {
    flexDirection: 'row', position: 'relative',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md, padding: 4,
    borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden',
  },
  tabIndicator: {
    position: 'absolute', top: 4, bottom: 4,
    borderRadius: BorderRadius.sm - 2,
    overflow: 'hidden',
  },
  tabItem: {
    flex: 1, paddingVertical: isSmall ? 10 : 13,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: BorderRadius.sm,
  },
  tabLabel: { ...Typography.bodyBold, color: Colors.textSecondary, fontSize: isSmall ? 14 : 15 },
  tabLabelActive: { color: '#FFF', fontWeight: '700' },

  // ── Form
  formArea: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  fieldRow: { marginBottom: isSmall ? Spacing.sm + 2 : Spacing.md - 2 },

  // ── Floating input
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    height: 58,
    paddingHorizontal: Spacing.md,
    position: 'relative',
  },
  inputIconBox: {
    width: 28, alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  inputInner: { flex: 1, justifyContent: 'center', position: 'relative', height: '100%' },
  floatLabel: {
    position: 'absolute', left: 0, top: '50%', marginTop: -10,
    fontSize: 15, fontWeight: '500',
    transformOrigin: 'left top',
    pointerEvents: 'none',
  } as any,
  textInput: {
    ...Typography.body, color: Colors.text,
    height: '100%', paddingTop: 10,
    fontSize: 15,
  },
  eyeBtn: { padding: 4, marginLeft: Spacing.xs },

  // ── Strength
  strengthWrap: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    marginBottom: Spacing.md, marginTop: -4,
  },
  strengthBars: { flexDirection: 'row', gap: 4, flex: 1 },
  strengthBar:  { flex: 1, height: 3, borderRadius: 2 },
  strengthLabel: { ...Typography.small, fontWeight: '600', width: 44, textAlign: 'right' },

  // ── Forgot
  forgotWrap: { alignSelf: 'flex-end', marginBottom: Spacing.md, marginTop: -4 },
  forgotText: { ...Typography.caption, color: Colors.primary, fontWeight: '600' },

  // ── Error
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    backgroundColor: Colors.errorGlow2,
    borderRadius: BorderRadius.md, padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1, borderColor: `${Colors.error}30`,
  },
  errorText: { ...Typography.caption, color: Colors.error, flex: 1, fontSize: isSmall ? 12 : 13 },

  // ── Submit
  submitWrap: { position: 'relative', marginTop: Spacing.xs, marginBottom: Spacing.xs },
  submitGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 12,
  },
  submitPressable: { borderRadius: BorderRadius.md, overflow: 'hidden' },
  submitDisabled:  { opacity: 0.55 },
  submitGrad:      { height: 56, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  submitShine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  submitLabel: { fontSize: 16, fontWeight: '700', color: '#FFF', letterSpacing: 0.3 },
  dot:         { width: 7, height: 7, borderRadius: 4, backgroundColor: '#FFF' },

  // ── Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.md },
  divLine:    { flex: 1, height: 1, backgroundColor: Colors.border },
  divText:    { ...Typography.caption, color: Colors.textMuted, marginHorizontal: Spacing.md, fontWeight: '600' },

  // ── Biometric
  bioBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.borderFocus,
    backgroundColor: Colors.primaryGlow2,
    borderRadius: BorderRadius.lg, padding: Spacing.md, gap: Spacing.md,
  },
  bioIconWrap:   { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  bioPulseRing:  {
    position: 'absolute', width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primary, borderWidth: 1.5, borderColor: Colors.primary,
  },
  bioIconCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primaryGlow2, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.borderFocus,
  },
  bioTitle: { ...Typography.bodyBold, color: Colors.primary },
  bioSub:   { ...Typography.caption,  color: Colors.textMuted, marginTop: 1 },

  // ── Footer
  footer: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderTopWidth: 1, borderTopColor: Colors.border,
    marginTop: Spacing.md,
  },
  footerText: { ...Typography.caption, color: Colors.textMuted, flex: 1, fontSize: isSmall ? 11 : 12 },
});
