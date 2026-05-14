import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { storage as SecureStore } from '@/utils/storage';

interface AppLockContextType {
  isLocked: boolean;
  unlock: () => Promise<boolean>;
  unlockWithPin: (pin: string) => Promise<boolean>;
  lockNow: () => void;
  autoLockMinutes: number;
  setAutoLockMinutes: (mins: number) => void;
}

export const AppLockContext = createContext<AppLockContextType>({
  isLocked: false,
  unlock: async () => true,
  unlockWithPin: async () => false,
  lockNow: () => {},
  autoLockMinutes: 5,
  setAutoLockMinutes: () => {},
});

export const AppLockProvider = ({ children }: { children: ReactNode }) => {
  const [isLocked, setIsLocked]           = useState(false);
  const [autoLockMinutes, setAutoLockMinutes] = useState(5);
  const lastBackgroundRef = useRef<number>(0);
  const appStateRef       = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleStateChange);
    return () => subscription.remove();
  }, [autoLockMinutes]);

  const handleStateChange = async (nextState: AppStateStatus) => {
    if (
      appStateRef.current === 'active' &&
      nextState.match(/inactive|background/)
    ) {
      lastBackgroundRef.current = Date.now();
    }

    if (
      appStateRef.current.match(/inactive|background/) &&
      nextState === 'active'
    ) {
      const elapsed = (Date.now() - lastBackgroundRef.current) / 1000 / 60;
      if (elapsed >= autoLockMinutes && lastBackgroundRef.current > 0) {
        const biometricEnabled = await SecureStore.getItemAsync('biometric_enabled');
        const pinCode = await SecureStore.getItemAsync('pin_code');
        if (biometricEnabled === 'true' || !!pinCode) {
          setIsLocked(true);
        }
      }
    }

    appStateRef.current = nextState;
  };

  const unlock = async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled  = await LocalAuthentication.isEnrolledAsync();
      const biometricEnabled = await SecureStore.getItemAsync('biometric_enabled');

      if (biometricEnabled === 'true' && hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Unlock CryptoVault',
          fallbackLabel: 'Use PIN',
          disableDeviceFallback: false,
        });
        if (result.success) {
          setIsLocked(false);
          return true;
        }
        return false;
      }

      const pinCode = await SecureStore.getItemAsync('pin_code');
      if (!pinCode) {
        setIsLocked(false);
        return true;
      }

      return false;
    } catch {
      setIsLocked(false);
      return true;
    }
  };

  const unlockWithPin = async (pin: string): Promise<boolean> => {
    try {
      const stored = await SecureStore.getItemAsync('pin_code');
      if (stored && pin === stored) {
        setIsLocked(false);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const lockNow = () => setIsLocked(true);

  return (
    <AppLockContext.Provider
      value={{
        isLocked,
        unlock,
        unlockWithPin,
        lockNow,
        autoLockMinutes,
        setAutoLockMinutes,
      }}
    >
      {children}
    </AppLockContext.Provider>
  );
};

export const useAppLock = () => useContext(AppLockContext);
