// API Configuration
export const API_CONFIG = {
  baseURL: 'https://cryptovault-api.onrender.com',
  timeout: 10000,
  endpoints: {
    auth: {
      login: '/api/auth/login',
      signup: '/api/auth/signup',
      logout: '/api/auth/logout',
      refresh: '/api/auth/refresh',
      me: '/api/auth/me',
    },
    wallet: {
      balance: '/api/wallet/balance',
      deposit: '/api/wallet/deposit/create',
      withdraw: '/api/wallet/withdraw',
      transfer: '/api/wallet/transfer',
    },
    transactions: '/api/transactions',
    prices: '/api/prices',
    crypto: '/api/crypto',
  },
};

// Base URL for WebSocket and other services
export const API_BASE_URL = API_CONFIG.baseURL;

// WebSocket Configuration
export const WS_CONFIG = {
  url: 'wss://cryptovault-api.onrender.com',
  reconnectInterval: 5000,
  maxReconnectAttempts: 5,
};

// App Configuration
export const APP_CONFIG = {
  name: 'CryptoVault',
  version: '1.0.0',
  supportedCurrencies: ['BTC', 'ETH', 'USDT', 'BNB', 'SOL'],
  minWithdrawalAmount: 10,
  maxWithdrawalAmount: 100000,
};
