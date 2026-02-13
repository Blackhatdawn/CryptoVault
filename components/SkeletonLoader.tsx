import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

interface SkeletonLoaderProps {
  variant?: 'card' | 'price' | 'transaction' | 'balance' | 'stat';
  count?: number;
}

export function SkeletonLoader({ variant = 'card', count = 1 }: SkeletonLoaderProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmer.value,
      [0, 1],
      [-width, width]
    );

    return {
      transform: [{ translateX }],
    };
  });

  const renderSkeleton = () => {
    switch (variant) {
      case 'balance':
        return <SkeletonBalance animatedStyle={animatedStyle} />;
      case 'price':
        return <SkeletonPrice animatedStyle={animatedStyle} />;
      case 'transaction':
        return <SkeletonTransaction animatedStyle={animatedStyle} />;
      case 'stat':
        return <SkeletonStat animatedStyle={animatedStyle} />;
      default:
        return <SkeletonCard animatedStyle={animatedStyle} />;
    }
  };

  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={index > 0 ? { marginTop: Spacing.sm } : {}}>
          {renderSkeleton()}
        </View>
      ))}
    </View>
  );
}

// Balance Card Skeleton
function SkeletonBalance({ animatedStyle }: any) {
  return (
    <View style={styles.balanceCard}>
      <View style={styles.shimmerContainer}>
        <Animated.View style={[styles.shimmer, animatedStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(139, 92, 246, 0.1)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
      <View style={styles.balanceContent}>
        <View style={[styles.skeletonBox, { width: '40%', height: 16 }]} />
        <View style={[styles.skeletonBox, { width: '70%', height: 40, marginTop: Spacing.xs }]} />
        <View style={styles.balanceStats}>
          <View style={{ flex: 1 }}>
            <View style={[styles.skeletonBox, { width: '60%', height: 12 }]} />
            <View style={[styles.skeletonBox, { width: '80%', height: 18, marginTop: 4 }]} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={[styles.skeletonBox, { width: '60%', height: 12 }]} />
            <View style={[styles.skeletonBox, { width: '80%', height: 18, marginTop: 4 }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

// Price Card Skeleton
function SkeletonPrice({ animatedStyle }: any) {
  return (
    <View style={styles.priceCard}>
      <View style={styles.shimmerContainer}>
        <Animated.View style={[styles.shimmer, animatedStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(139, 92, 246, 0.1)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
      <View style={styles.priceContent}>
        <View style={styles.priceLeft}>
          <View style={styles.skeletonCircle} />
          <View style={{ marginLeft: Spacing.md }}>
            <View style={[styles.skeletonBox, { width: 60, height: 16 }]} />
            <View style={[styles.skeletonBox, { width: 100, height: 12, marginTop: 4 }]} />
          </View>
        </View>
        <View style={styles.priceRight}>
          <View style={[styles.skeletonBox, { width: 80, height: 16 }]} />
          <View style={[styles.skeletonBox, { width: 60, height: 12, marginTop: 4 }]} />
        </View>
      </View>
    </View>
  );
}

// Transaction Item Skeleton
function SkeletonTransaction({ animatedStyle }: any) {
  return (
    <View style={styles.transactionCard}>
      <View style={styles.shimmerContainer}>
        <Animated.View style={[styles.shimmer, animatedStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(139, 92, 246, 0.1)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
      <View style={styles.transactionContent}>
        <View style={styles.skeletonCircle} />
        <View style={{ flex: 1, marginLeft: Spacing.md }}>
          <View style={[styles.skeletonBox, { width: '50%', height: 16 }]} />
          <View style={[styles.skeletonBox, { width: '70%', height: 12, marginTop: 4 }]} />
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={[styles.skeletonBox, { width: 70, height: 16 }]} />
          <View style={[styles.skeletonBox, { width: 60, height: 12, marginTop: 4 }]} />
        </View>
      </View>
    </View>
  );
}

// Stat Card Skeleton
function SkeletonStat({ animatedStyle }: any) {
  return (
    <View style={styles.statCard}>
      <View style={styles.shimmerContainer}>
        <Animated.View style={[styles.shimmer, animatedStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(139, 92, 246, 0.1)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
      <View style={styles.statContent}>
        <View style={[styles.skeletonBox, { width: '60%', height: 12 }]} />
        <View style={[styles.skeletonBox, { width: '80%', height: 20, marginTop: Spacing.xs }]} />
      </View>
    </View>
  );
}

// Generic Card Skeleton
function SkeletonCard({ animatedStyle }: any) {
  return (
    <View style={styles.card}>
      <View style={styles.shimmerContainer}>
        <Animated.View style={[styles.shimmer, animatedStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(139, 92, 246, 0.1)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
      <View style={styles.cardContent}>
        <View style={[styles.skeletonBox, { width: '70%', height: 18 }]} />
        <View style={[styles.skeletonBox, { width: '100%', height: 14, marginTop: Spacing.sm }]} />
        <View style={[styles.skeletonBox, { width: '90%', height: 14, marginTop: Spacing.xs }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderRadius: BorderRadius.lg,
  },
  shimmer: {
    width: '100%',
    height: '100%',
  },
  skeletonBox: {
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.xs,
  },
  skeletonCircle: {
    width: isSmallScreen ? 44 : 48,
    height: isSmallScreen ? 44 : 48,
    borderRadius: isSmallScreen ? 22 : 24,
    backgroundColor: Colors.border,
  },

  // Balance Card
  balanceCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    minHeight: 180,
    position: 'relative',
    overflow: 'hidden',
  },
  balanceContent: {
    position: 'relative',
    zIndex: 1,
  },
  balanceStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.lg,
  },

  // Price Card
  priceCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 1,
  },
  priceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  priceRight: {
    alignItems: 'flex-end',
  },

  // Transaction Card
  transactionCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: isSmallScreen ? Spacing.sm : Spacing.md,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },

  // Stat Card
  statCard: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    flex: 1,
    minWidth: '45%',
  },
  statContent: {
    position: 'relative',
    zIndex: 1,
  },

  // Generic Card
  card: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardContent: {
    position: 'relative',
    zIndex: 1,
  },
});
