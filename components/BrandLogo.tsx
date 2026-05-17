import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

interface BrandLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  variant?: 'icon' | 'full';
}

const SIZES = {
  small: { logoSize: 48, fontSize: 16 },
  medium: { logoSize: 80, fontSize: 24 },
  large: { logoSize: 120, fontSize: 32 },
};

export function BrandLogo({ size = 'medium', showText = false, variant = 'icon' }: BrandLogoProps) {
  const { logoSize, fontSize } = SIZES[size];

  return (
    <View style={[styles.container, { width: logoSize, height: logoSize }]}>
      <Image
        source={require('@/assets/images/logo.webp')}
        style={{ width: logoSize, height: logoSize, resizeMode: 'contain' }}
        accessibilityLabel="CryptoVault Logo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
