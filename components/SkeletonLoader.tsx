import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat,
  withTiming, interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');
const isSmall = width < 375;

const SHIMMER_COLORS = ['transparent', 'rgba(124,58,237,0.09)', 'rgba(124,58,237,0.14)', 'rgba(124,58,237,0.09)', 'transparent'] as const;

interface SkeletonLoaderProps {
  variant?: 'card' | 'price' | 'transaction' | 'balance' | 'stat';
  count?: number;
}

function Shimmer() {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 1600 }), -1, false);
  }, [progress]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0,1], [-width*1.2, width*1.2]) }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, anim, { overflow: 'hidden' }]}>
      <LinearGradient
        colors={SHIMMER_COLORS}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

function Box({ w, h, r = 6, mt = 0 }: { w: number|string; h: number; r?: number; mt?: number }) {
  return <View style={{ width: w as any, height: h, borderRadius: r, backgroundColor: Colors.border, marginTop: mt, overflow: 'hidden' }}><Shimmer /></View>;
}
function Circle({ size }: { size: number }) {
  return <View style={{ width: size, height: size, borderRadius: size/2, backgroundColor: Colors.border, overflow: 'hidden' }}><Shimmer /></View>;
}

function BalanceSkeleton() {
  return (
    <View style={sk.balanceCard}>
      <Shimmer />
      <Box w="45%" h={14} mt={0} />
      <Box w="75%" h={42} mt={8} r={8} />
      <View style={{ flexDirection: 'row', gap: 20, marginTop: 20 }}>
        <View style={{ flex: 1 }}><Box w="55%" h={12} /><Box w="80%" h={18} mt={4} /></View>
        <View style={{ flex: 1 }}><Box w="55%" h={12} /><Box w="80%" h={18} mt={4} /></View>
        <View style={{ flex: 1 }}><Box w="55%" h={12} /><Box w="80%" h={18} mt={4} /></View>
      </View>
    </View>
  );
}

function PriceSkeleton() {
  return (
    <View style={sk.priceCard}>
      <Shimmer />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Circle size={isSmall ? 44 : 50} />
        <View style={{ flex: 1 }}>
          <Box w="55%" h={15} />
          <Box w="75%" h={11} mt={5} />
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Box w={80} h={15} />
          <Box w={60} h={22} mt={5} r={BorderRadius.xs} />
        </View>
      </View>
    </View>
  );
}

function TransactionSkeleton() {
  return (
    <View style={sk.txCard}>
      <Shimmer />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Circle size={isSmall ? 40 : 46} />
        <View style={{ flex: 1 }}>
          <Box w="50%" h={14} />
          <Box w="35%" h={10} mt={5} />
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Box w={70} h={14} />
          <Box w={55} h={20} mt={5} r={4} />
        </View>
      </View>
    </View>
  );
}

function StatSkeleton() {
  return (
    <View style={sk.statCard}>
      <Shimmer />
      <Circle size={32} />
      <Box w="65%" h={11} mt={8} />
      <Box w="80%" h={18} mt={5} />
    </View>
  );
}

function CardSkeleton() {
  return (
    <View style={sk.card}>
      <Shimmer />
      <Box w="70%" h={18} />
      <Box w="100%" h={13} mt={10} />
      <Box w="88%" h={13} mt={6} />
    </View>
  );
}

export function SkeletonLoader({ variant = 'card', count = 1 }: SkeletonLoaderProps) {
  const render = () => {
    switch (variant) {
      case 'balance':     return <BalanceSkeleton />;
      case 'price':       return <PriceSkeleton />;
      case 'transaction': return <TransactionSkeleton />;
      case 'stat':        return <StatSkeleton />;
      default:            return <CardSkeleton />;
    }
  };
  return (
    <View style={{ gap: Spacing.xs }}>
      {Array.from({ length: count }).map((_, i) => <View key={i}>{render()}</View>)}
    </View>
  );
}

const baseCard = {
  borderRadius: BorderRadius.lg, padding: Spacing.md,
  borderWidth: 1 as const, borderColor: Colors.border,
  backgroundColor: Colors.surfaceElevated,
  overflow: 'hidden' as const, position: 'relative' as const,
};
const sk = StyleSheet.create({
  balanceCard: { ...baseCard, borderRadius: BorderRadius.xl, padding: Spacing.xl, minHeight: 180 },
  priceCard:   { ...baseCard },
  txCard:      { ...baseCard, paddingVertical: Spacing.sm },
  statCard:    { ...baseCard, flex: 1, minWidth: '45%' },
  card:        { ...baseCard },
});
