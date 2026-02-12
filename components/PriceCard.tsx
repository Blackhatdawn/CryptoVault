import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Typography, Spacing, Shadows } from '@/constants/theme';
import type { CryptoPrice } from '@/types';

interface PriceCardProps {
  price: CryptoPrice;
}

export function PriceCard({ price }: PriceCardProps) {
  const router = useRouter();
  const isPositive = parseFloat(price.changePercent24Hr || '0') >= 0;

  const handlePress = () => {
    router.push({
      pathname: '/price-detail',
      params: {
        symbol: price.symbol,
        name: price.name,
        price: price.priceUsd,
        change: price.changePercent24Hr,
      },
    });
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <View style={styles.card}>
        {/* Gradient border effect */}
        <LinearGradient
          colors={isPositive 
            ? ['rgba(16, 185, 129, 0.2)', 'transparent'] 
            : ['rgba(239, 68, 68, 0.2)', 'transparent']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBorder}
        />

        <View style={styles.content}>
          {/* Left: Icon & Info */}
          <View style={styles.leftSection}>
            <View style={[
              styles.iconContainer,
              { backgroundColor: isPositive ? Colors.successGlow : Colors.errorGlow }
            ]}>
              <MaterialIcons 
                name="currency-bitcoin" 
                size={28} 
                color={isPositive ? Colors.success : Colors.error} 
              />
            </View>
            <View style={styles.info}>
              <Text style={styles.symbol}>{price.symbol}</Text>
              <Text style={styles.name}>{price.name}</Text>
            </View>
          </View>

          {/* Right: Price & Change */}
          <View style={styles.rightSection}>
            <Text style={styles.price}>
              ${parseFloat(price.priceUsd).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <View style={[
              styles.changeBadge,
              { backgroundColor: isPositive ? Colors.successGlow : Colors.errorGlow }
            ]}>
              <MaterialIcons
                name={isPositive ? 'trending-up' : 'trending-down'}
                size={14}
                color={isPositive ? Colors.success : Colors.error}
              />
              <Text style={[
                styles.changeText,
                { color: isPositive ? Colors.success : Colors.error }
              ]}>
                {Math.abs(parseFloat(price.changePercent24Hr || '0')).toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  gradientBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    paddingLeft: Spacing.lg,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  symbol: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: 2,
  },
  name: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  price: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: 4,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 2,
  },
  changeText: {
    ...Typography.caption,
    fontWeight: '700',
  },
});
