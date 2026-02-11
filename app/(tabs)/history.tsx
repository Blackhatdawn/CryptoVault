import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Image } from 'react-native';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionItem } from '@/components/TransactionItem';
import { Colors, Typography, Spacing } from '@/constants/theme';

export default function HistoryScreen() {
  const { transactions, isLoading, isRefreshing, refresh } = useTransactions();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
      </View>

      {/* Transactions List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionItem transaction={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Image
              source={require('@/assets/images/empty-transactions.png')}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>
              Your transaction history will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.title,
    color: Colors.text,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.heading,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
