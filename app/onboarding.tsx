import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: 'Secure Crypto Wallet',
    description: 'Bank-grade security with biometric authentication and encrypted storage for your digital assets',
    image: require('@/assets/images/onboarding-hero.png'),
    icon: 'verified-user',
    gradient: ['#8B5CF6', '#6366F1'],
  },
  {
    id: 2,
    title: 'Real-Time Trading',
    description: 'Trade cryptocurrencies instantly with live market data and zero-delay execution',
    image: require('@/assets/images/onboarding-hero.png'),
    icon: 'trending-up',
    gradient: ['#F59E0B', '#FBBF24'],
  },
  {
    id: 3,
    title: 'Instant Transfers',
    description: 'Send and receive crypto with lightning-fast P2P transfers - free and instant',
    image: require('@/assets/images/onboarding-hero.png'),
    icon: 'flash-on',
    gradient: ['#10B981', '#34D399'],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

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

  return (
    <LinearGradient
      colors={[Colors.background, Colors.surface, Colors.background]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Skip Button */}
        <View style={styles.header}>
          <View style={{ width: 80 }} />
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Icon with Gradient Background */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={currentSlide.gradient as any}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons name={currentSlide.icon as any} size={80} color="#FFF" />
            </LinearGradient>
            
            {/* Animated glow rings */}
            <View style={[styles.glowRing, styles.glowRing1]} />
            <View style={[styles.glowRing, styles.glowRing2]} />
          </View>

          {/* Title & Description */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{currentSlide.title}</Text>
            <Text style={styles.description}>{currentSlide.description}</Text>
          </View>

          {/* Features List */}
          <View style={styles.features}>
            <View style={styles.featureItem}>
              <View style={styles.checkCircle}>
                <MaterialIcons name="check" size={16} color={Colors.background} />
              </View>
              <Text style={styles.featureText}>
                {currentIndex === 0 && 'Face ID & Fingerprint'}
                {currentIndex === 1 && 'Live Price Updates'}
                {currentIndex === 2 && 'No Transaction Fees'}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.checkCircle}>
                <MaterialIcons name="check" size={16} color={Colors.background} />
              </View>
              <Text style={styles.featureText}>
                {currentIndex === 0 && 'Multi-Currency Support'}
                {currentIndex === 1 && 'Advanced Order Types'}
                {currentIndex === 2 && 'Instant Settlement'}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.checkCircle}>
                <MaterialIcons name="check" size={16} color={Colors.background} />
              </View>
              <Text style={styles.featureText}>
                {currentIndex === 0 && '24/7 Account Monitoring'}
                {currentIndex === 1 && 'Real-Time Charts'}
                {currentIndex === 2 && 'QR Code Scanning'}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {SLIDES.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>

          {/* Continue Button */}
          <Pressable onPress={handleContinue} style={styles.button}>
            <LinearGradient
              colors={currentSlide.gradient as any}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>
                {currentIndex < SLIDES.length - 1 ? 'Continue' : 'Get Started'}
              </Text>
              <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  skipButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  skipText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
    position: 'relative',
  },
  iconGradient: {
    width: 160,
    height: 160,
    borderRadius: 80,
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
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: Colors.primaryGlow,
  },
  glowRing1: {
    width: 180,
    height: 180,
    opacity: 0.3,
  },
  glowRing2: {
    width: 200,
    height: 200,
    opacity: 0.15,
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
  features: {
    width: '100%',
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  button: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  buttonText: {
    ...Typography.bodyBold,
    color: '#FFF',
    fontSize: 18,
  },
});
