# CryptoVault Mobile & Responsive Design Guide

**Status:** ✅ Full mobile/responsive compatibility implemented

## Overview

CryptoVault now includes comprehensive responsive design support for:
- **Tiny phones:** iPhone SE, Samsung Galaxy S10e (340px - 360px)
- **Small phones:** iPhone 12 mini, iPhone 13 mini (360px - 375px)
- **Medium phones:** iPhone 12/13, Samsung Galaxy S21 (375px - 414px)
- **Large phones:** iPhone 12/13 Pro Max, Galaxy S21 Ultra (414px - 600px)
- **Tablets:** iPad mini, small tablets (600px - 1000px)
- **Desktop/Web:** iPad Pro, large tablets, desktop browsers (1000px+)

---

## What Changed

### 1. Enhanced `app/+html.tsx` (Web Viewport)
✅ **Improvements:**
- Added proper viewport meta tags with notch support
- CSS media queries for responsive breakpoints
- Safe area (notch) handling via `env()` variables
- Smooth scrolling and touch optimization
- Prevents iOS input zoom (16px minimum font)
- Tap highlight removal for better mobile UX

### 2. Updated `hooks/useResponsive.ts`
✅ **New Features:**
- 6 screen size flags: `isXSmall`, `isSmall`, `isMedium`, `isLarge`, `isTablet`, `isWeb`
- Dynamic `safePadding` object for responsive padding
- Better scaling factors for each breakpoint
- Improved helper functions: `scale()`, `iconSize()`, `hp()`, `wp()`

### 3. Enhanced `components/WebContainer.tsx`
✅ **Improvements:**
- Responsive max-width based on screen size
- Proper width constraints for all viewport sizes
- Better use of `useWindowDimensions` for real-time responsiveness

### 4. New Responsive Utilities
✅ **Created `constants/responsive.ts`:**
```tsx
// Breakpoint constants
BREAKPOINTS = { xSmall: 340, small: 375, medium: 414, large: 600, tablet: 1000, web: 1200 }

// Helper functions
- getResponsiveSpacing(width) → padding amount
- getResponsiveFontSize(baseSize, width) → font size
- getResponsiveSize(baseSize, width) → component size
- getColumnCount(width) → auto-column grid count
- getItemWidth(width, columns, gap) → item width in grid
- getModalWidth(width) → responsive modal width
- getTouchTargetSize(width) → WCAG-compliant tap size (44px+)
- getContainerMaxWidth(width) → content max-width
```

### 5. New Layout Components
✅ **Created `components/ResponsiveLayout.tsx`:**

#### `<ResponsiveGrid>`
Auto-responsive grid layout
```tsx
<ResponsiveGrid columns="auto" gap={16}>
  <PriceCard price={btc} />
  <PriceCard price={eth} />
  <PriceCard price={sol} />
</ResponsiveGrid>
// Automatically: 1 col on mobile, 2 cols on tablets, 3+ on desktop
```

#### `<ResponsiveStack>`
Switches row/column based on screen size
```tsx
<ResponsiveStack direction="auto" gap={16}>
  <ImageComponent />
  <TextComponent />
</ResponsiveStack>
// Stacks vertically on mobile, horizontally on desktop
```

#### `<ResponsiveContainer>`
Constrains width and centers on large screens
```tsx
<ResponsiveContainer maxWidth={1200} centered>
  <ContentHere />
</ResponsiveContainer>
```

#### `<HideOn>` / `<ShowOn>`
Conditional rendering for adaptive layouts
```tsx
<HideOn tablet web>
  <MobileOnlyBanner />
</HideOn>

<ShowOn web>
  <DesktopSidebar />
</ShowOn>
```

---

## Breakpoint Reference

| Size | Range | Examples | Use Case |
|------|-------|----------|----------|
| **xSmall** | <340px | iPhone SE | Minimum scaling |
| **small** | 340-375px | iPhone 12 mini | Small phone baseline |
| **medium** | 375-414px | iPhone 12 | Standard phone |
| **large** | 414-600px | iPhone 12 Pro Max | Large phone |
| **tablet** | 600-1000px | iPad mini | Tablet orientation |
| **web** | 1000px+ | iPad Pro, Desktop | Large screen |

