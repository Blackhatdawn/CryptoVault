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
import { useAuth } from '@/hooks/useAuth';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

const STEPS = ['Personal Info', 'Identity', 'Review'];

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'Japan', 'Singapore', 'UAE', 'Other',
];

const ID_TYPES = [
  { icon: 'badge',          label: "National ID",      desc: 'Government-issued national ID card' },
  { icon: 'article',        label: "Passport",          desc: 'International travel document' },
  { icon: 'directions-car', label: "Driver's License",  desc: 'Valid driving license' },
];

export default function KYCScreen() {
  const router = useRouter();
  const { user }  = useAuth();
  const { width } = useWindowDimensions();
  const isSmall   = width < 375;

  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName:  user?.name?.split(' ').slice(1).join(' ') || '',
    dob:       '',
    nationality: '',
    country:   '',
    address:   '',
    city:      '',
    postcode:  '',
    idType:    '',
    idNumber:  '',
  });

  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const validateStep = (): boolean => {
    if (step === 0) {
      if (!form.firstName || !form.lastName || !form.dob || !form.country) {
        Alert.alert('Missing Fields', 'Please fill in all required fields.');
        return false;
      }
      const dobRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dobRegex.test(form.dob)) {
        Alert.alert('Invalid Date', 'Enter your date of birth as DD/MM/YYYY.');
        return false;
      }
    }
    if (step === 1 && !form.idType) {
      Alert.alert('Select ID Type', 'Please select a form of identification.');
      return false;
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) setStep(s => s + 1);
  };

  const submit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    Alert.alert(
      'KYC Submitted',
      'Your documents have been submitted for review. Verification typically takes 1–3 business days.',
      [{ text: 'Done', onPress: () => router.back() }],
    );
  };

  const InputRow = ({
    label, value, onChangeText, placeholder, keyboardType, hint,
  }: any) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textDisabled}
        keyboardType={keyboardType}
        autoCapitalize="words"
      />
      {hint && <Text style={styles.fieldHint}>{hint}</Text>}
    </View>
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>

        {/* ─── Header ─── */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => (step > 0 ? setStep(s => s - 1) : router.back())}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>KYC Verification</Text>
          <View style={{ width: 44 }} />
        </Animated.View>

        {/* ─── Progress Bar ─── */}
        <View style={styles.progressWrap}>
          {STEPS.map((s, i) => (
            <View key={i} style={styles.progressItem}>
              <View style={[
                styles.progressDot,
                i <= step && styles.progressDotActive,
                i < step  && styles.progressDotDone,
              ]}>
                {i < step
                  ? <MaterialIcons name="check" size={12} color="#FFF" />
                  : <Text style={[styles.progressNum, i <= step && styles.progressNumActive]}>{i + 1}</Text>
                }
              </View>
              <Text style={[styles.progressLabel, i <= step && styles.progressLabelActive]}>{s}</Text>
              {i < STEPS.length - 1 && (
                <View style={[styles.progressLine, i < step && styles.progressLineDone]} />
              )}
            </View>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

          {/* ─── Step 0: Personal Info ─── */}
          {step === 0 && (
            <Animated.View entering={FadeInDown.springify()}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <LinearGradient colors={['#7C3AED22','transparent']} style={styles.cardIconWrap}>
                    <MaterialIcons name="person" size={22} color={Colors.primary} />
                  </LinearGradient>
                  <View>
                    <Text style={styles.cardTitle}>Personal Information</Text>
                    <Text style={styles.cardSub}>As shown on your government ID</Text>
                  </View>
                </View>

                <View style={styles.row2}>
                  <View style={{ flex: 1 }}>
                    <InputRow label="First Name *" value={form.firstName} onChangeText={set('firstName')} placeholder="John" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <InputRow label="Last Name *" value={form.lastName} onChangeText={set('lastName')} placeholder="Smith" />
                  </View>
                </View>

                <InputRow
                  label="Date of Birth *"
                  value={form.dob}
                  onChangeText={set('dob')}
                  placeholder="DD/MM/YYYY"
                  keyboardType="numeric"
                  hint="Format: DD/MM/YYYY"
                />
                <InputRow label="Nationality" value={form.nationality} onChangeText={set('nationality')} placeholder="e.g. American" />

                <Text style={[styles.fieldLabel, { marginTop: Spacing.sm }]}>Country of Residence *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.countryScroll}>
                  {COUNTRIES.map(c => (
                    <Pressable
                      key={c}
                      style={[styles.countryPill, form.country === c && styles.countryPillActive]}
                      onPress={() => set('country')(c)}
                    >
                      <Text style={[styles.countryText, form.country === c && styles.countryTextActive]}>{c}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <InputRow label="Street Address" value={form.address} onChangeText={set('address')} placeholder="123 Main Street" />
                <View style={styles.row2}>
                  <View style={{ flex: 1 }}>
                    <InputRow label="City" value={form.city} onChangeText={set('city')} placeholder="New York" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <InputRow label="Postcode" value={form.postcode} onChangeText={set('postcode')} placeholder="10001" keyboardType="numeric" />
                  </View>
                </View>
              </View>
            </Animated.View>
          )}

          {/* ─── Step 1: Identity ─── */}
          {step === 1 && (
            <Animated.View entering={FadeInDown.springify()}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <LinearGradient colors={['#2563EB22','transparent']} style={styles.cardIconWrap}>
                    <MaterialIcons name="badge" size={22} color={Colors.info} />
                  </LinearGradient>
                  <View>
                    <Text style={styles.cardTitle}>Identity Document</Text>
                    <Text style={styles.cardSub}>Select the type of ID to submit</Text>
                  </View>
                </View>

                {ID_TYPES.map(t => (
                  <Pressable
                    key={t.label}
                    style={[styles.idCard, form.idType === t.label && styles.idCardActive]}
                    onPress={() => set('idType')(t.label)}
                  >
                    <View style={[styles.idIcon, form.idType === t.label && styles.idIconActive]}>
                      <MaterialIcons name={t.icon as any} size={24} color={form.idType === t.label ? Colors.primary : Colors.textSecondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.idLabel, form.idType === t.label && { color: Colors.primary }]}>{t.label}</Text>
                      <Text style={styles.idDesc}>{t.desc}</Text>
                    </View>
                    {form.idType === t.label && (
                      <MaterialIcons name="check-circle" size={22} color={Colors.primary} />
                    )}
                  </Pressable>
                ))}

                {form.idType ? (
                  <>
                    <InputRow label="ID / Document Number *" value={form.idNumber} onChangeText={set('idNumber')} placeholder="Enter document number" />

                    <View style={styles.uploadCard}>
                      <MaterialIcons name="cloud-upload" size={32} color={Colors.primary} />
                      <Text style={styles.uploadTitle}>Upload Document Photos</Text>
                      <Text style={styles.uploadSub}>
                        Front & back of your {form.idType.toLowerCase()} (JPG, PNG or PDF)
                      </Text>
                      <Pressable
                        style={styles.uploadBtn}
                        onPress={() => Alert.alert('Upload', 'Photo upload will be available in the mobile app.')}
                      >
                        <Text style={styles.uploadBtnText}>Choose Files</Text>
                      </Pressable>
                    </View>

                    <View style={styles.selfieCard}>
                      <MaterialIcons name="face" size={32} color={Colors.accent} />
                      <Text style={[styles.uploadTitle, { color: Colors.accent }]}>Selfie Verification</Text>
                      <Text style={styles.uploadSub}>Take a clear photo of your face holding your ID</Text>
                      <Pressable
                        style={[styles.uploadBtn, { backgroundColor: Colors.accentGlow }]}
                        onPress={() => Alert.alert('Selfie', 'Selfie capture will be available in the mobile app.')}
                      >
                        <Text style={[styles.uploadBtnText, { color: Colors.accent }]}>Take Selfie</Text>
                      </Pressable>
                    </View>
                  </>
                ) : null}
              </View>
            </Animated.View>
          )}

          {/* ─── Step 2: Review ─── */}
          {step === 2 && (
            <Animated.View entering={FadeInDown.springify()}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <LinearGradient colors={['#05966922','transparent']} style={styles.cardIconWrap}>
                    <MaterialIcons name="fact-check" size={22} color={Colors.success} />
                  </LinearGradient>
                  <View>
                    <Text style={styles.cardTitle}>Review & Submit</Text>
                    <Text style={styles.cardSub}>Confirm your information is accurate</Text>
                  </View>
                </View>

                {[
                  { label: 'Full Name',    value: `${form.firstName} ${form.lastName}` },
                  { label: 'Date of Birth',value: form.dob || '—' },
                  { label: 'Nationality',  value: form.nationality || '—' },
                  { label: 'Country',      value: form.country || '—' },
                  { label: 'Address',      value: form.address ? `${form.address}, ${form.city} ${form.postcode}` : '—' },
                  { label: 'ID Type',      value: form.idType || '—' },
                  { label: 'ID Number',    value: form.idNumber || '—' },
                ].map((row, i) => (
                  <View key={i} style={[styles.reviewRow, i > 0 && { borderTopWidth: 1, borderTopColor: Colors.border }]}>
                    <Text style={styles.reviewLabel}>{row.label}</Text>
                    <Text style={styles.reviewValue}>{row.value}</Text>
                  </View>
                ))}

                <View style={styles.consentCard}>
                  <MaterialIcons name="security" size={20} color={Colors.primary} />
                  <Text style={styles.consentText}>
                    By submitting, you confirm that all information provided is accurate and consent to identity verification in accordance with our Privacy Policy and Terms of Service.
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* ─── CTA ─── */}
          <Pressable
            style={[styles.cta, loading && { opacity: 0.7 }]}
            onPress={step < STEPS.length - 1 ? next : submit}
            disabled={loading}
          >
            <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.ctaGrad}>
              <Text style={styles.ctaText}>
                {loading ? 'Submitting...' : step < STEPS.length - 1 ? 'Continue' : 'Submit for Review'}
              </Text>
              <MaterialIcons name={loading ? 'hourglass-empty' : 'arrow-forward'} size={20} color="#FFF" />
            </LinearGradient>
          </Pressable>

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

  progressWrap: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg,
    gap: 0,
  },
  progressItem:        { alignItems: 'center', flexDirection: 'row', gap: 6 },
  progressDot:         { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.surfaceElevated, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  progressDotActive:   { borderColor: Colors.primary, backgroundColor: `${Colors.primary}20` },
  progressDotDone:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
  progressNum:         { fontSize: 12, fontWeight: '700', color: Colors.textMuted },
  progressNumActive:   { color: Colors.primary },
  progressLabel:       { ...Typography.micro, color: Colors.textMuted, fontWeight: '600' },
  progressLabelActive: { color: Colors.primary },
  progressLine:        { width: 24, height: 2, backgroundColor: Colors.border, marginHorizontal: 6 },
  progressLineDone:    { backgroundColor: Colors.primary },

  body: { padding: Spacing.lg },

  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.xl, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.lg, ...Shadows.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
  cardIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { ...Typography.bodyBold, color: Colors.text, fontSize: 17 },
  cardSub:   { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },

  row2: { flexDirection: 'row', gap: Spacing.sm },

  fieldWrap:  { marginBottom: Spacing.md },
  fieldLabel: { ...Typography.captionBold, color: Colors.textSecondary, marginBottom: 6 },
  fieldHint:  { ...Typography.micro, color: Colors.textMuted, marginTop: 4 },
  input: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border,
    color: Colors.text, fontSize: 15, padding: Spacing.md,
  },

  countryScroll: { marginBottom: Spacing.md },
  countryPill: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface, marginRight: Spacing.sm,
  },
  countryPillActive: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}15` },
  countryText:       { ...Typography.caption, color: Colors.textSecondary, fontWeight: '600' },
  countryTextActive: { color: Colors.primary },

  idCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    padding: Spacing.md, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface, marginBottom: Spacing.sm,
  },
  idCardActive: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}10` },
  idIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center',
  },
  idIconActive: { backgroundColor: `${Colors.primary}20` },
  idLabel: { ...Typography.bodyBold, color: Colors.text, marginBottom: 2 },
  idDesc:  { ...Typography.caption, color: Colors.textMuted },

  uploadCard: {
    alignItems: 'center', padding: Spacing.xl,
    borderRadius: BorderRadius.lg, borderWidth: 2,
    borderStyle: 'dashed', borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}08`,
    marginTop: Spacing.md, gap: Spacing.sm,
  },
  selfieCard: {
    alignItems: 'center', padding: Spacing.xl,
    borderRadius: BorderRadius.lg, borderWidth: 2,
    borderStyle: 'dashed', borderColor: Colors.accent,
    backgroundColor: `${Colors.accent}08`,
    marginTop: Spacing.md, gap: Spacing.sm,
  },
  uploadTitle:   { ...Typography.bodyBold, color: Colors.text },
  uploadSub:     { ...Typography.caption, color: Colors.textMuted, textAlign: 'center' },
  uploadBtn:     { backgroundColor: Colors.primaryGlow, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, marginTop: Spacing.xs },
  uploadBtnText: { ...Typography.captionBold, color: Colors.primary },

  reviewRow: { paddingVertical: Spacing.sm, flexDirection: 'row', justifyContent: 'space-between' },
  reviewLabel: { ...Typography.caption, color: Colors.textMuted, flex: 1 },
  reviewValue: { ...Typography.captionBold, color: Colors.text, flex: 2, textAlign: 'right' },

  consentCard: {
    flexDirection: 'row', gap: Spacing.sm,
    backgroundColor: `${Colors.primary}10`,
    borderRadius: BorderRadius.md, padding: Spacing.md,
    marginTop: Spacing.md, borderWidth: 1, borderColor: `${Colors.primary}30`,
  },
  consentText: { ...Typography.caption, color: Colors.textSecondary, flex: 1, lineHeight: 18 },

  cta: { borderRadius: BorderRadius.xl, overflow: 'hidden', ...Shadows.lg },
  ctaGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: Spacing.lg, gap: Spacing.sm,
  },
  ctaText: { ...Typography.bodyBold, color: '#FFF', fontSize: 17 },

  accentGlow: { backgroundColor: `${Colors.accent}20` },
});
