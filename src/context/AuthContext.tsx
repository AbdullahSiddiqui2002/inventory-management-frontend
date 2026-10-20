'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser } from '@/types';
import { apiService, parseErrorMessage } from '@/services/api';
import { useNotification } from './NotificationContext';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  isAdmin: boolean;
  isSupervisor: boolean;
  activeProjectId: number | null;
  selectedAdminProjectId: number | null;
  setSelectedAdminProjectId: (id: number | null) => void;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { success, error } = useNotification();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedAdminProjectId, setSelectedAdminProjectId] = useState<number | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('StockCore_Auth_User');
      if (saved) {
        setUser(JSON.parse(saved));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const authData = await apiService.login(email.trim(), pass);
      setUser(authData);
      localStorage.setItem('StockCore_Auth_User', JSON.stringify(authData));
      success('Authentication Successful', `Welcome back, ${authData.fullName}! Access granted to ${authData.role} Workspace.`);
      return true;
    } catch (err) {
      error('Access Denied', parseErrorMessage(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('StockCore_Auth_User');
    success('Session Terminated', 'You have been securely signed out.');
  };

  const isAdmin = user?.role === 'Admin';
  const isSupervisor = user?.role === 'Supervisor';

  // Active project id: for supervisor it's strictly their assignedProjectId; for Admin it's selectedAdminProjectId (or null for all)
  const activeProjectId = isSupervisor ? user?.assignedProjectId ?? null : selectedAdminProjectId;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isInitialized,
        isAdmin,
        isSupervisor,
        activeProjectId,
        selectedAdminProjectId,
        setSelectedAdminProjectId,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
