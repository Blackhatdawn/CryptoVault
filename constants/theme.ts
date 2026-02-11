// CryptoVault Design System

export const Colors = {
  // Base
  background: '#0a0a0a',
  surface: '#121212',
  surfaceElevated: '#1a1a1a',
  
  // Brand
  primary: '#FFD700', // Gold
  primaryDark: '#FFC700',
  
  // Text
  text: '#FFFFFF',
  textSecondary: '#999999',
  textMuted: '#666666',
  
  // Semantic
  success: '#10B981',
  successBg: '#10B98120',
  error: '#EF4444',
  errorBg: '#EF444420',
  warning: '#F59E0B',
  warningBg: '#F59E0B20',
  info: '#3B82F6',
  infoBg: '#3B82F620',
  
  // Market
  bullish: '#10B981',
  bearish: '#EF4444',
  
  // Borders
  border: '#1a1a1a',
  borderLight: '#333333',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.8)',
  
  // Chart colors
  chartGreen: '#10B981',
  chartRed: '#EF4444',
  chartBlue: '#3B82F6',
  chartPurple: '#8B5CF6',
  chartOrange: '#F59E0B',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Typography = {
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 6.27,
    elevation: 6,
  },
};
