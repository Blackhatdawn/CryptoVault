import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as LocalAuthentication from 'expo-local-authentication';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

const CRYPTO_OPTIONS = [
  { symbol: 'BTC', name: 'Bitcoin', fee: 0.0001, network: 'Bitcoin', gradient: ['#F7931A', '#FF6B35'], icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', fee: 0.001, network: 'Ethereum', gradient: ['#627EEA', '#8B5CF6'], icon: 'Ξ' },
  { symbol: 'USDT', name: 'Tether', fee: 5, network: 'Ethereum', gradient: ['#26A17B', '#10B981'], icon: '₮' },
  { symbol: 'USDC', name: 'USD Coin', fee: 3, network: 'Ethereum', gradient: ['#2775CA', '#6366F1'], icon: '$' },
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

    if (selectedCrypto === 'BTC' && !formData.address.match(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/)) {
      Alert.alert('Error', 'Invalid Bitcoin address format');
      return;
    }

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
    <View style={styles.container}>
      <LinearGradient
        colors={Colors.gradientBackground as any}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Withdraw Funds</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Available Balance */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <View style={styles.balanceCard}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.1)', 'rgba(99, 102, 241, 0.05)']}
                style={styles.balanceGradient}
              >
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceAmount}>
                  ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* Select Crypto */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
            <Text style={styles.label}>Select Cryptocurrency</Text>
            <View style={styles.cryptoGrid}>
              {CRYPTO_OPTIONS.map((crypto, index) => (
                <Pressable
                  key={crypto.symbol}
                  style={styles.cryptoButtonWrapper}
                  onPress={() => setSelectedCrypto(crypto.symbol)}
                >
                  <LinearGradient
                    colors={selectedCrypto === crypto.symbol ? crypto.gradient as any : ['transparent', 'transparent']}
                    style={styles.cryptoGradient}
                  >
                    <View style={[
                      styles.cryptoButton,
                      selectedCrypto === crypto.symbol && styles.cryptoButtonActive,
                    ]}>
                      <View style={styles.cryptoIconContainer}>
                        <Text style={styles.cryptoIcon}>{crypto.icon}</Text>
                      </View>
                      <Text style={styles.cryptoSymbol}>{crypto.symbol}</Text>
                      <Text style={styles.cryptoNetwork}>{crypto.network}</Text>
                      <View style={styles.feeContainer}>
                        <MaterialIcons name="flash-on" size={12} color={Colors.warning} />
                        <Text style={styles.cryptoFee}>{crypto.fee} {crypto.symbol}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Withdrawal Address */}
          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
            <View style={styles.inputHeader}>
              <Input
                label={`${selectedCrypto} Address`}
                value={formData.address}
                onChangeText={(address) => setFormData({ ...formData, address })}
                placeholder={selectedCrypto === 'BTC' ? 'bc1q...' : '0x...'}
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon="vpn-key"
              />
              <Pressable
                style={styles.qrButton}
                onPress={() => router.push('/qr-scanner')}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#6366F1']}
                  style={styles.qrGradient}
                >
                  <MaterialIcons name="qr-code-scanner" size={20} color="#FFF" />
                </LinearGradient>
              </Pressable>
            </View>
            <View style={styles.warningBox}>
              <View style={styles.warningIcon}>
                <MaterialIcons name="warning" size={16} color={Colors.warning} />
              </View>
              <Text style={styles.warningText}>
                Only send to {selectedCrypto} {selectedCryptoData?.network} addresses. Wrong network = lost funds!
              </Text>
            </View>
          </Animated.View>

          {/* Amount */}
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
            <Input
              label={`Amount (${selectedCrypto})`}
              value={formData.amount}
              onChangeText={(amount) => setFormData({ ...formData, amount })}
              placeholder="0.00000000"
              keyboardType="decimal-pad"
              leftIcon="account-balance-wallet"
            />
            <Pressable
              style={styles.maxButton}
              onPress={() => {
                const maxAmount = Math.max(0, availableBalance - (typeof networkFee === 'number' ? networkFee : 0));
                setFormData({ ...formData, amount: maxAmount.toFixed(8) });
              }}
            >
              <LinearGradient
                colors={['#8B5CF6', '#6366F1']}
                style={styles.maxGradient}
              >
                <Text style={styles.maxButtonText}>MAX</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Withdrawal Summary */}
          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <View style={styles.summaryCard}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.05)', 'transparent']}
                style={styles.summaryGradient}
              >
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Withdrawal Amount</Text>
                  <Text style={styles.summaryValue}>
                    {withdrawAmount.toFixed(8)} {selectedCrypto}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryLabelRow}>
                    <Text style={styles.summaryLabel}>Network Fee</Text>
                    <MaterialIcons name="flash-on" size={14} color={Colors.warning} />
                  </View>
                  <Text style={styles.summaryValue}>
                    {networkFee} {selectedCrypto}
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryTotal}>Total Deducted</Text>
                  <Text style={[
                    styles.summaryTotal,
                    { color: totalAmount > availableBalance ? Colors.error : Colors.primary }
                  ]}>
                    {totalAmount.toFixed(8)} {selectedCrypto}
                  </Text>
                </View>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* Security Notice */}
          <Animated.View entering={FadeIn.delay(600)}>
            <View style={styles.infoBox}>
              <View style={styles.infoIconContainer}>
                <MaterialIcons name="security" size={20} color={Colors.info} />
              </View>
              <Text style={styles.infoText}>
                Withdrawals require admin approval for security. Typical processing time: 1-24 hours.
              </Text>
            </View>
          </Animated.View>

          {/* Withdraw Button */}
          <Animated.View entering={FadeInDown.delay(700).springify()}>
            <Button
              title="Request Withdrawal"
              onPress={handleWithdraw}
              loading={loading}
              disabled={!formData.address || !formData.amount || withdrawAmount <= 0 || totalAmount > availableBalance}
              style={styles.submitButton}
            />
          </Animated.View>
        </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
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
    fontSize: isSmallScreen ? 18 : 20,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  balanceCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  balanceGradient: {
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  balanceLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontSize: isSmallScreen ? 12 : 14,
  },
  balanceAmount: {
    fontSize: isSmallScreen ? 32 : 36,
    fontWeight: '800',
    color: Colors.primary,
  },
  section: {
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  label: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Spacing.md,
    fontSize: isSmallScreen ? 14 : 16,
  },
  cryptoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  cryptoButtonWrapper: {
    flex: 1,
    minWidth: isSmallScreen ? '47%' : '48%',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  cryptoGradient: {
    padding: 2,
    borderRadius: BorderRadius.lg,
  },
  cryptoButton: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: isSmallScreen ? Spacing.sm : Spacing.md,
    alignItems: 'center',
    minHeight: isSmallScreen ? 120 : 130,
    justifyContent: 'center',
  },
  cryptoButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  cryptoIconContainer: {
    width: isSmallScreen ? 48 : 56,
    height: isSmallScreen ? 48 : 56,
    borderRadius: isSmallScreen ? 24 : 28,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  cryptoIcon: {
    fontSize: isSmallScreen ? 28 : 32,
  },
  cryptoSymbol: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: 2,
    fontSize: isSmallScreen ? 14 : 16,
  },
  cryptoNetwork: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontSize: isSmallScreen ? 11 : 12,
  },
  feeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cryptoFee: {
    ...Typography.small,
    color: Colors.textMuted,
    fontSize: 10,
  },
  inputHeader: {
    position: 'relative',
  },
  qrButton: {
    position: 'absolute',
    right: Spacing.md,
    top: 40,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  qrGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: Colors.warningGlow,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
    gap: Spacing.xs,
  },
  warningIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningText: {
    ...Typography.caption,
    color: Colors.warning,
    flex: 1,
    lineHeight: 18,
    fontSize: isSmallScreen ? 12 : 13,
  },
  maxButton: {
    position: 'absolute',
    right: Spacing.md,
    top: 40,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  maxGradient: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  maxButtonText: {
    ...Typography.caption,
    color: '#FFF',
    fontWeight: '700',
  },
  summaryCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryGradient: {
    padding: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  summaryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: isSmallScreen ? 13 : 14,
  },
  summaryValue: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    fontFamily: 'monospace',
    fontSize: isSmallScreen ? 13 : 14,
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
    fontSize: isSmallScreen ? 15 : 17,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.infoGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
    fontSize: isSmallScreen ? 12 : 13,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
});
