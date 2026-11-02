import React from 'react';
import { AlertCircle, RefreshCw, LogOut, Database, Server } from 'lucide-react';
import { Navbar } from '../Navbar';
import { useAuth } from '../../context/AuthContext';

export const DashboardErrorState = ({ onRetry, errorMessage }) => {
  const { logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main, #0B0F19)' }}>
      <Navbar />

      <div className="dashboard-container" style={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
          border: '1px solid rgba(244, 63, 94, 0.4)',
          borderRadius: 'var(--radius-xl, 24px)',
          padding: '2.5rem',
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: 'var(--accent-rose, #f43f5e)'
          }}>
            <AlertCircle size={32} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main, #f8fafc)' }}>
            Unable to load your dashboard
          </h2>
          <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.92rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            Please check that the Spring Boot backend server and MongoDB database are running properly.
          </p>

          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '1rem',
            borderRadius: '10px',
            fontSize: '0.82rem',
            color: 'var(--text-muted, #94a3b8)',
            textAlign: 'left',
            marginBottom: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server size={15} color="var(--primary-400, #818cf8)" />
              <span>Backend: <strong>Spring Boot (Port 8080)</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={15} color="var(--accent-cyan, #06b6d4)" />
              <span>Database: <strong>MongoDB (Port 27017)</strong></span>
            </div>
            {errorMessage && (
              <div style={{ color: '#fca5a5', marginTop: '0.25rem', fontSize: '0.78rem' }}>
                Details: {errorMessage}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onRetry}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.7rem 1.5rem',
                background: 'var(--primary-600, #4f46e5)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md, 10px)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            >
              <RefreshCw size={16} />
              <span>Retry</span>
            </button>

            <button
              onClick={logout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.7rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-main, #f8fafc)',
                border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
                borderRadius: 'var(--radius-md, 10px)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
