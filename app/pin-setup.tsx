import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Alert, Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

const PIN_LENGTH = 6;
const KEYPAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['',  '0', '⌫'],
];

export default function PinSetupScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isChange = mode === 'change';

  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [pin, setPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState('');

  const title = isChange ? 'Change PIN' : 'Set Up PIN';
  const subtitle = step === 'enter'
    ? (isChange ? 'Enter your new PIN' : 'Create a 6-digit PIN')
    : 'Confirm your PIN';

  const handleKey = async (key: string) => {
    if (key === '⌫') {
      setPin(p => p.slice(0, -1));
      setError('');
      return;
    }
    if (key === '') return;

    const newPin = pin + key;
    setPin(newPin);

    if (newPin.length === PIN_LENGTH) {
      if (step === 'enter') {
        setFirstPin(newPin);
        setPin('');
        setStep('confirm');
      } else {
        // Confirm step
        if (newPin === firstPin) {
          await SecureStore.setItemAsync('pin_code', newPin);
          Alert.alert('Success', 'PIN set successfully', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        } else {
          Vibration.vibrate(300);
          setError('PINs do not match. Try again.');
          setPin('');
          setStep('enter');
          setFirstPin('');
        }
      }
    }
  };

  const dots = Array.from({ length: PIN_LENGTH }).map((_, i) => ({
    filled: i < pin.length,
  }));

  return (
    <View style={styles.root}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>{title}</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.body}>
          {/* Icon */}
          <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.iconCircle}>
            <MaterialIcons name="pin" size={40} color="#FFF" />
          </LinearGradient>

          <Text style={styles.subtitle}>{subtitle}</Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Step indicator */}
          <View style={styles.stepRow}>
            <View style={[styles.stepDot, step === 'enter' && styles.stepDotActive]} />
            <View style={[styles.stepDot, step === 'confirm' && styles.stepDotActive]} />
          </View>

          {/* PIN dots */}
          <View style={styles.dotsRow}>
            {dots.map((d, i) => (
              <View key={i} style={[styles.dot, d.filled && styles.dotFilled]} />
            ))}
          </View>

          {/* Keypad */}
          <View style={styles.keypad}>
            {KEYPAD.map((row, ri) => (
              <View key={ri} style={styles.keyRow}>
                {row.map((key, ki) => (
                  <Pressable
                    key={ki}
                    style={({ pressed }) => [
                      styles.key,
                      key === '' && styles.keyEmpty,
                      pressed && key !== '' && { opacity: 0.6, transform: [{ scale: 0.92 }] },
                    ]}
                    onPress={() => handleKey(key)}
                    disabled={key === ''}
                  >
                    {key === '⌫' ? (
                      <MaterialIcons name="backspace" size={22} color={Colors.textSecondary} />
                    ) : (
                      <Text style={styles.keyText}>{key}</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            ))}
          </View>
        </View>
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

  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },

  iconCircle: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xl, ...Shadows.primaryGlow,
  },
  subtitle: { ...Typography.h4, color: Colors.text, marginBottom: Spacing.sm, textAlign: 'center' },
  errorText: { ...Typography.caption, color: Colors.error, marginBottom: Spacing.sm, textAlign: 'center' },

  stepRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  stepDotActive: { backgroundColor: Colors.primary, width: 24 },

  dotsRow: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.xxxl },
  dot: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: Colors.border,
    backgroundColor: 'transparent',
  },
  dotFilled: { backgroundColor: Colors.primary, borderColor: Colors.primary },

  keypad: { width: '100%', maxWidth: 300 },
  keyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  key: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.sm,
  },
  keyEmpty: { backgroundColor: 'transparent', borderColor: 'transparent', elevation: 0, shadowOpacity: 0 },
  keyText: { fontSize: 26, fontWeight: '600', color: Colors.text },
});
