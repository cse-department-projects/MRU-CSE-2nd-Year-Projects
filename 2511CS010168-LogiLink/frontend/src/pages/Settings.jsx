import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Building2, Lock, Palette, Settings as SettingsIcon, User } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import { Field, Input, Select } from '../components/ui/Input.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { settingsService } from '../services/settingsService.js';
import { authService } from '../services/authService.js';
import { warehouseService } from '../services/warehouseService.js';

const REGION_OPTIONS = [
  'North America',
  'Europe',
  'Asia Pacific',
  'Latin America',
  'Middle East & Africa',
  'Global',
];

const ALERT_THRESHOLDS = [
  'Critical Only',
  'High & Critical',
  'Medium and Above',
  'All Alerts',
];

const DIGEST_FREQUENCIES = [
  'Realtime',
  'Hourly',
  'Daily Digest',
  'Weekly Digest',
  'Never',
];

const THEME_OPTIONS = ['Light'];

const DENSITY_OPTIONS = ['Default', 'Compact', 'Comfortable'];

const SESSION_POLICIES = [
  '15 minutes',
  '30 minutes',
  '1 hour',
  '8 hours',
  '24 hours',
];

const PASSWORD_POLICIES = [
  'Standard (8+ chars)',
  'Strong (10+ chars, uppercase, symbol)',
  'Enterprise (12+ chars, 2FA required)',
];

const TIMEZONE_OPTIONS = [
  'UTC',
  'America/New_York (EST)',
  'America/Chicago (CST)',
  'America/Denver (MST)',
  'America/Los_Angeles (PST)',
  'Europe/London (GMT)',
  'Europe/Paris (CET)',
  'Asia/Tokyo (JST)',
  'Asia/Kolkata (IST)',
  'Australia/Sydney (AEST)',
];

