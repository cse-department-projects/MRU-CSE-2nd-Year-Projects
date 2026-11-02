import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, CheckCircle2, UploadCloud } from 'lucide-react';

export const ResumeScoreCard = ({ atsScore = 80 }) => {
  return (
    <div className="feature-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileText size={18} color="var(--accent-emerald, #10b981)" />
            <span>ATS Resume Health</span>
          </h3>
          <span style={{
            background: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--accent-emerald, #10b981)',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.15rem 0.5rem',
            borderRadius: '4px'
          }}>
            {atsScore >= 80 ? 'Optimized' : 'Needs Review'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.75rem 0' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '2px solid var(--accent-emerald, #10b981)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-emerald, #10b981)', lineHeight: 1 }}>{atsScore}</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted, #94a3b8)' }}>/100</span>
          </div>

          <div style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem', color: 'var(--text-main, #f8fafc)' }}>
              <CheckCircle2 size={13} color="var(--accent-emerald, #10b981)" />
              <span>Formatting & Parser Friendly</span>
            </div>
            <span>Upload fresh versions to analyze role-specific keyword density.</span>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '1.25rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link
          to="/resume-analyzer"
          style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
        >
          <UploadCloud size={15} />
          <span>Upload & Audit Resume</span>
        </Link>
        <Link to="/resume-matcher" style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>
          Match JD →
        </Link>
      </div>
    </div>
  );
};
