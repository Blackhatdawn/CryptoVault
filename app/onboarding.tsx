import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Button } from '@/components/ui/Button';

const { width } = Dimensions.get('window');

const ONBOARDING_SLIDES = [
  {
    id: '1',
    title: 'Secure Crypto Wallet',
    description: 'Your assets are protected with bank-level security and biometric authentication',
    image: require('@/assets/images/onboarding-hero.png'),
    icon: 'security',
  },
  {
    id: '2',
    title: 'Real-Time Prices',
    description: 'Stay updated with live cryptocurrency prices and market trends',
    icon: 'trending-up',
  },
  {
    id: '3',
    title: 'Instant Transfers',
    description: 'Send and receive crypto instantly with zero fees between users',
    icon: 'send',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('onboarding_completed', 'true');
    router.replace('/auth');
  };

  const renderSlide = ({ item }: { item: typeof ONBOARDING_SLIDES[0] }) => (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image
            source={item.image}
            style={styles.image}
            contentFit="contain"
            transition={200}
          />
        ) : (
          <View style={styles.iconPlaceholder}>
            <MaterialIcons name={item.icon as any} size={120} color={Colors.primary} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Skip Button */}
      {currentIndex < ONBOARDING_SLIDES.length - 1 && (
        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {ONBOARDING_SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* Next/Get Started Button */}
      <View style={styles.footer}>
        <Button
          title={currentIndex === ONBOARDING_SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: Spacing.md,
    zIndex: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  skipText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
  },
  image: {
    width: width * 0.8,
    height: width * 1.2,
  },
  iconPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
});
