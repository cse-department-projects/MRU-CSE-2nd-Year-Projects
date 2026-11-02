import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';
import { ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="container flex flex-col items-center justify-center" style={{ minHeight: '50vh' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '3px solid rgba(239, 68, 68, 0.2)',
          borderTopColor: '#ef4444',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Verifying security authorization...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '600px', textAlign: 'center' }}>
        <div className="glass-card" style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            padding: '16px',
            borderRadius: '50%',
            width: 'fit-content',
            margin: '0 auto 1.5rem auto'
          }}>
            <ShieldAlert size={40} color="#ef4444" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: '#ffffff' }}>
            Restricted Clearance Level
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            Your current account role (<strong>{user.role}</strong>) does not have clearance to access this sector.
          </p>
          <button
            onClick={() => window.history.back()}
            className="btn btn-outline"
            style={{ width: '100%' }}
          >
            Return to Safety
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
