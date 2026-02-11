import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLivePrices } from '@/hooks/useLivePrices';
import { PriceCard } from '@/components/PriceCard';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

export default function MarketsScreen() {
  const { prices, isConnected } = useLivePrices();
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
            return b.price_usd - a.price_usd;
          }
          const changeA = parseFloat(price.changePercent24Hr || '0');
          const changeB = parseFloat(b.changePercent24Hr || '0');
          return Math.abs(changeB) - Math.abs(changeA);
        })
    : [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Markets</Text>
        <View style={styles.connectionBadge}>
          <View
            style={[
              styles.connectionDot,
              { backgroundColor: isConnected ? Colors.success : Colors.error },
            ]}
          />
          <Text style={styles.connectionText}>
            {isConnected ? 'Live' : 'Offline'}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons
          name="search"
          size={20}
          color={Colors.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search cryptocurrencies..."
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
          <Text
            style={[styles.sortText, sortBy === 'price' && styles.sortTextActive]}
          >
            Price
          </Text>
        </Pressable>
        <Pressable
          style={[styles.sortButton, sortBy === 'change' && styles.sortButtonActive]}
          onPress={() => setSortBy('change')}
        >
          <Text
            style={[styles.sortText, sortBy === 'change' && styles.sortTextActive]}
          >
            24h Change
          </Text>
        </Pressable>
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
            <MaterialIcons name="search-off" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No cryptocurrencies found</Text>
          </View>
        }
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  title: {
    ...Typography.title,
    color: Colors.text,
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  connectionText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    height: 48,
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  sortButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortButtonActive: {
    backgroundColor: `${Colors.primary}20`,
    borderColor: Colors.primary,
  },
  sortText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  sortTextActive: {
    color: Colors.primary,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
    marginTop: Spacing.md,
  },
});
