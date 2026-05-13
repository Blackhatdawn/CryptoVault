import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

interface Props {
  children: React.ReactNode;
}

export function WebContainer({ children }: Props) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={styles.outer}>
      <View style={styles.inner}>{children}</View>
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
    maxWidth: 480,
    backgroundColor: Colors.background,
    overflow: 'hidden' as any,
  },
});
