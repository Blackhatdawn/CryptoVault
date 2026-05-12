import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  Pressable, Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn, ZoomIn } from 'react-native-reanimated';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useLivePrices } from '@/hooks/useLivePrices';
import { PriceCard } from '@/components/PriceCard';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { Colors, Typography, Spacing, BorderRadius, Shadows, CryptoGradients } from '@/constants/theme';

const { width } = Dimensions.get('window');
const isSmall = width < 375;

const QUICK_ACTIONS = [
  { icon: 'add-circle', label: 'Deposit',  route: '/deposit',     gradient: ['#059669','#10B981'] as [string,string], glow: Colors.successGlow },
  { icon: 'remove-circle', label: 'Withdraw', route: '/withdraw',    gradient: ['#DC2626','#EF4444'] as [string,string], glow: Colors.errorGlow   },
  { icon: 'swap-horizontal-circle', label: 'Transfer', route: '/transfer',   gradient: ['#2563EB','#3B82F6'] as [string,string], glow: Colors.infoGlow    },
  { icon: 'show-chart', label: 'Trade',    route: '/trading',     gradient: ['#7C3AED','#4F46E5'] as [string,string], glow: Colors.primaryGlow },
];

export default function WalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { balance, isLoading: walletLoading, refresh: refreshWallet } = useWallet();
  const { prices } = useLivePrices();
  const [refreshing, setRefreshing] = useState(false);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [hasNotifications] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshWallet();
    setRefreshing(false);
  }, [refreshWallet]);

  const topPrices = Array.isArray(prices) ? prices.slice(0, 5) : [];

  const stripCoins = ['BTC', 'ETH', 'SOL'].map(sym => {
    const p = Array.isArray(prices) ? prices.find((x: any) => x.symbol === sym) : null;
    const pct = p ? parseFloat(p.changePercent24Hr || '0') : null;
    return {
      label: sym,
      pct: pct !== null ? `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%` : '---',
      pos: pct !== null ? pct >= 0 : true,
      color: CryptoGradients[sym as keyof typeof CryptoGradients] || [Colors.primary, Colors.primaryMid],
    };
  });

  const formatBalance = (val: number) =>
    balanceHidden ? '••••••' : `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <View style={styles.root}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
        >
          {/* ─── Header ─────────────────────────────────────────────── */}
          <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good {getGreeting()},</Text>
              <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'Trader'} 👋</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable onPress={() => router.push('/notifications')} style={styles.iconBtn}>
                <MaterialIcons name="notifications-none" size={24} color={Colors.text} />
                {hasNotifications && <View style={styles.notifDot} />}
              </Pressable>
              <Pressable onPress={() => router.push('/(tabs)/account')} style={styles.avatarBtn}>
                <LinearGradient colors={['#7C3AED','#4F46E5']} style={styles.avatarGradient}>
                  <Text style={styles.avatarLetter}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>

          {/* ─── Hero Balance Card ───────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.heroWrap}>
            <LinearGradient
              colors={['#7C3AED','#4F46E5','#2563EB']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              {/* Glass sheen */}
              <View style={styles.heroBgSheen} />
              {/* Decorative circles */}
              <View style={[styles.deco, styles.deco1]} />
              <View style={[styles.deco, styles.deco2]} />
              <View style={[styles.deco, styles.deco3]} />

              <View style={styles.heroContent}>
                <View style={styles.heroTop}>
                  <View>
                    <Text style={styles.heroLabel}>Portfolio Balance</Text>
                    {walletLoading ? (
                      <View style={styles.balanceSkeleton} />
                    ) : (
                      <Text style={styles.heroBalance}>
                        {formatBalance(balance?.total_usd || 0)}
                      </Text>
                    )}
                    <View style={styles.heroChange}>
                      <MaterialIcons name="account-balance-wallet" size={14} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.heroChangeTxt}>Portfolio</Text>
                    </View>
                  </View>
                  <Pressable style={styles.eyeBtn} onPress={() => setBalanceHidden(!balanceHidden)}>
                    <MaterialIcons
                      name={balanceHidden ? 'visibility-off' : 'visibility'}
                      size={20} color="rgba(255,255,255,0.85)"
                    />
                  </Pressable>
                </View>

                <View style={styles.heroStats}>
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatLabel}>Available</Text>
                    <Text style={styles.heroStatValue}>
                      {balanceHidden ? '••••' : `$${(balance?.available_usd || 0).toFixed(2)}`}
                    </Text>
                  </View>
                  <View style={styles.heroDivider} />
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatLabel}>In Orders</Text>
                    <Text style={styles.heroStatValue}>
                      {balanceHidden ? '••••' : `$${(balance?.locked_usd || 0).toFixed(2)}`}
                    </Text>
                  </View>
                  <View style={styles.heroDivider} />
                  <View style={styles.heroStatItem}>
                    <Text style={styles.heroStatLabel}>P&L</Text>
                    <Text style={[styles.heroStatValue, { color: Colors.textSecondary }]}>N/A</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* ─── Quick Actions ───────────────────────────────────────── */}
          <View style={styles.actionsRow}>
            {QUICK_ACTIONS.map((a, i) => (
              <Animated.View key={a.label} entering={ZoomIn.delay(120 + i * 60).springify()} style={styles.actionItem}>
                <Pressable
                  onPress={() => router.push(a.route as any)}
                  style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }]}
                >
                  <LinearGradient colors={a.gradient} style={styles.actionIconWrap}>
                    <MaterialIcons name={a.icon as any} size={28} color="#FFF" />
                  </LinearGradient>
                  <Text style={styles.actionLabel}>{a.label}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>

          {/* ─── Portfolio Summary Strip ──────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(250).springify()}>
            <View style={styles.stripRow}>
              {stripCoins.map((c) => (
                <View key={c.label} style={styles.stripCard}>
                  <LinearGradient colors={c.color as any} style={styles.stripDot} />
                  <Text style={styles.stripLabel}>{c.label}</Text>
                  <Text style={[styles.stripPct, { color: c.pos ? Colors.success : Colors.error }]}>{c.pct}</Text>
                </View>
              ))}
              <Pressable style={styles.stripCard} onPress={() => router.push('/(tabs)/markets')}>
                <MaterialIcons name="arrow-forward" size={18} color={Colors.primary} />
                <Text style={[styles.stripLabel, { color: Colors.primary }]}>All</Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* ─── Market Overview ─────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(320).springify()}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Live Markets</Text>
                  <Text style={styles.sectionSub}>Real-time prices</Text>
                </View>
                <Pressable onPress={() => router.push('/(tabs)/markets')} style={styles.seeAllBtn}>
                  <Text style={styles.seeAll}>See All</Text>
                  <MaterialIcons name="chevron-right" size={18} color={Colors.primary} />
                </Pressable>
              </View>

              {walletLoading ? (
                <SkeletonLoader variant="price" count={4} />
              ) : (
                <View style={styles.priceList}>
                  {topPrices.map((crypto, i) => (
                    <Animated.View key={crypto.symbol} entering={FadeInDown.delay(380 + i * 60).springify()}>
                      <PriceCard price={crypto} />
                    </Animated.View>
                  ))}
                </View>
              )}
            </View>
          </Animated.View>

          {/* ─── Bottom Pad ──────────────────────────────────────────── */}
          <View style={{ height: Spacing.xxxl + insets.bottom }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

const styles = StyleSheet.create({
  root:  { flex: 1 },
  safe:  { flex: 1 },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  greeting:    { ...Typography.caption, color: Colors.textSecondary },
  userName:    { ...Typography.h3, color: Colors.text, fontWeight: '700', marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border, position: 'relative',
  },
  notifDot: {
    position: 'absolute', top: 10, right: 10,
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.error,
    borderWidth: 1, borderColor: Colors.surface,
  },
  avatarBtn: { borderRadius: 22, overflow: 'hidden', ...Shadows.primaryGlow },
  avatarGradient: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: '#FFF', fontSize: 18, fontWeight: '700' },

  // Hero card
  heroWrap: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  heroCard: {
    borderRadius: BorderRadius.xl, padding: Spacing.xl, minHeight: 200,
    overflow: 'hidden', position: 'relative', ...Shadows.xl,
  },
  heroBgSheen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  deco: { position: 'absolute', borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.07)' },
  deco1: { width: 160, height: 160, top: -50, right: -40 },
  deco2: { width: 100, height: 100, bottom: -30, left: -20 },
  deco3: { width: 60,  height: 60,  top: 40,    right: 80 },
  heroContent: { position: 'relative', zIndex: 1 },
  heroTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  heroLabel:   { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 6, fontWeight: '500' },
  heroBalance: { fontSize: isSmall ? 34 : 40, fontWeight: '800', color: '#FFF', letterSpacing: -1.5 },
  balanceSkeleton: { width: 180, height: 44, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BorderRadius.md, marginTop: 4 },
  heroChange: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 3 },
  heroChangeTxt: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  eyeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  heroStats:   { flexDirection: 'row', alignItems: 'center' },
  heroStatItem:{ flex: 1 },
  heroStatLabel:{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 3, fontWeight: '500' },
  heroStatValue:{ fontSize: 16, fontWeight: '700', color: '#FFF' },
  heroDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.18)', marginHorizontal: Spacing.sm },

  // Quick Actions
  actionsRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg, gap: Spacing.sm,
  },
  actionItem: { flex: 1 },
  actionBtn:  { alignItems: 'center' },
  actionIconWrap: {
    width: isSmall ? 52 : 60, height: isSmall ? 52 : 60,
    borderRadius: isSmall ? 26 : 30, alignItems: 'center', justifyContent: 'center',
    marginBottom: 8, ...Shadows.md,
  },
  actionLabel: { ...Typography.micro, color: Colors.textSecondary, fontWeight: '600', textAlign: 'center' },

  // Strip
  stripRow: {
    flexDirection: 'row', marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.sm,
  },
  stripCard: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 5, paddingVertical: 6,
  },
  stripDot:   { width: 10, height: 10, borderRadius: 5 },
  stripLabel: { ...Typography.captionBold, color: Colors.text },
  stripPct:   { ...Typography.caption, fontWeight: '700', fontSize: 12 },

  // Section
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: Spacing.md },
  sectionTitle: { ...Typography.h4, color: Colors.text },
  sectionSub:   { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  seeAllBtn:    { flexDirection: 'row', alignItems: 'center' },
  seeAll:       { ...Typography.captionBold, color: Colors.primary },
  priceList:    { gap: Spacing.sm },
});
