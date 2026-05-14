import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useAuth } from '@/hooks/useAuth';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmall = width < 375;
  const { user, logout, biometricEnabled, enableBiometric } = useAuth();
  const [loading, setLoading]   = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [pushAlerts, setPushAlerts]   = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [txAlerts, setTxAlerts]       = useState(true);

  const handleBioToggle = async (v: boolean) => {
    try { setLoading(true); await enableBiometric(v); }
    catch (e: any) { Alert.alert('Error', e.message || 'Failed to update'); }
    finally { setLoading(false); }
  };

  const handleLogout = () => Alert.alert('Logout', 'Are you sure?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Logout', style: 'destructive', onPress: async () => { await logout(); router.replace('/auth'); } },
  ]);

  type SwitchRow = { icon: string; label: string; sub?: string; value: boolean; onChange: (v: boolean) => void; color?: string };
  type SettingSection = { title: string; items: SwitchRow[] };

  const switchSections: SettingSection[] = [
    {
      title: 'Security',
      items: [
        { icon: 'fingerprint', label: 'Biometric Login',    sub: 'Face ID or fingerprint',          value: biometricEnabled, onChange: handleBioToggle, color: Colors.primary },
        { icon: 'dark-mode',   label: 'Dark Mode',          sub: 'App appearance',                  value: darkMode,         onChange: setDarkMode,     color: Colors.info    },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { icon: 'notifications',        label: 'Push Notifications', sub: 'All app alerts',      value: pushAlerts,   onChange: setPushAlerts,   color: Colors.warning },
        { icon: 'notifications-active', label: 'Price Alerts',       sub: 'Target price reached',value: priceAlerts,  onChange: setPriceAlerts,  color: Colors.accent  },
        { icon: 'receipt',              label: 'Transaction Alerts', sub: 'Deposits, withdrawals',value: txAlerts,    onChange: setTxAlerts,     color: Colors.success },
      ],
    },
  ];

  const navItems = [
    { icon: 'lock',            label: 'Change Password',    sub: 'Update account password',  color: Colors.primary, action: () => Alert.alert('Change Password','Feature coming soon') },
    { icon: 'language',        label: 'Language',           sub: 'English (US)',              color: Colors.info,    action: () => Alert.alert('Language','Multi-language coming soon') },
    { icon: 'storage',         label: 'Data & Privacy',     sub: 'Manage your data',         color: Colors.warning, action: () => Alert.alert('Privacy','Feature coming soon') },
    { icon: 'bug-report',      label: 'Send Feedback',      sub: 'Report bugs or ideas',     color: Colors.success, action: () => Alert.alert('Feedback','feedback@cryptovault.io') },
  ];

  return (
    <View style={styles.root}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>

        {/* Header */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 44 }} />
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Profile card */}
          <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.profileCard}>
            <LinearGradient colors={['#7C3AED','#4F46E5']} style={styles.profileGrad}>
              <View style={styles.avatar}>
                <Text style={styles.avatarLetter}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name || 'User'}</Text>
                <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
              </View>
              <Pressable onPress={() => router.push('/edit-profile')} style={styles.editBtn}>
                <MaterialIcons name="edit" size={18} color="rgba(255,255,255,0.9)" />
              </Pressable>
            </LinearGradient>
          </Animated.View>

          {/* Switch sections */}
          {switchSections.map((sec, si) => (
            <Animated.View key={si} entering={FadeInDown.delay(120 + si * 60).springify()} style={styles.section}>
              <Text style={styles.sectionTitle}>{sec.title}</Text>
              <View style={styles.group}>
                {sec.items.map((item, ii) => (
                  <View key={ii} style={[styles.row, ii < sec.items.length - 1 && styles.rowBorder]}>
                    <View style={[styles.rowIcon, { backgroundColor: `${item.color || Colors.primary}22` }]}>
                      <MaterialIcons name={item.icon as any} size={20} color={item.color || Colors.primary} />
                    </View>
                    <View style={styles.rowText}>
                      <Text style={styles.rowLabel}>{item.label}</Text>
                      {item.sub && <Text style={styles.rowSub}>{item.sub}</Text>}
                    </View>
                    <Switch
                      value={item.value}
                      onValueChange={item.onChange}
                      disabled={loading}
                      trackColor={{ false: Colors.border, true: Colors.primary }}
                      thumbColor={item.value ? '#FFF' : Colors.textMuted}
                      ios_backgroundColor={Colors.border}
                    />
                  </View>
                ))}
              </View>
            </Animated.View>
          ))}

          {/* Nav items */}
          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
            <Text style={styles.sectionTitle}>General</Text>
            <View style={styles.group}>
              {navItems.map((item, ii) => (
                <Pressable
                  key={ii}
                  style={({ pressed }) => [
                    styles.row, ii < navItems.length - 1 && styles.rowBorder,
                    pressed && { backgroundColor: Colors.surfaceHighlight },
                  ]}
                  onPress={item.action}
                >
                  <View style={[styles.rowIcon, { backgroundColor: `${item.color}22` }]}>
                    <MaterialIcons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={styles.rowLabel}>{item.label}</Text>
                    <Text style={styles.rowSub}>{item.sub}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* App info */}
          <Animated.View entering={FadeInDown.delay(380).springify()} style={styles.infoCard}>
            <LinearGradient colors={[Colors.primaryGlow2,'transparent']} style={styles.infoGrad}>
              <MaterialIcons name="verified-user" size={20} color={Colors.primary} />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>CryptoVault v1.0.0</Text>
                <Text style={styles.infoSub}>All systems operational</Text>
              </View>
              <View style={styles.statusDot} />
            </LinearGradient>
          </Animated.View>

          {/* Logout */}
          <Animated.View entering={FadeInDown.delay(440).springify()}>
            <Pressable style={styles.logoutBtn} onPress={handleLogout}>
              <LinearGradient colors={[Colors.errorGlow2,'transparent']} style={styles.logoutGrad}>
                <MaterialIcons name="logout" size={20} color={Colors.error} />
                <Text style={styles.logoutText}>Sign Out</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <Text style={styles.footer}>© 2026 CryptoVault · Enterprise Wallet Platform</Text>
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
  title:   { ...Typography.heading, color: Colors.text },

  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },

  profileCard: { borderRadius: BorderRadius.xl, overflow: 'hidden', marginBottom: Spacing.xl, ...Shadows.lg },
  profileGrad: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarLetter: { fontSize: 26, fontWeight: '800', color: '#FFF' },
  profileInfo:  { flex: 1 },
  profileName:  { ...Typography.bodyBold, color: '#FFF', fontSize: 17 },
  profileEmail: { ...Typography.caption, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  editBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },

  section:      { marginBottom: Spacing.xl },
  sectionTitle: { ...Typography.label, color: Colors.textMuted, marginBottom: Spacing.sm },
  group: { backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  row:   { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowIcon:   { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  rowText:   { flex: 1 },
  rowLabel:  { ...Typography.bodyBold, color: Colors.text, fontSize: 15 },
  rowSub:    { ...Typography.caption, color: Colors.textMuted, marginTop: 2, fontSize: 12 },

  infoCard: { borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md },
  infoGrad: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  infoText: { flex: 1 },
  infoLabel: { ...Typography.captionBold, color: Colors.text },
  infoSub:   { ...Typography.micro, color: Colors.success, marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },

  logoutBtn:  { borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.error, marginBottom: Spacing.md },
  logoutGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: Spacing.md, gap: Spacing.sm },
  logoutText: { ...Typography.bodyBold, color: Colors.error },

  footer: { ...Typography.caption, color: Colors.textDisabled, textAlign: 'center', marginTop: Spacing.sm },
});
