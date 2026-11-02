import React from 'react';
import { ShieldCheck, User, Sparkles } from 'lucide-react';

export const DashboardHeader = ({ userName, userEmail, targetRole }) => {
  return (
    <section className="dashboard-hero" style={{ marginBottom: '2rem' }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        color: 'var(--accent-emerald, #10b981)',
        fontSize: '0.85rem',
        fontWeight: 600,
        marginBottom: '0.75rem',
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        padding: '0.25rem 0.75rem',
        borderRadius: '999px'
      }}>
        <ShieldCheck size={16} />
        <span>Authenticated Session • MongoDB Connected</span>
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.4rem' }}>
        Welcome, {userName || 'Career Explorer'}! 👋
      </h1>
      <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.98rem', maxWidth: '750px', lineHeight: 1.5 }}>
        Here is your personalized career guidance dashboard with real-time skill matching, ATS score tracking, and verified opportunity suggestions.
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          <User size={15} color="var(--text-muted, #94a3b8)" />
          <span style={{ color: 'var(--text-muted, #94a3b8)' }}>Account: </span>
          <strong>{userEmail || 'user@example.com'}</strong>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          <Sparkles size={15} color="var(--accent-cyan, #06b6d4)" />
          <span style={{ color: 'var(--text-muted, #94a3b8)' }}>Target Track: </span>
          <strong style={{ color: 'var(--accent-cyan, #06b6d4)' }}>
            {targetRole || 'Full Stack Developer'}
          </strong>
        </div>
      </div>
    </section>
  );
};
