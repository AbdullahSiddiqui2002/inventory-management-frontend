'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService, getApiBaseUrl, setApiBaseUrl } from '@/services/api';
import { ApiHealthResponse } from '@/types';

interface HealthContextType {
  health: ApiHealthResponse;
  apiUrl: string;
  isChecking: boolean;
  refreshHealth: () => Promise<void>;
  updateApiUrl: (url: string) => void;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [health, setHealth] = useState<ApiHealthResponse>({
    status: 'checking',
    latencyMs: 0,
  });
  const [apiUrl, setApiUrlState] = useState<string>('http://localhost:5000');
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const checkStatus = useCallback(async () => {
    setIsChecking(true);
    try {
      const res = await apiService.checkHealth();
      setHealth(res);
    } catch {
      setHealth({
        status: 'offline',
        latencyMs: 0,
        checkedAt: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    setApiUrlState(getApiBaseUrl());
    checkStatus();

    // Auto-poll health every 30 seconds
    const interval = setInterval(() => {
      checkStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [checkStatus]);

  const updateApiUrl = (url: string) => {
    setApiBaseUrl(url);
    setApiUrlState(url);
    setTimeout(() => {
      checkStatus();
    }, 200);
  };

  return (
    <HealthContext.Provider
      value={{
        health,
        apiUrl,
        isChecking,
        refreshHealth: checkStatus,
        updateApiUrl,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
};
