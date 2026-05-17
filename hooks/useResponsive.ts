import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  // Breakpoints for mobile-first responsive design
  const isXSmall = width < 340;    // Very small phones (iPhone SE, etc.)
  const isSmall  = width < 375;    // Small phones (iPhone 12 mini, etc.)
  const isMedium = width >= 375 && width < 414;  // Medium phones (iPhone 12/13)
  const isLarge  = width >= 414 && width < 600;  // Large phones (iPhone 12 Pro Max, etc.)
  const isTablet = width >= 600 && width < 1000; // Tablets (iPad mini)
  const isWeb    = width >= 1000;  // Desktop web/large tablets (iPad Pro)

  // Responsive scale function with proper scaling for all sizes
  const scale = (base: number, factor = 0.8) => {
    if (isXSmall) return Math.round(base * factor);
    if (isSmall)  return Math.round(base * 0.9);
    if (isMedium) return base;
    if (isLarge)  return Math.round(base * 1.05);
    if (isTablet) return Math.round(base * 1.2);
    return Math.round(base * 1.3);
  };

  // Dynamic icon sizing with aspect ratio preservation
  const iconSize = (max: number) => Math.min(max, Math.round(width * 0.45));

  // Percentage-based sizing helpers
  const hp = (pct: number) => Math.round(height * (pct / 100));
  const wp = (pct: number) => Math.round(width  * (pct / 100));

  // Safe padding that accounts for notches and safe areas
  const safePadding = {
    horizontal: isXSmall ? 12 : isSmall ? 16 : isTablet ? 32 : 40,
    vertical: isXSmall ? 8 : isSmall ? 12 : isTablet ? 20 : 24,
  };

  return {
    // Dimensions
    width,
    height,

    // Screen size flags
    isXSmall,
    isSmall,
    isMedium,
    isLarge,
    isTablet,
    isWeb,

    // Scaling functions
    scale,
    iconSize,
    hp,
    wp,
    safePadding,
  };
}
