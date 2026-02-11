import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing } from '@/constants/theme';
import type { Transaction } from '@/types';

interface TransactionItemProps {
  transaction: Transaction;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const getIcon = () => {
    switch (transaction.type) {
      case 'deposit':
        return 'arrow-downward';
      case 'withdrawal':
        return 'arrow-upward';
      case 'transfer':
      case 'transfer_sent':
      case 'transfer_received':
        return 'send';
      case 'trade':
        return 'swap-horiz';
      default:
        return 'help-outline';
    }
  };

  const getColor = () => {
    switch (transaction.type) {
      case 'deposit':
        return Colors.bullish;
      case 'withdrawal':
        return Colors.bearish;
      case 'transfer':
      case 'transfer_sent':
      case 'transfer_received':
        return Colors.info;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case 'completed':
        return Colors.success;
      case 'pending':
        return Colors.warning;
      case 'failed':
        return Colors.error;
      default:
        return Colors.textMuted;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const formatType = (type: string) => {
    return type.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: `${getColor()}20` }]}>
        <MaterialIcons name={getIcon() as any} size={24} color={getColor()} />
      </View>

      <View style={styles.details}>
        <Text style={styles.type}>{formatType(transaction.type)}</Text>
        <Text style={styles.date}>{formatDate(transaction.created_at)}</Text>
      </View>

      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: getColor() }]}>
          {transaction.type === 'deposit' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}20` }]}>
          <Text style={[styles.status, { color: getStatusColor() }]}>
            {transaction.status}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  details: {
    flex: 1,
  },
  type: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    ...Typography.subheading,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  status: {
    ...Typography.small,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
