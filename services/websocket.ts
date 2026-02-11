import io, { Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/constants/config';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(token?: string) {
    if (this.socket?.connected) {
      return;
    }

    const wsUrl = API_BASE_URL.replace('http', 'ws').replace('https', 'wss');

    this.socket = io(wsUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: token ? { token } : undefined,
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.reconnectAttempts = 0;
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.emit('connection_status', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.emit('connection_error', { error: 'Max reconnection attempts reached' });
      }
    });

    // Price updates
    this.socket.on('price_update', (data) => {
      this.emit('price_update', data);
    });

    // Wallet updates
    this.socket.on('wallet_update', (data) => {
      this.emit('wallet_update', data);
    });

    // Notifications
    this.socket.on('notification', (data) => {
      this.emit('notification', data);
    });

    // Order updates
    this.socket.on('order_update', (data) => {
      this.emit('order_update', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  subscribeToPrices(symbols: string[]) {
    if (this.socket?.connected) {
      this.socket.emit('subscribe_prices', { symbols });
    }
  }

  unsubscribeFromPrices(symbols: string[]) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe_prices', { symbols });
    }
  }

  get isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const wsService = new WebSocketService();
