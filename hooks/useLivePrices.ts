import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { wsService } from '@/services/websocket';
import type { CryptoPrice } from '@/types';

// Debounce utility for high-frequency updates
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
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
  
  // Memoize the debounced price update handler
  const debouncedPriceUpdate = useMemo(
    () => debounce((data: any) => {
      if (data.prices && Array.isArray(data.prices)) {
        const pricesMap: Record<string, CryptoPrice> = {};
        data.prices.forEach((price: CryptoPrice) => {
          pricesMap[price.symbol] = price;
        });
        setPrices(pricesMap);
        setIsLoading(false);
      }
    }, 100), // 100ms debounce to batch rapid updates
    []
  );

  const handleConnectionStatus = useCallback((data: { connected: boolean }) => {
    setIsConnected(data.connected);
  }, []);

  useEffect(() => {
    symbolsRef.current = symbols;
  }, [symbols]);

  useEffect(() => {
    // Connect to WebSocket
    wsService.connect();

    // Subscribe to events
    wsService.on('connection_status', handleConnectionStatus);
    wsService.on('price_update', debouncedPriceUpdate);

    // Subscribe to price updates
    if (symbols.length > 0) {
      wsService.subscribeToPrices(symbols);
    }

    // Cleanup
    return () => {
      wsService.off('connection_status', handleConnectionStatus);
      wsService.off('price_update', debouncedPriceUpdate);
      if (symbolsRef.current.length > 0) {
        wsService.unsubscribeFromPrices(symbolsRef.current);
      }
    };
  }, []); // Remove symbols dependency to prevent re-subscription

  const getPriceChange = useCallback((symbol: string): number => {
    const price = prices[symbol];
    if (!price) return 0;
    return parseFloat(price.changePercent24Hr || '0');
  }, [prices]);

  const isPositive = useCallback((symbol: string): boolean => {
    return getPriceChange(symbol) >= 0;
  }, [getPriceChange]);

  // Convert prices map to array for components - memoized
  const pricesArray = useMemo(() => Object.values(prices), [prices]);

  return {
    prices: pricesArray,
    isConnected,
    isLoading,
    getPriceChange,
    isPositive,
  };
};
