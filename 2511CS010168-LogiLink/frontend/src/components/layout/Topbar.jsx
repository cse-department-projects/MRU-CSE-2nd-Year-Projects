import { Link, useLocation } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, SlidersHorizontal, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useApp } from '../../contexts/AppContext.jsx';
import { notificationService } from '../../services/notificationService.js';

const titles = {
  dashboard: 'Dashboard',
  orders: 'Orders',
  shipments: 'Shipments',
  fleet: 'Fleet',
  vehicles: 'Vehicles',
  drivers: 'Drivers',
  routes: 'Routes',
  tracking: 'Live Tracking',
  warehouse: 'Warehouse',
  inventory: 'Inventory',
  analytics: 'Analytics',
  reports: 'Reports',
  'activity-logs': 'Activity Logs',
  notifications: 'Notifications',
  settings: 'Settings',
};

export default function Topbar() {
  const { setMobileMenuOpen, currentUser, notify, signOut, unreadNotificationsCount, refreshUnreadCount } = useApp();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const segment = location.pathname.split('/').filter(Boolean)[0] || 'dashboard';
  const title = titles[segment] || 'Operations';

  useEffect(() => {
    refreshUnreadCount?.();
  }, [location.pathname, refreshUnreadCount]);

  const initials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const roleDisplay = currentUser?.organizationName
    ? `${currentUser.organizationName} • ${currentUser.role || 'Member'}`
    : currentUser?.role || 'Member';

  return (
    <header className="topbar">
      <button className="mobile-menu-button" type="button" aria-label="Open navigation" onClick={() => setMobileMenuOpen(true)}>
        <Menu size={20} />
      </button>
      <div className="page-title">
        <div className="breadcrumb">LogiLink / {title}</div>
        <h1>{title}</h1>
      </div>
      <div className="global-search">
        <Search size={18} />
        <input aria-label="Global search" placeholder="Search orders, vehicles, drivers, routes..." />
      </div>
      <div className="topbar-actions">
        <Link className="icon-button" to="/settings#appearance" aria-label="Preferences">
          <SlidersHorizontal size={18} />
        </Link>
        <Link className="icon-button" to="/notifications" aria-label="Notifications">
          <Bell size={18} />
          {unreadNotificationsCount > 0 && (
            <span className="topbar-unread-badge">
              {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
            </span>
          )}
        </Link>
        <div className="profile-menu">
          <button className="profile-trigger" type="button" onClick={() => setOpen(!open)} aria-expanded={open}>
            <span className="avatar">{initials}</span>
            <span className="profile-copy">
              <strong>{currentUser?.name || 'User'}</strong>
              <span>{roleDisplay}</span>
            </span>
            <ChevronDown size={16} />
          </button>
          {open && (
            <div className="dropdown-menu">
              <Link to="/settings#profile" onClick={() => setOpen(false)}><User size={16} /> Profile</Link>
              <Link to="/settings#security" onClick={() => setOpen(false)}><Settings size={16} /> Account settings</Link>
              <Link to="/settings#appearance" onClick={() => setOpen(false)}>
                <SlidersHorizontal size={16} /> Preferences
              </Link>
              <Link to="/login" onClick={() => { signOut(); setOpen(false); }}><LogOut size={16} /> Logout</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
