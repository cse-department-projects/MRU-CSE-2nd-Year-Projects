import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { Settings, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Shield, Bell, LogOut, KeyRound } from 'lucide-react';

export const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  // Notification states
  const [notifications, setNotifications] = useState({
    careerAlerts: true,
    jobMatches: true,
    skillReminders: false,
  });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassSuccess('');
    setPassError('');

    if (!currentPassword) {
      setPassError('Please enter your current password.');
      return;
    }
    if (!newPassword) {
      setPassError('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    setIsChangingPass(true);

    try {
      const res = await authApi.changePassword({
        currentPassword,
        newPassword
      });
      setPassSuccess(res.message || 'Password updated successfully in MongoDB!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(''), 4000);
    } catch (err) {
      setPassError(err.message || 'Failed to update password. Verify current credentials.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />

      <div className="dashboard-container">
        {/* Header */}
        <section className="dashboard-hero" style={{ padding: '2.25rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <Settings size={16} />
            <span>Account Security & Preferences</span>
          </div>
          <h1>System Settings & Account Management</h1>
          <p>
            Update your authentication credentials, configure job alert notification settings, and manage active session security.
          </p>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Security & Password Change */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-400)' }}>
              <KeyRound size={20} />
              <span>Change Account Password</span>
            </h3>

            {passSuccess && (
              <div className="global-alert success">
                <CheckCircle2 size={18} />
                <span>{passSuccess}</span>
              </div>
            )}

            {passError && (
              <div className="global-alert error">
                <AlertCircle size={18} />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <div className="input-wrapper">
                  <span className="input-icon-left"><Lock size={17} /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-control"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isChangingPass}
                  />
                  <button
                    type="button"
                    className="input-action-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-wrapper">
                  <span className="input-icon-left"><Lock size={17} /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-control"
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isChangingPass}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div className="input-wrapper">
                  <span className="input-icon-left"><Lock size={17} /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-control"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isChangingPass}
                  />
                </div>
              </div>

              <button type="submit" disabled={isChangingPass} className="btn-primary" style={{ marginTop: '0.75rem' }}>
                {isChangingPass ? (
                  <>
                    <div className="spinner" />
                    <span>Updating Password in MongoDB...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          </div>

          {/* Notifications & Session Control */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Notifications */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)' }}>
                <Bell size={20} />
                <span>Alerts & Notifications</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label className="checkbox-label" style={{ justifyContent: 'space-between', width: '100%' }}>
                  <span>Career Roadmap Milestone Notifications</span>
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={notifications.careerAlerts}
                    onChange={(e) => setNotifications({ ...notifications, careerAlerts: e.target.checked })}
                  />
                </label>

                <label className="checkbox-label" style={{ justifyContent: 'space-between', width: '100%' }}>
                  <span>High-Match Job & Internship Alerts (85%+)</span>
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={notifications.jobMatches}
                    onChange={(e) => setNotifications({ ...notifications, jobMatches: e.target.checked })}
                  />
                </label>

                <label className="checkbox-label" style={{ justifyContent: 'space-between', width: '100%' }}>
                  <span>Weekly Skill Gap Study Reminders</span>
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={notifications.skillReminders}
                    onChange={(e) => setNotifications({ ...notifications, skillReminders: e.target.checked })}
                  />
                </label>
              </div>
            </div>

            {/* Session Actions */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#fb7185', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={20} />
                <span>Active Authentication Session</span>
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Signed in as <strong>{user?.email}</strong>. Logging out destroys your JWT token and clears all active browser session state.
              </p>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.7rem 1.5rem',
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  color: '#fb7185',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                <LogOut size={16} />
                <span>Log Out of System</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