---

## Mobile Compatibility Checklist

### Viewport & Meta Tags ✅
- [x] Correct viewport meta tag
- [x] Safe area (notch) support
- [x] Mobile web app capable
- [x] Theme color set
- [x] Tap highlight disabled
- [x] Touch action optimization

### Responsive Typography ✅
- [x] Font sizes scale with screen
- [x] Line heights adjusted
- [x] 16px+ input font (prevents iOS zoom)
- [x] Readable on all sizes

### Touch Targets ✅
- [x] Minimum 44x44px per WCAG
- [x] Proper spacing between buttons
- [x] No overlapping touch areas

### Layout ✅
- [x] No horizontal overflow
- [x] Images scale properly
- [x] Grids reflow on small screens
- [x] Safe area padding applied

### Performance ✅
- [x] No unnecessary re-renders
- [x] Optimized for mobile
- [x] Smooth animations
- [x] Fast initial load

---

## Testing on Mobile Screens

### Browser DevTools

#### Chrome DevTools
1. Open DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Select device or custom dimensions

**Test these sizes:**
- iPhone SE (375x667)
- iPhone 12 (390x844)
- iPhone 12 Pro Max (428x926)
- iPad (768x1024)
- Custom 340px (edge case)

#### Safari DevTools
1. Enable Developer Menu (Safari → Preferences → Advanced)
2. Develop → Enter Responsive Design Mode
3. Test same dimensions as Chrome

### Real Device Testing

Test on actual devices when possible:
```
Small:   iPhone SE, iPhone 12 mini
Medium:  iPhone 12, Samsung S21
Large:   iPhone 12 Pro Max, Galaxy S21 Ultra
Tablet:  iPad mini, Galaxy Tab S6
```

### Orientation Testing

Always test both:
- **Portrait** (main orientation)
- **Landscape** (rotation handling)

Test safe area handling with notches:
- iPhone with notch (top safe area)
- Android with pill punch (top safe area)

---

## Using Responsive Utilities in Your Code

### Example 1: Responsive Grid
```tsx
import { ResponsiveGrid } from '@/components/ResponsiveLayout';
import { PriceCard } from '@/components/PriceCard';

export function MarketsList() {
  const prices = [/* ... */];
  
  return (
    <ResponsiveGrid columns="auto" gap={12}>
      {prices.map(p => <PriceCard key={p.symbol} price={p} />)}
    </ResponsiveGrid>
  );
  // Automatically: 1 col on mobile, 2 on tablet, 3+ on desktop
}
```

### Example 2: Responsive Spacing
```tsx
import { useWindowDimensions } from 'react-native';
import { getResponsiveSpacing } from '@/constants/responsive';

export function MyComponent() {
  const { width } = useWindowDimensions();
  const padding = getResponsiveSpacing(width);
  
  return (
    <View style={{ paddingHorizontal: padding }}>
      {/* Content adapts padding to screen width */}
    </View>
  );
}
```

### Example 3: Conditional Rendering
```tsx
import { ShowOn, HideOn } from '@/components/ResponsiveLayout';

export function Dashboard() {
  return (
    <View>
      {/* Show full dashboard on desktop only */}
      <ShowOn web>
        <DesktopDashboard />
      </ShowOn>
      
      {/* Show compact mobile version on small screens */}
      <HideOn tablet web>
        <MobileDashboard />
      </HideOn>
    </View>
  );
}
```

### Example 4: Dynamic Font Sizing
```tsx
import { useWindowDimensions } from 'react-native';
import { getResponsiveFontSize } from '@/constants/responsive';

export function Title() {
  const { width } = useWindowDimensions();
  const fontSize = getResponsiveFontSize(28, width);
  
  return <Text style={{ fontSize }}>Responsive Title</Text>;
}
```

---

## Common Responsive Patterns

### Pattern 1: Hero Section (Reflows)
```tsx
<ResponsiveStack direction="auto">
  <Image source={logo} style={{ width: 200, height: 200 }} />
  <TextContent />
</ResponsiveStack>
// Stacks vertically on mobile, side-by-side on desktop
```

