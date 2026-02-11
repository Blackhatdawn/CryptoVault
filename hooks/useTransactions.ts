import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import type { Transaction } from '@/types';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      
      const response = await api.getTransactions(1, 50);
      setTransactions(response.items);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const refresh = () => fetchTransactions(true);

  return {
    transactions,
    isLoading,
    isRefreshing,
    error,
    refresh,
  };
};
