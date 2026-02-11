import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/Button';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { api } from '@/services/api';

type OrderType = 'market' | 'limit';
type OrderSide = 'buy' | 'sell';

export default function TradingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { balance } = useWallet();

  const [orderType, setOrderType] = useState<OrderType>('market');
  const [orderSide, setOrderSide] = useState<OrderSide>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const symbol = (params.symbol as string) || 'BTC';
  const currentPrice = parseFloat(params.price as string) || 0;

  const handleSubmit = async () => {
    if (!amount || (orderType === 'limit' && !price)) {
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        symbol,
        side: orderSide,
        type: orderType,
        amount: parseFloat(amount),
        ...(orderType === 'limit' && { price: parseFloat(price) }),
      };

      await api.createOrder(orderData);
      router.back();
    } catch (error: any) {
      console.error('Order failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    const amountNum = parseFloat(amount) || 0;
    const priceNum = orderType === 'limit' ? parseFloat(price) || 0 : currentPrice;
    return (amountNum * priceNum).toFixed(2);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Trade {symbol}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Current Price */}
        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Current Price</Text>
          <Text style={styles.priceValue}>${currentPrice.toLocaleString()}</Text>
        </View>

        {/* Order Side Toggle */}
        <View style={styles.toggleContainer}>
          <Pressable
            style={[
              styles.toggleButton,
              styles.toggleButtonLeft,
              orderSide === 'buy' && styles.toggleButtonBuy,
            ]}
            onPress={() => setOrderSide('buy')}
          >
            <Text
              style={[
                styles.toggleText,
                orderSide === 'buy' && styles.toggleTextActive,
              ]}
            >
              Buy
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.toggleButton,
              styles.toggleButtonRight,
              orderSide === 'sell' && styles.toggleButtonSell,
            ]}
            onPress={() => setOrderSide('sell')}
          >
            <Text
              style={[
                styles.toggleText,
                orderSide === 'sell' && styles.toggleTextActive,
              ]}
            >
              Sell
            </Text>
          </Pressable>
        </View>

        {/* Order Type Tabs */}
        <View style={styles.typeContainer}>
          <Pressable
            style={[styles.typeTab, orderType === 'market' && styles.typeTabActive]}
            onPress={() => setOrderType('market')}
          >
            <Text
              style={[
                styles.typeText,
                orderType === 'market' && styles.typeTextActive,
              ]}
            >
              Market
            </Text>
          </Pressable>
          <Pressable
            style={[styles.typeTab, orderType === 'limit' && styles.typeTabActive]}
            onPress={() => setOrderType('limit')}
          >
            <Text
              style={[
                styles.typeText,
                orderType === 'limit' && styles.typeTextActive,
              ]}
            >
              Limit
            </Text>
          </Pressable>
        </View>

        {/* Order Form */}
        <View style={styles.formContainer}>
          {/* Amount Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Amount ({symbol})</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={Colors.textMuted}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
              <Text style={styles.inputSuffix}>{symbol}</Text>
            </View>
          </View>

          {/* Price Input (Limit Only) */}
          {orderType === 'limit' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price (USD)</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textMuted}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.inputSuffix}>USD</Text>
              </View>
            </View>
          )}

          {/* Total Display */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${calculateTotal()}</Text>
          </View>

          {/* Available Balance */}
          <View style={styles.balanceInfo}>
            <MaterialIcons name="account-balance-wallet" size={16} color={Colors.textSecondary} />
            <Text style={styles.balanceText}>
              Available: ${balance?.available_usd.toFixed(2) || '0.00'}
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.footer}>
          <Button
            title={`${orderSide === 'buy' ? 'Buy' : 'Sell'} ${symbol}`}
            onPress={handleSubmit}
            disabled={isLoading || !amount || (orderType === 'limit' && !price)}
            style={{
              backgroundColor: orderSide === 'buy' ? Colors.success : Colors.error,
            }}
          />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    ...Typography.title,
    color: Colors.text,
    fontWeight: '700',
  },
  priceCard: {
    backgroundColor: Colors.surfaceElevated,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  priceLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
  },
  toggleButtonLeft: {
    marginRight: 2,
  },
  toggleButtonRight: {
    marginLeft: 2,
  },
  toggleButtonBuy: {
    backgroundColor: Colors.success,
  },
  toggleButtonSell: {
    backgroundColor: Colors.error,
  },
  toggleText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: Colors.background,
  },
  typeContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  typeTab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  typeTabActive: {
    borderBottomColor: Colors.primary,
  },
  typeText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  typeTextActive: {
    color: Colors.primary,
  },
  formContainer: {
    paddingHorizontal: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    paddingVertical: Spacing.md,
    fontSize: 18,
  },
  inputSuffix: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  totalCard: {
    backgroundColor: Colors.surfaceElevated,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  totalLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  balanceText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  footer: {
    padding: Spacing.md,
    paddingTop: Spacing.xl,
  },
});
