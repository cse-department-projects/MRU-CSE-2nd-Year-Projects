import React from 'react';
import { Compass, Sparkles } from 'lucide-react';
import { Navbar } from '../Navbar';

export const DashboardLoadingSkeleton = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main, #0B0F19)' }}>
      <Navbar />

      <div className="dashboard-container" style={{ paddingTop: '2rem' }}>
        {/* Loading Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid var(--border-active, rgba(99, 102, 241, 0.4))',
          borderRadius: 'var(--radius-xl, 24px)',
          padding: '2.5rem',
          textAlign: 'center',
          marginBottom: '2.5rem',
          boxShadow: '0 0 35px rgba(99, 102, 241, 0.2)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--primary-500, #6366f1), var(--accent-cyan, #06b6d4))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: 'white',
            boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)',
            animation: 'pulse 2s infinite'
          }}>
            <Compass size={32} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main, #f8fafc)' }}>
            Smart Career Guidance System
          </h2>
          <p style={{ color: 'var(--accent-cyan, #06b6d4)', fontSize: '0.95rem', fontWeight: 500, marginBottom: '1.25rem' }}>
            Loading your career dashboard...
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted, #94a3b8)', fontSize: '0.85rem' }}>
            <Sparkles size={16} color="var(--primary-400, #818cf8)" />
            <span>Preparing personalized AI career trajectory, ATS score & job recommendations</span>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <div className="spinner" style={{ width: '36px', height: '36px', borderWidth: '3px' }} />
          </div>
        </div>

        {/* Skeleton Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="feature-card" style={{ padding: '1.25rem', minHeight: '110px', opacity: 0.6 }}>
              <div style={{ width: '60%', height: '14px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '0.75rem' }} />
              <div style={{ width: '40%', height: '24px', background: 'rgba(255,255,255,0.15)', borderRadius: '6px', marginBottom: '0.5rem' }} />
              <div style={{ width: '80%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
