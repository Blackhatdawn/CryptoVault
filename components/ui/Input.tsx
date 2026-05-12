import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, leftIcon, secureTextEntry, ...props }) => {
  const [secure, setSecure] = useState(secureTextEntry ?? false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, error && styles.inputRowError]}>
        {leftIcon && (
          <MaterialIcons
            name={leftIcon as any}
            size={20}
            color={Colors.textMuted}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[styles.input, leftIcon && styles.inputWithIcon, style]}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={secure}
          {...props}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setSecure(!secure)} style={styles.eyeBtn}>
            <MaterialIcons
              name={secure ? 'visibility-off' : 'visibility'}
              size={20}
              color={Colors.textMuted}
            />
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    height: 52,
    paddingHorizontal: Spacing.md,
  },
  inputRowError: {
    borderColor: Colors.error,
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    ...Typography.body,
    flex: 1,
    color: Colors.text,
    height: '100%',
  },
  inputWithIcon: {
    // already handled by flex: 1
  },
  eyeBtn: {
    padding: 4,
    marginLeft: Spacing.xs,
  },
  error: {
    ...Typography.small,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});
