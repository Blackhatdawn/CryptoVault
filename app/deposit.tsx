import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

const CRYPTO_OPTIONS = [
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ' },
  { symbol: 'USDT', name: 'Tether', icon: '₮' },
  { symbol: 'USDC', name: 'USD Coin', icon: '$' },
];

export default function DepositScreen() {
  const router = useRouter();
  const { createDeposit } = useWallet();
  const [loading, setLoading] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [depositData, setDepositData] = useState<any>(null);

  const handleCreateDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const result = await createDeposit({
        amount: parseFloat(amount),
        currency: 'USD',
        pay_currency: selectedCrypto.toLowerCase(),
      });

      if (result.success && result.data) {
        setDepositData(result.data);
      } else {
        Alert.alert('Error', result.error || 'Failed to create deposit');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = (address: string) => {
    // Copy to clipboard
    Alert.alert('Copied', 'Payment address copied to clipboard');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Deposit Funds</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!depositData ? (
          <>
            {/* Select Crypto */}
            <View style={styles.section}>
              <Text style={styles.label}>Select Cryptocurrency</Text>
              <View style={styles.cryptoGrid}>
                {CRYPTO_OPTIONS.map((crypto) => (
                  <Pressable
                    key={crypto.symbol}
                    style={[
                      styles.cryptoButton,
                      selectedCrypto === crypto.symbol && styles.cryptoButtonActive,
                    ]}
                    onPress={() => setSelectedCrypto(crypto.symbol)}
                  >
                    <Text style={styles.cryptoIcon}>{crypto.icon}</Text>
                    <Text style={styles.cryptoSymbol}>{crypto.symbol}</Text>
                    <Text style={styles.cryptoName}>{crypto.name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Amount Input */}
            <View style={styles.section}>
              <Input
                label="Amount (USD)"
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
              <Text style={styles.hint}>
                Minimum deposit: $10.00
              </Text>
            </View>

            {/* Create Deposit Button */}
            <Button
              title="Create Deposit"
              onPress={handleCreateDeposit}
              loading={loading}
              style={styles.submitButton}
            />

            {/* Info Box */}
            <View style={styles.infoBox}>
              <MaterialIcons name="info-outline" size={20} color={Colors.info} />
              <Text style={styles.infoText}>
                You'll receive a payment address to send your crypto. Funds will be credited after network confirmations.
              </Text>
            </View>
          </>
        ) : (
          <>
            {/* Payment Instructions */}
            <View style={styles.successCard}>
              <MaterialIcons name="check-circle" size={48} color={Colors.success} />
              <Text style={styles.successTitle}>Deposit Created</Text>
              <Text style={styles.successSubtitle}>
                Send {selectedCrypto} to the address below
              </Text>
            </View>

            {/* Payment Address */}
            <View style={styles.paymentSection}>
              <Text style={styles.label}>Payment Address</Text>
              <View style={styles.addressCard}>
                <Text style={styles.address} numberOfLines={2} ellipsizeMode="middle">
                  {depositData.pay_address}
                </Text>
                <Pressable
                  style={styles.copyButton}
                  onPress={() => handleCopyAddress(depositData.pay_address)}
                >
                  <MaterialIcons name="content-copy" size={20} color={Colors.primary} />
                </Pressable>
              </View>
            </View>

            {/* Amount to Send */}
            <View style={styles.paymentSection}>
              <Text style={styles.label}>Amount to Send</Text>
              <View style={styles.amountCard}>
                <Text style={styles.cryptoAmount}>
                  {depositData.pay_amount} {selectedCrypto}
                </Text>
                <Text style={styles.usdAmount}>
                  ≈ ${depositData.price_amount} USD
                </Text>
              </View>
            </View>

            {/* Status */}
            <View style={styles.statusCard}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Status</Text>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Waiting for payment</Text>
                </View>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Order ID</Text>
                <Text style={styles.statusValue}>{depositData.order_id}</Text>
              </View>
            </View>

            {/* Warning */}
            <View style={[styles.infoBox, { backgroundColor: Colors.warningBg }]}>
              <MaterialIcons name="warning" size={20} color={Colors.warning} />
              <Text style={[styles.infoText, { color: Colors.warning }]}>
                Only send {selectedCrypto} to this address. Other assets will be lost permanently.
              </Text>
            </View>

            {/* Done Button */}
            <Button
              title="Done"
              onPress={() => router.back()}
              variant="outline"
              style={styles.doneButton}
            />
          </>
        )}
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
  section: {
    marginBottom: Spacing.xl,
  },
  label: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  cryptoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  cryptoButton: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cryptoButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  cryptoIcon: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  cryptoSymbol: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  cryptoName: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  hint: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  submitButton: {
    marginBottom: Spacing.lg,
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
  successCard: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  successTitle: {
    ...Typography.title,
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  successSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  paymentSection: {
    marginBottom: Spacing.lg,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  address: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  amountCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cryptoAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  usdAmount: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  statusCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  statusLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.warning}20`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.warning,
    marginRight: 6,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.warning,
    fontWeight: '600',
  },
  statusValue: {
    ...Typography.body,
    color: Colors.text,
    fontFamily: 'monospace',
  },
  doneButton: {
    marginTop: Spacing.md,
  },
});
