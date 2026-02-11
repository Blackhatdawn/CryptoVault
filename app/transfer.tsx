import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

export default function TransferScreen() {
  const router = useRouter();
  const { balance, createTransfer } = useWallet();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipient_email: '',
    amount: '',
    note: '',
  });

  const handleTransfer = async () => {
    if (!formData.recipient_email || !formData.amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const transferAmount = parseFloat(formData.amount);
    if (transferAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (balance && transferAmount > balance.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    Alert.alert(
      'Confirm Transfer',
      `Send $${transferAmount.toFixed(2)} to ${formData.recipient_email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await createTransfer({
                recipient_email: formData.recipient_email,
                amount: transferAmount,
                note: formData.note || undefined,
              });

              if (result.success) {
                Alert.alert('Success', 'Transfer completed successfully', [
                  { text: 'OK', onPress: () => router.back() },
                ]);
              } else {
                Alert.alert('Error', result.error || 'Transfer failed');
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const availableBalance = balance?.balance || 0;
  const transferAmount = parseFloat(formData.amount) || 0;
  const remainingBalance = availableBalance - transferAmount;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>P2P Transfer</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Available Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>

        {/* Recipient */}
        <View style={styles.section}>
          <Input
            label="Recipient Email"
            value={formData.recipient_email}
            onChangeText={(recipient_email) => setFormData({ ...formData, recipient_email })}
            placeholder="recipient@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Input
            label="Amount (USD)"
            value={formData.amount}
            onChangeText={(amount) => setFormData({ ...formData, amount })}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
          <View style={styles.quickAmounts}>
            {[25, 50, 100].map((amount) => (
              <Pressable
                key={amount}
                style={styles.quickAmountButton}
                onPress={() => setFormData({ ...formData, amount: amount.toString() })}
              >
                <Text style={styles.quickAmountText}>${amount}</Text>
              </Pressable>
            ))}
            <Pressable
              style={styles.quickAmountButton}
              onPress={() => setFormData({ ...formData, amount: availableBalance.toString() })}
            >
              <Text style={styles.quickAmountText}>Max</Text>
            </Pressable>
          </View>
        </View>

        {/* Note (Optional) */}
        <View style={styles.section}>
          <Input
            label="Note (Optional)"
            value={formData.note}
            onChangeText={(note) => setFormData({ ...formData, note })}
            placeholder="Add a note..."
            multiline
            numberOfLines={3}
            style={styles.noteInput}
          />
        </View>

        {/* Transfer Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Transfer Amount</Text>
            <Text style={styles.summaryValue}>
              ${transferAmount.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Transfer Fee</Text>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>
              FREE
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotal}>Remaining Balance</Text>
            <Text style={[
              styles.summaryTotal,
              { color: remainingBalance < 0 ? Colors.error : Colors.text }
            ]}>
              ${Math.max(0, remainingBalance).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <MaterialIcons name="info-outline" size={20} color={Colors.info} />
          <Text style={styles.infoText}>
            Transfers are instant and free between CryptoVault users. Make sure the recipient email is correct.
          </Text>
        </View>

        {/* Send Button */}
        <Button
          title="Send Transfer"
          onPress={handleTransfer}
          loading={loading}
          disabled={!formData.recipient_email || !formData.amount || transferAmount <= 0}
          style={styles.sendButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  title: {
    ...Typography.heading,
    color: Colors.text,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  balanceCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  balanceLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  quickAmountText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
  },
  noteInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
  },
  summaryCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  summaryLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  summaryValue: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  summaryTotal: {
    ...Typography.subheading,
    color: Colors.text,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: `${Colors.info}20`,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoText: {
    ...Typography.caption,
    color: Colors.info,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  sendButton: {
    marginTop: Spacing.md,
  },
});
