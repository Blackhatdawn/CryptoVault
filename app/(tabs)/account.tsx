import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, Alert, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

type MenuSection = {
  title: string;
  items: { icon: string; label: string; subtitle?: string; route?: string; action?: () => void; badge?: string; color?: string }[];
};

export default function AccountScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmall = width < 375;
  const { user, logout } = useAuth();
  const { balance } = useWallet();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); router.replace('/auth'); } },
    ]);
  };

  const menuSections: MenuSection[] = [
    {
      title: 'Account Management',
      items: [
        { icon: 'person-outline',    label: 'Edit Profile',      subtitle: 'Update your personal info',   route: '/edit-profile',      color: Colors.primary },
        { icon: 'verified-user',     label: 'KYC Verification',  subtitle: user?.kyc_verified ? 'Verified' : 'Complete to unlock features', color: user?.kyc_verified ? Colors.success : Colors.warning },
        { icon: 'credit-card',       label: 'Payment Methods',   subtitle: 'Manage bank accounts & cards', color: Colors.info    },
        { icon: 'description',       label: 'Statements',        subtitle: 'Download account statements',  color: Colors.accent  },
      ],
    },
    {
      title: 'Security & Privacy',
      items: [
        { icon: 'security',     label: 'Security Settings', subtitle: 'Biometrics, PIN, 2FA',         route: '/security-settings', color: Colors.success  },
        { icon: 'settings',     label: 'App Settings',      subtitle: 'Preferences & notifications',  route: '/settings',          color: Colors.primary  },
        { icon: 'notifications',label: 'Notifications',     subtitle: 'Price alerts & activity',      route: '/notifications',     color: Colors.warning  },
        { icon: 'notifications-active', label: 'Price Alerts', subtitle: 'Set custom price targets', route: '/price-alert',       color: Colors.accent   },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-outline',  label: 'Help Center',      subtitle: 'FAQ & guides',              action: () => Alert.alert('Help Center', 'Visit our website for support'), color: Colors.info },
        { icon: 'headset-mic',   label: 'Contact Support',  subtitle: 'Live chat & email',         action: () => Alert.alert('Support', 'support@cryptovault.io'),            color: Colors.primary },
        { icon: 'star-outline',  label: 'Rate the App',     subtitle: 'Share your feedback',       action: () => Alert.alert('Thanks!', 'Redirecting to App Store...'),       color: Colors.accent },
        { icon: 'info-outline',  label: 'About CryptoVault',subtitle: 'Version 1.0.0',            action: () => Alert.alert('CryptoVault', 'Version 1.0.0\nBuilt with React Native & Expo'), color: Colors.textMuted },
      ],
    },
  ];

  const kycStatus = user?.kyc_verified ? 'Verified' : 'Unverified';
  const kycColor  = user?.kyc_verified ? Colors.success : Colors.warning;

  return (
    <View style={styles.root}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* ─── Header ─────────────────────────────────────────────── */}
          <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
            <Text style={styles.title}>Account</Text>
          </Animated.View>

          {/* ─── Profile Hero Card ───────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.heroWrap}>
            <LinearGradient
              colors={['#7C3AED','#4F46E5','#2563EB']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              {/* Decorative circles */}
              <View style={[styles.deco, { width: 120, height: 120, top: -30, right: -20 }]} />
              <View style={[styles.deco, { width: 70,  height: 70,  bottom: -20, left: -10 }]} />

              <View style={styles.heroContent}>
                {/* Avatar */}
                <View style={styles.avatarWrap}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarLetter}>
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                  {user?.kyc_verified && (
                    <View style={styles.verifiedBadge}>
                      <MaterialIcons name="verified" size={14} color={Colors.success} />
                    </View>
                  )}
                </View>

                {/* User info */}
                <Text style={styles.userName}>{user?.name || 'CryptoVault User'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>

                {/* KYC badge */}
                <View style={[styles.kycBadge, { borderColor: kycColor }]}>
                  <MaterialIcons name={user?.kyc_verified ? 'check-circle' : 'pending'} size={13} color={kycColor} />
                  <Text style={[styles.kycText, { color: kycColor }]}>KYC {kycStatus}</Text>
                </View>

                {/* Balance strip */}
                <View style={styles.balanceStrip}>
                  <View style={styles.balanceItem}>
                    <Text style={styles.balanceItemLabel}>Portfolio</Text>
                    <Text style={styles.balanceItemValue}>
                      ${(balance?.total_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <View style={styles.balanceDivider} />
                  <View style={styles.balanceItem}>
                    <Text style={styles.balanceItemLabel}>Available</Text>
                    <Text style={styles.balanceItemValue}>
                      ${(balance?.available_usd || 0).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.balanceDivider} />
                  <View style={styles.balanceItem}>
                    <Text style={styles.balanceItemLabel}>Locked</Text>
                    <Text style={styles.balanceItemValue}>
                      ${(balance?.locked_usd || 0).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* ─── Quick Stats Row ─────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(130).springify()} style={styles.statsRow}>
            {[
              { icon: 'swap-horiz',    label: 'Trades',   value: 'N/A', color: Colors.primary },
              { icon: 'arrow-downward',label: 'Deposits', value: 'N/A', color: Colors.success },
              { icon: 'trending-up',   label: 'P&L',      value: 'N/A', color: Colors.accent  },
            ].map((s, i) => (
              <View key={i} style={styles.statCard}>
                <LinearGradient colors={[`${s.color}18`, 'transparent']} style={styles.statGrad}>
                  <View style={[styles.statIcon, { backgroundColor: `${s.color}25` }]}>
                    <MaterialIcons name={s.icon as any} size={18} color={s.color} />
                  </View>
                  <Text style={styles.statLabel}>{s.label}</Text>
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                </LinearGradient>
              </View>
            ))}
          </Animated.View>

          {/* ─── Menu Sections ───────────────────────────────────────── */}
          {menuSections.map((section, si) => (
            <Animated.View key={si} entering={FadeInDown.delay(200 + si * 60).springify()} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.menuGroup}>
                {section.items.map((item, ii) => (
                  <Pressable
                    key={ii}
                    style={({ pressed }) => [
                      styles.menuItem,
                      ii < section.items.length - 1 && styles.menuItemBorder,
                      pressed && { backgroundColor: Colors.surfaceHighlight },
                    ]}
                    onPress={() => {
                      if (item.route) router.push(item.route as any);
                      else if (item.action) item.action();
                    }}
                  >
                    <View style={[styles.menuIconWrap, { backgroundColor: `${item.color || Colors.primary}20` }]}>
                      <MaterialIcons name={item.icon as any} size={20} color={item.color || Colors.primary} />
                    </View>
                    <View style={styles.menuText}>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                      {item.subtitle && <Text style={styles.menuSub}>{item.subtitle}</Text>}
                    </View>
                    {item.badge && (
                      <View style={styles.badge}><Text style={styles.badgeText}>{item.badge}</Text></View>
                    )}
                    <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          ))}

          {/* ─── Logout ─────────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.section}>
            <Pressable style={styles.logoutBtn} onPress={handleLogout}>
              <LinearGradient colors={[Colors.errorGlow2, 'transparent']} style={styles.logoutGrad}>
                <MaterialIcons name="logout" size={22} color={Colors.error} />
                <Text style={styles.logoutText}>Sign Out</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* ─── Footer ──────────────────────────────────────────────── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>CryptoVault v1.0.0</Text>
            <Text style={styles.footerSub}>Enterprise Crypto Wallet Platform</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  title:  { ...Typography.h2, color: Colors.text, fontSize: 26 },

  heroWrap: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  heroCard: {
    borderRadius: BorderRadius.xl, padding: Spacing.xl,
    overflow: 'hidden', ...Shadows.xl,
  },
  deco: { position: 'absolute', borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.08)' },
  heroContent: { position: 'relative', zIndex: 1, alignItems: 'center' },

  avatarWrap: { position: 'relative', marginBottom: Spacing.sm },
  avatar: {
    width: 88, height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarLetter: { fontSize: 36, fontWeight: '800', color: '#FFF' },
  verifiedBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center',
  },
  userName:  { fontSize: 22, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: Spacing.sm },
  kycBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: BorderRadius.full,
    paddingHorizontal: 10, paddingVertical: 4, marginBottom: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  kycText: { fontSize: 11, fontWeight: '700' },
  balanceStrip: {
    flexDirection: 'row', width: '100%',
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: BorderRadius.md, padding: Spacing.md,
  },
  balanceItem:  { flex: 1, alignItems: 'center' },
  balanceItemLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 4 },
  balanceItemValue: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  balanceDivider:   { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

  statsRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md, gap: Spacing.sm },
  statCard: { flex: 1, borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  statGrad: { padding: Spacing.sm, alignItems: 'center' },
  statIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  statLabel: { ...Typography.micro, color: Colors.textMuted, marginBottom: 3 },
  statValue: { ...Typography.captionBold, fontWeight: '700' },

  section:      { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  sectionTitle: { ...Typography.label, color: Colors.textMuted, marginBottom: Spacing.sm },
  menuGroup: {
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  menuItem:       { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIconWrap:   { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  menuText:       { flex: 1 },
  menuLabel:      { ...Typography.bodyBold, color: Colors.text, fontSize: 16 },
  menuSub:        { ...Typography.caption,  color: Colors.textMuted, marginTop: 2, fontSize: 12 },
  badge: {
    backgroundColor: Colors.primaryGlow, borderRadius: BorderRadius.full,
    paddingHorizontal: 8, paddingVertical: 2, marginRight: Spacing.xs,
  },
  badgeText: { ...Typography.micro, color: Colors.primary, fontWeight: '700' },

  logoutBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.error },
  logoutGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: Spacing.md, gap: Spacing.sm },
  logoutText: { ...Typography.bodyBold, color: Colors.error },

  footer:    { alignItems: 'center', paddingVertical: Spacing.xl },
  footerText:{ ...Typography.caption, color: Colors.textMuted },
  footerSub: { ...Typography.caption, color: Colors.textDisabled, marginTop: 2, fontSize: 11 },
});
