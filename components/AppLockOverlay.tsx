import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, Vibration, Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppLock } from '@/contexts/AppLockContext';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

const PIN_LENGTH = 6;
const KEYPAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['',  '0', '⌫'],
];

export function AppLockOverlay() {
  const { isLocked, unlock, unlockWithPin } = useAppLock();
  const [pin, setPin]               = useState('');
  const [error, setError]           = useState('');
  const [mode, setMode]             = useState<'biometric' | 'pin'>('biometric');
  const [unlocking, setUnlocking]   = useState(false);

  useEffect(() => {
    if (isLocked && mode === 'biometric') {
      triggerBiometric();
    }
  }, [isLocked]);

  const triggerBiometric = async () => {
    setUnlocking(true);
    const success = await unlock();
    setUnlocking(false);
    if (!success) {
      setMode('pin');
    }
  };

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
      const success = await unlockWithPin(newPin);
      if (!success) {
        Vibration.vibrate(400);
        setError('Incorrect PIN. Try again.');
        setPin('');
      }
    }
  };

  if (!isLocked) return null;

  return (
    <Modal visible={isLocked} animationType="fade" statusBarTranslucent>
      <View style={styles.root}>
        <LinearGradient
          colors={['#050714', '#0D0F2B', '#08091A']}
          style={StyleSheet.absoluteFill}
        />

        {/* Logo */}
        <View style={styles.top}>
          <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.logoCircle}>
            <MaterialIcons name="account-balance-wallet" size={36} color="#FFF" />
          </LinearGradient>
          <Text style={styles.appName}>CryptoVault</Text>
          <Text style={styles.subtitle}>
            {mode === 'biometric' ? 'Authenticate to continue' : 'Enter your PIN'}
          </Text>
        </View>

        {mode === 'biometric' ? (
          <View style={styles.bioSection}>
            <Pressable
              style={({ pressed }) => [styles.bioBtn, pressed && { opacity: 0.7 }]}
              onPress={triggerBiometric}
              disabled={unlocking}
            >
              <LinearGradient colors={['#7C3AED22', '#4F46E522']} style={styles.bioBtnGrad}>
                <MaterialIcons name="fingerprint" size={64} color={Colors.primary} />
              </LinearGradient>
            </Pressable>
            <Text style={styles.bioHint}>
              {unlocking ? 'Verifying...' : 'Tap to use biometrics'}
            </Text>
            <Pressable style={styles.switchMode} onPress={() => setMode('pin')}>
              <Text style={styles.switchModeText}>Use PIN instead</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.pinSection}>
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <View style={{ height: 20 }} />
            )}

            <View style={styles.dotsRow}>
              {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
              ))}
            </View>

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
                      ) : key !== '' ? (
                        <Text style={styles.keyText}>{key}</Text>
                      ) : null}
                    </Pressable>
                  ))}
                </View>
              ))}
            </View>

            <Pressable style={styles.switchMode} onPress={triggerBiometric}>
              <MaterialIcons name="fingerprint" size={18} color={Colors.primary} />
              <Text style={styles.switchModeText}>Use biometrics</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1, alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 60,
  },

  top: { alignItems: 'center', gap: Spacing.sm },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm, ...Shadows.primaryGlow,
  },
  appName: { fontSize: 28, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { ...Typography.body, color: Colors.textSecondary },

  bioSection: { alignItems: 'center', gap: Spacing.xl },
  bioBtn: { borderRadius: 60 },
  bioBtnGrad: {
    width: 120, height: 120, borderRadius: 60,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  bioHint: { ...Typography.body, color: Colors.textSecondary },

  pinSection: { alignItems: 'center', width: '100%', paddingHorizontal: Spacing.xl },
  errorText: { ...Typography.caption, color: Colors.error, marginBottom: Spacing.md },
  dotsRow: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.xxxl },
  dot: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 2, borderColor: Colors.border, backgroundColor: 'transparent',
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

  switchMode: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: Spacing.md,
  },
  switchModeText: { ...Typography.body, color: Colors.primary, fontWeight: '600' },
});
