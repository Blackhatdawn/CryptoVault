import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLivePrices } from '@/hooks/useLivePrices';
import { PriceCard } from '@/components/PriceCard';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

export default function MarketsScreen() {
  const prices = useLivePrices();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'change'>('price');

  const filteredPrices = Array.isArray(prices)
    ? prices
        .filter(
          (price) =>
            price.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            price.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
          if (sortBy === 'price') {
            return parseFloat(b.priceUsd) - parseFloat(a.priceUsd);
          }
          const changeA = parseFloat(a.changePercent24Hr || '0');
          const changeB = parseFloat(b.changePercent24Hr || '0');
          return Math.abs(changeB) - Math.abs(changeA);
        })
    : [];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Markets</Text>
            <Text style={styles.subtitle}>Live Cryptocurrency Prices</Text>
          </View>
          <View style={styles.connectionBadge}>
            <View style={styles.connectionDot} />
            <Text style={styles.connectionText}>Live</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <MaterialIcons
              name="search"
              size={20}
              color={Colors.textMuted}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search crypto..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={20} color={Colors.textMuted} />
              </Pressable>
            )}
          </View>

          {/* Sort Buttons */}
          <View style={styles.sortContainer}>
            <Pressable
              style={[styles.sortButton, sortBy === 'price' && styles.sortButtonActive]}
              onPress={() => setSortBy('price')}
            >
              <LinearGradient
                colors={sortBy === 'price' ? ['#8B5CF6', '#6366F1'] : ['transparent', 'transparent']}
                style={styles.sortGradient}
              >
                <MaterialIcons 
                  name="attach-money" 
                  size={16} 
                  color={sortBy === 'price' ? '#FFF' : Colors.textMuted} 
                />
                <Text style={[styles.sortText, sortBy === 'price' && styles.sortTextActive]}>
                  Price
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={[styles.sortButton, sortBy === 'change' && styles.sortButtonActive]}
              onPress={() => setSortBy('change')}
            >
              <LinearGradient
                colors={sortBy === 'change' ? ['#8B5CF6', '#6366F1'] : ['transparent', 'transparent']}
                style={styles.sortGradient}
              >
                <MaterialIcons 
                  name="trending-up" 
                  size={16} 
                  color={sortBy === 'change' ? '#FFF' : Colors.textMuted} 
                />
                <Text style={[styles.sortText, sortBy === 'change' && styles.sortTextActive]}>
                  24h
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        {/* Price List */}
        <FlatList
          data={filteredPrices}
          keyExtractor={(item) => item.symbol}
          renderItem={({ item }) => <PriceCard price={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <MaterialIcons name="search-off" size={48} color={Colors.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No Results</Text>
              <Text style={styles.emptyText}>
                {searchQuery 
                  ? `No cryptocurrencies match "${searchQuery}"`
                  : 'No cryptocurrencies available'}
              </Text>
            </View>
          }
        />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    fontSize: isSmallScreen ? 24 : 28,
    marginBottom: 2,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: isSmallScreen ? 12 : 14,
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  connectionText: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '700',
    fontSize: 11,
  },
  searchSection: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: isSmallScreen ? 44 : 48,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    fontSize: isSmallScreen ? 14 : 16,
    height: '100%',
  },
  sortContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  sortButton: {
    flex: 1,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortButtonActive: {
    borderColor: Colors.primary,
  },
  sortGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallScreen ? Spacing.xs : Spacing.sm,
    paddingHorizontal: Spacing.sm,
    gap: 4,
  },
  sortText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '600',
    fontSize: isSmallScreen ? 12 : 14,
  },
  sortTextActive: {
    color: '#FFF',
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallScreen ? Spacing.xxl : Spacing.xxxl,
  },
  emptyIcon: {
    width: isSmallScreen ? 80 : 96,
    height: isSmallScreen ? 80 : 96,
    borderRadius: isSmallScreen ? 40 : 48,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.heading,
    color: Colors.text,
    marginBottom: Spacing.xs,
    fontSize: isSmallScreen ? 16 : 18,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
    fontSize: isSmallScreen ? 14 : 16,
  },
});
