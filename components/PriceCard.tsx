import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Typography, Spacing, CryptoGradients } from '@/constants/theme';
import type { CryptoPrice } from '@/types';

const CRYPTO_ICONS: Record<string, string> = {
  BTC: '₿', ETH: 'Ξ', USDT: '₮', USDC: '$',
  BNB: 'B', SOL: '◎', ADA: '₳', XRP: '✕',
  DOT: '●', DOGE: 'Ð',
};

interface PriceCardProps {
  price: CryptoPrice;
}

export function PriceCard({ price }: PriceCardProps) {
  const router = useRouter();
  const change = parseFloat(price.changePercent24Hr || '0');
  const isPositive = change >= 0;
  const priceNum   = parseFloat(price.priceUsd);

  const gradient = CryptoGradients[price.symbol] || (isPositive
    ? [Colors.successDark, Colors.success]
    : [Colors.errorDark,   Colors.error]);

  const handlePress = () => {
    router.push({
      pathname: '/price-detail',
      params: { symbol: price.symbol, name: price.name, price: price.priceUsd, change: price.changePercent24Hr },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.wrapper, pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] }]}
    >
      <View style={styles.card}>
        {/* Left gradient accent bar */}
        <LinearGradient
          colors={gradient as any}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={styles.accentBar}
        />

        <View style={styles.inner}>
          {/* Icon */}
          <View style={styles.iconWrap}>
            <LinearGradient colors={gradient as any} style={styles.iconGrad}>
              <Text style={styles.iconText}>{CRYPTO_ICONS[price.symbol] || price.symbol.charAt(0)}</Text>
            </LinearGradient>
          </View>

          {/* Name & Symbol */}
          <View style={styles.info}>
            <Text style={styles.symbol}>{price.symbol}</Text>
            <Text style={styles.name} numberOfLines={1}>{price.name}</Text>
          </View>

          {/* Price & Change */}
          <View style={styles.right}>
            <Text style={styles.price}>
              ${priceNum >= 1
                ? priceNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : priceNum.toFixed(6)}
            </Text>
            <View style={[styles.changeBadge, { backgroundColor: isPositive ? Colors.successGlow : Colors.errorGlow }]}>
              <MaterialIcons
                name={isPositive ? 'arrow-drop-up' : 'arrow-drop-down'}
                size={14}
                color={isPositive ? Colors.success : Colors.error}
              />
              <Text style={[styles.changeText, { color: isPositive ? Colors.success : Colors.error }]}>
                {Math.abs(change).toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 1 },
  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden', flexDirection: 'row',
  },
  accentBar: { width: 3 },
  inner: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: Spacing.md, gap: Spacing.sm,
  },
  iconWrap: { borderRadius: BorderRadius.md, overflow: 'hidden' },
  iconGrad: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 20, fontWeight: '800', color: '#FFF' },

  info:   { flex: 1 },
  symbol: { ...Typography.captionBold, color: Colors.text, fontWeight: '700' },
  name:   { ...Typography.micro, color: Colors.textSecondary, marginTop: 3 },

  right: { alignItems: 'flex-end', gap: 5 },
  price: { ...Typography.captionBold, color: Colors.text, fontWeight: '700' },
  changeBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: BorderRadius.xs, gap: 1,
  },
  changeText: { ...Typography.micro, fontWeight: '700', fontSize: 11 },
});
