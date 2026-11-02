import { AlertCircle, ArrowRight, Eye, EyeOff, MapPinned, Network, Route, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Button from '../components/ui/Button.jsx';
import { Field, Input } from '../components/ui/Input.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { authService } from '../services/authService.js';
import { getToken } from '../services/apiClient.js';

export default function Login() {
  const navigate = useNavigate();
  const { notify, setCurrentUser } = useApp();
  const [errors, setErrors] = useState({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (getToken() && authService.storedUser()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextErrors = {};
    const email = form.get('email')?.toString().trim();
    const password = form.get('password')?.toString();

    if (!email) nextErrors.email = 'Email or username is required.';
    if (!password) nextErrors.password = 'Password is required.';
    setErrors(nextErrors);

    if (!Object.keys(nextErrors).length) {
      setSubmitting(true);
      try {
        const user = await authService.login(email, password);
        setCurrentUser(user);
        notify('Welcome back to LogiLink.');
        navigate('/dashboard');
      } catch (error) {
        const msg = error.message || 'Unable to sign in. Please verify your credentials.';
        setErrors({ general: msg, password: msg });
        notify(msg, 'danger');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const enterDemo = async () => {
    setSubmitting(true);
    try {
      const user = await authService.demoLogin();
      setCurrentUser(user);
      notify('Welcome back to LogiLink.');
      navigate('/dashboard');
    } catch (error) {
      notify(error.message, 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <div className="login-brand">
            <div className="logo-mark"><Network size={22} /></div>
            <div className="logo-text">
              <strong>LogiLink</strong>
              <span>Transportation &amp; Logistics</span>
            </div>
          </div>

          <div className="login-intro">
            <h1>Welcome back</h1>
            <p>Access your logistics operations workspace.</p>
          </div>

          {errors.general && (
            <div className="auth-error-banner" role="alert">
              <AlertCircle size={16} />
              <span>{errors.general}</span>
            </div>
          )}

          <div className="login-form-surface">
            <div className="login-form-fields">
              <Field label="Email or username" required error={errors.email}>
                <Input name="email" type="text" placeholder="admin@logilink.edu" autoComplete="username" aria-label="Email or username" />
              </Field>
              <Field label="Password" required error={errors.password}>
                <div className="login-password-control">
                  <Input name="password" type={passwordVisible ? 'text' : 'password'} placeholder="Enter password" autoComplete="current-password" aria-label="Password" />
                  <button className="password-toggle" type="button" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={passwordVisible ? 'Hide password' : 'Show password'}>
                    {passwordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </Field>
            </div>

            <div className="login-options">
              <label className="remember-option"><input type="checkbox" name="remember" /> <span>Remember me</span></label>
              <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>

            <div className="login-actions">
              <Button type="submit" className="login-submit" disabled={submitting}>{submitting ? 'Signing in...' : 'Login'} <ArrowRight size={17} /></Button>
              <Button type="button" variant="secondary" className="login-demo" onClick={enterDemo} disabled={submitting}>Enter demo workspace</Button>
            </div>

            <div className="auth-footer-prompt">
              <span>Don't have an account?</span>
              <Link to="/register" className="auth-switch-link">Create an account</Link>
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
          <p className="login-visual-eyebrow"><Route size={15} /> Connected operations</p>
          <h2>Plan. Dispatch. Track. Deliver.</h2>
          <p>Manage orders, fleet operations, routes, and deliveries from one connected workspace.</p>
          <div className="login-features">
            <span><MapPinned size={15} /> Real-time tracking</span>
            <span><ShieldCheck size={15} /> Smart dispatch</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
