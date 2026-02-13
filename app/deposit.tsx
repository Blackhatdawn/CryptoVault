
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

const CRYPTO_OPTIONS = [
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿', gradient: ['#F7931A', '#FF6B35'] },
  { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', gradient: ['#627EEA', '#8B5CF6'] },
  { symbol: 'USDT', name: 'Tether', icon: '₮', gradient: ['#26A17B', '#10B981'] },
  { symbol: 'USDC', name: 'USD Coin', icon: '$', gradient: ['#2775CA', '#6366F1'] },
];

export default function DepositScreen() {
  const router = useRouter();
  const { createDeposit } = useWallet();
  const [loading, setLoading] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [depositData, setDepositData] = useState<any>(null);

  const selectedCryptoData = CRYPTO_OPTIONS.find(c => c.symbol === selectedCrypto);

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
    Alert.alert('Copied', 'Payment address copied to clipboard');
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
          <Text style={styles.title}>Deposit Funds</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {!depositData ? (
            <>
              {/* Select Crypto */}
              <View style={styles.section}>
                <Text style={styles.label}>Select Cryptocurrency</Text>
                <View style={styles.cryptoGrid}>
                  {CRYPTO_OPTIONS.map((crypto) => (
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
                          <Text style={styles.cryptoName}>{crypto.name}</Text>
                        </View>
                      </LinearGradient>
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
                  leftIcon="attach-money"
                />
                <View style={styles.hintBox}>
                  <MaterialIcons name="info-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.hint}>Minimum deposit: $10.00</Text>
                </View>
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
                <View style={styles.infoIconContainer}>
                  <MaterialIcons name="security" size={20} color={Colors.info} />
                </View>
                <Text style={styles.infoText}>
                  You'll receive a secure payment address to send your crypto. Funds will be credited after network confirmations.
                </Text>
              </View>
            </>
          ) : (
            <>
              {/* Success Card */}
              <View style={styles.successCard}>
                <LinearGradient
                  colors={selectedCryptoData?.gradient as any || ['#10B981', '#34D399']}
                  style={styles.successGradient}
                >
                  <View style={styles.successIcon}>
                    <MaterialIcons name="check-circle" size={64} color="#FFF" />
                  </View>
                </LinearGradient>
                <Text style={styles.successTitle}>Deposit Created</Text>
                <Text style={styles.successSubtitle}>
                  Send {selectedCrypto} to the address below
                </Text>
              </View>

              {/* Payment Address */}
              <View style={styles.section}>
                <Text style={styles.label}>Payment Address</Text>
                <View style={styles.addressCard}>
                  <View style={styles.addressContent}>
                    <Text style={styles.address} numberOfLines={2}>
                      {depositData.pay_address}
                    </Text>
                  </View>
                  <Pressable
                    style={styles.copyButton}
                    onPress={() => handleCopyAddress(depositData.pay_address)}
                  >
                    <LinearGradient
                      colors={['#8B5CF6', '#6366F1']}
                      style={styles.copyGradient}
                    >
                      <MaterialIcons name="content-copy" size={18} color="#FFF" />
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>

              {/* Amount to Send */}
              <View style={styles.section}>
                <Text style={styles.label}>Amount to Send</Text>
                <View style={styles.amountCard}>
                  <LinearGradient
                    colors={['rgba(139, 92, 246, 0.1)', 'rgba(99, 102, 241, 0.05)']}
                    style={styles.amountGradient}
                  >
                    <Text style={styles.cryptoAmount}>
                      {depositData.pay_amount} {selectedCrypto}
                    </Text>
                    <Text style={styles.usdAmount}>
                      ≈ ${depositData.price_amount} USD
                    </Text>
                  </LinearGradient>
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
              <View style={styles.warningBox}>
                <View style={styles.warningIcon}>
                  <MaterialIcons name="warning" size={20} color={Colors.warning} />
                </View>
                <Text style={styles.warningText}>
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
  section: {
    marginBottom: Spacing.xl,
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
    minHeight: isSmallScreen ? 100 : 110,
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
  cryptoName: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: isSmallScreen ? 11 : 12,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: 4,
  },
  hint: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: isSmallScreen ? 11 : 12,
  },
  submitButton: {
    marginBottom: Spacing.lg,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
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
  successCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.lg,
  },
  successGradient: {
    width: isSmallScreen ? 100 : 120,
    height: isSmallScreen ? 100 : 120,
    borderRadius: isSmallScreen ? 50 : 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
    fontSize: isSmallScreen ? 20 : 24,
  },
  successSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontSize: isSmallScreen ? 14 : 16,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  addressContent: {
    flex: 1,
  },
  address: {
    ...Typography.body,
    color: Colors.text,
    fontFamily: 'monospace',
    fontSize: isSmallScreen ? 12 : 14,
  },
  copyButton: {
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  copyGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.md,
  },
  amountGradient: {
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cryptoAmount: {
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  usdAmount: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontSize: isSmallScreen ? 14 : 16,
  },
  statusCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
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
    fontSize: isSmallScreen ? 13 : 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningGlow,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.warning,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.warning,
    fontWeight: '700',
    fontSize: isSmallScreen ? 11 : 12,
  },
  statusValue: {
    ...Typography.body,
    color: Colors.text,
    fontFamily: 'monospace',
    fontSize: isSmallScreen ? 12 : 13,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: Colors.warningGlow,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  warningIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  doneButton: {
    marginTop: Spacing.md,
  },
});
