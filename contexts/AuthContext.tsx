import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { storage as SecureStore } from '@/utils/storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { api } from '@/services/api';
import type { User, LoginCredentials, SignupData } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricEnabled: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loginWithBiometric: () => Promise<{ success: boolean; error?: string }>;
  checkSession: () => Promise<void>;
  enableBiometric: (enable: boolean) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    checkSession();
    checkBiometricStatus();
  }, []);

  const checkSession = async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (token) {
        const userData = await api.getMe();
        setUser(userData);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      await clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const checkBiometricStatus = async () => {
    const enabled = await SecureStore.getItemAsync('biometric_enabled');
    setBiometricEnabled(enabled === 'true');
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const { user: userData, tokens } = await api.login(credentials);

      await SecureStore.setItemAsync('access_token', tokens.access_token);
      await SecureStore.setItemAsync('refresh_token', tokens.refresh_token);

      setUser(userData);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.response?.data?.detail || 'Login failed' };
    }
  };

  const signup = async (data: SignupData) => {
    try {
      const { user: userData, tokens } = await api.signup(data);

      await SecureStore.setItemAsync('access_token', tokens.access_token);
      await SecureStore.setItemAsync('refresh_token', tokens.refresh_token);

      setUser(userData);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.response?.data?.detail || 'Signup failed' };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await clearAuth();
    }
  };

  const loginWithBiometric = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        return { success: false, error: 'Biometric authentication not available' };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login to CryptoVault',
        fallbackLabel: 'Use password',
      });

      if (result.success) {
        // Re-use refresh token flow instead of storing raw passwords
        const token = await SecureStore.getItemAsync('access_token');
        if (token) {
          try {
            const userData = await api.getMe();
            setUser(userData);
            return { success: true };
          } catch {
            return { success: false, error: 'Session expired. Please log in with your password.' };
          }
        }
        return { success: false, error: 'No active session found. Please log in with your password.' };
      }

      return { success: false, error: 'Biometric authentication failed' };
    } catch (error) {
      return { success: false, error: 'Biometric error' };
    }
  };

  const enableBiometric = async (enable: boolean) => {
    if (enable) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        throw new Error('Biometric authentication not available');
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable biometric login',
      });

      if (result.success) {
        await SecureStore.setItemAsync('biometric_enabled', 'true');
        setBiometricEnabled(true);
      } else {
        throw new Error('Authentication failed');
      }
    } else {
      await SecureStore.setItemAsync('biometric_enabled', 'false');
      setBiometricEnabled(false);
    }
  };

  const clearAuth = async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        biometricEnabled,
        login,
        signup,
        logout,
        loginWithBiometric,
        checkSession,
        enableBiometric,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
