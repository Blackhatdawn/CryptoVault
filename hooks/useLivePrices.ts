import { useEffect, useState, useCallback } from 'react';
import { wsService } from '@/services/websocket';
import type { CryptoPrice } from '@/types';

export const useLivePrices = (symbols: string[] = ['BTC', 'ETH', 'USDT', 'USDC', 'BNB']) => {
  const [prices, setPrices] = useState<Record<string, CryptoPrice>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handlePriceUpdate = useCallback((data: any) => {
    if (data.prices && Array.isArray(data.prices)) {
      const pricesMap: Record<string, CryptoPrice> = {};
      data.prices.forEach((price: CryptoPrice) => {
        pricesMap[price.symbol] = price;
      });
      setPrices(pricesMap);
      setIsLoading(false);
    }
  }, []);

  const handleConnectionStatus = useCallback((data: { connected: boolean }) => {
    setIsConnected(data.connected);
  }, []);

  useEffect(() => {
    // Connect to WebSocket
    wsService.connect();

    // Subscribe to events
    wsService.on('connection_status', handleConnectionStatus);
    wsService.on('price_update', handlePriceUpdate);

    // Subscribe to price updates
    if (symbols.length > 0) {
      wsService.subscribeToPrices(symbols);
    }

    // Cleanup
    return () => {
      wsService.off('connection_status', handleConnectionStatus);
      wsService.off('price_update', handlePriceUpdate);
      if (symbols.length > 0) {
        wsService.unsubscribeFromPrices(symbols);
      }
    };
  }, [symbols.join(',')]);

  const getPriceChange = (symbol: string): number => {
    const price = prices[symbol];
    if (!price) return 0;
    return parseFloat(price.changePercent24Hr || '0');
  };

  const isPositive = (symbol: string): boolean => {
    return getPriceChange(symbol) >= 0;
  };

  // Convert prices map to array for components
  const pricesArray = Object.values(prices);

  return {
    prices: pricesArray,
    isConnected,
    isLoading,
    getPriceChange,
    isPositive,
  };
};
