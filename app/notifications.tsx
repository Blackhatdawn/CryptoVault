import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

type Notification = {
  id: string;
  type: 'price_alert' | 'transaction' | 'security' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'price_alert',
    title: 'BTC Price Alert',
    message: 'Bitcoin reached your target price of $45,000',
    timestamp: new Date().toISOString(),
    read: false,
  },
  {
    id: '2',
    type: 'transaction',
    title: 'Deposit Completed',
    message: '$500.00 has been credited to your wallet',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
  },
  {
    id: '3',
    type: 'security',
    title: 'New Login Detected',
    message: 'Login from new device on iOS',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: true,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'price_alert':
        return 'notifications-active';
      case 'transaction':
        return 'account-balance-wallet';
      case 'security':
        return 'security';
      case 'system':
        return 'info';
    }
  };

  const getIconColor = (type: Notification['type']) => {
    switch (type) {
      case 'price_alert':
        return Colors.warning;
      case 'transaction':
        return Colors.success;
      case 'security':
        return Colors.error;
      case 'system':
        return Colors.info;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <Pressable onPress={markAllAsRead}>
            <Text style={styles.markAllRead}>Mark all read</Text>
          </Pressable>
        )}
        {unreadCount === 0 && <View style={styles.placeholder} />}
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.notificationItem, !item.read && styles.notificationItemUnread]}
            onPress={() => handleNotificationPress(item)}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${getIconColor(item.type)}20` }]}>
              <MaterialIcons
                name={getIcon(item.type) as any}
                size={24}
                color={getIconColor(item.type)}
              />
            </View>
            <View style={styles.content}>
              <View style={styles.titleRow}>
                <Text style={styles.notificationTitle}>{item.title}</Text>
                {!item.read && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
            </View>
          </Pressable>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="notifications-none" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No notifications</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 80,
  },
  title: {
    ...Typography.heading,
    color: Colors.text,
  },
  markAllRead: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  notificationItemUnread: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: Spacing.xs,
  },
  notificationMessage: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  timestamp: {
    ...Typography.caption,
    color: Colors.textMuted,
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
