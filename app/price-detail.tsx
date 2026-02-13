import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { api } from '@/services/api';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

type TimeFrame = '1H' | '24H' | '7D' | '1M' | '1Y';

export default function PriceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('24H');
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const symbol = (params.symbol as string) || 'BTC';
  const name = (params.name as string) || 'Bitcoin';
  const currentPrice = parseFloat(params.price as string) || 0;
  const change24h = parseFloat(params.change as string) || 0;

  useEffect(() => {
    fetchPriceHistory();
  }, [timeFrame]);

  const fetchPriceHistory = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPriceHistory(symbol, timeFrame);
      setPriceHistory(data);
    } catch (error) {
      console.error('Failed to fetch price history:', error);
      setPriceHistory(generateMockData());
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockData = () => {
    const points = timeFrame === '1H' ? 12 : timeFrame === '24H' ? 24 : 30;
    const data = [];
    let price = currentPrice;
    for (let i = 0; i < points; i++) {
      const volatility = timeFrame === '1H' ? 0.01 : timeFrame === '24H' ? 0.02 : 0.05;
      price = price * (1 + (Math.random() - 0.5) * volatility);
      data.push(price);
    }
    return data;
  };

  const chartData = {
    labels: [],
    datasets: [
      {
        data: priceHistory.length > 0 ? priceHistory : [currentPrice],
        color: () => change24h >= 0 ? Colors.success : Colors.error,
        strokeWidth: 3,
      },
    ],
  };

  const timeFrames: { value: TimeFrame; label: string }[] = [
    { value: '1H', label: '1H' },
    { value: '24H', label: '24H' },
    { value: '7D', label: '7D' },
    { value: '1M', label: '1M' },
    { value: '1Y', label: '1Y' },
  ];

  const isPositive = change24h >= 0;
  const minPrice = Math.min(...priceHistory);
  const maxPrice = Math.max(...priceHistory);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View entering={FadeIn}>
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
              </Pressable>
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle}>{name}</Text>
                <Text style={styles.headerSymbol}>{symbol}</Text>
              </View>
              <Pressable style={styles.favoriteButton}>
                <MaterialIcons name="star-border" size={24} color={Colors.primary} />
              </Pressable>
            </View>
          </Animated.View>

          {/* Current Price */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <View style={styles.priceContainer}>
              <Text style={styles.currentPrice}>
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
              <View style={styles.changeContainer}>
                <LinearGradient
                  colors={isPositive 
                    ? ['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.05)']
                    : ['rgba(239, 68, 68, 0.15)', 'rgba(239, 68, 68, 0.05)']
                  }
                  style={styles.changeGradient}
                >
                  <MaterialIcons
                    name={isPositive ? 'trending-up' : 'trending-down'}
                    size={18}
                    color={isPositive ? Colors.success : Colors.error}
                  />
                  <Text style={[styles.changeText, { color: isPositive ? Colors.success : Colors.error }]}>
                    {Math.abs(change24h).toFixed(2)}%
                  </Text>
                </LinearGradient>
              </View>
            </View>
          </Animated.View>

          {/* Chart */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <View style={styles.chartContainer}>
              <View style={styles.chartCard}>
                <LinearGradient
                  colors={isPositive
                    ? ['rgba(16, 185, 129, 0.05)', 'transparent']
                    : ['rgba(239, 68, 68, 0.05)', 'transparent']
                  }
                  style={styles.chartGradient}
                >
                  {!isLoading && priceHistory.length > 0 && (
                    <LineChart
                      data={chartData}
                      width={width - Spacing.lg * 2}
                      height={isSmallScreen ? 200 : 240}
                      chartConfig={{
                        backgroundColor: 'transparent',
                        backgroundGradientFrom: 'transparent',
                        backgroundGradientTo: 'transparent',
                        decimalPlaces: 2,
                        color: () => isPositive ? Colors.success : Colors.error,
                        labelColor: () => Colors.textMuted,
                        style: {
                          borderRadius: BorderRadius.lg,
                        },
                        propsForDots: {
                          r: '0',
                        },
                        propsForBackgroundLines: {
                          strokeDasharray: '0',
                          stroke: Colors.border,
                          strokeWidth: 1,
                        },
                      }}
                      bezier
                      withDots={false}
                      withInnerLines={true}
                      withOuterLines={false}
                      withVerticalLabels={false}
                      withHorizontalLabels={true}
                      style={styles.chart}
                    />
                  )}
                </LinearGradient>
              </View>
            </View>
          </Animated.View>

          {/* Time Frame Selector */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <View style={styles.timeFrameContainer}>
              {timeFrames.map((tf, index) => (
                <Pressable
                  key={tf.value}
                  style={styles.timeFrameButtonWrapper}
                  onPress={() => setTimeFrame(tf.value)}
                >
                  <LinearGradient
                    colors={timeFrame === tf.value 
                      ? ['#8B5CF6', '#6366F1'] 
                      : ['transparent', 'transparent']
                    }
                    style={styles.timeFrameGradient}
                  >
                    <Text style={[
                      styles.timeFrameText,
                      timeFrame === tf.value && styles.timeFrameTextActive,
                    ]}>
                      {tf.label}
                    </Text>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Stats Grid */}
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.05)', 'transparent']}
                  style={styles.statGradient}
                >
                  <View style={styles.statIcon}>
                    <MaterialIcons name="trending-up" size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.statLabel}>Market Cap</Text>
                  <Text style={styles.statValue}>$1.2T</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.05)', 'transparent']}
                  style={styles.statGradient}
                >
                  <View style={styles.statIcon}>
                    <MaterialIcons name="show-chart" size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.statLabel}>24h Volume</Text>
                  <Text style={styles.statValue}>$45.2B</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.05)', 'transparent']}
                  style={styles.statGradient}
                >
                  <View style={[styles.statIcon, { backgroundColor: Colors.successGlow }]}>
                    <MaterialIcons name="arrow-upward" size={20} color={Colors.success} />
                  </View>
                  <Text style={styles.statLabel}>24h High</Text>
                  <Text style={styles.statValue}>
                    ${maxPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </Text>
                </LinearGradient>
              </View>
              
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['rgba(239, 68, 68, 0.05)', 'transparent']}
                  style={styles.statGradient}
                >
                  <View style={[styles.statIcon, { backgroundColor: Colors.errorGlow }]}>
                    <MaterialIcons name="arrow-downward" size={20} color={Colors.error} />
                  </View>
                  <Text style={styles.statLabel}>24h Low</Text>
                  <Text style={styles.statValue}>
                    ${minPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </Text>
                </LinearGradient>
              </View>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <View style={styles.actionsContainer}>
              <View style={{ flex: 1 }}>
                <Button
                  title="Buy"
                  onPress={() =>
                    router.push({
                      pathname: '/trading',
                      params: { symbol, price: currentPrice.toString() },
                    })
                  }
                  variant="primary"
                />
              </View>
              <View style={{ width: Spacing.md }} />
              <View style={{ flex: 1 }}>
                <Button
                  title="Sell"
                  onPress={() =>
                    router.push({
                      pathname: '/trading',
                      params: { symbol, price: currentPrice.toString() },
                    })
                  }
                  variant="danger"
                />
              </View>
            </View>
          </Animated.View>

          {/* Set Alert Button */}
          <Animated.View entering={FadeIn.delay(600)}>
            <Pressable
              style={styles.alertButton}
              onPress={() =>
                router.push({
                  pathname: '/price-alert',
                  params: { symbol, currentPrice: currentPrice.toString() },
                })
              }
            >
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.1)', 'transparent']}
                style={styles.alertGradient}
              >
                <View style={styles.alertIcon}>
                  <MaterialIcons name="notifications-active" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.alertButtonText}>Set Price Alert</Text>
                <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.heading,
    color: Colors.text,
    fontWeight: '700',
    fontSize: isSmallScreen ? 16 : 18,
  },
  headerSymbol: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: isSmallScreen ? 11 : 12,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  currentPrice: {
    fontSize: isSmallScreen ? 32 : 40,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.sm,
    letterSpacing: -1,
  },
  changeContainer: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  changeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: 4,
  },
  changeText: {
    ...Typography.body,
    fontWeight: '700',
    fontSize: isSmallScreen ? 15 : 17,
  },
  chartContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  chartCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.md,
  },
  chartGradient: {
    paddingVertical: Spacing.md,
  },
  chart: {
    borderRadius: BorderRadius.lg,
  },
  timeFrameContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  timeFrameButtonWrapper: {
    flex: 1,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  timeFrameGradient: {
    paddingVertical: isSmallScreen ? Spacing.xs : Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeFrameText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: isSmallScreen ? 12 : 14,
  },
  timeFrameTextActive: {
    color: '#FFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: isSmallScreen ? '47%' : '48%',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statGradient: {
    padding: isSmallScreen ? Spacing.sm : Spacing.md,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontSize: isSmallScreen ? 11 : 12,
  },
  statValue: {
    ...Typography.bodyBold,
    color: Colors.text,
    fontSize: isSmallScreen ? 14 : 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  alertButton: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  alertGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: isSmallScreen ? Spacing.sm : Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    flex: 1,
    fontSize: isSmallScreen ? 14 : 16,
  },
});
