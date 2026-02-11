import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors, BorderRadius, Typography, Spacing } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    disabled && styles.disabled,
    style,
  ];

  const labelStyle = [
    styles.text,
    styles[`text_${variant}`],
    styles[`textSize_${size}`],
    disabled && styles.textDisabled,
    textStyle,
  ];

  return (
    <Pressable
      style={({ pressed }) => [
        ...buttonStyle,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.primary : Colors.background} />
      ) : (
        <Text style={labelStyle}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
  },
  
  // Variants
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.surfaceElevated,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  danger: {
    backgroundColor: Colors.error,
  },

  // Sizes
  size_small: {
    height: 36,
    paddingHorizontal: Spacing.md,
  },
  size_medium: {
    height: 48,
    paddingHorizontal: Spacing.lg,
  },
  size_large: {
    height: 56,
    paddingHorizontal: Spacing.xl,
  },

  // States
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },

  // Text
  text: {
    fontWeight: '600',
  },
  text_primary: {
    color: Colors.background,
  },
  text_secondary: {
    color: Colors.text,
  },
  text_outline: {
    color: Colors.primary,
  },
  text_danger: {
    color: Colors.text,
  },
  textSize_small: {
    fontSize: 14,
  },
  textSize_medium: {
    fontSize: 16,
  },
  textSize_large: {
    fontSize: 18,
  },
  textDisabled: {
    color: Colors.textMuted,
  },
});
