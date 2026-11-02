import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { notificationService } from '../services/notificationService.js';
import { settingsService } from '../services/settingsService.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('Light');
  const [density, setDensity] = useState(() => window.localStorage.getItem('logilink_density') || 'Default');
  const [toast, setToast] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => authService.storedUser());
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const applyTheme = useCallback(() => {
    setTheme('Light');
    try {
      window.localStorage.setItem('logilink_theme', 'Light');
    } catch {}
    document.documentElement.setAttribute('data-theme', 'light');
    if (document.body) {
      document.body.setAttribute('data-theme', 'light');
    }
  }, []);

  const applyDensity = useCallback((densityValue) => {
    setDensity(densityValue);
    try {
      window.localStorage.setItem('logilink_density', densityValue);
    } catch {}
    const val = (densityValue || 'default').toLowerCase();
    document.documentElement.setAttribute('data-density', val);
    if (document.body) {
      document.body.setAttribute('data-density', val);
    }
  }, []);

  // Initialize theme and density on mount
  useEffect(() => {
    applyTheme();
    applyDensity(density);
  }, [density, applyTheme, applyDensity]);

  const refreshUnreadCount = useCallback(async () => {
    try {
      if (!authService.storedUser()) {
        setUnreadNotificationsCount(0);
        return;
      }
      const res = await notificationService.getUnreadCount();
      if (res && typeof res.unreadCount === 'number') {
        setUnreadNotificationsCount(res.unreadCount);
      }
    } catch {
      // Ignore network errors when polling
    }
  }, []);

  // Sync user and preferences on startup
  useEffect(() => {
    if (authService.storedUser()) {
      authService.currentUser().then((user) => {
        if (user) {
          setCurrentUser(user);
          refreshUnreadCount();
          // Fetch user preferences
          settingsService.getSettings().then((s) => {
            if (s?.appearance?.density) applyDensity(s.appearance.density);
          }).catch(() => {});
        } else {
          setCurrentUser(null);
          setUnreadNotificationsCount(0);
        }
      });
    }
  }, [refreshUnreadCount, applyTheme, applyDensity]);

  useEffect(() => {
    if (currentUser) {
      refreshUnreadCount();
      const interval = setInterval(refreshUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser, refreshUnreadCount]);

  const notify = (message, variant = 'success') => {
    setToast({ message, variant });
    window.setTimeout(() => setToast(null), 2800);
  };

  const signOut = () => {
    authService.logout();
    setCurrentUser(null);
    setUnreadNotificationsCount(0);
  };

  const value = useMemo(
    () => ({
      sidebarCollapsed,
      setSidebarCollapsed,
      mobileMenuOpen,
      setMobileMenuOpen,
      theme,
      setTheme: applyTheme,
      density,
      setDensity: applyDensity,
      applyTheme,
      applyDensity,
      toast,
      notify,
      currentUser,
      setCurrentUser,
      signOut,
      unreadNotificationsCount,
      setUnreadNotificationsCount,
      refreshUnreadCount,
    }),
    [sidebarCollapsed, mobileMenuOpen, theme, density, applyTheme, applyDensity, toast, currentUser, unreadNotificationsCount, refreshUnreadCount]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return context;
}
