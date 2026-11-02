import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandingHeader } from '../components/BrandingHeader';
import { User, Mail, Lock, Eye, EyeOff, Phone, GraduationCap, Building, Award, Calendar, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    education: 'Undergraduate',
    college: '',
    degree: 'B.Tech Computer Science',
    graduationYear: 2026,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Please enter your full name.';
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email format.';
    }

    if (!formData.password) {
      newErrors.password = 'Please enter a password.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.college.trim()) newErrors.college = 'Please specify your college/university.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setGlobalError('');

    if (!validate()) return;

    setIsLoading(true);

    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        education: formData.education,
        college: formData.college.trim(),
        degree: formData.degree,
        graduationYear: parseInt(formData.graduationYear, 10),
      });

      setSuccessMsg('Account created successfully! Redirecting to your Career Dashboard...');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setIsLoading(false);
      setGlobalError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-wrapper" style={{ maxWidth: '1080px' }}>
        <BrandingHeader />

        <div className="auth-form-panel" style={{ padding: '2.5rem 2.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
          <div className="form-header" style={{ marginBottom: '1.25rem' }}>
            <h2>Create Student Account</h2>
            <p>Complete your academic profile to unlock personalized career guidance.</p>
          </div>

          {globalError && (
            <div className="global-alert error">
              <AlertCircle size={18} />
              <span>{globalError}</span>
            </div>
          )}

          {successMsg && (
            <div className="global-alert success">
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} noValidate>
            {/* Full Name & Email */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">Full Name *</label>
                <div className="input-wrapper">
                  <span className="input-icon-left"><User size={17} /></span>
                  <input
                    id="reg-name"
                    name="fullName"
                    type="text"
                    className={`input-control ${errors.fullName ? 'error' : ''}`}
                    placeholder="e.g. Alex Rivera"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={isLoading || !!successMsg}
                  />
                </div>
                {errors.fullName && <div className="form-error-text"><AlertCircle size={12} /><span>{errors.fullName}</span></div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email Address *</label>
                <div className="input-wrapper">
                  <span className="input-icon-left"><Mail size={17} /></span>
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    className={`input-control ${errors.email ? 'error' : ''}`}
                    placeholder="e.g. alex@university.edu"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading || !!successMsg}
                  />
                </div>
                {errors.email && <div className="form-error-text"><AlertCircle size={12} /><span>{errors.email}</span></div>}
              </div>
            </div>

            {/* Phone & College */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-phone">Phone Number</label>
                <div className="input-wrapper">
                  <span className="input-icon-left"><Phone size={17} /></span>
                  <input
                    id="reg-phone"
                    name="phone"
                    type="tel"
                    className="input-control"
                    placeholder="e.g. +91 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isLoading || !!successMsg}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-college">College / University *</label>
                <div className="input-wrapper">
                  <span className="input-icon-left"><Building size={17} /></span>
                  <input
                    id="reg-college"
                    name="college"
                    type="text"
                    className={`input-control ${errors.college ? 'error' : ''}`}
                    placeholder="e.g. National Institute of Tech"
                    value={formData.college}
                    onChange={handleChange}
                    disabled={isLoading || !!successMsg}
                  />
                </div>
                {errors.college && <div className="form-error-text"><AlertCircle size={12} /><span>{errors.college}</span></div>}
              </div>
            </div>

            {/* Degree & Grad Year */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-degree">Degree & Branch</label>
                <div className="input-wrapper">
                  <span className="input-icon-left"><Award size={17} /></span>
                  <input
                    id="reg-degree"
                    name="degree"
                    type="text"
                    className="input-control"
                    placeholder="e.g. B.Tech Computer Science"
                    value={formData.degree}
                    onChange={handleChange}
                    disabled={isLoading || !!successMsg}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-gradYear">Graduation Year</label>
                <div className="input-wrapper">
                  <span className="input-icon-left"><Calendar size={17} /></span>
                  <input
                    id="reg-gradYear"
                    name="graduationYear"
                    type="number"
                    min="2020"
                    max="2032"
                    className="input-control"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    disabled={isLoading || !!successMsg}
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-pass">Password *</label>
                <div className="input-wrapper">
                  <span className="input-icon-left"><Lock size={17} /></span>
                  <input
                    id="reg-pass"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`input-control ${errors.password ? 'error' : ''}`}
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading || !!successMsg}
                  />
                  <button
                    type="button"
                    className="input-action-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && <div className="form-error-text"><AlertCircle size={12} /><span>{errors.password}</span></div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm">Confirm Password *</label>
                <div className="input-wrapper">
                  <span className="input-icon-left"><Lock size={17} /></span>
                  <input
                    id="reg-confirm"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    className={`input-control ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading || !!successMsg}
                  />
                </div>
                {errors.confirmPassword && <div className="form-error-text"><AlertCircle size={12} /><span>{errors.confirmPassword}</span></div>}
              </div>
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="form-footer-switch" style={{ marginTop: '1rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
