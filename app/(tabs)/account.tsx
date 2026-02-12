import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

export default function AccountScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { balance } = useWallet();

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

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: 'person', label: 'Edit Profile', route: '/edit-profile' },
        { icon: 'security', label: 'Security Settings', route: '/security-settings' },
        { icon: 'settings', label: 'App Settings', route: '/settings' },
      ],
    },
    {
      title: 'Activity',
      items: [
        { icon: 'notifications', label: 'Notifications', route: '/notifications' },
        { icon: 'notifications-active', label: 'Price Alerts', route: '/price-alert' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help', label: 'Help Center', action: () => Alert.alert('Coming Soon', 'Help center') },
        { icon: 'headset-mic', label: 'Contact Support', action: () => Alert.alert('Coming Soon', 'Contact support') },
        { icon: 'info', label: 'About', action: () => Alert.alert('CryptoVault', 'Version 1.0.0\nBuilt with React Native & Expo') },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Account</Text>
          </View>

          {/* Profile Card */}
          <View style={styles.profileSection}>
            <View style={styles.profileCard}>
              <LinearGradient
                colors={['#8B5CF6', '#6366F1']}
                style={styles.profileGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                  {user?.kyc_verified && (
                    <View style={styles.verifiedBadge}>
                      <MaterialIcons name="verified" size={16} color={Colors.success} />
                    </View>
                  )}
                </View>

                {/* User Info */}
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user?.name || 'User'}</Text>
                  <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
                </View>

                {/* Balance Summary */}
                <View style={styles.balanceSummary}>
                  <View style={styles.balanceItem}>
                    <Text style={styles.balanceLabel}>Total Balance</Text>
                    <Text style={styles.balanceValue}>
                      ${balance?.total_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Menu Sections */}
          {menuSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.menuGroup}>
                {section.items.map((item, itemIndex) => (
                  <Pressable
                    key={itemIndex}
                    style={styles.menuItem}
                    onPress={() => {
                      if (item.route) {
                        router.push(item.route as any);
                      } else if (item.action) {
                        item.action();
                      }
                    }}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.menuIcon}>
                        <MaterialIcons name={item.icon as any} size={22} color={Colors.primary} />
                      </View>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
                  </Pressable>
                ))}
              </View>
            </View>
          ))}

          {/* Logout Button */}
          <View style={styles.logoutSection}>
            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <MaterialIcons name="logout" size={20} color={Colors.error} />
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>CryptoVault v1.0.0</Text>
            <Text style={styles.footerSubtext}>Secure Digital Wallet</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
    fontSize: isSmallScreen ? 24 : 28,
  },
  profileSection: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  profileCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  profileGradient: {
    padding: isSmallScreen ? Spacing.lg : Spacing.xl,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: isSmallScreen ? 80 : 96,
    height: isSmallScreen ? 80 : 96,
    borderRadius: isSmallScreen ? 40 : 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: isSmallScreen ? 36 : 42,
    fontWeight: '700',
    color: '#FFF',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  userName: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: isSmallScreen ? 13 : 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceSummary: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  balanceItem: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: isSmallScreen ? 12 : 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: '700',
    color: '#FFF',
  },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
    fontSize: isSmallScreen ? 11 : 12,
  },
  menuGroup: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isSmallScreen ? Spacing.sm : Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  menuLabel: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '500',
    fontSize: isSmallScreen ? 14 : 16,
  },
  logoutSection: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.errorGlow,
    borderRadius: BorderRadius.md,
    padding: isSmallScreen ? Spacing.sm : Spacing.md,
    borderWidth: 1,
    borderColor: Colors.error,
    gap: Spacing.sm,
  },
  logoutText: {
    ...Typography.body,
    color: Colors.error,
    fontWeight: '600',
    fontSize: isSmallScreen ? 14 : 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  footerText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: isSmallScreen ? 11 : 12,
  },
  footerSubtext: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: isSmallScreen ? 10 : 11,
    marginTop: 2,
  },
});
