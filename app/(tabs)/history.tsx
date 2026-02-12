import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionItem } from '@/components/TransactionItem';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

export default function HistoryScreen() {
  const { transactions, isLoading, isRefreshing, refresh } = useTransactions();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Transaction History</Text>
            <Text style={styles.subtitle}>All your crypto activities</Text>
          </View>
        </View>

        {/* Transactions List */}
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TransactionItem transaction={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {/* Empty Icon */}
              <View style={styles.emptyIconContainer}>
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.1)', 'rgba(99, 102, 241, 0.05)']}
                  style={styles.emptyIconGradient}
                >
                  <MaterialIcons name="receipt-long" size={isSmallScreen ? 48 : 64} color={Colors.textMuted} />
                </LinearGradient>
              </View>

              {/* Empty Text */}
              <Text style={styles.emptyTitle}>No Transactions Yet</Text>
              <Text style={styles.emptySubtitle}>
                Your transaction history will appear here once you start trading
              </Text>

              {/* Info Cards */}
              <View style={styles.infoCards}>
                <View style={styles.infoCard}>
                  <View style={styles.infoIconContainer}>
                    <MaterialIcons name="account-balance-wallet" size={20} color={Colors.success} />
                  </View>
                  <Text style={styles.infoCardText}>Deposit crypto to get started</Text>
                </View>

                <View style={styles.infoCard}>
                  <View style={styles.infoIconContainer}>
                    <MaterialIcons name="swap-horiz" size={20} color={Colors.info} />
                  </View>
                  <Text style={styles.infoCardText}>Make transfers and trades</Text>
                </View>

                <View style={styles.infoCard}>
                  <View style={styles.infoIconContainer}>
                    <MaterialIcons name="history" size={20} color={Colors.warning} />
                  </View>
                  <Text style={styles.infoCardText}>Track all your activities</Text>
                </View>
              </View>
            </View>
          }
        />
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    fontSize: isSmallScreen ? 24 : 28,
    marginBottom: 2,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: isSmallScreen ? 12 : 14,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: isSmallScreen ? Spacing.xl : Spacing.xxl,
    paddingHorizontal: Spacing.md,
  },
  emptyIconContainer: {
    width: isSmallScreen ? 120 : 140,
    height: isSmallScreen ? 120 : 140,
    borderRadius: isSmallScreen ? 60 : 70,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  emptyIconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: isSmallScreen ? 60 : 70,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
    fontSize: isSmallScreen ? 20 : 24,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    maxWidth: 280,
    lineHeight: 22,
    fontSize: isSmallScreen ? 14 : 16,
  },
  infoCards: {
    width: '100%',
    gap: Spacing.sm,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: isSmallScreen ? Spacing.sm : Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCardText: {
    ...Typography.body,
    color: Colors.textSecondary,
    flex: 1,
    fontSize: isSmallScreen ? 13 : 14,
  },
});
