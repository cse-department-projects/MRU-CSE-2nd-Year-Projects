import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { BrandingHeader } from '../components/BrandingHeader';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!token.trim()) {
      errs.token = 'Reset token is required.';
    }
    if (!newPassword) {
      errs.newPassword = 'Please enter a new password.';
    } else if (newPassword.length < 6) {
      errs.newPassword = 'Password must be at least 6 characters long.';
    }
    if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await authApi.resetPassword({
        token: token.trim(),
        newPassword,
      });
      setSuccessMsg(response.message || 'Password reset successfully!');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Password reset failed. Token may have expired.');
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
            <h2>Reset Password</h2>
            <p>Enter your new password below to regain access to your account.</p>
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
              <span>{successMsg} Redirecting to login...</span>
            </div>
          )}

          <form onSubmit={handleReset} noValidate>
            {/* Token field */}
            <div className="form-group">
              <label className="form-label" htmlFor="token-input">Reset Token</label>
              <div className="input-wrapper">
                <input
                  id="token-input"
                  type="text"
                  className={`input-control ${validationErrors.token ? 'error' : ''}`}
                  style={{ paddingLeft: '1rem' }}
                  placeholder="Paste your reset token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={isLoading || !!successMsg}
                />
              </div>
              {validationErrors.token && (
                <div className="form-error-text">
                  <AlertCircle size={13} />
                  <span>{validationErrors.token}</span>
                </div>
              )}
            </div>

            {/* New Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="new-pass-input">New Password</label>
              <div className="input-wrapper">
                <span className="input-icon-left"><Lock size={18} /></span>
                <input
                  id="new-pass-input"
                  type={showPassword ? 'text' : 'password'}
                  className={`input-control ${validationErrors.newPassword ? 'error' : ''}`}
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading || !!successMsg}
                />
                <button
                  type="button"
                  className="input-action-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {validationErrors.newPassword && (
                <div className="form-error-text">
                  <AlertCircle size={13} />
                  <span>{validationErrors.newPassword}</span>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="confirm-new-pass-input">Confirm New Password</label>
              <div className="input-wrapper">
                <span className="input-icon-left"><Lock size={18} /></span>
                <input
                  id="confirm-new-pass-input"
                  type={showPassword ? 'text' : 'password'}
                  className={`input-control ${validationErrors.confirmPassword ? 'error' : ''}`}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading || !!successMsg}
                />
              </div>
              {validationErrors.confirmPassword && (
                <div className="form-error-text">
                  <AlertCircle size={13} />
                  <span>{validationErrors.confirmPassword}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || !!successMsg}
              style={{ marginTop: '0.75rem' }}
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Set New Password</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="form-footer-switch">
            Remember your credentials?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
