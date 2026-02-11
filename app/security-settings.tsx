import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Button } from '@/components/ui/Button';

export default function SecuritySettingsScreen() {
  const router = useRouter();
  const { biometricEnabled, enableBiometric } = useAuth();
  
  const [pinEnabled, setPinEnabled] = useState(false);
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);
  const [autoLockTime, setAutoLockTime] = useState('5'); // minutes
  const [loginNotifications, setLoginNotifications] = useState(true);

  const handleBiometricToggle = async (value: boolean) => {
    try {
      await enableBiometric(value);
      Alert.alert(
        'Success',
        value
          ? 'Biometric authentication enabled successfully'
          : 'Biometric authentication disabled'
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update biometric settings');
    }
  };

  const handlePinSetup = () => {
    router.push('/pin-setup');
  };

  const handleChangePin = () => {
    router.push('/pin-setup?mode=change');
  };

  const handleAutoLockTime = () => {
    Alert.alert(
      'Auto-Lock Time',
      'Choose when to auto-lock the app',
      [
        { text: '1 minute', onPress: () => setAutoLockTime('1') },
        { text: '5 minutes', onPress: () => setAutoLockTime('5') },
        { text: '15 minutes', onPress: () => setAutoLockTime('15') },
        { text: '30 minutes', onPress: () => setAutoLockTime('30') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Security Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Authentication Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Authentication</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="fingerprint" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Biometric Login</Text>
                <Text style={styles.settingDescription}>
                  Use Face ID or fingerprint to login
                </Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleBiometricToggle}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.background}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="pin" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>PIN Code</Text>
                <Text style={styles.settingDescription}>
                  {pinEnabled ? 'PIN code is active' : 'Setup PIN for additional security'}
                </Text>
              </View>
            </View>
            {pinEnabled ? (
              <Pressable onPress={handleChangePin}>
                <Text style={styles.linkText}>Change</Text>
              </Pressable>
            ) : (
              <Switch
                value={pinEnabled}
                onValueChange={(value) => {
                  if (value) {
                    handlePinSetup();
                  }
                  setPinEnabled(value);
                }}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Colors.background}
              />
            )}
          </View>
        </View>

        {/* Auto-Lock Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Auto-Lock</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="lock-clock" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Enable Auto-Lock</Text>
                <Text style={styles.settingDescription}>
                  Lock app when inactive
                </Text>
              </View>
            </View>
            <Switch
              value={autoLockEnabled}
              onValueChange={setAutoLockEnabled}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.background}
            />
          </View>

          {autoLockEnabled && (
            <Pressable style={styles.settingItem} onPress={handleAutoLockTime}>
              <View style={styles.settingLeft}>
                <MaterialIcons name="timer" size={24} color={Colors.textSecondary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Auto-Lock Time</Text>
                  <Text style={styles.settingDescription}>
                    Lock after {autoLockTime} {autoLockTime === '1' ? 'minute' : 'minutes'} of inactivity
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Notifications</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="notifications-active" size={24} color={Colors.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Login Notifications</Text>
                <Text style={styles.settingDescription}>
                  Get notified of new login attempts
                </Text>
              </View>
            </View>
            <Switch
              value={loginNotifications}
              onValueChange={setLoginNotifications}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.background}
            />
          </View>
        </View>

        {/* Advanced Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced</Text>

          <Pressable style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="devices" size={24} color={Colors.textSecondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Active Sessions</Text>
                <Text style={styles.settingDescription}>
                  Manage your active login sessions
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
          </Pressable>

          <Pressable style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="vpn-key" size={24} color={Colors.textSecondary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Change Password</Text>
                <Text style={styles.settingDescription}>
                  Update your account password
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
          </Pressable>
        </View>

        {/* Warning Section */}
        <View style={styles.warningCard}>
          <MaterialIcons name="security" size={24} color={Colors.warning} />
          <View style={styles.warningText}>
            <Text style={styles.warningTitle}>Security Tip</Text>
            <Text style={styles.warningDescription}>
              Enable both biometric and PIN authentication for maximum security. Never share your credentials with anyone.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    ...Typography.title,
    color: Colors.text,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceElevated,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  linkText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: `${Colors.warning}15`,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xl,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: `${Colors.warning}30`,
    gap: Spacing.md,
  },
  warningText: {
    flex: 1,
  },
  warningTitle: {
    ...Typography.body,
    color: Colors.warning,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  warningDescription: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
