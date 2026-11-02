import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  MapPinned,
  Network,
  Route,
  ShieldCheck,
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Button from '../components/ui/Button.jsx';
import { Field, Input } from '../components/ui/Input.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { authService } from '../services/authService.js';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() || '';

  const { notify } = useApp();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [verifying, setVerifying] = useState(true);
  const [tokenStatus, setTokenStatus] = useState({ valid: false, message: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setTokenStatus({
        valid: false,
        message: 'No password reset token was provided. Please check the link from your email or request a new one.',
      });
      return;
    }

    let isMounted = true;
    authService
      .verifyResetToken(token)
      .then((res) => {
        if (isMounted) {
          setTokenStatus(res);
          setVerifying(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setTokenStatus({
            valid: false,
            message: err.message || 'The password reset link is invalid or has expired.',
          });
          setVerifying(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!newPassword) {
      nextErrors.newPassword = 'New password is required.';
    } else if (newPassword.length < 6) {
      nextErrors.newPassword = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your new password.';
    } else if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setSubmitting(true);
      try {
        const result = await authService.resetPassword(token, newPassword);
        setResetComplete(true);
        notify(result.message || 'Password successfully reset.');
      } catch (error) {
        const msg = error.message || 'Unable to reset password. The link may have expired or was already used.';
        setErrors({ general: msg });
        notify(msg, 'danger');
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="login-page">
      <section className="login-panel">
        <div className="login-card">
          <div className="login-brand">
            <div className="logo-mark"><Network size={22} /></div>
            <div className="logo-text">
              <strong>LogiLink</strong>
              <span>Transportation &amp; Logistics</span>
            </div>
          </div>

          <div className="login-intro">
            <h1>Create new password</h1>
            <p>
              {tokenStatus.email
                ? `Enter a strong new password for ${tokenStatus.email}`
                : 'Set a secure new password for your account.'}
            </p>
          </div>

          {errors.general && (
            <div className="auth-error-banner" role="alert">
              <AlertCircle size={16} />
              <span>{errors.general}</span>
            </div>
          )}

          <div className="login-form-surface">
            {verifying ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: '#64748b' }}>
                <p style={{ margin: 0, fontSize: '0.94rem' }}>Verifying reset link security...</p>
              </div>
            ) : resetComplete ? (
              <div className="reset-success-flow">
                <div className="auth-success-banner" role="status">
                  <CheckCircle2 size={18} />
                  <div>
                    <strong>Password reset successful!</strong>
                    <p style={{ margin: '4px 0 0', color: '#14532d' }}>
                      Your password has been successfully updated. You can now use your new credentials to sign into LogiLink.
                    </p>
                  </div>
                </div>

                <div className="login-actions" style={{ marginTop: '24px' }}>
                  <Button
                    type="button"
                    className="login-submit"
                    onClick={() => navigate('/login')}
                  >
                    Go to Login <ArrowRight size={17} />
                  </Button>
                </div>
              </div>
            ) : !tokenStatus.valid ? (
              <div className="token-invalid-flow">
                <div className="auth-error-banner" role="alert" style={{ marginBottom: '20px' }}>
                  <AlertCircle size={18} />
                  <div>
                    <strong>Reset link unavailable</strong>
                    <p style={{ margin: '4px 0 0', color: '#9f1239' }}>
                      {tokenStatus.message || 'This reset link is either invalid, already used, or expired.'}
                    </p>
                  </div>
                </div>

                <div className="login-actions">
                  <Link to="/forgot-password" style={{ width: '100%' }}>
                    <Button type="button" className="login-submit" style={{ width: '100%' }}>
                      Request a new reset link <ArrowRight size={17} />
                    </Button>
                  </Link>
                  <Link to="/login" style={{ width: '100%' }}>
                    <Button type="button" variant="secondary" className="login-demo" style={{ width: '100%' }}>
                      Return to sign in
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="login-form-fields">
                  <Field label="New password" required error={errors.newPassword}>
                    <div className="login-password-control">
                      <Input
                        name="newPassword"
                        type={passwordVisible ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        autoComplete="new-password"
                        autoFocus
                        aria-label="New password"
                      />
                      <button
                        className="password-toggle"
                        type="button"
                        onClick={() => setPasswordVisible((v) => !v)}
                        aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                      >
                        {passwordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </Field>

                  <Field label="Confirm new password" required error={errors.confirmPassword}>
                    <div className="login-password-control">
                      <Input
                        name="confirmPassword"
                        type={confirmPasswordVisible ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        autoComplete="new-password"
                        aria-label="Confirm new password"
                      />
                      <button
                        className="password-toggle"
                        type="button"
                        onClick={() => setConfirmPasswordVisible((v) => !v)}
                        aria-label={confirmPasswordVisible ? 'Hide password' : 'Show password'}
                      >
                        {confirmPasswordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </Field>
                </div>

                <div className="login-actions" style={{ marginTop: '22px' }}>
                  <Button type="submit" className="login-submit" disabled={submitting}>
                    {submitting ? 'Updating password...' : 'Update password'} <ArrowRight size={17} />
                  </Button>
                </div>

                <div className="auth-footer-prompt">
                  <span>Cancel and return to</span>
                  <Link to="/login" className="auth-switch-link">Sign in</Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <aside className="login-visual" aria-label="Logistics operations overview">
        <div className="logistics-visual-grid" aria-hidden="true">
          <span className="visual-route visual-route-one" />
          <span className="visual-route visual-route-two" />
          <span className="visual-route visual-route-three" />
          <span className="visual-node visual-node-one" />
          <span className="visual-node visual-node-two" />
          <span className="visual-node visual-node-three" />
          <span className="visual-node visual-node-four" />
        </div>
        <div className="login-visual-content">
          <p className="login-visual-eyebrow"><Route size={15} /> Account Security</p>
          <h2>Safeguard your supply chain.</h2>
          <p>Strong passwords protect your fleet dispatch, shipment tracking, and warehouse operations from unauthorized changes.</p>
          <div className="login-features">
            <span><ShieldCheck size={15} /> BCrypt hashing</span>
            <span><Lock size={15} /> One-time token</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
