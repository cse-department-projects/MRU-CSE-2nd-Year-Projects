import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  MapPinned,
  Network,
  Route,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Button from '../components/ui/Button.jsx';
import { Field, Input } from '../components/ui/Input.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { authService } from '../services/authService.js';
import { getToken } from '../services/apiClient.js';

export default function Register() {
  const navigate = useNavigate();
  const { notify, setCurrentUser } = useApp();

  const [accountType, setAccountType] = useState('INDIVIDUAL'); // 'INDIVIDUAL' | 'COMPANY'
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (getToken() && authService.storedUser()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextErrors = {};

    const name = form.get('name')?.toString().trim() || '';
    const email = form.get('email')?.toString().trim() || '';
    const password = form.get('password')?.toString() || '';
    const organizationName = form.get('organizationName')?.toString().trim() || '';
    const organizationCode = form.get('organizationCode')?.toString().trim().toUpperCase() || '';

    if (!name) nextErrors.name = 'Full name is required.';
    if (!email) {
      nextErrors.email = 'Work email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }

    if (accountType === 'COMPANY' && !organizationName) {
      nextErrors.organizationName = 'Company / organization name is required.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setSubmitting(true);
      try {
        const payload = {
          name,
          email,
          password,
          role: 'ADMIN',
          organizationType: accountType,
          organizationName: accountType === 'COMPANY' ? organizationName : undefined,
          organizationCode: accountType === 'COMPANY' && organizationCode ? organizationCode : undefined,
        };

        const user = await authService.register(payload);
        setCurrentUser(user);
        notify(
          accountType === 'COMPANY'
            ? `Welcome to LogiLink! Organization "${user.organizationName || organizationName}" registered.`
            : 'Welcome to LogiLink! Your individual workspace has been created.'
        );
        navigate('/dashboard');
      } catch (error) {
        const message = error.message || 'Registration could not be completed.';
        const fieldErrors = error.validation || {};
        if (message.toLowerCase().includes('already registered')) {
          fieldErrors.email = 'This email is already registered. Please log in instead.';
        }
        setErrors({ ...fieldErrors, general: message });
        notify(message, 'danger');
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="login-page">
      <section className="login-panel">
        <form className="login-card register-card" onSubmit={submit} noValidate>
          <div className="login-brand">
            <div className="logo-mark">
              <Network size={22} />
            </div>
            <div className="logo-text">
              <strong>LogiLink</strong>
              <span>Transportation &amp; Logistics</span>
            </div>
          </div>

          <div className="login-intro">
            <h1>Create your account</h1>
            <p>Start managing your logistics operations with full workspace isolation.</p>
          </div>

          {errors.general && (
            <div className="auth-error-banner" role="alert">
              <AlertCircle size={16} />
              <span>{errors.general}</span>
            </div>
          )}

          <div className="login-form-surface">
            {/* Account Type Selector */}
            <div className="account-type-section">
              <span className="account-type-label">Select Workspace Type</span>
              <div className="account-type-grid" role="radiogroup" aria-label="Account Type">
                <button
                  type="button"
                  role="radio"
                  aria-checked={accountType === 'INDIVIDUAL'}
                  className={`account-type-option ${accountType === 'INDIVIDUAL' ? 'selected' : ''}`}
                  onClick={() => {
                    setAccountType('INDIVIDUAL');
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.organizationName;
                      return next;
                    });
                  }}
                >
                  <div className="option-header">
                    <User size={18} className="option-icon" />
                    <strong>Individual</strong>
                  </div>
                  <span className="option-desc">Private workspace for solo dispatchers or single operators</span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={accountType === 'COMPANY'}
                  className={`account-type-option ${accountType === 'COMPANY' ? 'selected' : ''}`}
                  onClick={() => setAccountType('COMPANY')}
                >
                  <div className="option-header">
                    <Building2 size={18} className="option-icon" />
                    <strong>Company</strong>
                  </div>
                  <span className="option-desc">Multi-user organization for logistics teams &amp; fleet owners</span>
                </button>
              </div>
            </div>

            <div className="login-form-fields">
              <Field label="Full Name" required error={errors.name}>
                <Input
                  name="name"
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  autoComplete="name"
                  aria-label="Full Name"
                />
              </Field>

              <Field label="Work Email" required error={errors.email}>
                <Input
                  name="email"
                  type="email"
                  placeholder="alex.morgan@company.com"
                  autoComplete="email"
                  aria-label="Work Email"
                />
              </Field>

              <Field label="Password" required error={errors.password}>
                <div className="login-password-control">
                  <Input
                    name="password"
                    type={passwordVisible ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    aria-label="Password"
                  />
                  <button
                    className="password-toggle"
                    type="button"
                    onClick={() => setPasswordVisible((visible) => !visible)}
                    aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                  >
                    {passwordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </Field>

              {accountType === 'COMPANY' && (
                <>
                  <Field label="Company / Organization Name" required error={errors.organizationName}>
                    <Input
                      name="organizationName"
                      type="text"
                      placeholder="e.g. Apex Freight Logistics"
                      aria-label="Company or Organization Name"
                    />
                  </Field>

                  <Field label="Organization Code (Optional)" error={errors.organizationCode}>
                    <Input
                      name="organizationCode"
                      type="text"
                      placeholder="e.g. APEX-LOGI (auto-generated if empty)"
                      aria-label="Organization Code"
                    />
                  </Field>
                </>
              )}

              {accountType === 'INDIVIDUAL' && (
                <div className="workspace-hint">
                  <CheckCircle2 size={15} color="#2563eb" />
                  <span>A private, secure workspace will be automatically created for your operations.</span>
                </div>
              )}
            </div>

            <div className="login-actions" style={{ marginTop: '20px' }}>
              <Button type="submit" className="login-submit" disabled={submitting}>
                {submitting ? 'Creating workspace...' : 'Create Account & Workspace'}{' '}
                <ArrowRight size={17} />
              </Button>
            </div>

            <div className="auth-footer-prompt">
              <span>Already have an account?</span>
              <Link to="/login" className="auth-switch-link">
                Sign in
              </Link>
            </div>
          </div>
        </form>
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
          <p className="login-visual-eyebrow">
            <Route size={15} /> Built for Logistics Teams
          </p>
          <h2>Dedicated isolation. Effortless control.</h2>
          <p>
            Whether you run a solo dispatch desk or a multi-depot carrier fleet, LogiLink provides
            clean organization boundaries, live operational visibility, and seamless dispatching.
          </p>
          <div className="login-features">
            <span>
              <ShieldCheck size={15} /> Tenant-isolated workspace
            </span>
            <span>
              <MapPinned size={15} /> Real-time tracking &amp; routes
            </span>
            <span>
              <CheckCircle2 size={15} /> Instant command center
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
