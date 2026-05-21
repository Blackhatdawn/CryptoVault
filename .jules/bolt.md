## 2025-05-15 - Headless Performance Verification
**Learning:** In headless environments where React DevTools or visual profilers are unavailable, manual console logging inside components is a reliable way to empirically measure re-render counts and verify memoization impact.
**Action:** Use temporary 'console.log' statements to document 'Before' and 'After' render counts when implementing memoization or re-render optimizations.
