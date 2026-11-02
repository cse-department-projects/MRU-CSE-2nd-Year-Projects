import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, UserCheck, Target, PlusCircle } from 'lucide-react';

export const DashboardEmptyState = ({ userName }) => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
      border: '1px solid var(--border-active, rgba(99, 102, 241, 0.4))',
      borderRadius: 'var(--radius-xl, 24px)',
      padding: '2.5rem',
      marginBottom: '2.5rem',
      boxShadow: 'var(--shadow-glow, 0 0 35px rgba(99, 102, 241, 0.25))'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan, #06b6d4)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <Sparkles size={16} />
            <span>Profile Initialization Required</span>
          </div>

          <h2 style={{ fontSize: '1.7rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main, #f8fafc)' }}>
            Welcome to Smart Career Guidance, {userName || 'Explorer'}!
          </h2>

          <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Complete your academic profile, select your skills, and specify your career interests to unlock tailored AI career matching, automated ATS resume scoring, and targeted job opportunities.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/profile"
              className="btn-primary"
              style={{ width: 'auto', padding: '0.65rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
            >
              <UserCheck size={18} />
              <span>Complete Profile</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/skills"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
                borderRadius: 'var(--radius-md, 10px)',
                color: 'var(--text-main, #f8fafc)',
                fontSize: '0.9rem',
                fontWeight: 500,
                textDecoration: 'none'
              }}
            >
              <PlusCircle size={16} color="var(--accent-emerald, #10b981)" />
              <span>Add Verified Skills</span>
            </Link>
          </div>
        </div>

        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-lg, 16px)',
          minWidth: '220px',
          textAlign: 'center'
        }}>
          <Target size={28} color="var(--primary-400, #818cf8)" style={{ margin: '0 auto 0.5rem' }} />
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-100, #e0e7ff)' }}>
            0 / 5
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>
            Core Skills Added
          </span>
        </div>
      </div>
    </div>
  );
};
