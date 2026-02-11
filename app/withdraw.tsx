import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

const CRYPTO_OPTIONS = [
  { symbol: 'BTC', name: 'Bitcoin', fee: 0.0001, network: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum', fee: 0.001, network: 'Ethereum' },
  { symbol: 'USDT', name: 'Tether (ERC-20)', fee: 5, network: 'Ethereum' },
  { symbol: 'USDC', name: 'USD Coin', fee: 3, network: 'Ethereum' },
];

export default function WithdrawScreen() {
  const router = useRouter();
  const { balance, createWithdrawal } = useWallet();
  const [loading, setLoading] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [formData, setFormData] = useState({
    address: '',
    amount: '',
  });

  const selectedCryptoData = CRYPTO_OPTIONS.find(c => c.symbol === selectedCrypto);
  const withdrawAmount = parseFloat(formData.amount) || 0;
  const networkFee = selectedCryptoData?.fee || 0;
  const totalAmount = withdrawAmount + (typeof networkFee === 'number' ? networkFee : 0);
  const availableBalance = balance?.balance || 0;

  const handleWithdraw = async () => {
    if (!formData.address || !formData.amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (withdrawAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (totalAmount > availableBalance) {
      Alert.alert('Error', 'Insufficient balance (including network fee)');
      return;
    }

    // Validate address format (basic check)
    if (selectedCrypto === 'BTC' && !formData.address.match(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/)) {
      Alert.alert('Error', 'Invalid Bitcoin address format');
      return;
    }

    // Biometric authentication for withdrawal
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Confirm withdrawal',
          fallbackLabel: 'Use passcode',
        });

        if (!result.success) {
          Alert.alert('Authentication Failed', 'Biometric authentication required to withdraw');
          return;
        }
      }
    } catch (error) {
      console.error('Biometric error:', error);
    }

    Alert.alert(
      'Confirm Withdrawal',
      `Withdraw ${withdrawAmount.toFixed(8)} ${selectedCrypto}\n\nNetwork Fee: ${networkFee} ${selectedCrypto}\n\nTotal: ${totalAmount.toFixed(8)} ${selectedCrypto}\n\nTo: ${formData.address.slice(0, 8)}...${formData.address.slice(-8)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await createWithdrawal({
                currency: selectedCrypto.toLowerCase(),
                amount: withdrawAmount,
                address: formData.address,
              });

              if (result.success) {
                Alert.alert(
                  'Withdrawal Requested',
                  'Your withdrawal request has been submitted and is pending admin approval.',
                  [{ text: 'OK', onPress: () => router.back() }]
                );
              } else {
                Alert.alert('Error', result.error || 'Withdrawal failed');
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Withdraw Funds</Text>
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
                <Text style={styles.cryptoSymbol}>{crypto.symbol}</Text>
                <Text style={styles.cryptoNetwork}>{crypto.network}</Text>
                <Text style={styles.cryptoFee}>Fee: {crypto.fee} {crypto.symbol}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Withdrawal Address */}
        <View style={styles.section}>
          <Input
            label={`${selectedCrypto} Address`}
            value={formData.address}
            onChangeText={(address) => setFormData({ ...formData, address })}
            placeholder={selectedCrypto === 'BTC' ? 'bc1q...' : '0x...'}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.warningBox}>
            <MaterialIcons name="warning" size={16} color={Colors.warning} />
            <Text style={styles.warningText}>
              Only send to {selectedCrypto} {selectedCryptoData?.network} addresses. Wrong network = lost funds!
            </Text>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Input
            label={`Amount (${selectedCrypto})`}
            value={formData.amount}
            onChangeText={(amount) => setFormData({ ...formData, amount })}
            placeholder="0.00000000"
            keyboardType="decimal-pad"
          />
          <Pressable
            style={styles.maxButton}
            onPress={() => {
              const maxAmount = Math.max(0, availableBalance - (typeof networkFee === 'number' ? networkFee : 0));
              setFormData({ ...formData, amount: maxAmount.toFixed(8) });
            }}
          >
            <Text style={styles.maxButtonText}>Max</Text>
          </Pressable>
        </View>

        {/* Withdrawal Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Withdrawal Amount</Text>
            <Text style={styles.summaryValue}>
              {withdrawAmount.toFixed(8)} {selectedCrypto}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Network Fee</Text>
            <Text style={styles.summaryValue}>
              {networkFee} {selectedCrypto}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotal}>Total Deducted</Text>
            <Text style={[
              styles.summaryTotal,
              { color: totalAmount > availableBalance ? Colors.error : Colors.text }
            ]}>
              {totalAmount.toFixed(8)} {selectedCrypto}
            </Text>
          </View>
        </View>

        {/* Security Notice */}
        <View style={styles.infoBox}>
          <MaterialIcons name="security" size={20} color={Colors.info} />
          <Text style={styles.infoText}>
            Withdrawals require admin approval for security. Typical processing time: 1-24 hours.
          </Text>
        </View>

        {/* Withdraw Button */}
        <Button
          title="Request Withdrawal"
          onPress={handleWithdraw}
          loading={loading}
          disabled={!formData.address || !formData.amount || withdrawAmount <= 0 || totalAmount > availableBalance}
          style={styles.submitButton}
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
    position: 'relative',
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
  cryptoSymbol: {
    ...Typography.subheading,
    color: Colors.text,
    fontWeight: '700',
    marginBottom: 4,
  },
  cryptoNetwork: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  cryptoFee: {
    ...Typography.small,
    color: Colors.textMuted,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: `${Colors.warning}15`,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  warningText: {
    ...Typography.caption,
    color: Colors.warning,
    marginLeft: Spacing.xs,
    flex: 1,
  },
  maxButton: {
    position: 'absolute',
    right: Spacing.md,
    top: 40,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  maxButtonText: {
    ...Typography.caption,
    color: Colors.background,
    fontWeight: '700',
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
    fontFamily: 'monospace',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  summaryTotal: {
    ...Typography.subheading,
    fontWeight: '700',
    fontFamily: 'monospace',
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
  submitButton: {
    marginTop: Spacing.md,
  },
});
