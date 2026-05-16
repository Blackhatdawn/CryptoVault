import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, Dimensions,
} from 'react-native';
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
const isSmall = width < 375;

type TimeFrame = '1H' | '24H' | '7D' | '1M' | '1Y';

const TIME_FRAMES: TimeFrame[] = ['1H', '24H', '7D', '1M', '1Y'];

const STATS = [
  { icon: 'trending-up', label: 'Market Cap', value: '$1.2T',   color: Colors.primary },
  { icon: 'show-chart',  label: '24h Volume', value: '$45.2B',  color: Colors.info    },
  { icon: 'arrow-upward',label: '24h High',   value: 'dynamic', color: Colors.success },
  { icon: 'arrow-downward',label:'24h Low',   value: 'dynamic', color: Colors.error   },
];

export default function PriceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('24H');
  const [history, setHistory]   = useState<number[]>([]);
  const [loading, setLoading]   = useState(true);

  const symbol     = (params.symbol  as string) || 'BTC';
  const name       = (params.name    as string) || 'Bitcoin';
  const price      = parseFloat(params.price  as string) || 0;
  const change     = parseFloat(params.change as string) || 0;
  const isPositive = change >= 0;

  const mockHistory = useCallback(() => {
    const pts = timeFrame === '1H' ? 12 : timeFrame === '24H' ? 24 : 30;
    let p = price;
    return Array.from({ length: pts }, () => {
      const v = timeFrame === '1H' ? 0.01 : timeFrame === '24H' ? 0.02 : 0.06;
      p = p * (1 + (Math.random() - 0.5) * v);
      return p;
    });
  }, [price, timeFrame]);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getPriceHistory(symbol, timeFrame);
      setHistory(data);
    } catch {
      setHistory(mockHistory());
    } finally { setLoading(false); }
  }, [mockHistory, symbol, timeFrame]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const chartData = {
    labels: [],
    datasets: [{
      data: history.length > 0 ? history : [price],
      color: () => isPositive ? Colors.success : Colors.error,
      strokeWidth: 2.5,
    }],
  };

  const hi = history.length ? Math.max(...history) : price;
  const lo = history.length ? Math.min(...history) : price;

  return (
    <View style={styles.root}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* ─── Header ──────────────────────────────────────────────── */}
          <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
            </Pressable>
            <View style={styles.headerCenter}>
              <View style={styles.symbolIcon}>
                <Text style={styles.symbolEmoji}>
                  {symbol === 'BTC' ? '₿' : symbol === 'ETH' ? 'Ξ' : symbol.charAt(0)}
                </Text>
              </View>
              <View>
                <Text style={styles.headerName}>{name}</Text>
                <Text style={styles.headerSym}>{symbol}/USD</Text>
              </View>
            </View>
            <Pressable style={styles.favBtn}>
              <MaterialIcons name="star-border" size={24} color={Colors.accent} />
            </Pressable>
          </Animated.View>

          {/* ─── Price Display ────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.priceSection}>
            <Text style={styles.priceValue}>
              ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <View style={styles.changePill}>
              <LinearGradient
                colors={isPositive ? ['rgba(16,185,129,0.2)','rgba(16,185,129,0.08)'] : ['rgba(239,68,68,0.2)','rgba(239,68,68,0.08)']}
                style={styles.changePillGrad}
              >
                <MaterialIcons
                  name={isPositive ? 'trending-up' : 'trending-down'}
                  size={18} color={isPositive ? Colors.success : Colors.error}
                />
                <Text style={[styles.changePct, { color: isPositive ? Colors.success : Colors.error }]}>
                  {isPositive ? '+' : ''}{change.toFixed(2)}%
                </Text>
                <Text style={styles.changePeriod}>24h</Text>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* ─── Chart ───────────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.chartSection}>
            <View style={styles.chartCard}>
              <LinearGradient
                colors={isPositive ? ['rgba(16,185,129,0.06)','transparent'] : ['rgba(239,68,68,0.06)','transparent']}
                style={styles.chartGrad}
              >
                {!loading && history.length > 0 && (
                  <LineChart
                    data={chartData}
                    width={width - Spacing.lg * 2 - 2}
                    height={isSmall ? 190 : 230}
                    chartConfig={{
                      backgroundColor: 'transparent',
                      backgroundGradientFrom: 'transparent',
                      backgroundGradientTo: 'transparent',
                      decimalPlaces: 0,
                      color: () => isPositive ? Colors.success : Colors.error,
                      labelColor: () => Colors.textMuted,
                      propsForDots: { r: '0' },
                      propsForBackgroundLines: { stroke: Colors.border, strokeWidth: 1, strokeDasharray: '4,4' },
                    }}
                    bezier
                    withDots={false}
                    withInnerLines
                    withOuterLines={false}
                    withVerticalLabels={false}
                    withHorizontalLabels
                    style={{ borderRadius: BorderRadius.lg }}
                  />
                )}
                {loading && (
                  <View style={[styles.chartPlaceholder, { height: isSmall ? 190 : 230 }]}>
                    <MaterialIcons name="show-chart" size={40} color={Colors.border} />
                    <Text style={styles.chartPlaceholderTxt}>Loading chart...</Text>
                  </View>
                )}
              </LinearGradient>
            </View>
          </Animated.View>

          {/* ─── Timeframe Selector ───────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(210).springify()} style={styles.tfRow}>
            {TIME_FRAMES.map(tf => (
              <Pressable key={tf} onPress={() => setTimeFrame(tf)} style={styles.tfItem}>
                <LinearGradient
                  colors={timeFrame === tf ? ['#7C3AED','#4F46E5'] : ['transparent','transparent']}
                  style={styles.tfGrad}
                >
                  <Text style={[styles.tfText, timeFrame === tf && styles.tfTextActive]}>{tf}</Text>
                </LinearGradient>
              </Pressable>
            ))}
          </Animated.View>

          {/* ─── Stats Grid ───────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(280).springify()} style={styles.statsGrid}>
            {STATS.map((s, i) => (
              <View key={i} style={styles.statCard}>
                <LinearGradient colors={[`${s.color}12`,'transparent']} style={styles.statGrad}>
                  <View style={[styles.statIcon, { backgroundColor: `${s.color}22` }]}>
                    <MaterialIcons name={s.icon as any} size={18} color={s.color} />
                  </View>
                  <Text style={styles.statLabel}>{s.label}</Text>
                  <Text style={[styles.statValue, { color: s.color }]}>
                    {s.value === 'dynamic'
                      ? (s.label === '24h High'
                        ? `$${hi.toLocaleString(undefined,{maximumFractionDigits:2})}`
                        : `$${lo.toLocaleString(undefined,{maximumFractionDigits:2})}`)
                      : s.value}
                  </Text>
                </LinearGradient>
              </View>
            ))}
          </Animated.View>

          {/* ─── Action Buttons ───────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(350).springify()} style={styles.actions}>
            <View style={{ flex: 1 }}>
              <Button title="Buy" onPress={() => router.push({ pathname: '/trading', params: { symbol, price: price.toString() } })} variant="primary" />
            </View>
            <View style={{ width: Spacing.md }} />
            <View style={{ flex: 1 }}>
              <Button title="Sell" onPress={() => router.push({ pathname: '/trading', params: { symbol, price: price.toString() } })} variant="danger" />
            </View>
          </Animated.View>

          {/* ─── Alert Button ─────────────────────────────────────────── */}
          <Animated.View entering={FadeIn.delay(420)}>
            <Pressable
              style={styles.alertBtn}
              onPress={() => router.push({ pathname: '/price-alert', params: { symbol, currentPrice: price.toString() } })}
            >
              <LinearGradient colors={[Colors.primaryGlow2,'transparent']} style={styles.alertGrad}>
                <View style={styles.alertIcon}>
                  <MaterialIcons name="notifications-active" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.alertTxt}>Set Price Alert</Text>
                <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <View style={{ height: Spacing.xxxl }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  backBtn:      { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1, justifyContent: 'center' },
  symbolIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceElevated, alignItems: 'center',
    justifyContent: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  symbolEmoji:  { fontSize: 18, fontWeight: '700', color: Colors.text },
  headerName:   { ...Typography.bodyBold, color: Colors.text },
  headerSym:    { ...Typography.caption, color: Colors.textMuted },
  favBtn:       { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

  priceSection: { alignItems: 'center', paddingVertical: Spacing.lg },
  priceValue:   { fontSize: isSmall ? 34 : 42, fontWeight: '800', color: Colors.text, letterSpacing: -1, marginBottom: Spacing.sm },
  changePill:   { borderRadius: BorderRadius.full, overflow: 'hidden' },
  changePillGrad: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 7, gap: 5,
  },
  changePct:    { ...Typography.bodyBold, fontWeight: '700', fontSize: isSmall ? 15 : 17 },
  changePeriod: { ...Typography.caption, color: Colors.textMuted },

  chartSection: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  chartCard: {
    borderRadius: BorderRadius.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border, ...Shadows.md,
  },
  chartGrad: { paddingVertical: Spacing.md },
  chartPlaceholder: { alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  chartPlaceholderTxt: { ...Typography.caption, color: Colors.textMuted },

  tfRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, marginBottom: Spacing.xl, gap: Spacing.xs },
  tfItem: { flex: 1, borderRadius: BorderRadius.sm, overflow: 'hidden' },
  tfGrad: {
    paddingVertical: isSmall ? 8 : 10, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  tfText:       { ...Typography.captionBold, color: Colors.textSecondary },
  tfTextActive: { color: '#FFF' },

  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1, minWidth: '47%', borderRadius: BorderRadius.lg,
    overflow: 'hidden', borderWidth: 1, borderColor: Colors.border,
  },
  statGrad:  { padding: isSmall ? Spacing.sm : Spacing.md },
  statIcon:  { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs },
  statLabel: { ...Typography.caption, color: Colors.textSecondary, marginBottom: 4 },
  statValue: { ...Typography.captionBold, fontWeight: '700', fontSize: isSmall ? 14 : 16 },

  actions:  { flexDirection: 'row', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },

  alertBtn: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md, borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  alertGrad: { flexDirection: 'row', alignItems: 'center', padding: isSmall ? Spacing.sm : Spacing.md, gap: Spacing.sm },
  alertIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryGlow, alignItems: 'center', justifyContent: 'center' },
  alertTxt:  { ...Typography.bodyBold, color: Colors.primary, flex: 1 },
});
