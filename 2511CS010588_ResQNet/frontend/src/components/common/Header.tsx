import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldAlert, 
  LogIn, 
  UserPlus, 
  LogOut, 
  User as UserIcon, 
  LayoutDashboard, 
  Radio, 
  Building2, 
  HeartPulse 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from '../notification/NotificationDropdown';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getDashboardRoute = () => {
    switch (user?.role) {
      case 'CITIZEN':
        return '/citizen';
      case 'VOLUNTEER':
        return '/volunteer';
      case 'RESCUE_TEAM':
        return '/rescue';
      case 'ADMIN':
        return '/admin';
      default:
        return '/';
    }
  };

  const dashboardRoute = getDashboardRoute();

  const isLinkActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const getLinkStyle = (isActive: boolean) => ({
    color: isActive ? '#ffffff' : 'var(--text-secondary)',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    borderRadius: '8px',
    background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
    border: isActive ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid transparent',
    transition: 'all 0.2s ease',
  });

  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'rgba(11, 15, 25, 0.92)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="container flex items-center justify-between" style={{ minHeight: '72px', padding: '0.6rem 1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
          }}>
            <ShieldAlert size={26} color="#ffffff" />
          </div>
          <div>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#ffffff' }}>
              ResQ<span style={{ color: '#ef4444' }}>Net</span>
            </span>
            <span style={{
              display: 'block',
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)'
            }}>
              Emergency Response Network
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center" style={{ fontSize: '0.9rem', fontWeight: 600, flexWrap: 'wrap', gap: '0.35rem' }}>
          <Link to="/" style={getLinkStyle(isLinkActive('/', true))}>
            Home
          </Link>
          <Link to="/disasters" style={getLinkStyle(isLinkActive('/disasters'))}>
            <Radio size={14} color={isLinkActive('/disasters') ? '#f87171' : '#ef4444'} /> Live Incidents
          </Link>
          <Link to="/shelters" style={getLinkStyle(isLinkActive('/shelters'))}>
            <Building2 size={14} color={isLinkActive('/shelters') ? '#34d399' : '#10b981'} /> Shelters
          </Link>
          <Link to="/hospitals" style={getLinkStyle(isLinkActive('/hospitals'))}>
            <HeartPulse size={14} color={isLinkActive('/hospitals') ? '#f87171' : '#ef4444'} /> Hospitals
          </Link>
          {isAuthenticated && (
            <Link to={dashboardRoute} style={getLinkStyle(isLinkActive(dashboardRoute))}>
              <LayoutDashboard size={15} color={isLinkActive(dashboardRoute) ? '#93c5fd' : '#60a5fa'} /> My Sector
            </Link>
          )}
        </nav>

        {/* Actions & Role State */}
        <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
              <NotificationDropdown />
              <Link to={dashboardRoute} style={{ textDecoration: 'none' }}>
                <div className="flex items-center gap-2" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}>
                  <UserIcon size={16} color="#9ca3af" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{user.fullName}</span>
                  <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{user.role}</span>
                </div>
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="btn btn-outline"
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
              <Link to="/login" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                <LogIn size={16} /> Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                <UserPlus size={16} /> Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
