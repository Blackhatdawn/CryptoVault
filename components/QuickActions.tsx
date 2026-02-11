import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

type QuickAction = {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  route: string;
  color: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'deposit',
    icon: 'add',
    label: 'Deposit',
    route: '/deposit',
    color: Colors.success,
  },
  {
    id: 'withdraw',
    icon: 'remove',
    label: 'Withdraw',
    route: '/withdraw',
    color: Colors.error,
  },
  {
    id: 'transfer',
    icon: 'swap-horiz',
    label: 'Transfer',
    route: '/transfer',
    color: Colors.primary,
  },
  {
    id: 'alert',
    icon: 'notifications',
    label: 'Alert',
    route: '/price-alert',
    color: Colors.warning,
  },
];

export const QuickActions: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {QUICK_ACTIONS.map((action) => (
        <Pressable
          key={action.id}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed,
          ]}
          onPress={() => router.push(action.route as any)}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${action.color}20` }]}>
            <MaterialIcons name={action.icon} size={24} color={action.color} />
          </View>
          <Text style={styles.actionLabel}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginVertical: Spacing.lg,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 80,
  },
  actionButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    ...Shadows.sm,
  },
  actionLabel: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
  },
});
