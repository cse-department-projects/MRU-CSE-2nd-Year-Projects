import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { BrandingHeader } from '../components/BrandingHeader';
import { Mail, ArrowLeft, Send, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [devToken, setDevToken] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setEmailError('');
    setSuccessMsg('');
    setDevToken('');

    if (!email.trim()) {
      setEmailError('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.forgotPassword(email.trim());
      setSuccessMsg(response.message || 'Password reset instructions sent.');
      if (response.data) {
        // Dev mode token returned for instant verification
        setDevToken(response.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to request password reset. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-wrapper">
        <BrandingHeader />

        <div className="auth-form-panel">
          <div className="form-header">
            <h2>Forgot Password?</h2>
            <p>Enter your registered email address and we'll send you a password reset link.</p>
          </div>

          {errorMsg && (
            <div className="global-alert error">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="global-alert success">
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="forgot-email-input">
                Email Address
              </label>
              <div className="input-wrapper">
                <span className="input-icon-left">
                  <Mail size={18} />
                </span>
                <input
                  id="forgot-email-input"
                  type="email"
                  className={`input-control ${emailError ? 'error' : ''}`}
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              {emailError && (
                <div className="form-error-text">
                  <AlertCircle size={13} />
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ marginTop: '0.5rem' }}
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>

          {/* Dev-Mode Reset Helper Link */}
          {devToken && (
            <div className="demo-credentials-box" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                <KeyRound size={15} />
                <span>Development Reset Link:</span>
              </div>
              <Link
                to={`/reset-password?token=${devToken}`}
                style={{
                  color: 'var(--primary-100)',
                  background: 'rgba(99, 102, 241, 0.25)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  wordBreak: 'break-all'
                }}
              >
                Click here to reset password with generated token →
              </Link>
            </div>
          )}

          <div className="form-footer-switch">
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
