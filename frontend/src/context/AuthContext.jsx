import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { getStoredToken, setStoredToken, clearStoredAuth } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const storedToken = getStoredToken();
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

      if (!storedToken) {
        if (isMounted) {
          setToken(null);
          setUser(null);
          setLoading(false);
        }
        return;
      }

      setToken(storedToken);

      // Populate cached user immediately to avoid flicker
      if (storedUser) {
        try {
          if (isMounted) setUser(JSON.parse(storedUser));
        } catch (e) {
          // ignore parse error
        }
      }

      // Validate token & fetch fresh profile from backend
      try {
        const profile = await authApi.getProfile();
        if (isMounted && profile) {
          setUser(profile);
          const storage = localStorage.getItem('accessToken') || localStorage.getItem('token')
            ? localStorage
            : sessionStorage;
          storage.setItem('user', JSON.stringify(profile));
        }
      } catch (error) {
        // If explicitly unauthorized / token invalid, clear state
        if (error.status === 401 || error.status === 403) {
          console.warn('Stored token was invalid or expired. Logging out.');
          clearStoredAuth();
          if (isMounted) {
            setToken(null);
            setUser(null);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password, rememberMe = true) => {
    const response = await authApi.login({ email, password, rememberMe });
    const jwtToken = response.token || response.accessToken;
    
    // Extract real name from response, or clean capitalized prefix from email (e.g. Mahima)
    const rawName = response.fullName || response.name;
    const cleanPrefix = email.includes('@') ? email.split('@')[0] : 'User';
    const capitalizedPrefix = cleanPrefix.charAt(0).toUpperCase() + cleanPrefix.slice(1);
    const formattedFallback = capitalizedPrefix.replace(/[._0-9]+/g, ' ').trim() || capitalizedPrefix;

    const userData = {
      id: response.id || 'user_' + Date.now(),
      fullName: rawName && rawName !== 'Alex Rivera' ? rawName : (email === 'demo@example.com' ? 'Alex Rivera' : formattedFallback),
      email: response.email || email,
      role: response.role || 'ROLE_USER',
    };

    // Save token & user in storage
    setStoredToken(jwtToken, rememberMe);
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(userData));

    // Update React state atomically
    setToken(jwtToken);
    setUser(userData);
    setLoading(false);

    return response;
  };

  const register = async (userData) => {
    const response = await authApi.register(userData);
    const jwtToken = response.token || response.accessToken;
    const userProfile = {
      id: response.id || 'user_' + Date.now(),
      fullName: userData.fullName || response.fullName || 'User',
      email: userData.email || response.email,
      role: response.role || 'ROLE_USER',
    };

    if (jwtToken) {
      setStoredToken(jwtToken, true);
      localStorage.setItem('user', JSON.stringify(userProfile));
      setToken(jwtToken);
      setUser(userProfile);
      setLoading(false);
    }

    return response;
  };

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // client logout is sufficient
    } finally {
      clearStoredAuth();
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback((updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      const storage = localStorage.getItem('accessToken') || localStorage.getItem('token')
        ? localStorage
        : sessionStorage;
      storage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token),
    login,
    register,
    logout,
    updateUser,
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
