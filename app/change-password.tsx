import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  TextInput, Alert, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { api } from '@/services/api';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

const REQUIREMENTS = [
  { test: (p: string) => p.length >= 8,       label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p),     label: 'One uppercase letter' },
  { test: (p: string) => /[0-9]/.test(p),     label: 'One number' },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: 'One special character' },
];

export default function ChangePasswordScreen() {
  const router    = useRouter();
  const { width } = useWindowDimensions();

  const [current,  setCurrent]  = useState('');
  const [next,     setNext]     = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showCur,  setShowCur]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const strength = REQUIREMENTS.filter(r => r.test(next)).length;

  const strengthColor = () => {
    if (strength <= 1) return Colors.error;
    if (strength <= 2) return Colors.warning;
    if (strength <= 3) return Colors.accent;
    return Colors.success;
  };

  const strengthLabel = () => {
    if (strength <= 1) return 'Weak';
    if (strength <= 2) return 'Fair';
    if (strength <= 3) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async () => {
    if (!current || !next || !confirm) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (next !== confirm) {
      Alert.alert('Password Mismatch', 'New passwords do not match.');
      return;
    }
    if (strength < 2) {
      Alert.alert('Weak Password', 'Your new password is too weak. Please make it stronger.');
      return;
    }
    setLoading(true);
    try {
      await api.updatePassword({ currentPassword: current, newPassword: next });
      Alert.alert(
        'Password Changed',
        'Your password has been updated successfully.',
        [{ text: 'Done', onPress: () => router.back() }],
      );
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || e.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
    label, value, onChangeText, show, onToggle, placeholder,
  }: {
    label: string; value: string; onChangeText: (v: string) => void;
    show: boolean; onToggle: () => void; placeholder: string;
  }) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textDisabled}
          secureTextEntry={!show}
          autoCapitalize="none"
        />
        <Pressable style={styles.eyeBtn} onPress={onToggle}>
          <MaterialIcons name={show ? 'visibility-off' : 'visibility'} size={20} color={Colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>

        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Change Password</Text>
          <View style={{ width: 44 }} />
        </Animated.View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

          {/* ─── Icon ─── */}
          <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.iconWrap}>
            <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.iconCircle}>
              <MaterialIcons name="lock-reset" size={36} color="#FFF" />
            </LinearGradient>
            <Text style={styles.iconTitle}>Secure Your Account</Text>
            <Text style={styles.iconSub}>Choose a strong, unique password you don't use elsewhere.</Text>
          </Animated.View>

          {/* ─── Form Card ─── */}
          <Animated.View entering={FadeInDown.delay(120).springify()} style={styles.card}>
            <Field
              label="Current Password"
              value={current}
              onChangeText={setCurrent}
              show={showCur}
              onToggle={() => setShowCur(v => !v)}
              placeholder="Enter current password"
            />
            <Field
              label="New Password"
              value={next}
              onChangeText={setNext}
              show={showNew}
              onToggle={() => setShowNew(v => !v)}
              placeholder="Enter new password"
            />

            {/* Strength meter */}
            {next.length > 0 && (
              <View style={styles.strengthWrap}>
                <View style={styles.strengthBars}>
                  {[1,2,3,4].map(n => (
                    <View
                      key={n}
                      style={[
                        styles.strengthBar,
                        { backgroundColor: n <= strength ? strengthColor() : Colors.border },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthLabel, { color: strengthColor() }]}>
                  {strengthLabel()}
                </Text>
              </View>
            )}

            {/* Requirements */}
            {next.length > 0 && (
              <View style={styles.reqList}>
                {REQUIREMENTS.map((r, i) => {
                  const ok = r.test(next);
                  return (
                    <View key={i} style={styles.reqRow}>
                      <MaterialIcons
                        name={ok ? 'check-circle' : 'radio-button-unchecked'}
                        size={14}
                        color={ok ? Colors.success : Colors.textDisabled}
                      />
                      <Text style={[styles.reqText, ok && { color: Colors.success }]}>{r.label}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            <Field
              label="Confirm New Password"
              value={confirm}
              onChangeText={setConfirm}
              show={showConf}
              onToggle={() => setShowConf(v => !v)}
              placeholder="Re-enter new password"
            />

            {confirm.length > 0 && next !== confirm && (
              <Text style={styles.matchError}>Passwords do not match</Text>
            )}
          </Animated.View>

          {/* ─── Submit ─── */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Pressable
              style={[styles.cta, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient colors={['#7C3AED','#4F46E5']} style={styles.ctaGrad}>
                <MaterialIcons name={loading ? 'hourglass-empty' : 'lock'} size={20} color="#FFF" />
                <Text style={styles.ctaText}>{loading ? 'Updating...' : 'Change Password'}</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* ─── Warning ─── */}
          <View style={styles.warningCard}>
            <MaterialIcons name="warning" size={20} color={Colors.warning} />
            <Text style={styles.warningText}>
              Changing your password will sign out all other active sessions for security.
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { ...Typography.heading, color: Colors.text },

  body: { padding: Spacing.lg, gap: Spacing.md },

  iconWrap:   { alignItems: 'center', paddingVertical: Spacing.lg, gap: Spacing.sm },
  iconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', ...Shadows.primaryGlow },
  iconTitle:  { ...Typography.h4, color: Colors.text, marginTop: Spacing.sm },
  iconSub:    { ...Typography.caption, color: Colors.textMuted, textAlign: 'center', maxWidth: 280 },

  card: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
    ...Shadows.md,
  },
  fieldWrap:  { marginBottom: Spacing.md },
  fieldLabel: { ...Typography.captionBold, color: Colors.textSecondary, marginBottom: 6 },
  inputWrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border },
  input:      { flex: 1, color: Colors.text, fontSize: 15, padding: Spacing.md },
  eyeBtn:     { padding: Spacing.md },

  strengthWrap:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  strengthBars:  { flex: 1, flexDirection: 'row', gap: 4 },
  strengthBar:   { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { ...Typography.captionBold, minWidth: 48, textAlign: 'right' },

  reqList: { gap: 6, marginBottom: Spacing.md },
  reqRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  reqText: { ...Typography.caption, color: Colors.textDisabled },

  matchError: { ...Typography.caption, color: Colors.error, marginBottom: Spacing.sm },

  cta:     { borderRadius: BorderRadius.xl, overflow: 'hidden', ...Shadows.lg },
  ctaGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: Spacing.lg, gap: Spacing.sm },
  ctaText: { ...Typography.bodyBold, color: '#FFF', fontSize: 17 },

  warningCard: {
    flexDirection: 'row', gap: Spacing.sm,
    backgroundColor: `${Colors.warning}12`,
    borderRadius: BorderRadius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: `${Colors.warning}30`,
  },
  warningText: { ...Typography.caption, color: Colors.textSecondary, flex: 1, lineHeight: 18 },
});
