import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Typography, Spacing } from '@/constants/theme';
import type { Transaction } from '@/types';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

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

  const getGradient = () => {
    switch (transaction.type) {
      case 'deposit':
        return ['#10B981', '#34D399'];
      case 'withdrawal':
        return ['#EF4444', '#F87171'];
      case 'transfer':
      case 'transfer_sent':
      case 'transfer_received':
        return ['#3B82F6', '#60A5FA'];
      default:
        return ['#71717A', '#A1A1AA'];
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
      {/* Gradient Border */}
      <LinearGradient
        colors={getGradient() as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientBorder}
      />

      {/* Icon */}
      <View style={styles.iconWrapper}>
        <LinearGradient
          colors={getGradient() as any}
          style={styles.iconGradient}
        >
          <MaterialIcons name={getIcon() as any} size={22} color="#FFF" />
        </LinearGradient>
      </View>

      {/* Details */}
      <View style={styles.details}>
        <Text style={styles.type}>{formatType(transaction.type)}</Text>
        <View style={styles.dateRow}>
          <MaterialIcons name="schedule" size={12} color={Colors.textMuted} />
          <Text style={styles.date}>{formatDate(transaction.created_at)}</Text>
        </View>
      </View>

      {/* Amount & Status */}
      <View style={styles.amountContainer}>
        <Text style={styles.amount}>
          {transaction.type === 'deposit' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor()}20` }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
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
    borderRadius: BorderRadius.lg,
    padding: isSmallScreen ? Spacing.sm : Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  gradientBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  iconWrapper: {
    marginLeft: Spacing.sm,
    marginRight: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  iconGradient: {
    width: isSmallScreen ? 44 : 48,
    height: isSmallScreen ? 44 : 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
  },
  type: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: 4,
    fontSize: isSmallScreen ? 14 : 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: isSmallScreen ? 11 : 12,
  },
  amountContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    ...Typography.bodyBold,
    fontSize: isSmallScreen ? 15 : 17,
    fontWeight: '700',
    color: Colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    gap: 3,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  status: {
    ...Typography.caption,
    fontWeight: '700',
    textTransform: 'capitalize',
    fontSize: isSmallScreen ? 10 : 11,
  },
});
