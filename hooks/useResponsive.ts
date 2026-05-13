import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isXSmall = width < 360;
  const isSmall  = width < 375;
  const isMedium = width >= 375 && width < 414;
  const isLarge  = width >= 414;

  const scale = (base: number, factor = 0.8) =>
    isXSmall ? Math.round(base * factor) : isSmall ? Math.round(base * 0.9) : base;

  const iconSize = (max: number) => Math.min(max, Math.round(width * 0.45));

  const hp = (pct: number) => Math.round(height * (pct / 100));
  const wp = (pct: number) => Math.round(width  * (pct / 100));

  return { width, height, isXSmall, isSmall, isMedium, isLarge, scale, iconSize, hp, wp };
}