### Pattern 2: Price Grid (Auto-columns)
```tsx
<ResponsiveGrid columns="auto" gap={16}>
  {prices.map(p => <PriceCard price={p} />)}
</ResponsiveGrid>
// 1 column on mobile, 2 on tablet, 3 on desktop
```

### Pattern 3: Adaptive Cards
```tsx
<View style={{ flex: 1, minWidth: '45%' }}>
  <Card>Content</Card>
</View>
// Uses minWidth to handle auto-reflow
```

### Pattern 4: Touch-Friendly Controls
```tsx
import { getTouchTargetSize } from '@/constants/responsive';

<Pressable style={{ 
  width: getTouchTargetSize(width),
  height: getTouchTargetSize(width),
}}>
  <Icon />
</Pressable>
// Always 44px+
```

---

## CSS Media Query Breakpoints (Web)

The HTML shell includes CSS media queries for all breakpoints:

```css
@media (max-width: 375px)      { /* xSmall phones */ }
@media (min-width: 376px) and (max-width: 479px)   { /* Small phones */ }
@media (min-width: 480px) and (max-width: 599px)   { /* Mobile */ }
@media (min-width: 600px) and (max-width: 999px)   { /* Tablets */ }
@media (min-width: 1000px)     { /* Desktop */ }
@media (min-width: 1400px)     { /* Large desktop */ }
```

---

## Performance Considerations

### On Mobile
- Avoid large images (compress to <100KB)
- Limit animations on low-end devices
- Use `removeClippedSubviews` for long lists
- Optimize bundle size

### Across All Sizes
- Use percentage widths where possible
- Avoid hardcoded dimensions
- Test with slow 3G throttling
- Monitor FPS on animations

---

## Accessibility on Mobile

### Touch Targets
- ✅ Minimum 44x44px (WCAG AA)
- ✅ 56x56px preferred (WCAG AAA)
- ✅ Adequate spacing between targets

### Text Sizing
- ✅ Minimum 14px body text
- ✅ 16px+ for inputs (prevents iOS zoom)
- ✅ Sufficient line height (1.5+)

### Contrast
- ✅ 4.5:1 for normal text
- ✅ 3:1 for large text
- ✅ Test with Color Contrast Analyzer

---

## Troubleshooting

### Issue: Content overflows on small screens
**Solution:** Use responsive width and `flex: 1` with `flexWrap: 'wrap'`

### Issue: Text too large on mobile
**Solution:** Use `getResponsiveFontSize()` instead of hardcoded values

### Issue: Tap targets too small
**Solution:** Use `getTouchTargetSize()` for buttons and interactive elements

### Issue: Safe area not respected
**Solution:** Use `useSafeAreaInsets()` from react-native-safe-area-context

### Issue: Image aspect ratios break
**Solution:** Set aspect ratio via `aspectRatio` style or calculate height from width

---

## Future Enhancements

- [ ] Dark mode responsive variants
- [ ] RTL (right-to-left) language support
- [ ] Landscape mode optimizations
- [ ] Tablet split-view support
- [ ] Foldable device support
- [ ] Dynamic type (iOS) support
- [ ] Reduced motion preferences

---

## Resources

- [React Native Dimensions API](https://reactnative.dev/docs/dimensions)
- [React Native SafeAreaView](https://reactnative.dev/docs/safeareaview)
- [WCAG Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [MDN Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries)
- [Responsive Web Design Basics](https://developers.google.com/web/fundamentals/design-and-ux/responsive)

---

## Summary

CryptoVault now has **enterprise-grade responsive design** that works seamlessly on:
- ✅ Tiny phones (340px)
- ✅ Standard mobile (375px - 600px)
- ✅ Tablets (600px - 1000px)
- ✅ Desktop/Web (1000px+)

**All components scale correctly** with proper:
- Typography scaling
- Padding/margin adjustment
- Grid reflow
- Touch target sizing
- Safe area handling
- Accessibility compliance

**Ready for production launch!** 🚀
