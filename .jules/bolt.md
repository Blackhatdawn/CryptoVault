## 2025-05-22 - WebSocket-Driven Re-render Cascades
**Learning:** The application uses a central `useLivePrices` hook that streams updates via WebSockets every 100ms (debounced). Without memoization on list item components like `PriceCard`, every price update for ANY coin triggers a full re-render of the entire list on the Wallet and Markets screens.
**Action:** Always wrap list item components (`PriceCard`, `TransactionItem`, etc.) in `React.memo` and ensure parent components provide stable object references via `useMemo` for the data being passed down.
