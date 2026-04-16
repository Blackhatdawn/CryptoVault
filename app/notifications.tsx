import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

const { width } = Dimensions.get('window');
const isSmall = width < 375;

type Notification = {
  id: string;
  type: 'price_alert' | 'transaction' | 'security' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
};

const MOCK: Notification[] = [
  { id: '1', type: 'price_alert',  title: 'BTC Price Alert',       message: 'Bitcoin hit your target price of $45,000',       timestamp: new Date().toISOString(),                  read: false },
  { id: '2', type: 'transaction',  title: 'Deposit Confirmed',      message: '$500.00 has been credited to your wallet',        timestamp: new Date(Date.now()-3600000).toISOString(), read: false },
  { id: '3', type: 'security',     title: 'New Login Detected',     message: 'iOS login from a new device at 14:32 UTC',        timestamp: new Date(Date.now()-7200000).toISOString(), read: true  },
  { id: '4', type: 'transaction',  title: 'Withdrawal Approved',    message: '0.01 BTC sent to bc1q…5x3y',                     timestamp: new Date(Date.now()-86400000).toISOString(),read: true  },
  { id: '5', type: 'system',       title: 'App Updated',            message: 'CryptoVault v1.0.0 — new features available',    timestamp: new Date(Date.now()-172800000).toISOString(),read: true },
];

const TYPE_CONFIG = {
  price_alert:  { icon: 'notifications-active', gradient: ['#D97706','#F59E0B'] as [string,string], glow: Colors.warningGlow  },
  transaction:  { icon: 'account-balance-wallet',gradient: ['#059669','#10B981']as [string,string], glow: Colors.successGlow  },
  security:     { icon: 'security',             gradient: ['#DC2626','#EF4444']as [string,string],  glow: Colors.errorGlow    },
  system:       { icon: 'info',                 gradient: ['#2563EB','#3B82F6']as [string,string],  glow: Colors.infoGlow     },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notes, setNotes] = useState(MOCK);
  const unread = notes.filter(n => !n.read).length;

  const markRead = (id: string) => setNotes(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const markAll  = () => setNotes(p => p.map(n => ({ ...n, read: true })));
  const dismiss  = (id: string) => setNotes(p => p.filter(n => n.id !== id));

  const fmt = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'Just now';
    if (h < 24) return `${h}h ago`;
    if (h < 48) return 'Yesterday';
    return new Date(ts).toLocaleDateString();
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
          <View>
            <Text style={styles.title}>Notifications</Text>
            {unread > 0 && <Text style={styles.unreadCount}>{unread} unread</Text>}
          </View>
          {unread > 0 ? (
            <Pressable onPress={markAll} style={styles.markAllBtn}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </Pressable>
          ) : <View style={{ width: 80 }} />}
        </Animated.View>

        {/* Summary bar */}
        {unread > 0 && (
          <Animated.View entering={FadeInDown.delay(60).duration(300)} style={styles.summaryBar}>
            <LinearGradient colors={[Colors.primaryGlow2,'transparent']} style={styles.summaryGrad}>
              <MaterialIcons name="notifications" size={18} color={Colors.primary} />
              <Text style={styles.summaryText}>
                You have <Text style={{ color: Colors.primary, fontWeight: '700' }}>{unread}</Text> unread notifications
              </Text>
            </LinearGradient>
          </Animated.View>
        )}

        {/* List */}
        <FlatList
          data={notes}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const cfg = TYPE_CONFIG[item.type];
            return (
              <Animated.View entering={FadeInDown.delay(index * 50).duration(250)}>
                <Pressable
                  style={[styles.card, !item.read && styles.cardUnread]}
                  onPress={() => markRead(item.id)}
                >
                  {/* Unread bar */}
                  {!item.read && <View style={styles.unreadBar} />}

                  {/* Icon */}
                  <View style={[styles.iconWrap, { shadowColor: cfg.gradient[1], ...Shadows.sm }]}>
                    <LinearGradient colors={cfg.gradient} style={styles.iconGrad}>
                      <MaterialIcons name={cfg.icon as any} size={22} color="#FFF" />
                    </LinearGradient>
                  </View>

                  {/* Content */}
                  <View style={styles.content}>
                    <View style={styles.titleRow}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      {!item.read && <View style={styles.dot} />}
                    </View>
                    <Text style={styles.cardMsg} numberOfLines={2}>{item.message}</Text>
                    <View style={styles.metaRow}>
                      <MaterialIcons name="schedule" size={12} color={Colors.textMuted} />
                      <Text style={styles.metaTime}>{fmt(item.timestamp)}</Text>
                    </View>
                  </View>

                  {/* Dismiss */}
                  <Pressable style={styles.dismissBtn} onPress={() => dismiss(item.id)}>
                    <MaterialIcons name="close" size={16} color={Colors.textMuted} />
                  </Pressable>
                </Pressable>
              </Animated.View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <LinearGradient colors={['rgba(124,58,237,0.1)','rgba(79,70,229,0.04)']} style={styles.emptyIcon}>
                <MaterialIcons name="notifications-none" size={52} color={Colors.textMuted} />
              </LinearGradient>
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptyText}>No notifications at the moment</Text>
            </View>
          }
        />
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
  backBtn:       { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title:         { ...Typography.heading, color: Colors.text },
  unreadCount:   { ...Typography.caption, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  markAllBtn:    { paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: BorderRadius.sm, backgroundColor: Colors.primaryGlow2, borderWidth: 1, borderColor: Colors.borderFocus },
  markAllText:   { ...Typography.caption, color: Colors.primary, fontWeight: '700', fontSize: isSmall ? 11 : 12 },

  summaryBar:    { marginHorizontal: Spacing.lg, marginTop: Spacing.md, borderRadius: BorderRadius.md, overflow: 'hidden', borderWidth: 1, borderColor: Colors.borderFocus },
  summaryGrad:   { flexDirection: 'row', alignItems: 'center', padding: Spacing.sm, gap: Spacing.sm },
  summaryText:   { ...Typography.caption, color: Colors.textSecondary, flex: 1 },

  list: { padding: Spacing.lg, gap: Spacing.sm, paddingBottom: Spacing.xxxl },

  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
    position: 'relative', overflow: 'hidden',
  },
  cardUnread: { borderColor: Colors.borderFocus, backgroundColor: Colors.surfaceHighlight },
  unreadBar:  { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: Colors.primary, borderRadius: BorderRadius.xs },

  iconWrap: { borderRadius: BorderRadius.md, overflow: 'hidden', marginLeft: 4, marginRight: Spacing.md },
  iconGrad: { width: isSmall ? 44 : 50, height: isSmall ? 44 : 50, alignItems: 'center', justifyContent: 'center' },

  content:   { flex: 1 },
  titleRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: Spacing.xs },
  cardTitle: { ...Typography.captionBold, color: Colors.text, flex: 1 },
  dot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  cardMsg:   { ...Typography.caption, color: Colors.textSecondary, lineHeight: 18, marginBottom: 6, fontSize: isSmall ? 12 : 13 },
  metaRow:   { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaTime:  { ...Typography.micro, color: Colors.textMuted },

  dismissBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },

  empty:      { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyIcon:  { width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  emptyTitle: { ...Typography.heading, color: Colors.text, marginBottom: Spacing.xs },
  emptyText:  { ...Typography.body, color: Colors.textMuted, textAlign: 'center' },
});
