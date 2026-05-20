## 2025-05-22 - Initial Bolt Journal
**Learning:** WebSocket updates in this app trigger re-renders of entire lists. Without memoization, every item in the list re-renders even if its specific data hasn't changed.
**Action:** Use React.memo for list items (PriceCard, TransactionItem) to prevent O(N) re-render cascades during frequent price updates.
