import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass } from 'lucide-react';

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main, #0B0F19)',
        color: 'var(--text-main, #f8fafc)',
        gap: '1.25rem',
        padding: '2rem'
      }}>
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, var(--primary-500, #6366f1), var(--accent-cyan, #06b6d4))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)',
          animation: 'pulse 2s infinite'
        }}>
          <Compass size={28} color="white" />
        </div>

        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, margin: '0 0 0.3rem' }}>
            Smart Career Guidance System
          </h3>
          <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.85rem', margin: 0 }}>
            Initializing application...
          </p>
        </div>

        <div className="spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
      </div>
    );
  }

  if (isAuthenticated) {
    const destination = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={destination} replace />;
  }

  return children;
};
