import React from 'react';
import { View, Image, ViewStyle, useWindowDimensions, ImageSourcePropType } from 'react-native';
import { BREAKPOINTS, getResponsiveSpacing, getColumnCount } from '@/constants/responsive';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: number | 'auto';
  gap?: number;
  style?: ViewStyle;
}

/**
 * Responsive grid component that automatically adjusts columns
 * based on screen width. Perfect for price cards, transaction lists, etc.
 */
export function ResponsiveGrid({
  children,
  columns = 'auto',
  gap = 16,
  style,
}: ResponsiveGridProps) {
  const { width } = useWindowDimensions();
  const autoColumns = getColumnCount(width);
  const numColumns = columns === 'auto' ? autoColumns : columns;
  const padding = getResponsiveSpacing(width);

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap,
          paddingHorizontal: padding,
        },
        style,
      ]}
    >
      {React.Children.map(children, (child) => (
        <View
          style={{
            flex: 1,
            minWidth: Math.round((width - padding * 2 - gap * (numColumns - 1)) / numColumns),
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

interface ResponsiveStackProps {
  children: React.ReactNode;
  direction?: 'row' | 'column' | 'auto';
  gap?: number;
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
  style?: ViewStyle;
}

/**
 * Responsive stack that switches direction based on screen size
 * Perfect for hero sections and cards that reflow on smaller screens
 */
export function ResponsiveStack({
  children,
  direction = 'auto',
  gap = 16,
  justify = 'flex-start',
  align = 'stretch',
  style,
}: ResponsiveStackProps) {
  const { width } = useWindowDimensions();

  // Auto direction: row on large screens, column on small
  const actualDirection = direction === 'auto'
    ? width < BREAKPOINTS.tablet ? 'column' : 'row'
    : direction;

  const padding = getResponsiveSpacing(width);

  return (
    <View
      style={[
        {
          flexDirection: actualDirection,
          gap,
          justifyContent: justify,
          alignItems: align,
          paddingHorizontal: padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
  centered?: boolean;
  style?: ViewStyle;
}

/**
 * Responsive container that constrains max width on large screens
 * and centers content on desktop
 */
export function ResponsiveContainer({
  children,
  maxWidth = 1200,
  centered = true,
  style,
}: ResponsiveContainerProps) {
  const { width } = useWindowDimensions();
  const padding = getResponsiveSpacing(width);

  return (
    <View
      style={[
        {
          paddingHorizontal: padding,
          alignSelf: centered && width >= BREAKPOINTS.tablet ? 'center' : 'stretch',
          maxWidth: maxWidth,
          width: '100%',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface ResponsiveImageProps {
  width: number;
  height: number;
  source: ImageSourcePropType;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

/**
 * Responsive image that scales proportionally
 * Use for hero images, icons, etc.
 */
export function ResponsiveImage({
  width,
  height,
  source,
  resizeMode = 'cover',
}: ResponsiveImageProps) {
  const { width: screenWidth } = useWindowDimensions();
  const maxWidth = Math.min(screenWidth - 32, 800);
  const aspectRatio = width / height;
  const displayHeight = Math.round(maxWidth / aspectRatio);

  return (
    <Image
      source={source}
      style={{
        width: maxWidth,
        height: displayHeight,
      }}
      resizeMode={resizeMode}
    />
  );
}

interface HideOnProps {
  children: React.ReactNode;
  xSmall?: boolean;
  small?: boolean;
  medium?: boolean;
  large?: boolean;
  tablet?: boolean;
  web?: boolean;
}

/**
 * Conditional rendering helper - hide content on specific screen sizes
 * Useful for adaptive layouts that hide secondary info on mobile
 */
export function HideOn({
  children,
  xSmall = false,
  small = false,
  medium = false,
  large = false,
  tablet = false,
  web = false,
}: HideOnProps) {
  const { width } = useWindowDimensions();

  let shouldHide = false;
  if (width < BREAKPOINTS.xSmall && xSmall) shouldHide = true;
  if (width >= BREAKPOINTS.xSmall && width < BREAKPOINTS.small && small) shouldHide = true;
  if (width >= BREAKPOINTS.small && width < BREAKPOINTS.medium && medium) shouldHide = true;
  if (width >= BREAKPOINTS.medium && width < BREAKPOINTS.large && large) shouldHide = true;
  if (width >= BREAKPOINTS.large && width < BREAKPOINTS.tablet && tablet) shouldHide = true;
  if (width >= BREAKPOINTS.tablet && web) shouldHide = true;

  return shouldHide ? null : <>{children}</>;
}

interface ShowOnProps {
  children: React.ReactNode;
  xSmall?: boolean;
  small?: boolean;
  medium?: boolean;
  large?: boolean;
  tablet?: boolean;
  web?: boolean;
}

/**
 * Conditional rendering helper - show content only on specific screen sizes
 * Useful for adaptive layouts that show extra info on larger screens
 */
export function ShowOn({
  children,
  xSmall = false,
  small = false,
  medium = false,
  large = false,
  tablet = false,
  web = false,
}: ShowOnProps) {
  const { width } = useWindowDimensions();

  let shouldShow = false;
  if (width < BREAKPOINTS.xSmall && xSmall) shouldShow = true;
  if (width >= BREAKPOINTS.xSmall && width < BREAKPOINTS.small && small) shouldShow = true;
  if (width >= BREAKPOINTS.small && width < BREAKPOINTS.medium && medium) shouldShow = true;
  if (width >= BREAKPOINTS.medium && width < BREAKPOINTS.large && large) shouldShow = true;
  if (width >= BREAKPOINTS.large && width < BREAKPOINTS.tablet && tablet) shouldShow = true;
  if (width >= BREAKPOINTS.tablet && web) shouldShow = true;

  return shouldShow ? <>{children}</> : null;
}
