import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform,
  ActivityIndicator, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { api } from '@/services/api';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

type MonthSummary = {
  label: string;
  month: number;
  year: number;
  txCount: number;
  totalIn: number;
  totalOut: number;
};

function generateMonths(): MonthSummary[] {
  const now = new Date();
  const months: MonthSummary[] = [];
  const names = ['January','February','March','April','May','June',
                 'July','August','September','October','November','December'];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: `${names[d.getMonth()]} ${d.getFullYear()}`,
      month: d.getMonth(),
      year:  d.getFullYear(),
      txCount: 0,
      totalIn: 0,
      totalOut: 0,
    });
  }
  return months;
}

export default function StatementsScreen() {
  const router    = useRouter();
  const { width } = useWindowDimensions();
  const isSmall   = width < 375;

  const [loading, setLoading]         = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [months, setMonths]           = useState<MonthSummary[]>(generateMonths());
  const [stats, setStats]             = useState<{
    total_in: number; total_out: number; net: number; tx_count: number;
  } | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const txRes = await api.getTransactions(1, 100);
      const txs   = txRes.items ?? [];

      const totalIn  = txs.filter(t => ['deposit','transfer_received'].includes(t.type) && t.status === 'completed').reduce((s,t) => s + t.amount, 0);
      const totalOut = txs.filter(t => ['withdrawal','transfer_sent'].includes(t.type)).reduce((s,t) => s + t.amount, 0);

      setStats({ total_in: totalIn, total_out: totalOut, net: totalIn - totalOut, tx_count: txs.length });

      setMonths(prev => prev.map(m => {
        const monthTxs = txs.filter(t => {
          const d = new Date(t.created_at);
          return d.getMonth() === m.month && d.getFullYear() === m.year;
        });
        return {
          ...m,
          txCount:  monthTxs.length,
          totalIn:  monthTxs.filter(t => ['deposit','transfer_received'].includes(t.type)).reduce((s,t) => s+t.amount, 0),
          totalOut: monthTxs.filter(t => ['withdrawal','transfer_sent'].includes(t.type)).reduce((s,t) => s+t.amount, 0),
        };
      }));
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const downloadAll = async () => {
    setDownloading(true);
    try {
      const csvText = await api.exportTransactionsCsv();

      if (Platform.OS === 'web') {
        const blob = new Blob([csvText], { type: 'text/csv' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = 'cryptovault-transactions.csv';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const FileSystem = await import('expo-file-system');
        const Sharing    = await import('expo-sharing');
        const path = FileSystem.documentDirectory + 'cryptovault-transactions.csv';
        await FileSystem.default.writeAsStringAsync(path, csvText, { encoding: 'utf8' } as any);
        if (await Sharing.default.isAvailableAsync()) {
          await Sharing.default.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Export Transactions' });
        } else {
          Alert.alert('Saved', `Statement saved to ${path}`);
        }
      }
    } catch (e: any) {
      Alert.alert('Export Failed', e.message || 'Could not export transactions.');
    } finally {
      setDownloading(false);
    }
  };

  const fmt = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <View style={styles.root}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>

        {/* Header */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Statements</Text>
          <View style={{ width: 44 }} />
        </Animated.View>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

            {/* ─── Summary Card ─── */}
            <Animated.View entering={FadeInDown.delay(60).springify()}>
              <LinearGradient
                colors={['#7C3AED','#4F46E5','#2563EB']}
                style={styles.summaryCard}
              >
                <View style={[styles.deco, { width: 100, height: 100, top: -20, right: -20 }]} />
                <Text style={styles.summaryTitle}>All-Time Summary</Text>
                <View style={styles.summaryGrid}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total In</Text>
                    <Text style={styles.summaryValue}>{fmt(stats?.total_in ?? 0)}</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total Out</Text>
                    <Text style={styles.summaryValue}>{fmt(stats?.total_out ?? 0)}</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Transactions</Text>
                    <Text style={styles.summaryValue}>{stats?.tx_count ?? 0}</Text>
                  </View>
                </View>
                <View style={styles.netRow}>
                  <Text style={styles.netLabel}>Net Flow</Text>
                  <Text style={[
                    styles.netValue,
                    { color: (stats?.net ?? 0) >= 0 ? '#4ADE80' : '#F87171' },
                  ]}>
                    {(stats?.net ?? 0) >= 0 ? '+' : ''}{fmt(stats?.net ?? 0)}
                  </Text>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* ─── Export Button ─── */}
            <Animated.View entering={FadeInDown.delay(120).springify()}>
              <Pressable
                style={[styles.exportBtn, downloading && { opacity: 0.7 }]}
                onPress={downloadAll}
                disabled={downloading}
              >
                <LinearGradient colors={[Colors.primaryGlow2, 'transparent']} style={styles.exportGrad}>
                  {downloading
                    ? <ActivityIndicator size="small" color={Colors.primary} />
                    : <MaterialIcons name="download" size={22} color={Colors.primary} />
                  }
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exportTitle}>
                      {downloading ? 'Preparing Export...' : 'Export All Transactions'}
                    </Text>
                    <Text style={styles.exportSub}>Download as CSV spreadsheet</Text>
                  </View>
                  {!downloading && <MaterialIcons name="chevron-right" size={20} color={Colors.primary} />}
                </LinearGradient>
              </Pressable>
            </Animated.View>

            {/* ─── Monthly Statements ─── */}
            <Animated.View entering={FadeInDown.delay(180).springify()}>
              <Text style={styles.sectionTitle}>Monthly Statements</Text>
              <View style={styles.monthList}>
                {months.map((m, i) => (
                  <View key={i} style={[styles.monthCard, i < months.length - 1 && styles.monthCardBorder]}>
                    <View style={styles.monthIcon}>
                      <MaterialIcons name="calendar-today" size={20} color={Colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.monthLabel}>{m.label}</Text>
                      <Text style={styles.monthSub}>
                        {m.txCount} transaction{m.txCount !== 1 ? 's' : ''}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.monthIn}>+{fmt(m.totalIn)}</Text>
                      <Text style={styles.monthOut}>-{fmt(m.totalOut)}</Text>
                    </View>
                    <Pressable
                      style={styles.monthDl}
                      onPress={downloadAll}
                    >
                      <MaterialIcons name="download" size={18} color={Colors.textMuted} />
                    </Pressable>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* ─── Info Card ─── */}
            <Animated.View entering={FadeInDown.delay(280).springify()}>
              <View style={styles.infoCard}>
                <MaterialIcons name="info-outline" size={20} color={Colors.info} />
                <Text style={styles.infoText}>
                  Statements are available for the last 6 months. For older records or tax documents, contact{' '}
                  <Text style={{ color: Colors.primary }}>support@cryptovault.financial</Text>
                </Text>
              </View>
            </Animated.View>

            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { ...Typography.heading, color: Colors.text },

  body: { padding: Spacing.lg, gap: Spacing.md },

  summaryCard: {
    borderRadius: BorderRadius.xl, padding: Spacing.xl,
    overflow: 'hidden', ...Shadows.xl, marginBottom: Spacing.sm,
  },
  deco: { position: 'absolute', borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.08)' },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.85)', marginBottom: Spacing.lg },
  summaryGrid:  { flexDirection: 'row', marginBottom: Spacing.md },
  summaryItem:  { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },
  netRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)', paddingTop: Spacing.md },
  netLabel:{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  netValue:{ fontSize: 18, fontWeight: '800' },

  exportBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.primary },
  exportGrad:  { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  exportTitle: { ...Typography.bodyBold, color: Colors.primary },
  exportSub:   { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },

  sectionTitle: { ...Typography.label, color: Colors.textMuted, marginTop: Spacing.sm, marginBottom: Spacing.sm },
  monthList:    { backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  monthCard:    { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  monthCardBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  monthIcon:    { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryGlow, alignItems: 'center', justifyContent: 'center' },
  monthLabel:   { ...Typography.bodyBold, color: Colors.text, fontSize: 15 },
  monthSub:     { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  monthIn:      { ...Typography.captionBold, color: Colors.success, fontSize: 13 },
  monthOut:     { ...Typography.captionBold, color: Colors.error, fontSize: 13, marginTop: 2 },
  monthDl:      { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  infoCard: {
    flexDirection: 'row', gap: Spacing.sm,
    backgroundColor: `${Colors.info}12`,
    borderRadius: BorderRadius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: `${Colors.info}25`,
  },
  infoText: { ...Typography.caption, color: Colors.textSecondary, flex: 1, lineHeight: 18 },
});
