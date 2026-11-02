import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandingHeader } from '../components/BrandingHeader';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Status & Validation states
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Validate form inputs
  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setGlobalError('');

    // Email validation
    if (!email.trim()) {
      setEmailError('Please enter your email address.');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setEmailError('Please provide a valid email format (e.g. user@example.com).');
        isValid = false;
      }
    }

    // Password validation
    if (!password) {
      setPasswordError('Please enter your password.');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setGlobalError('');

    try {
      await login(email.trim(), password, rememberMe);
      setLoginSuccess(true);
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setIsLoading(false);
      if (err.status === 401 || err.message?.toLowerCase().includes('invalid') || err.message?.toLowerCase().includes('unauthorized')) {
        setGlobalError('Invalid email or password. Please check your credentials.');
      } else {
        setGlobalError(err.message || 'Unable to connect to the server. Please ensure backend is running.');
      }
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-wrapper">
        {/* Left Branding Section */}
        <BrandingHeader />

        {/* Right Login Form Section */}
        <div className="auth-form-panel">
          <div className="form-header">
            <h2>Welcome Back!</h2>
            <p>Login to continue your career journey with AI-driven insights.</p>
          </div>

          {/* Global Alert messages */}
          {globalError && (
            <div className="global-alert error">
              <AlertCircle size={18} />
              <span>{globalError}</span>
            </div>
          )}

          {loginSuccess && (
            <div className="global-alert success">
              <CheckCircle2 size={18} />
              <span>Login successful. Preparing your personalized dashboard...</span>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="email-input">
                Email Address
              </label>
              <div className="input-wrapper">
                <span className="input-icon-left">
                  <Mail size={18} />
                </span>
                <input
                  id="email-input"
                  type="email"
                  className={`input-control ${emailError ? 'error' : ''}`}
                  placeholder="Enter your email (e.g. yourname@gmail.com)"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  disabled={isLoading || loginSuccess}
                  autoComplete="email"
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

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="password-input">
                <span>Password</span>
              </label>
              <div className="input-wrapper">
                <span className="input-icon-left">
                  <Lock size={18} />
                </span>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  className={`input-control ${passwordError ? 'error' : ''}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  disabled={isLoading || loginSuccess}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-action-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordError && (
                <div className="form-error-text">
                  <AlertCircle size={13} />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>

            {/* Options Row: Remember Me & Forgot Password */}
            <div className="form-options-row">
              <label className="checkbox-label" htmlFor="remember-me-checkbox">
                <input
                  id="remember-me-checkbox"
                  type="checkbox"
                  className="checkbox-input"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading || loginSuccess}
                />
                <span>Remember Me</span>
              </label>

              <Link to="/forgot-password" style={{ fontSize: '0.85rem' }}>
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || loginSuccess}
              id="login-submit-btn"
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  <span>Logging in...</span>
                </>
              ) : loginSuccess ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>Redirecting...</span>
                </>
              ) : (
                <>
                  <span>LOGIN</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Registration Navigation Switch */}
          <div className="form-footer-switch">
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
