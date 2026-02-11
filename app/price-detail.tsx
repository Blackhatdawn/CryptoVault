import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { api } from '@/services/api';

const { width } = Dimensions.get('window');

type TimeFrame = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

export default function PriceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1D');
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
      // Mock data for demo
      setPriceHistory(generateMockData());
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockData = () => {
    const points = 20;
    const data = [];
    for (let i = 0; i < points; i++) {
      data.push(currentPrice * (1 + (Math.random() - 0.5) * 0.1));
    }
    return data;
  };

  const chartData = {
    labels: [],
    datasets: [
      {
        data: priceHistory.length > 0 ? priceHistory : [currentPrice],
        color: () => change24h >= 0 ? Colors.success : Colors.error,
        strokeWidth: 2,
      },
    ],
  };

  const timeFrames: TimeFrame[] = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{name}</Text>
            <Text style={styles.headerSymbol}>{symbol}</Text>
          </View>
          <Pressable
            style={styles.favoriteButton}
            onPress={() => {/* Add to favorites */}}
          >
            <MaterialIcons name="star-border" size={24} color={Colors.primary} />
          </Pressable>
        </View>

        {/* Current Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>${currentPrice.toLocaleString()}</Text>
          <View
            style={[
              styles.changeContainer,
              { backgroundColor: change24h >= 0 ? `${Colors.success}20` : `${Colors.error}20` },
            ]}
          >
            <MaterialIcons
              name={change24h >= 0 ? 'arrow-upward' : 'arrow-downward'}
              size={16}
              color={change24h >= 0 ? Colors.success : Colors.error}
            />
            <Text
              style={[
                styles.changeText,
                { color: change24h >= 0 ? Colors.success : Colors.error },
              ]}
            >
              {Math.abs(change24h).toFixed(2)}%
            </Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          {!isLoading && priceHistory.length > 0 && (
            <LineChart
              data={chartData}
              width={width - Spacing.md * 2}
              height={220}
              chartConfig={{
                backgroundColor: Colors.background,
                backgroundGradientFrom: Colors.surface,
                backgroundGradientTo: Colors.surface,
                decimalPlaces: 2,
                color: () => change24h >= 0 ? Colors.success : Colors.error,
                labelColor: () => Colors.textMuted,
                style: {
                  borderRadius: BorderRadius.lg,
                },
                propsForDots: {
                  r: '0',
                },
              }}
              bezier
              withDots={false}
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLabels={false}
              withHorizontalLabels={false}
              style={styles.chart}
            />
          )}
        </View>

        {/* Time Frame Selector */}
        <View style={styles.timeFrameContainer}>
          {timeFrames.map((tf) => (
            <Pressable
              key={tf}
              style={[
                styles.timeFrameButton,
                timeFrame === tf && styles.timeFrameButtonActive,
              ]}
              onPress={() => setTimeFrame(tf)}
            >
              <Text
                style={[
                  styles.timeFrameText,
                  timeFrame === tf && styles.timeFrameTextActive,
                ]}
              >
                {tf}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Market Cap</Text>
            <Text style={styles.statValue}>$1.2T</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>24h Volume</Text>
            <Text style={styles.statValue}>$45.2B</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>24h High</Text>
            <Text style={styles.statValue}>${(currentPrice * 1.05).toLocaleString()}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>24h Low</Text>
            <Text style={styles.statValue}>${(currentPrice * 0.95).toLocaleString()}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="Buy"
            onPress={() =>
              router.push({
                pathname: '/trading',
                params: { symbol, price: currentPrice.toString() },
              })
            }
            style={[styles.actionButton, { backgroundColor: Colors.success }]}
          />
          <View style={{ width: Spacing.md }} />
          <Button
            title="Sell"
            onPress={() =>
              router.push({
                pathname: '/trading',
                params: { symbol, price: currentPrice.toString() },
              })
            }
            style={[styles.actionButton, { backgroundColor: Colors.error }]}
          />
        </View>

        {/* Set Alert Button */}
        <Pressable
          style={styles.alertButton}
          onPress={() =>
            router.push({
              pathname: '/price-alert',
              params: { symbol, currentPrice: currentPrice.toString() },
            })
          }
        >
          <MaterialIcons name="notifications-none" size={20} color={Colors.primary} />
          <Text style={styles.alertButtonText}>Set Price Alert</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.heading,
    color: Colors.text,
    fontWeight: '700',
  },
  headerSymbol: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  favoriteButton: {
    padding: Spacing.xs,
  },
  priceContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  currentPrice: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  changeText: {
    ...Typography.body,
    fontWeight: '600',
  },
  chartContainer: {
    paddingHorizontal: Spacing.md,
    marginVertical: Spacing.md,
  },
  chart: {
    borderRadius: BorderRadius.lg,
  },
  timeFrameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  timeFrameButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  timeFrameButtonActive: {
    backgroundColor: Colors.surfaceElevated,
  },
  timeFrameText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  timeFrameTextActive: {
    color: Colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surfaceElevated,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  statValue: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
  alertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: Spacing.xs,
  },
  alertButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
});
