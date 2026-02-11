import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useLivePrices } from '@/hooks/useLivePrices';
import { QuickActions } from '@/components/QuickActions';
import { PriceCard } from '@/components/PriceCard';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

export default function WalletScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { balance, fetchBalance, isLoading } = useWallet();
  const { prices, isConnected } = useLivePrices();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBalance();
    setIsRefreshing(false);
  };

  const formatBalance = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const topPrices = prices.slice(0, 5);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <Pressable
            style={styles.notificationButton}
            onPress={() => router.push('/notifications')}
          >
            <MaterialIcons name="notifications-none" size={24} color={Colors.text} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </Pressable>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <View style={styles.connectionBadge}>
              <View
                style={[
                  styles.connectionDot,
                  { backgroundColor: isConnected ? Colors.success : Colors.error },
                ]}
              />
              <Text style={styles.connectionText}>
                {isConnected ? 'Live' : 'Offline'}
              </Text>
            </View>
          </View>
          <Text style={styles.balanceAmount}>
            {balance ? formatBalance(balance.total_usd) : '$0.00'}
          </Text>
          <View style={styles.balanceDetails}>
            <View style={styles.balanceDetailItem}>
              <Text style={styles.balanceDetailLabel}>Available</Text>
              <Text style={styles.balanceDetailValue}>
                {balance ? formatBalance(balance.available_usd) : '$0.00'}
              </Text>
            </View>
            <View style={styles.balanceDetailDivider} />
            <View style={styles.balanceDetailItem}>
              <Text style={styles.balanceDetailLabel}>Locked</Text>
              <Text style={styles.balanceDetailValue}>
                {balance ? formatBalance(balance.locked_usd || 0) : '$0.00'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <QuickActions />

        {/* Live Prices Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live Prices</Text>
            <Pressable onPress={() => router.push('/(tabs)/markets')}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>
          {topPrices.map((price) => (
            <PriceCard key={price.symbol} price={price} />
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <Pressable onPress={() => router.push('/(tabs)/history')}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>
          <Pressable
            style={styles.activityCard}
            onPress={() => router.push('/(tabs)/history')}
          >
            <MaterialIcons name="receipt-long" size={48} color={Colors.textMuted} />
            <Text style={styles.activityEmptyText}>No recent activity</Text>
            <Text style={styles.activityEmptySubtext}>
              Your transactions will appear here
            </Text>
          </Pressable>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  greeting: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  userName: {
    ...Typography.title,
    color: Colors.text,
    fontWeight: '700',
  },
  notificationButton: {
    position: 'relative',
    padding: Spacing.xs,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    ...Typography.caption,
    color: Colors.background,
    fontSize: 11,
    fontWeight: '700',
  },
  balanceCard: {
    backgroundColor: Colors.surfaceElevated,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    ...Shadows.lg,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  balanceLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  connectionText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  balanceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceDetailItem: {
    flex: 1,
  },
  balanceDetailDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  balanceDetailLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  balanceDetailValue: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.heading,
    color: Colors.text,
    fontWeight: '700',
  },
  seeAllText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  activityCard: {
    backgroundColor: Colors.surfaceElevated,
    marginHorizontal: Spacing.md,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  activityEmptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: Spacing.md,
  },
  activityEmptySubtext: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
});
