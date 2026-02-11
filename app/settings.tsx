import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout, biometricEnabled, enableBiometric } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleBiometricToggle = async (value: boolean) => {
    try {
      setLoading(true);
      await enableBiometric(value);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update biometric settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'User'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
            </View>
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
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
                disabled={loading}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={Colors.text}
              />
            </View>
          </View>

          <Pressable style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <MaterialIcons name="lock" size={24} color={Colors.textSecondary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Change Password</Text>
                  <Text style={styles.settingDescription}>
                    Update your account password
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={Colors.textSecondary} />
            </View>
          </Pressable>
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>

          <Pressable style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <MaterialIcons name="notifications" size={24} color={Colors.textSecondary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Manage notification preferences
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={Colors.textSecondary} />
            </View>
          </Pressable>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <MaterialIcons name="info" size={24} color={Colors.textSecondary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>App Version</Text>
                  <Text style={styles.settingDescription}>1.0.0</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutPressed,
          ]}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={24} color={Colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        {/* Footer */}
        <Text style={styles.footer}>
          CryptoVault © 2026{'\n'}
          Secure crypto wallet and trading platform
        </Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  title: {
    ...Typography.heading,
    color: Colors.text,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.subheading,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.background,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...Typography.title,
    color: Colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  settingCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: Spacing.md,
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.error}20`,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  logoutPressed: {
    opacity: 0.7,
  },
  logoutText: {
    ...Typography.body,
    color: Colors.error,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  footer: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
    lineHeight: 20,
  },
});
