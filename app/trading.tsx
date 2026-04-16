import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn, ZoomIn } from 'react-native-reanimated';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');
const isSmall = width < 375;

type OrderType = 'market' | 'limit';
type OrderSide = 'buy' | 'sell';

const SYMBOLS = ['BTC','ETH','USDT','BNB','SOL'];
const PCT_BTNS = ['25%','50%','75%','100%'];

import { api } from '@/services/api';
import { useLocalSearchParams } from 'expo-router';

export default function TradingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { balance } = useWallet();

  const initSym  = (params.symbol as string) || 'BTC';
  const initPrice = parseFloat(params.price as string) || 43250;

  const [symbol,     setSymbol]    = useState(initSym);
  const [orderType,  setOrderType] = useState<OrderType>('market');
  const [orderSide,  setOrderSide] = useState<OrderSide>('buy');
  const [amount,     setAmount]    = useState('');
  const [limitPrice, setLimitPrice]= useState('');
  const [loading,    setLoading]   = useState(false);

  const execPrice = orderType === 'limit' ? parseFloat(limitPrice) || 0 : initPrice;
  const total     = (parseFloat(amount) || 0) * execPrice;
  const avail     = balance?.available_usd || 0;

  const handlePct = (pct: string) => {
    const p = parseInt(pct) / 100;
    if (orderSide === 'buy')  setAmount(((avail * p) / (execPrice || 1)).toFixed(6));
    else                      setAmount((avail * p).toFixed(6));
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0)                    { Alert.alert('Error','Enter a valid amount'); return; }
    if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) { Alert.alert('Error','Enter a valid limit price'); return; }

    Alert.alert(
      `Confirm ${orderSide === 'buy' ? 'Buy' : 'Sell'} Order`,
      `${orderType === 'market' ? 'Market' : 'Limit'} ${orderSide.toUpperCase()} ${amount} ${symbol}\n\nTotal: $${total.toFixed(2)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: async () => {
          setLoading(true);
          try {
            await api.createOrder({ symbol, side: orderSide, type: orderType, amount: parseFloat(amount), ...(orderType === 'limit' && { price: parseFloat(limitPrice) }) });
            Alert.alert('Order Placed!', 'Your order has been submitted.', [{ text: 'OK', onPress: () => router.back() }]);
          } catch { Alert.alert('Error','Failed to place order. Try again.'); }
          finally { setLoading(false); }
        }},
      ]
    );
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={Colors.gradientBackground as any} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>

        {/* ─── Header ──────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Trade</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ─── Symbol Picker ───────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.section}>
            <Text style={styles.label}>Select Asset</Text>
            <View style={styles.symbolRow}>
              {SYMBOLS.map((s, i) => (
                <Animated.View key={s} entering={ZoomIn.delay(80 + i * 40).springify()}>
                  <Pressable onPress={() => setSymbol(s)}>
                    <LinearGradient
                      colors={symbol === s ? ['#7C3AED','#4F46E5'] : ['transparent','transparent']}
                      style={styles.symbolChip}
                    >
                      <Text style={[styles.symbolText, symbol === s && styles.symbolTextActive]}>{s}</Text>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* ─── Price Card ───────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(120).springify()}>
            <View style={styles.priceCard}>
              <LinearGradient colors={[Colors.primaryGlow2,'transparent']} style={styles.priceGrad}>
                <View>
                  <Text style={styles.priceLabel}>Current Price</Text>
                  <Text style={styles.priceValue}>${initPrice.toLocaleString()}</Text>
                </View>
                <View style={styles.priceBadge}>
                  <MaterialIcons name="trending-up" size={14} color={Colors.success} />
                  <Text style={styles.pricePct}>+2.34%</Text>
                </View>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* ─── Buy / Sell Toggle ────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(160).springify()} style={styles.section}>
            <View style={styles.sideToggle}>
              <Pressable style={styles.sideItem} onPress={() => setOrderSide('buy')}>
                <LinearGradient
                  colors={orderSide === 'buy' ? [Colors.successDark, Colors.success] : ['transparent','transparent']}
                  style={styles.sideGrad}
                >
                  <MaterialIcons name="arrow-downward" size={18} color={orderSide === 'buy' ? '#FFF' : Colors.textMuted} />
                  <Text style={[styles.sideText, orderSide === 'buy' && styles.sideTextActive]}>Buy</Text>
                </LinearGradient>
              </Pressable>
              <Pressable style={styles.sideItem} onPress={() => setOrderSide('sell')}>
                <LinearGradient
                  colors={orderSide === 'sell' ? [Colors.errorDark, Colors.error] : ['transparent','transparent']}
                  style={styles.sideGrad}
                >
                  <MaterialIcons name="arrow-upward" size={18} color={orderSide === 'sell' ? '#FFF' : Colors.textMuted} />
                  <Text style={[styles.sideText, orderSide === 'sell' && styles.sideTextActive]}>Sell</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </Animated.View>

          {/* ─── Order Type ───────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
            <Text style={styles.label}>Order Type</Text>
            <View style={styles.typeRow}>
              {(['market','limit'] as OrderType[]).map(t => (
                <Pressable key={t} onPress={() => setOrderType(t)} style={{ flex: 1 }}>
                  <LinearGradient
                    colors={orderType === t ? ['#7C3AED','#4F46E5'] : ['transparent','transparent']}
                    style={styles.typeGrad}
                  >
                    <Text style={[styles.typeText, orderType === t && styles.typeTextActive]}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                    <Text style={[styles.typeSub, orderType === t && { color: 'rgba(255,255,255,0.75)' }]}>
                      {t === 'market' ? 'Instant execution' : 'Set your price'}
                    </Text>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* ─── Limit Price ──────────────────────────────────────────── */}
          {orderType === 'limit' && (
            <Animated.View entering={FadeInDown.duration(200)} style={styles.section}>
              <Input
                label="Limit Price (USD)"
                value={limitPrice}
                onChangeText={setLimitPrice}
                placeholder={initPrice.toString()}
                keyboardType="decimal-pad"
                leftIcon="attach-money"
              />
            </Animated.View>
          )}

          {/* ─── Amount ───────────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(240).springify()} style={styles.section}>
            <Input
              label={`Amount (${symbol})`}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00000000"
              keyboardType="decimal-pad"
              leftIcon="show-chart"
            />
            <View style={styles.pctRow}>
              {PCT_BTNS.map((p, i) => (
                <Animated.View key={p} entering={ZoomIn.delay(280 + i * 40).springify()}>
                  <Pressable onPress={() => handlePct(p)}>
                    <LinearGradient
                      colors={['rgba(124,58,237,0.15)','rgba(79,70,229,0.08)']}
                      style={styles.pctBtn}
                    >
                      <Text style={styles.pctText}>{p}</Text>
                    </LinearGradient>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* ─── Summary Card ─────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
            <View style={styles.summaryCard}>
              <LinearGradient colors={[Colors.primaryGlow2,'transparent']} style={styles.summaryGrad}>
                {[
                  { label: 'Order Type',   value: `${orderType.charAt(0).toUpperCase()}${orderType.slice(1)} ${orderSide.charAt(0).toUpperCase()}${orderSide.slice(1)}` },
                  { label: 'Asset',        value: symbol },
                  { label: 'Amount',       value: `${amount || '0'} ${symbol}` },
                  { label: 'Price',        value: `$${execPrice.toLocaleString()}` },
                  { label: 'Total',        value: `$${total.toFixed(2)}`, highlight: true },
                ].map((row, i) => (
                  <View key={i} style={[styles.summaryRow, i > 0 && styles.summaryRowBorder]}>
                    <Text style={styles.summaryLabel}>{row.label}</Text>
                    <Text style={[styles.summaryValue, row.highlight && { color: Colors.primary, fontWeight: '700' }]}>
                      {row.value}
                    </Text>
                  </View>
                ))}
              </LinearGradient>
            </View>
          </Animated.View>

          {/* ─── Available ────────────────────────────────────────────── */}
          <View style={styles.availRow}>
            <MaterialIcons name="account-balance-wallet" size={15} color={Colors.textMuted} />
            <Text style={styles.availText}>Available: <Text style={{ color: Colors.primary, fontWeight: '700' }}>${avail.toFixed(2)}</Text></Text>
          </View>

          {/* ─── Submit ───────────────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(360).springify()} style={styles.submitWrap}>
            <Button
              title={`${orderSide === 'buy' ? 'Buy' : 'Sell'} ${symbol}`}
              onPress={handleSubmit}
              loading={loading}
              disabled={!amount || parseFloat(amount) <= 0}
              variant={orderSide === 'buy' ? 'primary' : 'danger'}
            />
          </Animated.View>
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
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title:   { ...Typography.heading, color: Colors.text },

  scroll:  { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  section: { marginBottom: Spacing.md },
  label:   { ...Typography.captionBold, color: Colors.textSecondary, marginBottom: Spacing.sm },

  symbolRow: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
  symbolChip: { paddingHorizontal: Spacing.md, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border },
  symbolText: { ...Typography.captionBold, color: Colors.textMuted },
  symbolTextActive: { color: '#FFF' },

  priceCard: { borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md, ...Shadows.md },
  priceGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg },
  priceLabel: { ...Typography.caption, color: Colors.textSecondary, marginBottom: 4 },
  priceValue: { fontSize: isSmall ? 26 : 32, fontWeight: '800', color: Colors.text, letterSpacing: -0.8 },
  priceBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.successGlow, paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.full },
  pricePct:   { ...Typography.captionBold, color: Colors.success },

  sideToggle: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: 3, borderWidth: 1, borderColor: Colors.border },
  sideItem:   { flex: 1, borderRadius: BorderRadius.sm, overflow: 'hidden' },
  sideGrad:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: isSmall ? 10 : Spacing.md, gap: 6 },
  sideText:   { ...Typography.bodyBold, color: Colors.textMuted },
  sideTextActive: { color: '#FFF' },

  typeRow: { flexDirection: 'row', gap: Spacing.sm },
  typeGrad: { padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  typeText: { ...Typography.captionBold, color: Colors.textMuted, marginBottom: 3 },
  typeTextActive: { color: '#FFF' },
  typeSub:  { ...Typography.micro, color: Colors.textDisabled },

  pctRow: { flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.sm },
  pctBtn: { paddingHorizontal: Spacing.md, paddingVertical: 7, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border },
  pctText: { ...Typography.captionBold, color: Colors.primary },

  summaryCard: { borderRadius: BorderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  summaryGrad: { padding: Spacing.md },
  summaryRow:  { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm },
  summaryRowBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  summaryLabel: { ...Typography.caption, color: Colors.textSecondary },
  summaryValue: { ...Typography.caption, color: Colors.text, fontWeight: '600' },

  availRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: Spacing.md },
  availText: { ...Typography.caption, color: Colors.textMuted },
  submitWrap: { marginTop: Spacing.xs },
});
