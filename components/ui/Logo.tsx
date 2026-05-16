import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Colors, Typography, Spacing, Shadows } from '@/constants/theme';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  animated?: boolean;
  style?: ViewStyle;
}

const SIZES = {
  sm: { logo: 32, text: 14, tagline: 10 },
  md: { logo: 56, text: 20, tagline: 12 },
  lg: { logo: 80, text: 28, tagline: 14 },
  xl: { logo: 120, text: 38, tagline: 16 },
};

export function Logo({ 
  size = 'md', 
  showText = true, 
  showTagline = false,
  animated = false,
  style 
}: LogoProps) {
  const dims = SIZES[size];
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    if (animated) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1500 }),
          withTiming(1, { duration: 1500 })
        ),
        -1,
        true
      );
    }
  }, [animated, pulseScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const LogoImage = (
    <Image
      source={require('@/assets/images/logo.png')}
      style={{ width: dims.logo, height: dims.logo }}
      resizeMode="contain"
    />
  );

  return (
    <View style={[styles.container, style]}>
      {animated ? (
        <Animated.View style={[styles.logoWrapper, animatedStyle]}>
          {LogoImage}
        </Animated.View>
      ) : (
        <View style={styles.logoWrapper}>
          {LogoImage}
        </View>
      )}
      
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.brandName, { fontSize: dims.text }]}>
            CryptoVault
          </Text>
          {showTagline && (
            <Text style={[styles.tagline, { fontSize: dims.tagline }]}>
              Enterprise Digital Wallet
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

// Compact horizontal logo for headers
export function LogoCompact({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.compactContainer, style]}>
      <Image
        source={require('@/assets/images/logo.png')}
        style={styles.compactLogo}
        resizeMode="contain"
      />
      <Text style={styles.compactText}>CryptoVault</Text>
    </View>
  );
}

// Icon-only logo for small spaces
export function LogoIcon({ size = 40, style }: { size?: number; style?: ViewStyle }) {
  return (
    <View style={[styles.iconContainer, { width: size, height: size }, style]}>
      <Image
        source={require('@/assets/images/logo.png')}
        style={{ width: size * 0.85, height: size * 0.85 }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  brandName: {
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  tagline: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  
  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  compactLogo: {
    width: 28,
    height: 28,
  },
  compactText: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: 16,
    letterSpacing: -0.3,
  },
  
  // Icon-only variant
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
