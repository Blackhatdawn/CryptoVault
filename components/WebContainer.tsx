import React from 'react';
import { View, Platform, StyleSheet, useWindowDimensions } from 'react-native';
import { Colors } from '@/constants/theme';

interface Props {
  children: React.ReactNode;
}

export function WebContainer({ children }: Props) {
  const { width } = useWindowDimensions();

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  // Responsive max-width: mobile-first scaling
  const getMaxWidth = () => {
    if (width < 375) return '95%';
    if (width < 480) return '100%';
    if (width < 600) return 480;
    if (width < 1024) return Math.min(width - 40, 600);
    return 720; // Desktop: centered column
  };

  return (
    <View style={[styles.outer, { justifyContent: width >= 1000 ? 'center' : 'flex-start' }]}>
      <View style={[
        styles.inner,
        {
          maxWidth: getMaxWidth() as any,
          width: width < 480 ? '100%' : undefined,
        },
      ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    width: '100%' as any,
    backgroundColor: Colors.background,
    overflow: 'hidden' as any,
  },
});
