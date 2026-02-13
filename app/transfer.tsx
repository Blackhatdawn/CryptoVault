import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn, ZoomIn } from 'react-native-reanimated';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

const QUICK_AMOUNTS = [25, 50, 100, 250, 500];

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
          <Text style={styles.title}>P2P Transfer</Text>
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
                <View style={styles.balanceIcon}>
                  <MaterialIcons name="account-balance-wallet" size={32} color={Colors.primary} />
                </View>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceAmount}>
                  ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* Recipient */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
            <Input
              label="Recipient Email"
              value={formData.recipient_email}
              onChangeText={(recipient_email) => setFormData({ ...formData, recipient_email })}
              placeholder="recipient@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="person-outline"
            />
            <View style={styles.hintBox}>
              <MaterialIcons name="info-outline" size={14} color={Colors.info} />
              <Text style={styles.hint}>Transfer to any CryptoVault user instantly</Text>
            </View>
          </Animated.View>

          {/* Amount */}
          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
            <Input
              label="Amount (USD)"
              value={formData.amount}
              onChangeText={(amount) => setFormData({ ...formData, amount })}
              placeholder="0.00"
              keyboardType="decimal-pad"
              leftIcon="attach-money"
            />
            
            {/* Quick Amount Buttons */}
            <View style={styles.quickAmounts}>
              {QUICK_AMOUNTS.map((amount, index) => (
                <Animated.View
                  key={amount}
                  entering={ZoomIn.delay(400 + index * 50).springify()}
                >
                  <Pressable
                    style={styles.quickAmountButton}
                    onPress={() => setFormData({ ...formData, amount: amount.toString() })}
                  >
                    <LinearGradient
                      colors={formData.amount === amount.toString() 
                        ? ['#8B5CF6', '#6366F1'] 
                        : ['transparent', 'transparent']
                      }
                      style={styles.quickAmountGradient}
                    >
                      <Text style={[
                        styles.quickAmountText,
                        formData.amount === amount.toString() && styles.quickAmountTextActive
                      ]}>
                        ${amount}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              ))}
              <Animated.View entering={ZoomIn.delay(700).springify()}>
                <Pressable
                  style={styles.quickAmountButton}
                  onPress={() => setFormData({ ...formData, amount: availableBalance.toString() })}
                >
                  <LinearGradient
                    colors={['#F59E0B', '#F97316']}
                    style={styles.quickAmountGradient}
                  >
                    <Text style={styles.quickAmountTextActive}>MAX</Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </View>
          </Animated.View>

          {/* Note (Optional) */}
          <Animated.View entering={FadeInDown.delay(800).springify()} style={styles.section}>
            <Input
              label="Note (Optional)"
              value={formData.note}
              onChangeText={(note) => setFormData({ ...formData, note })}
              placeholder="Add a note..."
              multiline
              numberOfLines={3}
              style={styles.noteInput}
              leftIcon="note"
            />
          </Animated.View>

          {/* Transfer Summary */}
          <Animated.View entering={FadeInDown.delay(900).springify()}>
            <View style={styles.summaryCard}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.05)', 'transparent']}
                style={styles.summaryGradient}
              >
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Transfer Amount</Text>
                  <Text style={styles.summaryValue}>
                    ${transferAmount.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryLabelRow}>
                    <Text style={styles.summaryLabel}>Transfer Fee</Text>
                    <View style={styles.freeBadge}>
                      <MaterialIcons name="verified" size={12} color={Colors.success} />
                      <Text style={styles.freeText}>FREE</Text>
                    </View>
                  </View>
                  <Text style={[styles.summaryValue, { color: Colors.success }]}>
                    $0.00
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryTotal}>Remaining Balance</Text>
                  <Text style={[
                    styles.summaryTotal,
                    { color: remainingBalance < 0 ? Colors.error : Colors.primary }
                  ]}>
                    ${Math.max(0, remainingBalance).toFixed(2)}
                  </Text>
                </View>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* Info */}
          <Animated.View entering={FadeIn.delay(1000)}>
            <View style={styles.infoBox}>
              <View style={styles.infoIconContainer}>
                <MaterialIcons name="flash-on" size={20} color={Colors.info} />
              </View>
              <Text style={styles.infoText}>
                Transfers are instant and free between CryptoVault users. Make sure the recipient email is correct.
              </Text>
            </View>
          </Animated.View>

          {/* Send Button */}
          <Animated.View entering={FadeInDown.delay(1100).springify()}>
            <Button
              title="Send Transfer"
              onPress={handleTransfer}
              loading={loading}
              disabled={!formData.recipient_email || !formData.amount || transferAmount <= 0}
              style={styles.sendButton}
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
  balanceIcon: {
    width: isSmallScreen ? 64 : 72,
    height: isSmallScreen ? 64 : 72,
    borderRadius: isSmallScreen ? 32 : 36,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
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
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: 4,
  },
  hint: {
    ...Typography.caption,
    color: Colors.info,
    fontSize: isSmallScreen ? 11 : 12,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  quickAmountButton: {
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    minWidth: isSmallScreen ? 56 : 64,
  },
  quickAmountGradient: {
    paddingVertical: isSmallScreen ? Spacing.xs : Spacing.sm,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickAmountText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
    fontSize: isSmallScreen ? 12 : 14,
  },
  quickAmountTextActive: {
    ...Typography.caption,
    color: '#FFF',
    fontWeight: '700',
    fontSize: isSmallScreen ? 12 : 14,
  },
  noteInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
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
    gap: Spacing.xs,
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
    fontSize: isSmallScreen ? 14 : 16,
  },
  freeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successGlow,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    gap: 2,
  },
  freeText: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '700',
    fontSize: 10,
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
  sendButton: {
    marginTop: Spacing.md,
  },
});
