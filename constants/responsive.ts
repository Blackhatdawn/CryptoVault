/**
 * Responsive Design System for CryptoVault
 * Mobile-first breakpoints and responsive utilities
 */

export const BREAKPOINTS = {
  xSmall: 340,   // iPhone SE, Galaxy S10e
  small: 375,    // iPhone 12 mini
  medium: 414,   // iPhone 12/13
  large: 600,    // iPhone 12 Pro Max, Galaxy S21
  tablet: 1000,  // iPad mini, small tablets
  web: 1200,     // iPad Pro, desktop
} as const;

/**
 * Responsive spacing scale based on screen width
 * Ensures proper padding/margin on all devices
 */
export const getResponsiveSpacing = (width: number) => {
  if (width < BREAKPOINTS.xSmall) return 8;
  if (width < BREAKPOINTS.small) return 12;
  if (width < BREAKPOINTS.medium) return 14;
  if (width < BREAKPOINTS.large) return 16;
  if (width < BREAKPOINTS.tablet) return 20;
  return 24;
};

/**
 * Responsive font scale
 * Ensures readability on small and large screens
 */
export const getResponsiveFontSize = (baseSize: number, width: number) => {
  if (width < BREAKPOINTS.small) return Math.round(baseSize * 0.9);
  if (width < BREAKPOINTS.medium) return baseSize;
  if (width < BREAKPOINTS.large) return baseSize;
  if (width < BREAKPOINTS.tablet) return Math.round(baseSize * 1.05);
  return Math.round(baseSize * 1.1);
};

/**
 * Responsive component sizing
 * Use for cards, buttons, input fields that scale with screen
 */
export const getResponsiveSize = (baseSize: number, width: number) => {
  if (width < BREAKPOINTS.xSmall) return Math.round(baseSize * 0.8);
  if (width < BREAKPOINTS.small) return Math.round(baseSize * 0.9);
  if (width < BREAKPOINTS.medium) return baseSize;
  if (width < BREAKPOINTS.large) return Math.round(baseSize * 1.05);
  if (width < BREAKPOINTS.tablet) return Math.round(baseSize * 1.15);
  return Math.round(baseSize * 1.25);
};

/**
 * Safe area padding for notched devices
 * Use in contexts where safe area provider isn't available
 */
export const SAFE_PADDING = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

/**
 * Column layout helpers for grid/list items
 */
export const getColumnCount = (width: number) => {
  if (width < BREAKPOINTS.small) return 1;
  if (width < BREAKPOINTS.large) return 2;
  if (width < BREAKPOINTS.tablet) return 2;
  if (width < BREAKPOINTS.web) return 3;
  return 4;
};

/**
 * Responsive item sizing for grids
 * Calculates item width accounting for gaps
 */
export const getItemWidth = (width: number, columns: number = 2, gap: number = 16) => {
  const totalGapWidth = gap * (columns - 1);
  const horizontalPadding = getResponsiveSpacing(width) * 2;
  const availableWidth = width - horizontalPadding - totalGapWidth;
  return Math.round(availableWidth / columns);
};

/**
 * Modal/dialog sizing based on screen width
 * Ensures modals are readable but not too large
 */
export const getModalWidth = (width: number) => {
  if (width < BREAKPOINTS.small) return Math.round(width * 0.95);
  if (width < BREAKPOINTS.large) return Math.round(width * 0.9);
  if (width < BREAKPOINTS.tablet) return Math.round(width * 0.85);
  if (width < BREAKPOINTS.web) return Math.round(width * 0.6);
  return 500;
};

/**
 * Image aspect ratio helpers
 */
export const ASPECT_RATIOS = {
  square: 1,
  portrait: 0.75,
  landscape: 1.33,
  wide: 1.78,
  ultrawide: 2.39,
} as const;

/**
 * Typography scale - responsive font sizes
 */
export const RESPONSIVE_TYPOGRAPHY = {
  // Display sizes - for major headings
  display: (width: number) => getResponsiveFontSize(32, width),
  h1: (width: number) => getResponsiveFontSize(28, width),
  h2: (width: number) => getResponsiveFontSize(24, width),
  h3: (width: number) => getResponsiveFontSize(20, width),
  h4: (width: number) => getResponsiveFontSize(18, width),
  
  // Body text
  body: (width: number) => getResponsiveFontSize(16, width),
  bodySmall: (width: number) => getResponsiveFontSize(14, width),
  caption: (width: number) => getResponsiveFontSize(12, width),
  captionSmall: (width: number) => getResponsiveFontSize(11, width),
} as const;

/**
 * Responsive touch target sizing
 * Ensures buttons/controls are easy to tap on all devices
 * WCAG recommendation: 44x44px minimum
 */
export const getTouchTargetSize = (width: number) => {
  if (width < BREAKPOINTS.small) return 44; // Minimum for accessibility
  if (width < BREAKPOINTS.large) return 48;
  return 56; // Larger on tablets/desktop for easier interaction
};

/**
 * Container max-width constraints
 * Prevents content from becoming too wide on large screens
 */
export const getContainerMaxWidth = (width: number) => {
  if (width < BREAKPOINTS.tablet) return width;
  if (width < BREAKPOINTS.web) return 600;
  return 800;
};

export default {
  BREAKPOINTS,
  SAFE_PADDING,
  getResponsiveSpacing,
  getResponsiveFontSize,
  getResponsiveSize,
  getColumnCount,
  getItemWidth,
  getModalWidth,
  getTouchTargetSize,
  getContainerMaxWidth,
  ASPECT_RATIOS,
  RESPONSIVE_TYPOGRAPHY,
} as const;
