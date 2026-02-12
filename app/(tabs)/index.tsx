import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useLivePrices } from '@/hooks/useLivePrices';
import { PriceCard } from '@/components/PriceCard';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

export default function WalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { balance, isLoading: walletLoading, refresh: refreshWallet } = useWallet();
  const prices = useLivePrices();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshWallet();
    setRefreshing(false);
  }, [refreshWallet]);

  const topPrices = Array.isArray(prices) ? prices.slice(0, 5) : [];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFill}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
        >
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.name || 'Trader'}</Text>
            </View>
            <Pressable
              onPress={() => router.push('/notifications')}
              style={styles.notificationButton}
            >
              <View style={styles.notificationBadge} />
              <MaterialIcons name="notifications-none" size={28} color={Colors.text} />
            </Pressable>
          </View>

          {/* Hero Balance Card */}
          <View style={styles.heroSection}>
            <Pressable style={styles.balanceCard}>
              <LinearGradient
                colors={['#8B5CF6', '#6366F1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.balanceGradient}
              >
                {/* Glass overlay */}
                <View style={styles.glassOverlay} />
                
                {/* Floating circles decoration */}
                <View style={[styles.floatingCircle, styles.circle1]} />
                <View style={[styles.floatingCircle, styles.circle2]} />
                
                <View style={styles.balanceContent}>
                  <View style={styles.balanceTop}>
                    <View>
                      <Text style={styles.balanceLabel}>Total Balance</Text>
                      <Text style={styles.balanceAmount}>
                        ${balance?.total_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                      </Text>
                    </View>
                    <Pressable style={styles.eyeButton}>
                      <MaterialIcons name="visibility" size={24} color="rgba(255,255,255,0.9)" />
                    </Pressable>
                  </View>

                  <View style={styles.balanceStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Available</Text>
                      <Text style={styles.statValue}>
                        ${balance?.available_usd.toFixed(2) || '0.00'}
                      </Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>In Orders</Text>
                      <Text style={styles.statValue}>
                        ${balance?.locked_usd.toFixed(2) || '0.00'}
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Pressable
              style={styles.actionCard}
              onPress={() => router.push('/deposit')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.successGlow }]}>
                <MaterialIcons name="add" size={28} color={Colors.success} />
              </View>
              <Text style={styles.actionLabel}>Deposit</Text>
            </Pressable>

            <Pressable
              style={styles.actionCard}
              onPress={() => router.push('/withdraw')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.errorGlow }]}>
                <MaterialIcons name="remove" size={28} color={Colors.error} />
              </View>
              <Text style={styles.actionLabel}>Withdraw</Text>
            </Pressable>

            <Pressable
              style={styles.actionCard}
              onPress={() => router.push('/transfer')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.infoGlow }]}>
                <MaterialIcons name="swap-horiz" size={28} color={Colors.info} />
              </View>
              <Text style={styles.actionLabel}>Transfer</Text>
            </Pressable>

            <Pressable
              style={styles.actionCard}
              onPress={() => router.push('/price-alert')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.warningGlow }]}>
                <MaterialIcons name="notifications-active" size={28} color={Colors.warning} />
              </View>
              <Text style={styles.actionLabel}>Alerts</Text>
            </Pressable>
          </View>

          {/* Market Overview */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Market Overview</Text>
              <Pressable onPress={() => router.push('/(tabs)/markets')}>
                <Text style={styles.seeAllText}>See All</Text>
              </Pressable>
            </View>

            <View style={styles.priceList}>
              {topPrices.map((crypto) => (
                <PriceCard key={crypto.symbol} price={crypto} />
              ))}
            </View>
          </View>

          {/* Bottom Padding */}
          <View style={{ height: Spacing.xxxl }} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  greeting: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  userName: {
    ...Typography.h2,
    color: Colors.text,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  heroSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  balanceCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.xl,
  },
  balanceGradient: {
    padding: Spacing.xl,
    position: 'relative',
    minHeight: 180,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  floatingCircle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle1: {
    width: 120,
    height: 120,
    top: -30,
    right: -20,
  },
  circle2: {
    width: 80,
    height: 80,
    bottom: -20,
    left: -10,
  },
  balanceContent: {
    position: 'relative',
    zIndex: 1,
  },
  balanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  eyeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: Spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  seeAllText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  priceList: {
    gap: Spacing.sm,
  },
});
