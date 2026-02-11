// CryptoVault Mobile App Configuration
// Reads from environment variables with fallbacks

export const API_CONFIG = {
  // Backend URLs
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://cryptovault-api.onrender.com',
  WS_URL: process.env.EXPO_PUBLIC_WS_URL || 'wss://cryptovault-api.onrender.com',
  SOCKET_IO_PATH: process.env.EXPO_PUBLIC_SOCKET_IO_PATH || '/socket.io/',
  
  // Timeouts
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export const APP_CONFIG = {
  // App Info
  NAME: process.env.EXPO_PUBLIC_APP_NAME || 'CryptoVault',
  VERSION: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  SITE_NAME: process.env.EXPO_PUBLIC_SITE_NAME || 'CryptoVault Financial',
  
  // Support
  SUPPORT_EMAIL: process.env.EXPO_PUBLIC_SUPPORT_EMAIL || 'support@cryptovault.financial',
  
  // Features
  FEATURES: {
    TWO_FACTOR_AUTH: process.env.EXPO_PUBLIC_FEATURE_2FA_ENABLED === 'true',
    DEPOSITS: process.env.EXPO_PUBLIC_FEATURE_DEPOSITS_ENABLED === 'true',
    WITHDRAWALS: process.env.EXPO_PUBLIC_FEATURE_WITHDRAWALS_ENABLED === 'true',
    TRADING: process.env.EXPO_PUBLIC_FEATURE_TRADING_ENABLED === 'true',
    STAKING: process.env.EXPO_PUBLIC_FEATURE_STAKING_ENABLED === 'true',
  },
};

export const WEBSOCKET_CONFIG = {
  URL: API_CONFIG.WS_URL,
  PATH: API_CONFIG.SOCKET_IO_PATH,
  RECONNECTION: true,
  RECONNECTION_ATTEMPTS: 5,
  RECONNECTION_DELAY: 1000,
  RECONNECTION_DELAY_MAX: 5000,
  TIMEOUT: 20000,
};

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@cryptovault/auth_token',
  REFRESH_TOKEN: '@cryptovault/refresh_token',
  USER_DATA: '@cryptovault/user_data',
  BIOMETRIC_ENABLED: '@cryptovault/biometric_enabled',
  ONBOARDING_COMPLETED: '@cryptovault/onboarding_completed',
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  SIGNUP: '/api/auth/signup',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  ME: '/api/auth/me',
  
  // Wallet
  BALANCE: '/api/wallet/balance',
  DEPOSIT: '/api/wallet/deposit/create',
  WITHDRAW: '/api/wallet/withdraw',
  TRANSFER: '/api/wallet/transfer',
  
  // Transactions
  TRANSACTIONS: '/api/transactions',
  
  // Crypto
  PRICES: '/api/crypto/prices',
  CRYPTO_LIST: '/api/crypto',
  
  // Notifications
  NOTIFICATIONS: '/api/notifications',
};

// Export environment helper
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Backend API base URL (for reference)
export const API_BASE_URL = API_CONFIG.BASE_URL;
