import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG } from '@/constants/config';
import * as SecureStore from 'expo-secure-store';
import type {
  User,
  AuthTokens,
  LoginCredentials,
  SignupData,
  WalletBalance,
  DepositRequest,
  DepositResponse,
  WithdrawRequest,
  TransferRequest,
  Transaction,
  CryptoPrice,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await SecureStore.getItemAsync('refresh_token');
            if (refreshToken) {
              const response = await this.client.post<AuthTokens>(
                API_CONFIG.endpoints.auth.refresh,
                { refresh_token: refreshToken }
              );

              const { access_token, refresh_token: newRefreshToken } = response.data;
              await SecureStore.setItemAsync('access_token', access_token);
              await SecureStore.setItemAsync('refresh_token', newRefreshToken);

              originalRequest.headers.Authorization = `Bearer ${access_token}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed - clear tokens
            await SecureStore.deleteItemAsync('access_token');
            await SecureStore.deleteItemAsync('refresh_token');
            throw refreshError;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth API
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.client.post(API_CONFIG.endpoints.auth.login, credentials);
    return response.data;
  }

  async signup(data: SignupData): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.client.post(API_CONFIG.endpoints.auth.signup, data);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post(API_CONFIG.endpoints.auth.logout);
  }

  async getMe(): Promise<User> {
    const response = await this.client.get(API_CONFIG.endpoints.auth.me);
    return response.data;
  }

  // Wallet API
  async getBalance(): Promise<WalletBalance> {
    const response = await this.client.get(API_CONFIG.endpoints.wallet.balance);
    return response.data;
  }

  async createDeposit(request: DepositRequest): Promise<DepositResponse> {
    const response = await this.client.post(API_CONFIG.endpoints.wallet.deposit, request);
    return response.data;
  }

  async createWithdrawal(request: WithdrawRequest): Promise<ApiResponse<any>> {
    const response = await this.client.post(API_CONFIG.endpoints.wallet.withdraw, request);
    return response.data;
  }

  async createTransfer(request: TransferRequest): Promise<ApiResponse<Transaction>> {
    const response = await this.client.post(API_CONFIG.endpoints.wallet.transfer, request);
    return response.data;
  }

  // Transactions API
  async getTransactions(page = 1, limit = 20): Promise<PaginatedResponse<Transaction>> {
    const response = await this.client.get(API_CONFIG.endpoints.transactions, {
      params: { page, limit },
    });
    return response.data;
  }

  // Prices API
  async getPrices(): Promise<CryptoPrice[]> {
    const response = await this.client.get(API_CONFIG.endpoints.prices);
    return response.data;
  }

  async getCryptoList(): Promise<CryptoPrice[]> {
    const response = await this.client.get(API_CONFIG.endpoints.crypto);
    return response.data;
  }
}

export const api = new ApiClient();
