import React, { createContext, useState, ReactNode } from 'react';
import { api } from '@/services/api';
import type { WalletBalance, DepositRequest, WithdrawRequest, TransferRequest } from '@/types';

interface WalletContextType {
  balance: WalletBalance | null;
  isLoading: boolean;
  fetchBalance: () => Promise<void>;
  createDeposit: (request: DepositRequest) => Promise<{ success: boolean; data?: any; error?: string }>;
  createWithdrawal: (request: WithdrawRequest) => Promise<{ success: boolean; error?: string }>;
  createTransfer: (request: TransferRequest) => Promise<{ success: boolean; error?: string }>;
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = async () => {
    setIsLoading(true);
    try {
      const data = await api.getBalance();
      setBalance(data);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDeposit = async (request: DepositRequest) => {
    try {
      const data = await api.createDeposit(request);
      await fetchBalance(); // Refresh balance
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || 'Deposit failed' };
    }
  };

  const createWithdrawal = async (request: WithdrawRequest) => {
    try {
      await api.createWithdrawal(request);
      await fetchBalance(); // Refresh balance
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || 'Withdrawal failed' };
    }
  };

  const createTransfer = async (request: TransferRequest) => {
    try {
      // Add default currency if not provided
      const transferRequest = {
        ...request,
        currency: request.currency || 'USD',
      };
      await api.createTransfer(transferRequest);
      await fetchBalance(); // Refresh balance
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.detail || 'Transfer failed' };
    }
  };

  return (
    <WalletContext.Provider
      value={{
        balance,
        isLoading,
        fetchBalance,
        createDeposit,
        createWithdrawal,
        createTransfer,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
