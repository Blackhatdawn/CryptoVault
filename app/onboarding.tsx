import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

const SLIDES = [
  {
    id: 1,
    title: 'Secure Crypto Wallet',
    description: 'Bank-grade security with biometric authentication and encrypted storage for your digital assets',
    icon: 'verified-user',
    gradient: ['#8B5CF6', '#6366F1'],
  },
  {
    id: 2,
    title: 'Real-Time Trading',
    description: 'Trade cryptocurrencies instantly with live market data and zero-delay execution',
    icon: 'trending-up',
    gradient: ['#F59E0B', '#FBBF24'],
  },
  {
    id: 3,
    title: 'Instant Transfers',
    description: 'Send and receive crypto with lightning-fast P2P transfers - free and instant',
    icon: 'flash-on',
    gradient: ['#10B981', '#34D399'],
  },
];

const SLIDE_FEATURES = [
  ['Face ID & Fingerprint', 'Multi-Currency Support', '24/7 Account Monitoring'],
  ['Live Price Updates',    'Advanced Order Types',   'Real-Time Charts'],
  ['No Transaction Fees',  'Instant Settlement',      'QR Code Scanning'],
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);

  const isSmall  = width < 375 || height < 668;
  const isXSmall = width < 340 || height < 600;

  const iconContainerSize = Math.min(Math.round(width * 0.50), 200);
  const iconGradientSize  = Math.min(Math.round(width * 0.40), 160);
  const iconGlowRing1     = iconGradientSize + 20;
  const iconGlowRing2     = iconGradientSize + 40;
  const iconSymbolSize    = Math.round(iconGradientSize * 0.5);

  const handleContinue = async () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      await AsyncStorage.setItem('@cryptovault/onboarding_completed', 'true');
      router.replace('/auth');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('@cryptovault/onboarding_completed', 'true');
    router.replace('/auth');
  };

  const currentSlide = SLIDES[currentIndex];
  const currentFeatures = SLIDE_FEATURES[currentIndex];

  return (
    <LinearGradient
      colors={[Colors.background, Colors.surface, Colors.background]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>

        {/* Skip */}
        <View style={styles.header}>
          <View style={{ width: 80 }} />
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>

          {/* Icon */}
          <View style={[styles.iconContainer, { width: iconContainerSize, height: iconContainerSize }]}>
            <LinearGradient
              colors={currentSlide.gradient as any}
              style={[
                styles.iconGradient,
                { width: iconGradientSize, height: iconGradientSize, borderRadius: iconGradientSize / 2 },
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons name={currentSlide.icon as any} size={iconSymbolSize} color="#FFF" />
            </LinearGradient>
            <View style={[styles.glowRing, { width: iconGlowRing1, height: iconGlowRing1, borderRadius: iconGlowRing1 / 2, opacity: 0.3 }]} />
            <View style={[styles.glowRing, { width: iconGlowRing2, height: iconGlowRing2, borderRadius: iconGlowRing2 / 2, opacity: 0.15 }]} />
          </View>

          {/* Text */}
          <View style={[styles.textContainer, isSmall && { marginBottom: Spacing.lg }]}>
            <Text style={[styles.title, isXSmall && { fontSize: 24 }, isSmall && { fontSize: 28 }]}>
              {currentSlide.title}
            </Text>
            <Text style={[styles.description, isSmall && { fontSize: 14 }]}>
              {currentSlide.description}
            </Text>
          </View>

          {/* Features */}
          <View style={styles.features}>
            {currentFeatures.map((feat) => (
              <View key={feat} style={styles.featureItem}>
                <View style={[styles.checkCircle, isSmall && { width: 24, height: 24, borderRadius: 12 }]}>
                  <MaterialIcons name="check" size={isSmall ? 13 : 16} color={Colors.background} />
                </View>
                <Text style={[styles.featureText, isSmall && { fontSize: 14 }]}>{feat}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={[styles.footer, isSmall && { paddingHorizontal: Spacing.lg }]}>
          <View style={styles.pagination}>
            {SLIDES.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === currentIndex && styles.dotActive]}
              />
            ))}
          </View>

          <Pressable onPress={handleContinue} style={styles.button}>
            <LinearGradient
              colors={currentSlide.gradient as any}
              style={[styles.buttonGradient, isSmall && { paddingVertical: Spacing.md }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.buttonText, isSmall && { fontSize: 16 }]}>
                {currentIndex < SLIDES.length - 1 ? 'Continue' : 'Get Started'}
              </Text>
              <MaterialIcons name="arrow-forward" size={isSmall ? 18 : 20} color="#FFF" />
            </LinearGradient>
          </Pressable>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea:  { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  skipButton: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  skipText:   { ...Typography.body, color: Colors.textSecondary, fontWeight: '600' },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    position: 'relative',
  },
  iconGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: Colors.primaryGlow,
  },

  textContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },

  features: { width: '100%', gap: Spacing.md },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  checkCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.success,
    justifyContent: 'center', alignItems: 'center',
  },
  featureText: { ...Typography.body, color: Colors.text, flex: 1 },

  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  pagination: {
    flexDirection: 'row', justifyContent: 'center',
    gap: Spacing.sm, marginBottom: Spacing.xl,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: { width: 24, backgroundColor: Colors.primary },

  button: { borderRadius: BorderRadius.xl, overflow: 'hidden' },
  buttonGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.lg, gap: Spacing.sm,
  },
  buttonText: { ...Typography.bodyBold, color: '#FFF', fontSize: 18 },
});
