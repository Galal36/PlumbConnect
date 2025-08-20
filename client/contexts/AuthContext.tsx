import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { useAuth } from '@/hooks/useAuth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isPlumber: boolean;
  isUser: boolean;
  isAdmin: boolean;
  login: (userData: User) => void;
  logout: () => void;
  switchToPlumberAccount: () => void;
  switchToUserAccount: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, isAuthenticated, isLoading, login: authLogin, logout: authLogout, isPlumber, isUser, isAdmin, switchToPlumberAccount, switchToUserAccount } = useAuth();

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isPlumber,
    isUser,
    isAdmin,
    login: authLogin,
    logout: authLogout,
    switchToPlumberAccount,
    switchToUserAccount,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
