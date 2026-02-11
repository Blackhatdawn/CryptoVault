import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing, Shadows } from '@/constants/theme';
import type { CryptoPrice } from '@/types';

interface PriceCardProps {
  price: CryptoPrice;
}

export const PriceCard: React.FC<PriceCardProps> = ({ price }) => {
  const router = useRouter();
  const isPositive = price.change_24h >= 0;

  const handlePress = () => {
    router.push({
      pathname: '/price-detail',
      params: {
        symbol: price.symbol,
        name: price.name,
        price: price.price_usd.toString(),
        change: price.change_24h.toString(),
      },
    });
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <View style={styles.header}>
        <View>
          <Text style={styles.symbol}>{price.symbol}</Text>
          <Text style={styles.name}>{price.name}</Text>
        </View>
        <MaterialIcons
          name={isPositive ? 'trending-up' : 'trending-down'}
          size={24}
          color={isPositive ? Colors.bullish : Colors.bearish}
        />
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.priceText}>
          ${price.price_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <View style={[styles.changeBadge, { backgroundColor: isPositive ? Colors.successBg : Colors.errorBg }]}>
          <Text style={[styles.change, { color: isPositive ? Colors.bullish : Colors.bearish }]}>
            {isPositive ? '+' : ''}{price.change_24h.toFixed(2)}%
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  symbol: {
    ...Typography.subheading,
    color: Colors.text,
    fontWeight: '600',
  },
  name: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    ...Typography.heading,
    color: Colors.text,
    fontWeight: '700',
  },
  changeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  change: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
