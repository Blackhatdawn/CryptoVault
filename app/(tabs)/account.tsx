import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

type MenuItemProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
};

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, subtitle, onPress, danger }) => (
  <Pressable style={styles.menuItem} onPress={onPress}>
    <View style={[styles.iconContainer, danger && { backgroundColor: `${Colors.error}20` }]}>
      <MaterialIcons
        name={icon}
        size={24}
        color={danger ? Colors.error : Colors.primary}
      />
    </View>
    <View style={styles.menuContent}>
      <Text style={[styles.menuTitle, danger && { color: Colors.error }]}>{title}</Text>
      {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    </View>
    <MaterialIcons name="chevron-right" size={24} color={Colors.textMuted} />
  </Pressable>
);

export default function AccountScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="person" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="person-outline"
              title="Profile"
              subtitle="Edit your personal information"
              onPress={() => router.push('/settings')}
            />
            <MenuItem
              icon="security"
              title="Security"
              subtitle="Password, 2FA, biometric"
              onPress={() => router.push('/settings')}
            />
            <MenuItem
              icon="notifications-outline"
              title="Notifications"
              subtitle="Manage notification preferences"
              onPress={() => Alert.alert('Coming Soon', 'Notification settings')}
            />
          </View>
        </View>

        {/* Wallet Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="account-balance-wallet"
              title="Payment Methods"
              subtitle="Manage deposit & withdrawal methods"
              onPress={() => Alert.alert('Coming Soon', 'Payment methods')}
            />
            <MenuItem
              icon="history"
              title="Transaction History"
              subtitle="View all your transactions"
              onPress={() => router.push('/(tabs)/history')}
            />
            <MenuItem
              icon="receipt"
              title="Statements"
              subtitle="Download transaction statements"
              onPress={() => Alert.alert('Coming Soon', 'Statements')}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="help-outline"
              title="Help Center"
              subtitle="FAQs and support articles"
              onPress={() => Alert.alert('Coming Soon', 'Help center')}
            />
            <MenuItem
              icon="chat-bubble-outline"
              title="Contact Support"
              subtitle="Get help from our team"
              onPress={() => Alert.alert('Coming Soon', 'Contact support')}
            />
            <MenuItem
              icon="info-outline"
              title="About"
              subtitle="Version 1.0.0"
              onPress={() => Alert.alert('CryptoVault', 'Version 1.0.0\nBuilt with React Native & Expo')}
            />
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <View style={styles.menuGroup}>
            <MenuItem
              icon="logout"
              title="Logout"
              onPress={handleLogout}
              danger
            />
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
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  userName: {
    ...Typography.title,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.subheading,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginLeft: Spacing.md,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuGroup: {
    backgroundColor: Colors.surfaceElevated,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});
