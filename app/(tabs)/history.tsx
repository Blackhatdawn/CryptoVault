import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionItem } from "@/components/TransactionItem";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
} from "@/constants/theme";

const FILTER_TABS = [
  { key: "all", label: "All", icon: "list" },
  { key: "deposit", label: "Deposits", icon: "arrow-downward" },
  { key: "withdrawal", label: "Withdrawals", icon: "arrow-upward" },
  { key: "transfer", label: "Transfers", icon: "swap-horiz" },
];

export default function HistoryScreen() {
  const { transactions, isLoading, isRefreshing, refresh, loadMore, hasMore } =
    useTransactions();
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = transactions
    ? transactions.filter(
        (t) =>
          activeFilter === "all" ||
          t.type === activeFilter ||
          t.type.startsWith(activeFilter),
      )
    : [];

  const totalIn =
    transactions
      ?.filter((t) => t.type === "deposit")
      .reduce((s, t) => s + t.amount, 0) || 0;
  const totalOut =
    transactions
      ?.filter((t) => t.type !== "deposit")
      .reduce((s, t) => s + t.amount, 0) || 0;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        {/* ─── Header ────────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={styles.header}
        >
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>All your crypto activities</Text>
        </Animated.View>

        {/* ─── Summary Cards ────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(60).duration(300)}
          style={styles.summaryRow}
        >
          <View style={styles.summaryCard}>
            <LinearGradient
              colors={[Colors.successGlow2, "transparent"]}
              style={styles.summaryGrad}
            >
              <View style={styles.summaryIcon}>
                <MaterialIcons
                  name="arrow-downward"
                  size={18}
                  color={Colors.success}
                />
              </View>
              <Text style={styles.summaryLabel}>Total In</Text>
              <Text style={[styles.summaryValue, { color: Colors.success }]}>
                +${totalIn.toFixed(2)}
              </Text>
            </LinearGradient>
          </View>
          <View style={styles.summaryCard}>
            <LinearGradient
              colors={[Colors.errorGlow2, "transparent"]}
              style={styles.summaryGrad}
            >
              <View
                style={[
                  styles.summaryIcon,
                  { backgroundColor: Colors.errorGlow },
                ]}
              >
                <MaterialIcons
                  name="arrow-upward"
                  size={18}
                  color={Colors.error}
                />
              </View>
              <Text style={styles.summaryLabel}>Total Out</Text>
              <Text style={[styles.summaryValue, { color: Colors.error }]}>
                -${totalOut.toFixed(2)}
              </Text>
            </LinearGradient>
          </View>
          <View style={styles.summaryCard}>
            <LinearGradient
              colors={[Colors.primaryGlow2, "transparent"]}
              style={styles.summaryGrad}
            >
              <View
                style={[
                  styles.summaryIcon,
                  { backgroundColor: Colors.primaryGlow },
                ]}
              >
                <MaterialIcons
                  name="receipt-long"
                  size={18}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.summaryLabel}>Total Txns</Text>
              <Text style={[styles.summaryValue, { color: Colors.primary }]}>
                {transactions?.length || 0}
              </Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* ─── Filter Tabs ──────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
          <View style={styles.filterRow}>
            {FILTER_TABS.map((tab) => (
              <Pressable
                key={tab.key}
                onPress={() => setActiveFilter(tab.key)}
                style={styles.filterItem}
              >
                <LinearGradient
                  colors={
                    activeFilter === tab.key
                      ? ["#7C3AED", "#4F46E5"]
                      : ["transparent", "transparent"]
                  }
                  style={styles.filterGrad}
                >
                  <MaterialIcons
                    name={tab.icon as any}
                    size={15}
                    color={activeFilter === tab.key ? "#FFF" : Colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.filterText,
                      activeFilter === tab.key && styles.filterTextActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </LinearGradient>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* ─── List ─────────────────────────────────────────────────── */}
        {isLoading ? (
          <View style={styles.listPad}>
            <SkeletonLoader variant="transaction" count={6} />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <Animated.View
                entering={FadeInDown.delay(index * 40).duration(200)}
              >
                <TransactionItem transaction={item} />
              </Animated.View>
            )}
            contentContainerStyle={styles.listPad}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refresh}
                tintColor={Colors.primary}
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              hasMore ? (
                <View
                  style={{ paddingVertical: Spacing.lg, alignItems: "center" }}
                >
                  <ActivityIndicator size="small" color={Colors.primary} />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <LinearGradient
                  colors={["rgba(124,58,237,0.1)", "rgba(79,70,229,0.04)"]}
                  style={styles.emptyIconWrap}
                >
                  <MaterialIcons
                    name="receipt-long"
                    size={56}
                    color={Colors.textMuted}
                  />
                </LinearGradient>
                <Text style={styles.emptyTitle}>No Transactions</Text>
                <Text style={styles.emptyText}>
                  {activeFilter !== "all"
                    ? `No ${activeFilter} transactions yet`
                    : "Your transaction history will appear here"}
                </Text>
                <View style={styles.emptyHints}>
                  {[
                    {
                      icon: "account-balance-wallet",
                      label: "Deposit crypto to start",
                      color: Colors.success,
                    },
                    {
                      icon: "swap-horiz",
                      label: "Transfer to other users",
                      color: Colors.info,
                    },
                    {
                      icon: "show-chart",
                      label: "Trade crypto assets",
                      color: Colors.primary,
                    },
                  ].map((h, i) => (
                    <View key={i} style={styles.hintCard}>
                      <View
                        style={[
                          styles.hintIcon,
                          { backgroundColor: `${h.color}20` },
                        ]}
                      >
                        <MaterialIcons
                          name={h.icon as any}
                          size={18}
                          color={h.color}
                        />
                      </View>
                      <Text style={styles.hintText}>{h.label}</Text>
                    </View>
                  ))}
                </View>
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { ...Typography.h2, color: Colors.text, fontSize: 26 },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  summaryCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryGrad: { padding: Spacing.sm },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.successGlow,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  summaryLabel: {
    ...Typography.micro,
    color: Colors.textMuted,
    marginBottom: 3,
  },
  summaryValue: { ...Typography.captionBold, fontWeight: "700" },

  filterRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  filterItem: { borderRadius: BorderRadius.full, overflow: "hidden", flex: 1 },
  filterGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
  },
  filterText: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontSize: 10,
  },
  filterTextActive: { color: "#FFF" },

  listPad: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.xs,
  },

  empty: { alignItems: "center", paddingVertical: Spacing.xl },
  emptyIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
    maxWidth: 260,
  },
  emptyHints: { width: "100%", gap: Spacing.sm },
  hintCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hintIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  hintText: { ...Typography.caption, color: Colors.textSecondary },
});
