import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

type Card = {
  id: string;
  type: 'visa' | 'mastercard' | 'bank';
  label: string;
  last4: string;
  expiry?: string;
  isPrimary: boolean;
};

const MOCK_CARDS: Card[] = [];

export default function PaymentMethodsScreen() {
  const router    = useRouter();

  const [cards, setCards] = useState<Card[]>(MOCK_CARDS);

  const handleAdd = () => {
    Alert.alert(
      'Add Payment Method',
      'Choose the type of payment method to add.',
      [
        {
          text: 'Credit / Debit Card',
          onPress: () =>
            Alert.alert(
              'Card Integration',
              'Stripe card tokenization will be wired in the next release. Your card details are never stored on our servers.',
            ),
        },
        {
          text: 'Bank Account (ACH)',
          onPress: () =>
            Alert.alert('Bank Account', 'ACH / direct debit integration coming soon.'),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove Card', 'Are you sure you want to remove this payment method?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setCards(c => c.filter(x => x.id !== id)),
      },
    ]);
  };

  const handleSetPrimary = (id: string) => {
    setCards(c => c.map(x => ({ ...x, isPrimary: x.id === id })));
  };

  const CardIcon = ({ type }: { type: Card['type'] }) => {
    const icon = type === 'bank' ? 'account-balance' : 'credit-card';
    const color = type === 'visa' ? '#1A1F71' : type === 'mastercard' ? '#EB001B' : Colors.info;
    return (
      <View style={[styles.cardIcon, { backgroundColor: `${color}22` }]}>
        <MaterialIcons name={icon as any} size={22} color={color} />
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={[Colors.background, Colors.surface]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top']}>

        {/* Header */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.title}>Payment Methods</Text>
          <Pressable style={styles.addIconBtn} onPress={handleAdd}>
            <MaterialIcons name="add" size={24} color={Colors.primary} />
          </Pressable>
        </Animated.View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

          {cards.length === 0 ? (
            /* ─── Empty State ─── */
            <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.emptyWrap}>
              <LinearGradient colors={['#7C3AED22', 'transparent']} style={styles.emptyIconCircle}>
                <MaterialIcons name="credit-card-off" size={52} color={Colors.primary} />
              </LinearGradient>
              <Text style={styles.emptyTitle}>No Payment Methods</Text>
              <Text style={styles.emptySub}>
                Add a credit card, debit card, or bank account to fund your wallet and withdraw funds.
              </Text>

              <Pressable style={styles.addBtn} onPress={handleAdd}>
                <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.addBtnGrad}>
                  <MaterialIcons name="add" size={20} color="#FFF" />
                  <Text style={styles.addBtnText}>Add Payment Method</Text>
                </LinearGradient>
              </Pressable>

              {/* Supported methods */}
              <View style={styles.supportedWrap}>
                <Text style={styles.supportedTitle}>Accepted Methods</Text>
                <View style={styles.supportedRow}>
                  {[
                    { icon: 'credit-card', label: 'Visa', color: '#1A1F71' },
                    { icon: 'credit-card', label: 'Mastercard', color: '#EB001B' },
                    { icon: 'credit-card', label: 'Amex', color: '#2E77BC' },
                    { icon: 'account-balance', label: 'Bank', color: Colors.success },
                  ].map((m, i) => (
                    <View key={i} style={styles.supportedItem}>
                      <View style={[styles.supportedIcon, { backgroundColor: `${m.color}20` }]}>
                        <MaterialIcons name={m.icon as any} size={22} color={m.color} />
                      </View>
                      <Text style={styles.supportedLabel}>{m.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Animated.View>
          ) : (
            /* ─── Card List ─── */
            <>
              {cards.map((card, i) => (
                <Animated.View key={card.id} entering={FadeInDown.delay(60 + i * 60).springify()}>
                  <View style={[styles.cardRow, card.isPrimary && styles.cardRowPrimary]}>
                    <CardIcon type={card.type} />
                    <View style={{ flex: 1 }}>
                      <View style={styles.cardTopRow}>
                        <Text style={styles.cardLabel}>{card.label}</Text>
                        {card.isPrimary && (
                          <View style={styles.primaryBadge}>
                            <Text style={styles.primaryBadgeText}>Primary</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.cardSub}>
                        •••• •••• •••• {card.last4}
                        {card.expiry ? ` · Expires ${card.expiry}` : ''}
                      </Text>
                    </View>
                    <Pressable
                      style={styles.moreBtn}
                      onPress={() =>
                        Alert.alert(card.label, undefined, [
                          !card.isPrimary
                            ? { text: 'Set as Primary', onPress: () => handleSetPrimary(card.id) }
                            : { text: 'Already Primary', style: 'cancel' },
                          { text: 'Remove', style: 'destructive', onPress: () => handleDelete(card.id) },
                          { text: 'Cancel', style: 'cancel' },
                        ])
                      }
                    >
                      <MaterialIcons name="more-vert" size={22} color={Colors.textMuted} />
                    </Pressable>
                  </View>
                </Animated.View>
              ))}

              <Animated.View entering={FadeInDown.delay(300).springify()}>
                <Pressable style={styles.addRowBtn} onPress={handleAdd}>
                  <View style={styles.addRowIcon}>
                    <MaterialIcons name="add" size={22} color={Colors.primary} />
                  </View>
                  <Text style={styles.addRowText}>Add Another Method</Text>
                  <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
                </Pressable>
              </Animated.View>
            </>
          )}

          {/* ─── Security Note ─── */}
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.secNote}>
            <MaterialIcons name="verified-user" size={18} color={Colors.success} />
            <Text style={styles.secText}>
              All payment data is encrypted and processed securely. CryptoVault never stores raw card details.
            </Text>
          </Animated.View>

          <View style={{ height: 40 }} />
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
  backBtn:    { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  addIconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { ...Typography.heading, color: Colors.text },

  body: { padding: Spacing.lg, gap: Spacing.md },

  emptyWrap:       { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.md },
  emptyIconCircle: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  emptyTitle:      { ...Typography.h3, color: Colors.text },
  emptySub:        { ...Typography.body, color: Colors.textMuted, textAlign: 'center', maxWidth: 280, lineHeight: 22 },

  addBtn:     { borderRadius: BorderRadius.xl, overflow: 'hidden', ...Shadows.lg, marginTop: Spacing.sm },
  addBtnGrad: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, gap: Spacing.sm },
  addBtnText: { ...Typography.bodyBold, color: '#FFF', fontSize: 16 },

  supportedWrap:  { width: '100%', marginTop: Spacing.lg },
  supportedTitle: { ...Typography.label, color: Colors.textMuted, marginBottom: Spacing.md, textAlign: 'center' },
  supportedRow:   { flexDirection: 'row', justifyContent: 'center', gap: Spacing.lg },
  supportedItem:  { alignItems: 'center', gap: 6 },
  supportedIcon:  { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  supportedLabel: { ...Typography.caption, color: Colors.textMuted, fontWeight: '600' },

  cardRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  cardRowPrimary: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}08` },
  cardIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  cardTopRow:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  cardLabel:     { ...Typography.bodyBold, color: Colors.text },
  primaryBadge:  { backgroundColor: Colors.primaryGlow, borderRadius: BorderRadius.full, paddingHorizontal: 7, paddingVertical: 2 },
  primaryBadgeText: { ...Typography.micro, color: Colors.primary, fontWeight: '700' },
  cardSub:       { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  moreBtn:       { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  addRowBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  addRowIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryGlow, alignItems: 'center', justifyContent: 'center' },
  addRowText: { ...Typography.bodyBold, color: Colors.primary, flex: 1 },

  secNote: {
    flexDirection: 'row', gap: Spacing.sm,
    backgroundColor: `${Colors.success}12`,
    borderRadius: BorderRadius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: `${Colors.success}25`,
  },
  secText: { ...Typography.caption, color: Colors.textSecondary, flex: 1, lineHeight: 18 },
});
