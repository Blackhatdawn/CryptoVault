import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";
import type { Transaction } from "@/types";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const fetchTransactions = useCallback(
    async (opts: { refresh?: boolean; nextPage?: number } = {}) => {
      const { refresh = false, nextPage = 1 } = opts;

      try {
        if (refresh) setIsRefreshing(true);
        else if (nextPage === 1) setIsLoading(true);

        setError(null);

        const response = await api.getTransactions(nextPage, 20);

        // Handle both response shapes: PaginatedResponse (items) and legacy (data)
        const items: Transaction[] =
          (response as any).items ?? (response as any).data ?? [];

        if (refresh || nextPage === 1) {
          setTransactions(items);
        } else {
          setTransactions((prev) => [...prev, ...items]);
        }

        setHasMore((response as any).has_next ?? false);
        setPage(nextPage);
      } catch (err: any) {
        setError(
          err.response?.data?.error ||
            err.response?.data?.detail ||
            "Failed to load transactions",
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const refresh = useCallback(
    () => fetchTransactions({ refresh: true }),
    [fetchTransactions],
  );
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading && !isRefreshing) {
      fetchTransactions({ nextPage: page + 1 });
    }
  }, [hasMore, isLoading, isRefreshing, page, fetchTransactions]);

  return {
    transactions,
    isLoading,
    isRefreshing,
    error,
    hasMore,
    refresh,
    loadMore,
  };
};
