import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { wsService } from '@/services/websocket';
import { api } from '@/services/api';
import type { CryptoPrice } from '@/types';

// Debounce utility — batches rapid WebSocket price updates into a single render
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const useLivePrices = (symbols: string[] = ['BTC', 'ETH', 'USDT', 'USDC', 'BNB']) => {
  const [prices, setPrices] = useState<Record<string, CryptoPrice>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const symbolsRef = useRef(symbols);

  // Memoise the debounced WebSocket price-update handler
  const debouncedPriceUpdate = useMemo(
    () => debounce((data: any) => {
      if (data.prices && Array.isArray(data.prices)) {
        setPrices((prev) => {
          const next = { ...prev };
          (data.prices as CryptoPrice[]).forEach((p) => { next[p.symbol] = p; });
          return next;
        });
        setIsLoading(false);
      }
    }, 100),
    []
  );

  const handleConnectionStatus = useCallback((data: { connected: boolean }) => {
    setIsConnected(data.connected);
  }, []);

  useEffect(() => {
    symbolsRef.current = symbols;
  }, [symbols]);

  useEffect(() => {
    // ── Step 1: Fetch prices from REST API immediately ────────────────────────
    // This means the Markets screen is populated right away without waiting
    // for the WebSocket handshake (which can take a few seconds).
    (async () => {
      try {
        const data = await api.getPrices();
        if (Array.isArray(data) && data.length > 0) {
          const map: Record<string, CryptoPrice> = {};
          data.forEach((p) => { map[p.symbol] = p; });
          setPrices(map);
          setIsLoading(false);
        }
      } catch {
        // If REST fails, the WebSocket will provide data once connected
        console.warn('[useLivePrices] REST price fetch failed, waiting for WebSocket...');
      }
    })();

    // ── Step 2: Connect WebSocket for streaming updates ───────────────────────
    // The backend broadcasts fresh CoinGecko data every 30 s.
    // New clients receive cached data immediately on subscription (see backend).
    wsService.connect();
    wsService.on('connection_status', handleConnectionStatus);
    wsService.on('price_update', debouncedPriceUpdate);

    if (symbols.length > 0) {
      wsService.subscribeToPrices(symbols);
    }

    return () => {
      wsService.off('connection_status', handleConnectionStatus);
      wsService.off('price_update', debouncedPriceUpdate);
      if (symbolsRef.current.length > 0) {
        wsService.unsubscribeFromPrices(symbolsRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getPriceChange = useCallback((symbol: string): number => {
    const price = prices[symbol];
    if (!price) return 0;
    return parseFloat(price.changePercent24Hr || '0');
  }, [prices]);

  const isPositive = useCallback((symbol: string): boolean => {
    return getPriceChange(symbol) >= 0;
  }, [getPriceChange]);

  // Convert map → array for list components
  const pricesArray = useMemo(() => Object.values(prices), [prices]);

  return {
    prices: pricesArray,
    isConnected,
    isLoading,
    getPriceChange,
    isPositive,
  };
};
