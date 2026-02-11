import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useLivePrices } from '@/hooks/useLivePrices';
import { PriceCard } from '@/components/PriceCard';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

export default function WalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { balance, fetchBalance, isLoading: walletLoading } = useWallet();
  const { prices, isConnected, isLoading: pricesLoading } = useLivePrices(['BTC', 'ETH', 'USDT', 'USDC', 'BNB']);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBalance();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBalance();
    setRefreshing(false);
  };

  const quickActions = [
    { icon: 'arrow-downward', label: 'Deposit', route: '/deposit', color: Colors.bullish },
    { icon: 'arrow-upward', label: 'Withdraw', route: '/withdraw', color: Colors.bearish },
    { icon: 'send', label: 'Transfer', route: '/transfer', color: Colors.info },
    { icon: 'history', label: 'History', route: '/history', color: Colors.textSecondary },
  ];

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]} edges={[]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <Pressable style={styles.settingsButton} onPress={() => router.push('/settings')}>
            <MaterialIcons name="settings" size={24} color={Colors.text} />
          </Pressable>
        </View>

        {/* WebSocket Status Indicator */}
        <View style={styles.statusBar}>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? Colors.success : Colors.error }]} />
          <Text style={styles.statusText}>
            {isConnected ? 'Live prices' : 'Connecting...'}
          </Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>
            ${balance ? balance.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </Text>
          {balance && balance.balance > 0 && (
            <View style={styles.balanceChange}>
              <MaterialIcons name="trending-up" size={16} color={Colors.bullish} />
              <Text style={styles.balanceChangeText}>+2.5% today</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {quickActions.map((action) => (
            <Pressable
              key={action.label}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionButtonPressed,
              ]}
              onPress={() => router.push(action.route as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                <MaterialIcons name={action.icon as any} size={24} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Live Prices */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live Prices</Text>
            <Pressable>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>

          {pricesLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading prices...</Text>
            </View>
          ) : (
            <View style={styles.pricesGrid}>
              {Object.values(prices).slice(0, 6).map((price) => (
                <PriceCard key={price.symbol} price={price} />
              ))}
            </View>
          )}
        </View>

        {/* Recent Activity Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.emptyState}>
            <MaterialIcons name="receipt-long" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyStateText}>No recent transactions</Text>
            <Text style={styles.emptyStateSubtext}>Your activity will appear here</Text>
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
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  userName: {
    ...Typography.title,
    color: Colors.text,
    fontWeight: '700',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  balanceCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  balanceLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  balanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.bullish}20`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  balanceChangeText: {
    ...Typography.caption,
    color: Colors.bullish,
    fontWeight: '600',
    marginLeft: 4,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  actionButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  actionLabel: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.subheading,
    color: Colors.text,
    fontWeight: '700',
  },
  seeAll: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  pricesGrid: {
    gap: Spacing.sm,
  },
  emptyState: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyStateText: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyStateSubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
