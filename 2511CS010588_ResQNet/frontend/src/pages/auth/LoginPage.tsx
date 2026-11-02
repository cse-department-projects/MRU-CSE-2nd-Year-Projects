import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldAlert, LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/auth.service';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { loginWithAuthResponse } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const isExpired = searchParams.get('expired') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const authData = await authService.login({ email, password });
      loginWithAuthResponse(authData);

      if (redirectPath) {
        // If redirect targets citizen sector but user does not have CITIZEN/ADMIN clearance, route safely to their dashboard
        if (redirectPath.startsWith('/citizen') && authData.role !== 'CITIZEN' && authData.role !== 'ADMIN') {
          switch (authData.role) {
            case 'VOLUNTEER':
              navigate('/volunteer');
              break;
            case 'RESCUE_TEAM':
              navigate('/rescue');
              break;
            default:
              navigate('/');
          }
        } else {
          navigate(redirectPath);
        }
      } else {
        // Redirect to appropriate dashboard based on role
        switch (authData.role) {
          case 'CITIZEN':
            navigate('/citizen');
            break;
          case 'VOLUNTEER':
            navigate('/volunteer');
            break;
          case 'RESCUE_TEAM':
            navigate('/rescue');
            break;
          case 'ADMIN':
            navigate('/admin');
            break;
          default:
            navigate('/');
        }
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 401) {
        setError('Invalid email or password. Please check your credentials.');
      } else {
        setError('Failed to connect to ResQNet server. Please ensure the backend is running.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center" style={{ minHeight: '75vh' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        {/* Header Icon */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '14px',
            borderRadius: '16px',
            width: 'fit-content',
            margin: '0 auto 1rem auto'
          }}>
            <ShieldAlert size={32} color="#ef4444" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
            Responder Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Sign in to access your emergency operations sector
          </p>
        </div>

        {/* Session Expired Notice */}
        {isExpired && !error && (
          <div style={{
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            borderRadius: '8px',
            padding: '0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            color: '#93c5fd',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={18} color="#60a5fa" style={{ flexShrink: 0 }} />
            <span>Your session has expired. Please sign in again to continue.</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '8px',
            padding: '0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            color: '#fca5a5',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={18} color="#6b7280" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@emergency.org"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.925rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={18} color="#6b7280" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '0.925rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <LogIn size={18} /> Sign In
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Need an account?{' '}
            <Link to="/register" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>
              Register as Citizen / Responder
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
