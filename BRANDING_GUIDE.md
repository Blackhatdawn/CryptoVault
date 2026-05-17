# CryptoVault Branding & Logo Guide

## Logo Assets

### Primary Logo (Recommended)
- **File:** `assets/images/logo.webp`
- **Format:** WebP (optimized)
- **Size:** 6.7 KB
- **Best for:** App icons, splash screens, web

### Scalable Vector Logo
- **File:** `assets/images/logo.svg`
- **Format:** SVG
- **Best for:** Print, large displays, responsive sizing

### Color Specification
- **Primary Gold:** #D4AF37 (shield outline)
- **Secondary Gold:** #B8860B (shade)
- **Dark Gray:** #2C3E50 (chart bars & shadow)
- **Background:** #0a0a0a (dark background)

---

## Using the Logo in Code

### Option 1: Direct Image (Simple)
```tsx
import { Image } from 'react-native';

export function MyComponent() {
  return (
    <Image
      source={require('@/assets/images/logo.webp')}
      style={{ width: 120, height: 120, resizeMode: 'contain' }}
    />
  );
}
```

### Option 2: Reusable Component (Recommended)
```tsx
import { BrandLogo } from '@/components/BrandLogo';

export function MyComponent() {
  return <BrandLogo size="large" />;  // 120px
}
```

### Size Options
```tsx
<BrandLogo size="small" />    // 48px - headers, nav
<BrandLogo size="medium" />   // 80px - card headers
<BrandLogo size="large" />    // 120px - splash, hero
```

---

## Current Usage

### Splash Screen
- **Location:** `app/splash.tsx`
- **Size:** Large (120px)
- **Animation:** Spring bounce effect
- **Duration:** 2.5 seconds

### Auth Screen (Login/Signup)
- **Location:** `app/auth.tsx`
- **Size:** Medium (80px) on small phones, Large (120px) on bigger screens
- **Position:** Top of authentication card
- **Context:** Branding for sign-in/sign-up flows

### App Icon
- **iOS:** `app.json` → icon reference
- **Android:** `app.json` → adaptive icon
- **Web:** `app.json` → favicon

---

## Adding Logo to New Screens

### Pattern 1: Header Logo
```tsx
import { BrandLogo } from '@/components/BrandLogo';
import { Text } from 'react-native';

export function SettingsHeader() {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 16 }}>
      <BrandLogo size="small" />
      <Text style={{ marginTop: 8, fontSize: 18, fontWeight: '700' }}>
        Settings
      </Text>
    </View>
  );
}
```

### Pattern 2: Hero Section
```tsx
import { BrandLogo } from '@/components/BrandLogo';
import { LinearGradient } from 'expo-linear-gradient';

export function WelcomeHero() {
  return (
    <LinearGradient colors={['#08091A', '#0F1128']} style={{ padding: 32, alignItems: 'center' }}>
      <BrandLogo size="large" />
      <Text style={{ marginTop: 16, fontSize: 28, fontWeight: '700' }}>
        Welcome to CryptoVault
      </Text>
    </LinearGradient>
  );
}
```

### Pattern 3: Small Badge/Icon
```tsx
import { BrandLogo } from '@/components/BrandLogo';

export function TransactionBadge() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <BrandLogo size="small" />
      <Text>CryptoVault Transfer</Text>
    </View>
  );
}
```

---

## Design Specifications

### Logo Padding
- **Minimum clear space:** 16px around logo
- Avoid placing text directly next to logo in small sizes

### Background Compatibility
- Logo works on:
  - Dark backgrounds (#0a0a0a, #08091A) ✅
  - Medium dark (#1a1a2e) ✅
  - Light backgrounds ⚠️ (gold becomes less visible)

### Sizing Guidelines
- **Small (48px):** Navigation bars, inline badges
- **Medium (80px):** Card headers, section titles
- **Large (120px):** Splash screens, hero sections, app icons

### Color Variations (Future)
The current logo is optimized for dark themes. For light theme:
- Darken the gold (#D4AF37 → #8B6914)
- Or use navy/gray instead

---

## Migration from Old Icon

### Old System (Wallet Icon)
```tsx
// Before: Using Material Icons
<MaterialIcons name="account-balance-wallet" size={64} color={Colors.primary} />
```

### New System (Professional Logo)
```tsx
// After: Using BrandLogo component
<BrandLogo size="large" />
```

### Screens Already Updated
- ✅ `app/splash.tsx`
- ✅ `app/auth.tsx`

### Screens to Consider Updating (Optional)
- `app/onboarding.tsx` - Could use logo at top
- `app/(tabs)/_layout.tsx` - Header logo
- `app/settings.tsx` - Profile section header
- Welcome/tutorial screens

---

## Exporting for Print or High-Res

To use the logo outside the app:

1. **For Web:** Use `logo.webp` at 2x size
   ```html
   <img src="/assets/logo.webp" alt="CryptoVault" width="240" height="240" />
   ```

2. **For Print:** Export from `logo.svg`
   - Scales infinitely without quality loss
   - Suitable for: Business cards, letterheads, posters

3. **For Marketing:** Use the high-res WebP
   - Resolution: 512x512 pixels
   - DPI: 72 (web) or 300 (print)

---

## Accessibility

### Alt Text
```tsx
<Image
  source={require('@/assets/images/logo.webp')}
  accessibilityLabel="CryptoVault Logo"
/>
```

### Color Contrast
- Gold (#D4AF37) on Dark (#0a0a0a): **Ratio 6.5:1** ✅ WCAG AA compliant
- Logo includes text context ("CryptoVault") for screen readers

---

## Future Enhancements (Optional)

1. **Dark/Light Theme Variants**
   - `logo-dark.webp` (current)
   - `logo-light.webp` (for light mode)

2. **Animated Logo**
   - Lottie animation for splash screens
   - Bouncing or rotating shield effect

3. **Logo Monochrome Version**
   - For simple contexts (nav icons)
   - For light backgrounds

4. **Favicon Variants**
   - iOS app clip icon
   - Android notification icon

---

## Brand Consistency Checklist

When adding the logo to new features:
- [ ] Using `BrandLogo` component (not direct image)
- [ ] Correct size (small/medium/large)
- [ ] Adequate padding (min 16px clear space)
- [ ] Dark background for best visibility
- [ ] Paired with "CryptoVault" text branding
- [ ] Accessibility label included
- [ ] Tested on iOS and Android

---

## Support

For questions about logo usage:
1. Check `components/BrandLogo.tsx` for available props
2. Review existing usage in `app/splash.tsx` or `app/auth.tsx`
3. Reference this guide for design specifications

---

**Logo Version:** 1.0 Enterprise  
**Last Updated:** May 17, 2026  
**Status:** ✅ Production Ready
