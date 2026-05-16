import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withRepeat, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, Shadows } from '@/constants/theme';

export default function SplashScreen() {
  const router = useRouter();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const glowPulse = useSharedValue(0);
  const shimmer = useSharedValue(0);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + glowPulse.value * 0.3,
    transform: [{ scale: 1 + glowPulse.value * 0.15 }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmer.value,
  }));

  useEffect(() => {
    // Animate logo
    scale.value = withSequence(
      withSpring(1.2, { damping: 10 }),
      withSpring(1, { damping: 15 })
    );
    opacity.value = withSpring(1, { damping: 20 });

    // Pulse glow
    glowPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200 }),
        withTiming(0, { duration: 1200 })
      ),
      -1,
      true
    );

    // Shimmer effect
    shimmer.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );

    // Navigate after animation
    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, [opacity, router, scale, glowPulse, shimmer]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#050714', '#0D0F2B', '#08091A']}
        style={StyleSheet.absoluteFill}
      />

      {/* Background ambient glows */}
      <View style={styles.ambientGlow1} />
      <View style={styles.ambientGlow2} />

      <Animated.View style={[styles.logoContainer, logoStyle]}>
        {/* Animated glow ring behind logo */}
        <Animated.View style={[styles.glowRing, glowStyle]} />

        {/* Logo image */}
        <View style={styles.logoWrapper}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Brand name with shimmer */}
        <View style={styles.brandContainer}>
          <Text style={styles.appName}>CryptoVault</Text>
          <Animated.View style={[styles.brandShimmer, shimmerStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(245,158,11,0.3)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>

        <Text style={styles.tagline}>Enterprise Digital Wallet</Text>

        {/* Security badge */}
        <View style={styles.securityBadge}>
          <View style={styles.securityDot} />
          <Text style={styles.securityText}>Bank-Grade Security</Text>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.version}>v1.0.0</Text>
        <Text style={styles.copyright}>2026 CryptoVault Inc.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientGlow1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(124,58,237,0.15)',
    top: '20%',
    left: '-20%',
  },
  ambientGlow2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(245,158,11,0.1)',
    bottom: '15%',
    right: '-15%',
  },
  logoContainer: {
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(245,158,11,0.2)',
    top: -20,
  },
  logoWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.primaryGlow,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  brandContainer: {
    position: 'relative',
    marginBottom: Spacing.xs,
  },
  appName: {
    fontSize: 38,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -1,
  },
  brandShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 4,
  },
  tagline: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: Spacing.lg,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16,185,129,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
  },
  securityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  securityText: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  version: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  copyright: {
    ...Typography.micro,
    color: Colors.textDisabled,
    marginTop: 4,
  },
});
