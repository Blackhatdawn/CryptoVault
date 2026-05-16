import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const GRADIENTS = {
  primary:   ['#7C3AED','#4F46E5'] as const,
  danger:    ['#DC2626','#EF4444'] as const,
  secondary: ['rgba(124,58,237,0.15)','rgba(79,70,229,0.08)'] as const,
};

export const Button: React.FC<ButtonProps> = ({
  title, onPress, variant = 'primary', size = 'medium',
  loading = false, disabled = false, style, textStyle, icon,
}) => {
  const isDisabled = disabled || loading;

  const heights    = { small: 40, medium: 52, large: 60 };
  const fontSizes  = { small: 13, medium: 16, large: 18 };
  const paddings   = { small: Spacing.md, medium: Spacing.lg, large: Spacing.xl };

  const h  = heights[size];
  const fs = fontSizes[size];
  const px = paddings[size];

  const baseStyle: ViewStyle[] = [
    styles.base,
    { height: h, paddingHorizontal: px, borderRadius: BorderRadius.md } as ViewStyle,
    style as ViewStyle,
  ];

  const labelStyle = [styles.text, { fontSize: fs }, textStyle];

  const content = (
    <View style={styles.row}>
      {loading
        ? <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? Colors.primary : '#FFF'} size="small" />
        : <>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text style={labelStyle}>{title}</Text>
          </>
      }
    </View>
  );

  // Gradient variants
  if (variant === 'primary' || variant === 'danger') {
    return (
      <Pressable
        onPress={onPress} disabled={isDisabled}
        style={({ pressed }) => [
          ...baseStyle, styles.overflow,
          pressed && !isDisabled && styles.pressed,
          isDisabled && styles.disabled,
        ]}
      >
        <LinearGradient
          colors={GRADIENTS[variant] as any}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.fill}
        >
          {content}
        </LinearGradient>
        {/* Subtle shine */}
        <View style={styles.shine} />
      </Pressable>
    );
  }

  if (variant === 'secondary') {
    return (
      <Pressable
        onPress={onPress} disabled={isDisabled}
        style={({ pressed }) => [
          ...baseStyle, styles.overflow,
          { borderWidth: 1, borderColor: Colors.borderFocus },
          pressed && !isDisabled && styles.pressed,
          isDisabled && styles.disabled,
        ]}
      >
        <LinearGradient colors={GRADIENTS.secondary as any} style={styles.fill}>
          <Text style={[...labelStyle, { color: Colors.primary }]}>{loading ? '' : title}</Text>
          {loading && <ActivityIndicator color={Colors.primary} size="small" />}
        </LinearGradient>
      </Pressable>
    );
  }

  if (variant === 'outline') {
    return (
      <Pressable
        onPress={onPress} disabled={isDisabled}
        style={({ pressed }) => [
          ...baseStyle, styles.outline,
          pressed && !isDisabled && styles.pressed,
          isDisabled && styles.disabled,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  // Ghost
  return (
    <Pressable
      onPress={onPress} disabled={isDisabled}
      style={({ pressed }) => [
        ...baseStyle,
        pressed && !isDisabled && { opacity: 0.7 },
        isDisabled && styles.disabled,
      ]}
    >
      <Text style={[...labelStyle, { color: Colors.primary }]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base:     { justifyContent: 'center', alignItems: 'center' },
  overflow: { overflow: 'hidden' },
  fill:     { ...StyleSheet.absoluteFillObject as any, alignItems: 'center', justifyContent: 'center' },
  shine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: BorderRadius.md,
  },
  outline:  { backgroundColor: 'transparent', borderWidth: 2, borderColor: Colors.primary },
  pressed:  { opacity: 0.82, transform: [{ scale: 0.978 }] },
  disabled: { opacity: 0.45 },
  text:     { fontWeight: '700', color: '#FFF', letterSpacing: 0.2 },
  row:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  icon:     { alignItems: 'center', justifyContent: 'center' },
});
