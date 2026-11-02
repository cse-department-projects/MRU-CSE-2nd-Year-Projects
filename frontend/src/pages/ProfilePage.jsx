import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { User, Mail, Phone, GraduationCap, Building, Award, Briefcase, MapPin, CheckCircle2, AlertCircle, Save, Edit3, X, RotateCcw, Plus, Trash2 } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Interest & Cert temporary input states
  const [newInterest, setNewInterest] = useState('');
  const [newCert, setNewCert] = useState({ name: '', issuer: '', year: 2025, url: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await authApi.getProfile();
      setProfile(data);
      setFormData(data);
    } catch (err) {
      setErrorMsg('Failed to load profile details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    setErrorMsg('');

    try {
      const updated = await authApi.updateProfile({
        ...formData,
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear, 10) : 2026,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : 8.5,
      });
      setProfile(updated);
      setFormData(updated);
      setIsEditing(false);
      setMessage('Profile updated and saved to MongoDB successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
    setErrorMsg('');
  };

  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    const current = formData.interests || [];
    if (!current.includes(newInterest.trim())) {
      setFormData(prev => ({ ...prev, interests: [...current, newInterest.trim()] }));
    }
    setNewInterest('');
  };

  const handleRemoveInterest = (tag) => {
    setFormData(prev => ({
      ...prev,
      interests: (prev.interests || []).filter(i => i !== tag)
    }));
  };

  const handleAddCert = () => {
    if (!newCert.name.trim()) return;
    const current = formData.certifications || [];
    setFormData(prev => ({
      ...prev,
      certifications: [...current, { ...newCert, year: parseInt(newCert.year, 10) || 2025 }]
    }));
    setNewCert({ name: '', issuer: '', year: 2025, url: '' });
  };

  const handleRemoveCert = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: (prev.certifications || []).filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
        <Navbar />
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />

      <div className="dashboard-container">
        {/* Header with Edit / Save Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem' }}>Student Profile Management</h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Manage your academic credentials, career preferences, and certifications.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="btn-primary" style={{ width: 'auto', padding: '0.6rem 1.25rem' }}>
                <Edit3 size={16} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <>
                <button onClick={handleCancel} type="button" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem 1.1rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-main)',
                  cursor: 'pointer'
                }}>
                  <X size={16} />
                  <span>Cancel</span>
                </button>

                <button onClick={handleSave} disabled={isSaving} className="btn-primary" style={{ width: 'auto', padding: '0.6rem 1.25rem' }}>
                  {isSaving ? (
                    <>
                      <div className="spinner" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {message && (
          <div className="global-alert success">
            <CheckCircle2 size={18} />
            <span>{message}</span>
          </div>
        )}

        {errorMsg && (
          <div className="global-alert error">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Profile Card Sections */}
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            {/* Section 1: Personal & Contact Info */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-400)' }}>
                <User size={20} />
                <span>Personal & Contact Details</span>
              </h3>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  name="fullName"
                  type="text"
                  className="input-control"
                  style={{ paddingLeft: '1rem' }}
                  value={formData.fullName || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Read-only)</label>
                <input
                  name="email"
                  type="email"
                  className="input-control"
                  style={{ paddingLeft: '1rem', opacity: 0.7 }}
                  value={formData.email || ''}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  name="phone"
                  type="tel"
                  className="input-control"
                  style={{ paddingLeft: '1rem' }}
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Career Ambition / Goal Summary</label>
                <textarea
                  name="careerGoals"
                  rows="3"
                  className="input-control"
                  style={{ padding: '0.75rem 1rem', height: 'auto' }}
                  value={formData.careerGoals || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Summarize your professional vision..."
                />
              </div>
            </div>

            {/* Section 2: Education & Academic History */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)' }}>
                <GraduationCap size={20} />
                <span>Academic & College Background</span>
              </h3>

              <div className="form-group">
                <label className="form-label">College / University</label>
                <input
                  name="college"
                  type="text"
                  className="input-control"
                  style={{ paddingLeft: '1rem' }}
                  value={formData.college || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Degree & Branch</label>
                <input
                  name="degree"
                  type="text"
                  className="input-control"
                  style={{ paddingLeft: '1rem' }}
                  value={formData.degree || ''}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Graduation Year</label>
                  <input
                    name="graduationYear"
                    type="number"
                    className="input-control"
                    style={{ paddingLeft: '1rem' }}
                    value={formData.graduationYear || 2026}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CGPA / Percentage</label>
                  <input
                    name="cgpa"
                    type="number"
                    step="0.01"
                    className="input-control"
                    style={{ paddingLeft: '1rem' }}
                    value={formData.cgpa || 8.5}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Current Academic Level</label>
                <select
                  name="education"
                  className="input-control"
                  style={{ paddingLeft: '1rem' }}
                  value={formData.education || 'Undergraduate'}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                >
                  <option value="Undergraduate">Undergraduate (B.Tech / B.E. / BCA / B.Sc)</option>
                  <option value="Postgraduate">Postgraduate (M.Tech / MCA / M.Sc / MBA)</option>
                  <option value="Graduate / Alum">Recent Graduate / Alum</option>
                  <option value="Diploma">Diploma / Associate Degree</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Career Preferences */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-purple)' }}>
              <Briefcase size={20} />
              <span>Career & Work Preferences (Drives Recommendations)</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Preferred Technical Domain</label>
                <select
                  name="preferredDomain"
                  className="input-control"
                  style={{ paddingLeft: '1rem' }}
                  value={formData.preferredDomain || 'Software Engineering'}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                >
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Frontend Engineering">Frontend Engineering</option>
                  <option value="Backend Engineering">Backend Engineering</option>
                  <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                  <option value="Data & Analytics">Data & Analytics</option>
                  <option value="Artificial Intelligence">Artificial Intelligence / ML</option>
                  <option value="Database Management">Database Management</option>
                  <option value="Quality Engineering">Quality Assurance / QA</option>
                  <option value="Information Security">Cyber Security</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Target Role</label>
                <input
                  name="preferredRole"
                  type="text"
                  className="input-control"
                  style={{ paddingLeft: '1rem' }}
                  value={formData.preferredRole || 'Full Stack Java Developer'}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Work Mode</label>
                <select
                  name="preferredWorkMode"
                  className="input-control"
                  style={{ paddingLeft: '1rem' }}
                  value={formData.preferredWorkMode || 'Hybrid'}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Onsite">Onsite</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <select
                  name="experienceLevel"
                  className="input-control"
                  style={{ paddingLeft: '1rem' }}
                  value={formData.experienceLevel || 'Fresher / Entry Level'}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                >
                  <option value="Fresher / Entry Level">Fresher / Entry Level (0-1 yr)</option>
                  <option value="Junior (1-3 years)">Junior (1-3 years)</option>
                  <option value="Mid-Level (3-5 years)">Mid-Level (3-5 years)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Interests & Certifications */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Interests Tag Cloud */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--accent-emerald)' }}>
                Professional Interests
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {(formData.interests || []).map((tag) => (
                  <span key={tag} style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#a7f3d0', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>{tag}</span>
                    {isEditing && (
                      <button type="button" onClick={() => handleRemoveInterest(tag)} style={{ background: 'none', border: 'none', color: '#fb7185', cursor: 'pointer', display: 'flex' }}>
                        <X size={13} />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {isEditing && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="input-control"
                    style={{ paddingLeft: '1rem', fontSize: '0.85rem' }}
                    placeholder="Add interest (e.g. Distributed Systems)"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddInterest(); } }}
                  />
                  <button type="button" onClick={handleAddInterest} className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Certifications */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--accent-amber)' }}>
                Verified Certifications
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {(formData.certifications || []).map((cert, index) => (
                  <div key={index} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h5 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{cert.name}</h5>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cert.issuer} • {cert.year}</span>
                    </div>
                    {isEditing && (
                      <button type="button" onClick={() => handleRemoveCert(index)} style={{ background: 'none', border: 'none', color: '#fb7185', cursor: 'pointer' }}>
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="input-control"
                    style={{ paddingLeft: '0.8rem', fontSize: '0.85rem' }}
                    placeholder="Cert Name (e.g. AWS Cloud Practitioner)"
                    value={newCert.name}
                    onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className="input-control"
                      style={{ paddingLeft: '0.8rem', fontSize: '0.85rem' }}
                      placeholder="Issuer (e.g. AWS)"
                      value={newCert.issuer}
                      onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                    />
                    <input
                      type="number"
                      className="input-control"
                      style={{ paddingLeft: '0.8rem', fontSize: '0.85rem' }}
                      value={newCert.year}
                      onChange={(e) => setNewCert({ ...newCert, year: e.target.value })}
                    />
                    <button type="button" onClick={handleAddCert} className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
