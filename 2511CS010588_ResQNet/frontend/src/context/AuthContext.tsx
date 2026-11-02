import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Role, AuthResponse } from '../types';
import authService from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithAuthResponse: (authData: AuthResponse) => void;
  setUserProfile: (user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('resqnet_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('resqnet_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loginWithAuthResponse = (authData: AuthResponse) => {
    localStorage.setItem('resqnet_token', authData.token);
    const userObj: User = {
      id: authData.id,
      email: authData.email,
      fullName: authData.fullName,
      role: authData.role,
      isActive: true,
      roleProfile: authData.profile as any,
    };
    localStorage.setItem('resqnet_user', JSON.stringify(userObj));
    setToken(authData.token);
    setUser(userObj);
  };

  const setUserProfile = (updatedUser: User) => {
    localStorage.setItem('resqnet_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem('resqnet_token');
    localStorage.removeItem('resqnet_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      localStorage.setItem('resqnet_user', JSON.stringify(currentUser));
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const value: AuthContextType = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    isLoading,
    loginWithAuthResponse,
    setUserProfile,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
