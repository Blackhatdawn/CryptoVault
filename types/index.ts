// User & Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  email_verified: boolean;
  kyc_verified?: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

// Wallet Types
export interface WalletBalance {
  user_id?: string;
  balance: number;        // total balance (used in transfer.tsx)
  total_usd: number;      // total portfolio value (used in index.tsx, account.tsx)
  available_usd: number;  // available for trading
  locked_usd: number;     // locked in active orders
  currency: string;
  updated_at: string;
}

export interface DepositRequest {
  amount: number;
  currency: string;
  pay_currency: string;
}

export interface DepositResponse {
  order_id: string;
  payment_id: string;
  pay_address: string;
  pay_amount: number;
  pay_currency: string;
  price_amount: number;
  price_currency: string;
  payment_url: string;
  status: string;
}

export interface WithdrawRequest {
  amount: number;
  currency: string;
  address: string;
  network?: string;
}

export interface TransferRequest {
  recipient_email: string;
  amount: number;
  currency?: string;
  note?: string;
}

// Transaction Types
export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'transfer_sent' | 'transfer_received' | 'transfer' | 'trade';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  created_at: string;
  metadata?: {
    recipient_email?: string;
    sender_email?: string;
    deposit_order_id?: string;
    withdrawal_address?: string;
  };
}

// Crypto Price Types
export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  priceUsd: string;           // was price_usd: number — now string to match CoinGecko/API
  changePercent24Hr: string;  // was mixed — now consistent
  marketCapUsd: string;
  volumeUsd24Hr: string;
  icon?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}
