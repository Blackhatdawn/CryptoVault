import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Typography, Spacing } from '@/constants/theme';
import type { Transaction } from '@/types';

const { width } = Dimensions.get('window');
const isSmall = width < 375;

const TYPE_CONFIG: Record<string, { icon: string; label: string; gradient: string[] }> = {
  deposit:           { icon: 'arrow-downward', label: 'Deposit',          gradient: ['#059669','#10B981'] },
  withdrawal:        { icon: 'arrow-upward',   label: 'Withdrawal',       gradient: ['#DC2626','#EF4444'] },
  transfer:          { icon: 'swap-horiz',      label: 'Transfer',         gradient: ['#2563EB','#3B82F6'] },
  transfer_sent:     { icon: 'send',            label: 'Sent',             gradient: ['#2563EB','#3B82F6'] },
  transfer_received: { icon: 'move-to-inbox',   label: 'Received',         gradient: ['#059669','#10B981'] },
  trade:             { icon: 'show-chart',      label: 'Trade',            gradient: ['#7C3AED','#4F46E5'] },
};

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  completed: { color: Colors.success, label: 'Completed' },
  pending:   { color: Colors.warning, label: 'Pending'   },
  failed:    { color: Colors.error,   label: 'Failed'    },
};

interface TransactionItemProps { transaction: Transaction }

export const TransactionItem: React.FC<TransactionItemProps> = React.memo(({ transaction }) => {
  // Memoize configuration lookups
  const cfg = useMemo(() => 
    TYPE_CONFIG[transaction.type] || { icon: 'help', label: transaction.type, gradient: ['#64748B','#94A3B8'] }
  , [transaction.type]);
  
  const status = useMemo(() => 
    STATUS_CONFIG[transaction.status] || { color: Colors.textMuted, label: transaction.status }
  , [transaction.status]);
  
  const isIn = useMemo(() => 
    ['deposit','transfer_received'].includes(transaction.type)
  , [transaction.type]);
  
  // Memoize date formatting function
  const fmt = useCallback((ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'Just now';
    if (h < 24) return `${h}h ago`;
    if (h < 48) return 'Yesterday';
    return new Date(ts).toLocaleDateString();
  }, []);
  
  // Memoize formatted amount
  const formattedAmount = useMemo(() => {
    const amount = Math.abs(transaction.amount).toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
    return `${isIn ? '+' : '-'}$${amount}`;
  }, [transaction.amount, isIn]);

  return (
    <View style={styles.card}>
      {/* Left accent */}
      <LinearGradient
        colors={cfg.gradient as any}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={styles.accent}
      />

      {/* Icon */}
      <View style={styles.iconWrap}>
        <LinearGradient colors={cfg.gradient as any} style={styles.iconGrad}>
          <MaterialIcons name={cfg.icon as any} size={20} color="#FFF" />
        </LinearGradient>
      </View>

      {/* Details */}
      <View style={styles.details}>
        <Text style={styles.type}>{cfg.label}</Text>
        <View style={styles.metaRow}>
          <MaterialIcons name="schedule" size={11} color={Colors.textMuted} />
          <Text style={styles.date}>{fmt(transaction.created_at)}</Text>
        </View>
      </View>

      {/* Amount + Status */}
      <View style={styles.right}>
        <Text style={[styles.amount, { color: isIn ? Colors.success : Colors.error }]}>
          {formattedAmount}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: `${status.color}20` }]}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>
    </View>
  );
});

TransactionItem.displayName = 'TransactionItem';

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg,
    borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden',
  },
  accent: { width: 3, alignSelf: 'stretch' },

  iconWrap: { borderRadius: BorderRadius.md, overflow: 'hidden', marginLeft: Spacing.sm, marginRight: Spacing.md, marginVertical: Spacing.sm },
  iconGrad: { width: isSmall ? 40 : 46, height: isSmall ? 40 : 46, alignItems: 'center', justifyContent: 'center' },

  details: { flex: 1, paddingVertical: Spacing.sm },
  type:    { ...Typography.captionBold, color: Colors.text, fontWeight: '700', fontSize: isSmall ? 13 : 15 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  date:    { ...Typography.micro, color: Colors.textMuted },

  right:   { alignItems: 'flex-end', paddingRight: Spacing.md, gap: 5 },
  amount:  { ...Typography.captionBold, fontWeight: '700', fontSize: isSmall ? 14 : 16 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 3, borderRadius: BorderRadius.xs, gap: 4 },
  statusDot:   { width: 5, height: 5, borderRadius: 3 },
  statusText:  { ...Typography.micro, fontWeight: '700', textTransform: 'capitalize', fontSize: isSmall ? 9 : 10 },
});
