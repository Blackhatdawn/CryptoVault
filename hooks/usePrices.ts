import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import type { CryptoPrice } from '@/types';

export const usePrices = (refreshInterval = 30000) => {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      setError(null);
      const data = await api.getPrices();
      setPrices(data);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch prices');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    
    const interval = setInterval(fetchPrices, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    prices,
    isLoading,
    error,
    refetch: fetchPrices,
  };
};
