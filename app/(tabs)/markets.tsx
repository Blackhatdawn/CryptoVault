import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  Pressable, type ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useLivePrices } from '@/hooks/useLivePrices';
import { PriceCard } from '@/components/PriceCard';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import type { CryptoPrice } from '@/types';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

type SortKey = 'price' | 'change' | 'name';

const FILTER_TABS = [
  { key: 'all',  label: 'All' },
  { key: 'top',  label: 'Top 10' },
  { key: 'gainers', label: 'Gainers' },
  { key: 'losers',  label: 'Losers' },
];

export default function MarketsScreen() {
  const { prices, isLoading: pricesLoading } = useLivePrices();
  const [query, setQuery]   = useState('');
  const [sort, setSort]     = useState<SortKey>('price');
  const [filter, setFilter] = useState('all');

  const loading = pricesLoading || prices.length === 0;

  // Memoize filtered and sorted data to prevent recalculation on every render
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return prices
      .filter(p => {
        if (q && !p.name.toLowerCase().includes(q) && !p.symbol.toLowerCase().includes(q)) return false;
        if (filter === 'top')     return prices.indexOf(p) < 10;  // top 10 by market cap
        if (filter === 'gainers') return parseFloat(p.changePercent24Hr || '0') > 0;
        if (filter === 'losers')  return parseFloat(p.changePercent24Hr || '0') < 0;
        return true;
      })
      .sort((a, b) => {
        if (sort === 'price')  return parseFloat(b.priceUsd)  - parseFloat(a.priceUsd);
        if (sort === 'change') return parseFloat(b.changePercent24Hr || '0') - parseFloat(a.changePercent24Hr || '0');
        return a.name.localeCompare(b.name);
      });
  }, [prices, query, sort, filter]);

  // Memoize sentiment counts
  const { gainCount, loseCount, totalCount } = useMemo(() => {
    const gainCount = prices.filter(p => parseFloat(p.changePercent24Hr || '0') > 0).length;
    return { gainCount, loseCount: prices.length - gainCount, totalCount: prices.length };
  }, [prices]);

  // Memoize search handler
  const handleSearchChange = useCallback((text: string) => {
    setQuery(text);
  }, []);

  const handleClearSearch = useCallback(() => {
    setQuery('');
  }, []);

  const keyExtractor = useCallback((item: CryptoPrice) => item.symbol, []);

  const renderPriceItem = useCallback<ListRenderItem<CryptoPrice>>(({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 30).duration(200)}>
      <PriceCard price={item} />
    </Animated.View>
  ), []);

  return (
    <View style={styles.root}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>

        {/* ─── Header ────────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
          <View>
            <Text style={styles.title}>Markets</Text>
            <Text style={styles.subtitle}>Live Cryptocurrency Prices</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </Animated.View>

        {/* ─── Market Sentiment Bar ──────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(60).duration(300)} style={styles.sentimentWrap}>
          <View style={styles.sentimentCard}>
            <View style={styles.sentimentItem}>
              <MaterialIcons name="trending-up" size={16} color={Colors.success} />
              <Text style={[styles.sentimentCount, { color: Colors.success }]}>{gainCount}</Text>
              <Text style={styles.sentimentLabel}>Gainers</Text>
            </View>
            <View style={styles.sentimentDivider} />
            <View style={styles.sentimentItem}>
              <MaterialIcons name="trending-down" size={16} color={Colors.error} />
              <Text style={[styles.sentimentCount, { color: Colors.error }]}>{loseCount}</Text>
              <Text style={styles.sentimentLabel}>Losers</Text>
            </View>
            <View style={styles.sentimentDivider} />
            <View style={styles.sentimentItem}>
              <MaterialIcons name="show-chart" size={16} color={Colors.primary} />
              <Text style={[styles.sentimentCount, { color: Colors.primary }]}>{totalCount}</Text>
              <Text style={styles.sentimentLabel}>Listed</Text>
            </View>
          </View>
        </Animated.View>

        {/* ─── Search ───────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.searchWrap}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search coins..."
              placeholderTextColor={Colors.textMuted}
              value={query}
              onChangeText={handleSearchChange}
            />
            {query.length > 0 && (
              <Pressable onPress={handleClearSearch}>
                <MaterialIcons name="close" size={20} color={Colors.textMuted} />
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* ─── Filter Chips ─────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(140).duration(300)}>
          <View style={styles.filterRow}>
            {FILTER_TABS.map(tab => (
              <Pressable key={tab.key} onPress={() => setFilter(tab.key)} style={styles.chipWrapper}>
                <LinearGradient
                  colors={filter === tab.key ? ['#7C3AED','#4F46E5'] : ['transparent','transparent']}
                  style={styles.chip}
                >
                  <Text style={[styles.chipText, filter === tab.key && styles.chipTextActive]}>
                    {tab.label}
                  </Text>
                </LinearGradient>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* ─── Sort Row ─────────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(180).duration(300)} style={styles.sortRow}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          {(['price','change','name'] as SortKey[]).map(s => (
            <Pressable key={s} onPress={() => setSort(s)}
              style={[styles.sortBtn, sort === s && styles.sortBtnActive]}
            >
              <Text style={[styles.sortBtnText, sort === s && styles.sortBtnTextActive]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </Pressable>
          ))}
        </Animated.View>

        {/* ─── List ─────────────────────────────────────────────────── */}
        {loading ? (
          <View style={styles.listPad}>
            <SkeletonLoader variant="price" count={8} />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={keyExtractor}
            renderItem={renderPriceItem}
            contentContainerStyle={styles.listPad}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <LinearGradient
                  colors={[Colors.surfaceElevated, Colors.surface]}
                  style={styles.emptyIconWrap}
                >
                  <MaterialIcons name="search-off" size={48} color={Colors.textMuted} />
                </LinearGradient>
                <Text style={styles.emptyTitle}>No Results</Text>
                <Text style={styles.emptyText}>
                  {query ? `Nothing matched "${query}"` : 'No coins available'}
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  title:    { ...Typography.h2, color: Colors.text, fontSize: 26 },
  subtitle: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.successGlow, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.success,
  },
  liveDot:  { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.success },
  liveText: { ...Typography.label, color: Colors.success, fontSize: 10 },

  sentimentWrap: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  sentimentCard: {
    flexDirection: 'row', backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.lg, padding: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  sentimentItem:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  sentimentCount: { ...Typography.captionBold, fontWeight: '700' },
  sentimentLabel: { ...Typography.caption, color: Colors.textMuted },
  sentimentDivider:{ width: 1, backgroundColor: Colors.border, marginVertical: 2 },

  searchWrap: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, height: 48,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: 16 },

  filterRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm, gap: Spacing.xs,
  },
  chipWrapper: { borderRadius: BorderRadius.full, overflow: 'hidden' },
  chip:        { paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border },
  chipText:    { ...Typography.captionBold, color: Colors.textMuted },
  chipTextActive:{ color: '#FFF' },

  sortRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm, gap: Spacing.xs,
  },
  sortLabel: { ...Typography.caption, color: Colors.textMuted, marginRight: 4 },
  sortBtn:   { paddingHorizontal: Spacing.sm, paddingVertical: 5, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border },
  sortBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryGlow2 },
  sortBtnText: { ...Typography.caption, color: Colors.textMuted },
  sortBtnTextActive: { color: Colors.primary, fontWeight: '600' },

  listPad: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.xs },

  empty: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyIconWrap: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border,
  },
  emptyTitle: { ...Typography.heading, color: Colors.text, marginBottom: Spacing.xs },
  emptyText:  { ...Typography.body, color: Colors.textMuted, textAlign: 'center' },
});
