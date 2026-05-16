// CryptoVault Enterprise Theme — Premium Dark Crypto Design System

// ─── Brand Identity ───────────────────────────────────────────────────────────
export const Brand = {
  name: 'CryptoVault',
  tagline: 'Enterprise Digital Wallet',
  copyright: '2026 CryptoVault Inc.',
  colors: {
    gold: '#F59E0B',
    goldLight: '#FBBF24',
    goldDark: '#D97706',
    charcoal: '#1F2937',
    charcoalDark: '#111827',
    navy: '#08091A',
  },
};

export const Colors = {
  // ─── Backgrounds ────────────────────────────────────────────────────────────
  background:        '#08091A',   // Deepest navy-black
  surface:           '#0F1128',   // Layer 1
  surfaceElevated:   '#181B35',   // Layer 2 — cards
  surfaceHighlight:  '#1F2347',   // Layer 3 — active/hover
  surfaceOverlay:    '#252952',   // Layer 4 — modal/sheet

  // ─── Gradients ──────────────────────────────────────────────────────────────
  gradientPrimary:    ['#7C3AED', '#4F46E5'],
  gradientGold:       ['#F59E0B', '#EF4444'],
  gradientSuccess:    ['#059669', '#10B981'],
  gradientError:      ['#DC2626', '#EF4444'],
  gradientInfo:       ['#2563EB', '#3B82F6'],
  gradientBackground: ['#08091A', '#0F1128', '#08091A'],
  gradientCard:       ['rgba(124,58,237,0.08)', 'rgba(79,70,229,0.03)'],
  gradientHero:       ['#7C3AED', '#4F46E5', '#2563EB'],

  // ─── Brand ──────────────────────────────────────────────────────────────────
  primary:      '#7C3AED',
  primaryMid:   '#6D28D9',
  primaryDark:  '#5B21B6',
  primaryLight: '#A78BFA',
  primaryGlow:  'rgba(124,58,237,0.25)',
  primaryGlow2: 'rgba(124,58,237,0.12)',

  accent:      '#F59E0B',
  accentDark:  '#D97706',
  accentLight: '#FCD34D',
  accentGlow:  'rgba(245,158,11,0.2)',

  // ─── Semantic ───────────────────────────────────────────────────────────────
  success:      '#10B981',
  successDark:  '#059669',
  successLight: '#34D399',
  successGlow:  'rgba(16,185,129,0.18)',
  successGlow2: 'rgba(16,185,129,0.08)',

  error:      '#EF4444',
  errorDark:  '#DC2626',
  errorLight: '#F87171',
  errorGlow:  'rgba(239,68,68,0.18)',
  errorGlow2: 'rgba(239,68,68,0.08)',

  warning:      '#F59E0B',
  warningDark:  '#D97706',
  warningLight: '#FCD34D',
  warningGlow:  'rgba(245,158,11,0.18)',
  warningGlow2: 'rgba(245,158,11,0.08)',

  info:      '#3B82F6',
  infoDark:  '#2563EB',
  infoLight: '#60A5FA',
  infoGlow:  'rgba(59,130,246,0.18)',
  infoGlow2: 'rgba(59,130,246,0.08)',

  // ─── Text ───────────────────────────────────────────────────────────────────
  text:         '#F1F5F9',   // Near-white
  textSecondary:'#94A3B8',   // Slate 400
  textMuted:    '#64748B',   // Slate 500
  textDisabled: '#475569',   // Slate 600
  textInverse:  '#08091A',

  // ─── Borders ────────────────────────────────────────────────────────────────
  border:       'rgba(255,255,255,0.07)',
  borderLight:  'rgba(255,255,255,0.04)',
  borderMedium: 'rgba(255,255,255,0.11)',
  borderFocus:  'rgba(124,58,237,0.55)',
  borderAccent: 'rgba(245,158,11,0.4)',

  // ─── Glass / Frosted ────────────────────────────────────────────────────────
  glass:        'rgba(15,17,40,0.75)',
  glassLight:   'rgba(24,27,53,0.6)',
  glassBorder:  'rgba(255,255,255,0.08)',

  // ─── Overlays ───────────────────────────────────────────────────────────────
  overlay:     'rgba(8,9,26,0.82)',
  overlayDark: 'rgba(0,0,0,0.65)',

  // ─── Convenience BG aliases ─────────────────────────────────────────────────
  warningBg: 'rgba(245,158,11,0.1)',
  infoBg:    'rgba(59,130,246,0.1)',
  successBg: 'rgba(16,185,129,0.1)',
  errorBg:   'rgba(239,68,68,0.1)',
};

export const Typography = {
  // Display
  display: { fontSize: 48, fontWeight: '800' as const, lineHeight: 56, letterSpacing: -1.5 },
  hero:    { fontSize: 40, fontWeight: '800' as const, lineHeight: 48, letterSpacing: -1 },

  // Headings
  h1: { fontSize: 34, fontWeight: '700' as const, lineHeight: 42, letterSpacing: -0.5 },
  h2: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36, letterSpacing: -0.3 },
  h3: { fontSize: 22, fontWeight: '600' as const, lineHeight: 30 },
  h4: { fontSize: 18, fontWeight: '600' as const, lineHeight: 26 },

  // Functional
  title:    { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  heading:  { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  subheading:{ fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },

  // Body
  body:     { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyBold: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },

  // Small
  caption:     { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  captionBold: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },

  // Micro
  label: { fontSize: 11, fontWeight: '600' as const, lineHeight: 16, letterSpacing: 0.8, textTransform: 'uppercase' as const },
  micro: { fontSize: 10, fontWeight: '500' as const, lineHeight: 14 },

  // Numeric / Mono
  mono: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20, fontFamily: 'monospace' as const },
  monoLg: { fontSize: 24, fontWeight: '700' as const, lineHeight: 30, fontFamily: 'monospace' as const },

  small: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
};

export const Spacing = {
  xxs: 2,
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
  xxxl:64,
};

export const BorderRadius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  xxxl: 40,
  full: 9999,
};

export const Shadows = {
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 20,
    elevation: 10,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.30,
    shadowRadius: 30,
    elevation: 16,
  },
  // Colored glows
  primaryGlow: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  successGlow: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  errorGlow: {
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  goldGlow: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
};

export const Animation = {
  instant: 100,
  quick:   200,
  normal:  300,
  slow:    500,
  verySlow:800,
};

// Crypto icon map (symbol → gradient colors)
export const CryptoGradients: Record<string, string[]> = {
  BTC:  ['#F7931A', '#FFB347'],
  ETH:  ['#627EEA', '#A78BFA'],
  USDT: ['#26A17B', '#34D399'],
  USDC: ['#2775CA', '#60A5FA'],
  BNB:  ['#F3BA2F', '#F59E0B'],
  SOL:  ['#9945FF', '#14F195'],
  ADA:  ['#0033AD', '#3B82F6'],
  XRP:  ['#00BFFF', '#60A5FA'],
  DOT:  ['#E6007A', '#F87171'],
  DOGE: ['#C2A633', '#FBBF24'],
};

export const glassStyle = {
  backgroundColor: Colors.glass,
  borderWidth: 1,
  borderColor: Colors.glassBorder,
};
