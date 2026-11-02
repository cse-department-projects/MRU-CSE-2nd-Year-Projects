import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  Info,
  Mail,
  MapPinned,
  Network,
  Route,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import Button from '../components/ui/Button.jsx';
import { Field, Input } from '../components/ui/Input.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { authService } from '../services/authService.js';

export default function ForgotPassword() {
  const { notify } = useApp();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submittedData, setSubmittedData] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextErrors.email = 'Registered email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setSubmitting(true);
      try {
        const response = await authService.forgotPassword(trimmedEmail);
        setSubmittedData({
          email: trimmedEmail,
          ...response,
        });

        if (response.emailSent) {
          notify('Password reset email dispatched successfully.');
        } else {
          notify(response.message || 'Password reset request generated.');
        }
      } catch (error) {
        const message = error.message || 'Unable to process password reset request. Please try again.';
        setErrors({ general: message });
        notify(message, 'danger');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const copyResetLink = () => {
    if (submittedData?.resetUrl) {
      navigator.clipboard.writeText(submittedData.resetUrl).then(() => {
        setCopied(true);
        notify('Reset link copied to clipboard.');
        setTimeout(() => setCopied(false), 2500);
      });
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
            <h1>Reset your password</h1>
            <p>
              {submittedData
                ? 'Review your reset request details below.'
                : "Enter your registered email address and we'll generate password recovery instructions."}
            </p>
          </div>

          {errors.general && (
            <div className="auth-error-banner" role="alert">
              <AlertCircle size={16} />
              <span>{errors.general}</span>
            </div>
          )}

          <div className="login-form-surface">
            {submittedData ? (
              <div className="forgot-submitted-flow">
                {submittedData.emailSent ? (
                  <div className="auth-success-banner" role="status">
                    <CheckCircle2 size={18} />
                    <div>
                      <strong>Reset link sent!</strong>
                      <p style={{ margin: '4px 0 0', color: '#14532d' }}>
                        Password reset instructions have been dispatched to <strong>{submittedData.email}</strong>.
                        Please check your inbox and spam folder. The link will expire in 15 minutes.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="auth-info-banner" role="status">
                      <Info size={18} />
                      <div>
                        <strong>Reset instructions generated</strong>
                        <p style={{ margin: '4px 0 0', color: '#075985' }}>
                          {submittedData.message || 'If an account exists with that email address, password reset instructions have been generated.'}
                        </p>
                      </div>
                    </div>

                    {submittedData.devMode && submittedData.resetUrl && (
                      <div className="auth-dev-box">
                        <div className="auth-dev-box-header">
                          <span>Local Development Link</span>
                          <span className="auth-dev-box-badge">Dev Mode</span>
                        </div>
                        <p style={{ margin: '0 0 10px', color: '#64748b', fontSize: '0.78rem' }}>
                          SMTP is not configured in this environment. Use the generated development link below to test the reset flow:
                        </p>
                        <a
                          href={submittedData.resetUrl}
                          className="auth-dev-box-link"
                          title="Open Password Reset Page"
                        >
                          {submittedData.resetUrl}
                        </a>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={copyResetLink}
                            style={{ flex: 1, minHeight: '38px', fontSize: '0.8rem' }}
                          >
                            <Copy size={14} /> {copied ? 'Copied!' : 'Copy link'}
                          </Button>
                          <Link
                            to={`/reset-password?token=${encodeURIComponent(submittedData.resetToken)}`}
                            style={{ flex: 1 }}
                          >
                            <Button
                              type="button"
                              style={{ width: '100%', minHeight: '38px', fontSize: '0.8rem' }}
                            >
                              Open reset page <ExternalLink size={14} />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="login-actions" style={{ marginTop: '20px' }}>
                  <Button
                    type="button"
                    variant="secondary"
                    className="login-demo"
                    onClick={() => {
                      setSubmittedData(null);
                      setErrors({});
                    }}
                  >
                    Request another reset link
                  </Button>
                </div>

                <div className="auth-footer-prompt">
                  <Link to="/login" className="auth-switch-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <ArrowLeft size={15} /> Return to sign in
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="login-form-fields">
                  <Field label="Registered work email" required error={errors.email}>
                    <Input
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@logilink.edu"
                      autoComplete="email"
                      autoFocus
                      aria-label="Registered work email"
                    />
                  </Field>
                </div>

                <div className="login-actions" style={{ marginTop: '20px' }}>
                  <Button type="submit" className="login-submit" disabled={submitting}>
                    {submitting ? 'Generating instructions...' : 'Send reset link'} <ArrowRight size={17} />
                  </Button>
                </div>

                <div className="auth-footer-prompt">
                  <span>Remember your password?</span>
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
          <p className="login-visual-eyebrow"><Route size={15} /> Secure Account Recovery</p>
          <h2>Protected access to your fleet.</h2>
          <p>Secure password recovery ensures your logistics dispatching and operations remain safe at all times.</p>
          <div className="login-features">
            <span><ShieldCheck size={15} /> Encrypted tokens</span>
            <span><Mail size={15} /> Safe recovery</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
