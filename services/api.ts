import axios, { AxiosInstance, AxiosError } from "axios";
import { API_CONFIG, API_ENDPOINTS } from "@/constants/config";
import * as SecureStore from "expo-secure-store";
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
} from "@/types";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync("access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken =
              await SecureStore.getItemAsync("refresh_token");
            if (refreshToken) {
              const response = await this.client.post<AuthTokens>(
                API_ENDPOINTS.REFRESH,
                { refresh_token: refreshToken },
              );

              const { access_token, refresh_token: newRefreshToken } =
                response.data;
              await SecureStore.setItemAsync("access_token", access_token);
              await SecureStore.setItemAsync("refresh_token", newRefreshToken);

              originalRequest.headers.Authorization = `Bearer ${access_token}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed - clear tokens
            await SecureStore.deleteItemAsync("access_token");
            await SecureStore.deleteItemAsync("refresh_token");
            throw refreshError;
          }
        }

        return Promise.reject(error);
      },
    );
  }

  // Auth API
  async login(
    credentials: LoginCredentials,
  ): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.client.post(API_ENDPOINTS.LOGIN, credentials);
    return response.data;
  }

  async signup(data: SignupData): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.client.post(API_ENDPOINTS.SIGNUP, data);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post(API_ENDPOINTS.LOGOUT);
  }

  async getMe(): Promise<User> {
    const response = await this.client.get(API_ENDPOINTS.ME);
    return response.data;
  }

  // Wallet API
  async getBalance(): Promise<WalletBalance> {
    const response = await this.client.get(API_ENDPOINTS.BALANCE);
    return response.data;
  }

  async createDeposit(request: DepositRequest): Promise<DepositResponse> {
    const response = await this.client.post(API_ENDPOINTS.DEPOSIT, request);
    return response.data;
  }

  async createWithdrawal(request: WithdrawRequest): Promise<ApiResponse<any>> {
    const response = await this.client.post(API_ENDPOINTS.WITHDRAW, request);
    return response.data;
  }

  async createTransfer(
    request: TransferRequest,
  ): Promise<ApiResponse<Transaction>> {
    const response = await this.client.post(API_ENDPOINTS.TRANSFER, request);
    return response.data;
  }

  // Transactions API
  async getTransactions(
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<Transaction>> {
    const response = await this.client.get(API_ENDPOINTS.TRANSACTIONS, {
      params: { page, limit },
    });
    return response.data;
  }

  // Prices API
  async getPrices(): Promise<CryptoPrice[]> {
    const response = await this.client.get(API_ENDPOINTS.PRICES);
    return response.data;
  }

  async getCryptoList(): Promise<CryptoPrice[]> {
    const response = await this.client.get(API_ENDPOINTS.CRYPTO_LIST);
    return response.data;
  }

  // Trading/Orders API
  async createOrder(orderData: {
    symbol: string;
    side: "buy" | "sell";
    type: "market" | "limit";
    amount: number;
    price?: number;
  }): Promise<ApiResponse<any>> {
    const response = await this.client.post("/api/orders", orderData);
    return response.data;
  }

  async getOrders(): Promise<ApiResponse<any[]>> {
    const response = await this.client.get("/api/orders");
    return response.data;
  }

  async cancelOrder(orderId: string): Promise<ApiResponse<any>> {
    const response = await this.client.delete(`/api/orders/${orderId}`);
    return response.data;
  }

  // Price History API
  async getPriceHistory(symbol: string, timeframe: string): Promise<number[]> {
    const response = await this.client.get(`/api/crypto/${symbol}/history`, {
      params: { interval: timeframe },
    });
    return response.data.prices || [];
  }

  // Price Alerts API
  async createPriceAlert(alertData: any): Promise<ApiResponse<any>> {
    const response = await this.client.post("/api/alerts", alertData);
    return response.data;
  }

  async getPriceAlerts(): Promise<ApiResponse<any[]>> {
    const response = await this.client.get("/api/alerts");
    return response.data;
  }

  async deletePriceAlert(alertId: string): Promise<ApiResponse<any>> {
    const response = await this.client.delete(`/api/alerts/${alertId}`);
    return response.data;
  }

  // Profile API
  async updateProfile(
    data: any,
  ): Promise<{ user?: any; success?: boolean; error?: string }> {
    const response = await this.client.put("/api/auth/profile", data);
    return response.data;
  }

  async updatePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<any>> {
    const response = await this.client.put("/api/auth/password", data);
    return response.data;
  }

  // Notifications API
  async getNotifications(): Promise<ApiResponse<any[]>> {
    const response = await this.client.get("/api/notifications");
    return response.data;
  }

  async markNotificationRead(
    notificationId: string,
  ): Promise<ApiResponse<any>> {
    const response = await this.client.put(
      `/api/notifications/${notificationId}/read`,
    );
    return response.data;
  }

  async markAllNotificationsRead(): Promise<ApiResponse<any>> {
    const response = await this.client.put("/api/notifications/read-all");
    return response.data;
  }
}

export const api = new ApiClient();
