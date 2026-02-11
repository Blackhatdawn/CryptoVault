import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { api } from '@/services/api';

const CRYPTO_OPTIONS = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'USDT', name: 'Tether' },
  { symbol: 'BNB', name: 'Binance Coin' },
];

export default function PriceAlertScreen() {
  const router = useRouter();
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [loading, setLoading] = useState(false);

  const handleCreateAlert = async () => {
    if (!targetPrice || parseFloat(targetPrice) <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid target price');
      return;
    }

    setLoading(true);
    try {
      const result = await api.createPriceAlert({
        symbol: selectedCrypto,
        condition,
        target_price: parseFloat(targetPrice),
      });
      
      if (result.success || result.data) {
        Alert.alert(
          'Alert Created',
          `You'll be notified when ${selectedCrypto} goes ${condition} $${targetPrice}`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create price alert');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create price alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Create Price Alert</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
                <Text style={styles.cryptoName}>{crypto.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Condition */}
        <View style={styles.section}>
          <Text style={styles.label}>Alert Condition</Text>
          <View style={styles.conditionButtons}>
            <Pressable
              style={[
                styles.conditionButton,
                condition === 'above' && styles.conditionButtonActive,
              ]}
              onPress={() => setCondition('above')}
            >
              <MaterialIcons
                name="trending-up"
                size={24}
                color={condition === 'above' ? Colors.primary : Colors.textMuted}
              />
              <Text
                style={[
                  styles.conditionText,
                  condition === 'above' && styles.conditionTextActive,
                ]}
              >
                Goes Above
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.conditionButton,
                condition === 'below' && styles.conditionButtonActive,
              ]}
              onPress={() => setCondition('below')}
            >
              <MaterialIcons
                name="trending-down"
                size={24}
                color={condition === 'below' ? Colors.primary : Colors.textMuted}
              />
              <Text
                style={[
                  styles.conditionText,
                  condition === 'below' && styles.conditionTextActive,
                ]}
              >
                Goes Below
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Target Price */}
        <View style={styles.section}>
          <Input
            label="Target Price (USD)"
            value={targetPrice}
            onChangeText={setTargetPrice}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        </View>

        {/* Preview */}
        {targetPrice && (
          <View style={styles.previewCard}>
            <MaterialIcons name="notifications-active" size={32} color={Colors.primary} />
            <Text style={styles.previewText}>
              You'll receive a notification when {selectedCrypto} {condition === 'above' ? 'rises above' : 'falls below'}
            </Text>
            <Text style={styles.previewPrice}>${targetPrice}</Text>
          </View>
        )}

        {/* Create Button */}
        <Button
          title="Create Alert"
          onPress={handleCreateAlert}
          loading={loading}
          style={styles.submitButton}
        />

        {/* Info */}
        <View style={styles.infoBox}>
          <MaterialIcons name="info-outline" size={20} color={Colors.info} />
          <Text style={styles.infoText}>
            You'll receive a push notification when the price condition is met. You can manage your alerts in Settings.
          </Text>
        </View>
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
  conditionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  conditionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  conditionButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  conditionText: {
    ...Typography.body,
    color: Colors.textMuted,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  conditionTextActive: {
    color: Colors.primary,
  },
  previewCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  previewText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  previewPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
  },
  submitButton: {
    marginBottom: Spacing.lg,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: `${Colors.info}20`,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  infoText: {
    ...Typography.caption,
    color: Colors.info,
    marginLeft: Spacing.sm,
    flex: 1,
  },
});
