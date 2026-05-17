# Responsive Design - Quick Reference

## Breakpoints
```
xSmall:  <340px   (iPhone SE)
small:   340-375  (iPhone 12 mini)
medium:  375-414  (iPhone 12)
large:   414-600  (iPhone 12 Pro Max)
tablet:  600-1000 (iPad mini)
web:     1000px+  (Desktop)
```

## Hooks & Imports

### useResponsive Hook
```tsx
import { useResponsive } from '@/hooks/useResponsive';

const { 
  width, height,                          // Raw dimensions
  isXSmall, isSmall, isMedium, isLarge,  // Size flags
  isTablet, isWeb,                        // Large size flags
  scale, iconSize, hp, wp,                // Helper functions
  safePadding,                            // { horizontal, vertical }
} = useResponsive();
```

### Responsive Constants
```tsx
import { BREAKPOINTS, getResponsiveSpacing, getResponsiveFontSize } from '@/constants/responsive';

BREAKPOINTS.small        // 375
getResponsiveSpacing(width)        // 8-24px padding
getResponsiveFontSize(28, width)   // Scales 28px font
```

### Layout Components
```tsx
import { 
  ResponsiveGrid, 
  ResponsiveStack, 
  ResponsiveContainer,
  HideOn, 
  ShowOn,
  ResponsiveImage,
} from '@/components/ResponsiveLayout';
```

---

## Component Examples

### 1. Responsive Grid (Auto-columns)
```tsx
<ResponsiveGrid columns="auto" gap={16}>
  <Card />
  <Card />
  <Card />
</ResponsiveGrid>
// Mobile: 1 col | Tablet: 2 cols | Desktop: 3+ cols
```

### 2. Responsive Stack (Auto-direction)
```tsx
<ResponsiveStack direction="auto" gap={24}>
  <Image width={200} height={200} />
  <TextBlock />
</ResponsiveStack>
// Mobile: vertical | Desktop: horizontal
```

### 3. Responsive Container
```tsx
<ResponsiveContainer maxWidth={1200} centered>
  <PageContent />
</ResponsiveContainer>
// Constrains width on large screens
```

### 4. Conditional Rendering
```tsx
<HideOn tablet web>
  <MobileOnlyMenu />
</HideOn>

<ShowOn web>
  <DesktopSidebar />
</ShowOn>
```

---

## Common Patterns

### Responsive Spacing
```tsx
const { width } = useWindowDimensions();
const padding = getResponsiveSpacing(width);

<View style={{ paddingHorizontal: padding }}>
```

### Responsive Font
```tsx
const { width } = useWindowDimensions();
const fontSize = getResponsiveFontSize(16, width);

<Text style={{ fontSize }}>
```

### Touch Targets (WCAG)
```tsx
import { getTouchTargetSize } from '@/constants/responsive';

<Pressable style={{ 
  width: getTouchTargetSize(width),
  height: getTouchTargetSize(width),
}} />
// Always 44px minimum
```

### Auto Grid
```tsx
<ResponsiveGrid columns="auto" gap={12}>
  {items.map(item => <Item key={item.id} data={item} />)}
</ResponsiveGrid>
```

### Flexible Row
```tsx
<View style={{ flex: 1, minWidth: '45%' }}>
  <Card />
</View>
// Wraps when space limited
```

---

## What NOT to Do ❌

```tsx
// ❌ Hardcoded widths
<View style={{ width: 375 }} />

// ❌ Hardcoded font sizes
<Text style={{ fontSize: 18 }} />

// ❌ No safe area consideration
<View style={{ paddingHorizontal: 0 }} />

// ❌ Too small touch targets
<Pressable style={{ width: 30, height: 30 }} />

// ❌ Horizontal overflow
<View style={{ width: 400 }}>
```

## What TO Do ✅

```tsx
// ✅ Percentage or flex width
<View style={{ width: '100%' }} />

// ✅ Responsive font size
const fontSize = getResponsiveFontSize(18, width);

// ✅ Safe area padding
const padding = getResponsiveSpacing(width);

// ✅ WCAG-compliant touch targets
const size = getTouchTargetSize(width); // 44px+

// ✅ Use responsive components
<ResponsiveGrid columns="auto">
```

---

## Testing Dimensions

### Chrome DevTools
1. Press Ctrl+Shift+M (Cmd+Shift+M on Mac)
2. Select device or enter custom: **340 x 667** (tiny phone edge case)

### Test These Sizes
- 340x667 (iPhone SE)
- 375x667 (iPhone 12 mini)
- 390x844 (iPhone 12)
- 428x926 (iPhone 12 Pro Max)
- 768x1024 (iPad)
- 1024x1366 (iPad Pro)
- 1920x1080 (Desktop)

---

## Performance Tips

- Use `useResponsive()` instead of `Dimensions.get()` for real-time updates
- Memoize responsive calculations with `useMemo()`
- Avoid re-renders with `React.memo()` on layout components
- Use `removeClippedSubviews` for long lists on mobile
- Test with DevTools throttling (Slow 3G)

---

## Files Reference

| File | Purpose |
|------|---------|
| `hooks/useResponsive.ts` | Responsive hook with size flags |
| `constants/responsive.ts` | Breakpoints and helper functions |
| `components/ResponsiveLayout.tsx` | Reusable layout components |
| `app/+html.tsx` | Web viewport config and CSS media queries |
| `components/WebContainer.tsx` | Web-specific responsive container |
| `MOBILE_RESPONSIVE_GUIDE.md` | Detailed reference (this file) |

---

## Quick Checklist

- [ ] Using `useResponsive()` hook
- [ ] No hardcoded dimensions (use %, flex, responsive funcs)
- [ ] Font sizes scale with screen width
- [ ] Touch targets ≥44px (use `getTouchTargetSize()`)
- [ ] Proper safe area padding
- [ ] Images scale proportionally
- [ ] Tested on small (340px) and large (1920px) screens
- [ ] No horizontal overflow
- [ ] Accessibility: color contrast, readability

---

## Support

See `MOBILE_RESPONSIVE_GUIDE.md` for detailed documentation and examples.
