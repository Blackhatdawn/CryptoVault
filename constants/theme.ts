// CryptoVault Modern Theme - Premium Crypto UI Design

export const Colors = {
  // Rich Dark Backgrounds (Less harsh black)
  background: '#0D0D1F', // Deep navy instead of pure black
  surface: '#1A1A2E', // Rich dark blue
  surfaceElevated: '#242440', // Elevated surface
  surfaceHighlight: '#2D2D4A', // Highlighted surface
  
  // Gradients
  gradientPrimary: ['#8B5CF6', '#6366F1'], // Purple to Indigo
  gradientSecondary: ['#F59E0B', '#FBBF24'], // Amber gold
  gradientSuccess: ['#10B981', '#34D399'], // Emerald green
  gradientError: ['#EF4444', '#F87171'], // Red
  gradientBackground: ['#0D0D1F', '#1A1A2E', '#0D0D1F'], // Background gradient
  
  // Primary Colors (Vibrant purple/indigo)
  primary: '#8B5CF6', // Vibrant purple
  primaryDark: '#7C3AED',
  primaryLight: '#A78BFA',
  primaryGlow: 'rgba(139, 92, 246, 0.3)', // Glow effect
  
  // Accent Colors
  accent: '#F59E0B', // Golden amber
  accentDark: '#D97706',
  accentLight: '#FBBF24',
  
  // Semantic Colors
  success: '#10B981',
  successLight: '#34D399',
  successGlow: 'rgba(16, 185, 129, 0.2)',
  
  error: '#EF4444',
  errorLight: '#F87171',
  errorGlow: 'rgba(239, 68, 68, 0.2)',
  
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  warningGlow: 'rgba(245, 158, 11, 0.2)',
  
  info: '#3B82F6',
  infoLight: '#60A5FA',
  infoGlow: 'rgba(59, 130, 246, 0.2)',
  
  // Text Colors
  text: '#FFFFFF',
  textSecondary: '#A1A1AA', // Zinc 400
  textMuted: '#71717A', // Zinc 500
  textDisabled: '#52525B', // Zinc 600
  
  // UI Elements
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
  borderFocus: 'rgba(139, 92, 246, 0.5)',
  
  // Glassmorphism
  glass: 'rgba(26, 26, 46, 0.7)', // Frosted glass effect
  glassLight: 'rgba(36, 36, 64, 0.5)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  
  // Overlays
  overlay: 'rgba(13, 13, 31, 0.8)',
  overlayDark: 'rgba(0, 0, 0, 0.6)',
  
  // Utility
  warningBg: 'rgba(245, 158, 11, 0.1)',
  infoBg: 'rgba(59, 130, 246, 0.1)',
  successBg: 'rgba(16, 185, 129, 0.1)',
  errorBg: 'rgba(239, 68, 68, 0.1)',
};

export const Gradients = {
  primary: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
  secondary: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
  success: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  error: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
  background: 'linear-gradient(180deg, #0D0D1F 0%, #1A1A2E 50%, #0D0D1F 100%)',
  card: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
  shine: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)',
};

export const Typography = {
  // Hero/Display
  hero: {
    fontSize: 40,
    fontWeight: '800' as const,
    lineHeight: 48,
    letterSpacing: -1,
  },
  
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  
  // Title (Smaller headings)
  title: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  
  // Body
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  
  // Small
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  captionBold: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  
  // Tiny
  label: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  micro: {
    fontSize: 10,
    fontWeight: '500' as const,
    lineHeight: 14,
  },
};

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const Shadows = {
  // Soft shadows for depth
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  
  // Colored glows
  primaryGlow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  successGlow: {
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  errorGlow: {
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const Animation = {
  quick: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
};

// Export a helper for glassmorphism effect
export const glassStyle = {
  backgroundColor: Colors.glass,
  borderWidth: 1,
  borderColor: Colors.glassBorder,
  backdropFilter: 'blur(10px)', // Web only
};