export default function Settings() {
  const { currentUser, setCurrentUser, notify, applyTheme, applyDensity } = useApp();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [warehouses, setWarehouses] = useState([]);

  const [profile, setProfile] = useState({ fullName: '', email: '' });
  const [company, setCompany] = useState({ companyName: '', operatingRegion: 'North America' });
  const [notifications, setNotifications] = useState({ alertThreshold: 'Medium and Above', digestFrequency: 'Daily Digest' });
  const [appearance, setAppearance] = useState({ theme: 'Light', density: 'Default' });
  const [security, setSecurity] = useState({ sessionPolicy: '1 hour', passwordPolicy: 'Standard (8+ chars)' });
  const [system, setSystem] = useState({ timezone: 'UTC', defaultWarehouse: 'Default Central Warehouse' });

  const [saving, setSaving] = useState({
    profile: false,
    company: false,
    notifications: false,
    appearance: false,
    security: false,
    system: false,
  });

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const [settingsData, warehouseData] = await Promise.all([
        settingsService.getSettings(),
        warehouseService.list().catch(() => []),
      ]);

      if (settingsData) {
        if (settingsData.profile) {
          setProfile({
            fullName: settingsData.profile.fullName || '',
            email: settingsData.profile.email || '',
          });
        }
        if (settingsData.company) {
          setCompany({
            companyName: settingsData.company.companyName || '',
            operatingRegion: settingsData.company.operatingRegion || 'North America',
          });
        }
        if (settingsData.notifications) {
          setNotifications({
            alertThreshold: settingsData.notifications.alertThreshold || 'Medium and Above',
            digestFrequency: settingsData.notifications.digestFrequency || 'Daily Digest',
          });
        }
        if (settingsData.appearance) {
          setAppearance({
            theme: settingsData.appearance.theme || 'Light',
            density: settingsData.appearance.density || 'Default',
          });
        }
        if (settingsData.security) {
          setSecurity({
            sessionPolicy: settingsData.security.sessionPolicy || '1 hour',
            passwordPolicy: settingsData.security.passwordPolicy || 'Standard (8+ chars)',
          });
        }
        if (settingsData.system) {
          setSystem({
            timezone: settingsData.system.timezone || 'UTC',
            defaultWarehouse: settingsData.system.defaultWarehouse || 'Default Central Warehouse',
          });
        }
      }

      if (Array.isArray(warehouseData)) {
        setWarehouses(warehouseData);
      }
    } catch (err) {
      setError(err.message || 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Handle hash scrolling to sections (e.g. #profile, #appearance, #security, #company)
  useEffect(() => {
    if (!loading && location.hash) {
      const targetId = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('highlighted-section');
          setTimeout(() => el.classList.remove('highlighted-section'), 2000);
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.hash, loading]);

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    if (!profile.fullName.trim()) {
      notify('Full name cannot be empty.', 'error');
      return;
    }
    if (!profile.email.trim() || !profile.email.includes('@')) {
      notify('Valid email address is required.', 'error');
      return;
    }

    setSaving((s) => ({ ...s, profile: true }));
    try {
      const res = await settingsService.updateProfile(profile);
      const updatedUser = authService.updateUserSession(
        {
          ...currentUser,
          name: res?.profile?.fullName || profile.fullName,
          email: res?.profile?.email || profile.email,
        },
        res?.token
      );
      setCurrentUser(updatedUser);
      notify('Profile updated successfully.');
    } catch (err) {
      notify(err.message || 'Failed to save profile.', 'error');
    } finally {
      setSaving((s) => ({ ...s, profile: false }));
    }
  };

  const handleSaveCompany = async (e) => {
    e?.preventDefault();
    if (!company.companyName.trim()) {
      notify('Company name cannot be empty.', 'error');
      return;
    }

    setSaving((s) => ({ ...s, company: true }));
    try {
      const res = await settingsService.updateCompany(company);
      const updatedUser = authService.updateUserSession({
        ...currentUser,
        organizationName: res?.company?.companyName || company.companyName,
      });
      setCurrentUser(updatedUser);
      notify('Company settings saved successfully.');
    } catch (err) {
      notify(err.message || 'Failed to save company settings.', 'error');
    } finally {
      setSaving((s) => ({ ...s, company: false }));
    }
  };

  const handleSaveNotifications = async (e) => {
    e?.preventDefault();
    setSaving((s) => ({ ...s, notifications: true }));
    try {
      await settingsService.updateNotifications(notifications);
      notify('Notification preferences saved successfully.');
    } catch (err) {
      notify(err.message || 'Failed to save notification preferences.', 'error');
    } finally {
      setSaving((s) => ({ ...s, notifications: false }));
    }
  };

  const handleSaveAppearance = async (e) => {
    e?.preventDefault();
    setSaving((s) => ({ ...s, appearance: true }));
    try {
      await settingsService.updateAppearance(appearance);
      applyTheme(appearance.theme);
      applyDensity(appearance.density);
      notify('Appearance preferences saved.');
    } catch (err) {
      notify(err.message || 'Failed to save appearance preferences.', 'error');
    } finally {
      setSaving((s) => ({ ...s, appearance: false }));
    }
  };

  const handleSaveSecurity = async (e) => {
    e?.preventDefault();
    setSaving((s) => ({ ...s, security: true }));
    try {
      await settingsService.updateSecurity(security);
      notify('Security policies updated successfully.');
    } catch (err) {
      notify(err.message || 'Failed to save security settings.', 'error');
    } finally {
      setSaving((s) => ({ ...s, security: false }));
    }
  };

  const handleSaveSystem = async (e) => {
    e?.preventDefault();
    setSaving((s) => ({ ...s, system: true }));
    try {
      await settingsService.updateSystem(system);
      notify('System preferences saved successfully.');
    } catch (err) {
      notify(err.message || 'Failed to save system preferences.', 'error');
    } finally {
      setSaving((s) => ({ ...s, system: false }));
    }
  };

  if (loading) {
    return <LoadingState title="Loading settings" />;
  }

  if (error) {
    return <ErrorState title="Failed to load settings" description={error} onRetry={loadSettings} />;
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage profile, company, notification, appearance, security, and system preferences."
      />
      <div className="grid cols-2">
        {/* Profile */}
        <Card id="profile" title="Profile" action={<User size={20} color="#2563eb" />}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Field label="Full name" required>
              <Input
                value={profile.fullName}
                onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                placeholder="Full name"
              />
            </Field>
            <Field label="Email" required>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                placeholder="Email address"
              />
            </Field>
          </div>
          <Button
            variant="secondary"
            style={{ marginTop: 14 }}
            disabled={saving.profile}
            onClick={handleSaveProfile}
          >
            {saving.profile ? 'Saving...' : 'Save Profile'}
          </Button>
        </Card>

        {/* Company */}
        <Card id="company" title="Company" action={<Building2 size={20} color="#2563eb" />}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Field label="Company name" required>
              <Input
                value={company.companyName}
                onChange={(e) => setCompany((c) => ({ ...c, companyName: e.target.value }))}
                placeholder="Company name"
              />
            </Field>
            <Field label="Operating region">
              <Select
                value={company.operatingRegion}
                onChange={(e) => setCompany((c) => ({ ...c, operatingRegion: e.target.value }))}
              >
                {REGION_OPTIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Button
            variant="secondary"
            style={{ marginTop: 14 }}
            disabled={saving.company}
            onClick={handleSaveCompany}
          >
            {saving.company ? 'Saving...' : 'Save Company'}
          </Button>
        </Card>

        {/* Notifications */}
        <Card id="notifications" title="Notifications" action={<Bell size={20} color="#2563eb" />}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Field label="Alert threshold">
              <Select
                value={notifications.alertThreshold}
                onChange={(e) => setNotifications((n) => ({ ...n, alertThreshold: e.target.value }))}
              >
                {ALERT_THRESHOLDS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Digest frequency">
              <Select
                value={notifications.digestFrequency}
                onChange={(e) => setNotifications((n) => ({ ...n, digestFrequency: e.target.value }))}
              >
                {DIGEST_FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Button
            variant="secondary"
            style={{ marginTop: 14 }}
            disabled={saving.notifications}
            onClick={handleSaveNotifications}
          >
            {saving.notifications ? 'Saving...' : 'Save Notifications'}
          </Button>
        </Card>

        {/* Appearance */}
        <Card id="appearance" title="Appearance" action={<Palette size={20} color="#2563eb" />}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Field label="Theme">
              <Select
                value="Light"
                disabled
                title="LogiLink Standard Light Theme"
              >
                <option value="Light">Light (Standard)</option>
              </Select>
            </Field>
            <Field label="Density">
              <Select
                value={appearance.density}
                onChange={(e) => {
                  const val = e.target.value;
                  setAppearance((a) => ({ ...a, density: val }));
                  applyDensity(val);
                }}
              >
                {DENSITY_OPTIONS.map((dens) => (
                  <option key={dens} value={dens}>
                    {dens}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Button
            variant="secondary"
            style={{ marginTop: 14 }}
            disabled={saving.appearance}
            onClick={handleSaveAppearance}
          >
            {saving.appearance ? 'Saving...' : 'Save Appearance'}
          </Button>
        </Card>

        {/* Security */}
        <Card id="security" title="Security" action={<Lock size={20} color="#2563eb" />}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Field label="Session policy">
              <Select
                value={security.sessionPolicy}
                onChange={(e) => setSecurity((s) => ({ ...s, sessionPolicy: e.target.value }))}
              >
                {SESSION_POLICIES.map((policy) => (
                  <option key={policy} value={policy}>
                    {policy}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Password policy">
              <Select
                value={security.passwordPolicy}
                onChange={(e) => setSecurity((s) => ({ ...s, passwordPolicy: e.target.value }))}
              >
                {PASSWORD_POLICIES.map((policy) => (
                  <option key={policy} value={policy}>
                    {policy}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Button
            variant="secondary"
            style={{ marginTop: 14 }}
            disabled={saving.security}
            onClick={handleSaveSecurity}
          >
            {saving.security ? 'Saving...' : 'Save Security'}
          </Button>
        </Card>

        {/* System Preferences */}
        <Card id="system" title="System Preferences" action={<SettingsIcon size={20} color="#2563eb" />}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Field label="Timezone">
              <Select
                value={system.timezone}
                onChange={(e) => setSystem((s) => ({ ...s, timezone: e.target.value }))}
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Default warehouse">
              <Select
                value={system.defaultWarehouse}
                onChange={(e) => setSystem((s) => ({ ...s, defaultWarehouse: e.target.value }))}
              >
                {warehouses.length > 0 ? (
                  warehouses.map((wh) => (
                    <option key={wh.id} value={wh.name || wh.warehouseCode}>
                      {wh.name} ({wh.warehouseCode || wh.city || 'Depot'})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Default Central Warehouse">Default Central Warehouse</option>
                    <option value="North Logistics Center">North Logistics Center</option>
                    <option value="South Distribution Depot">South Distribution Depot</option>
                  </>
                )}
              </Select>
            </Field>
          </div>
          <Button
            variant="secondary"
            style={{ marginTop: 14 }}
            disabled={saving.system}
            onClick={handleSaveSystem}
          >
            {saving.system ? 'Saving...' : 'Save System Preferences'}
          </Button>
        </Card>
      </div>
    </>
  );
}
