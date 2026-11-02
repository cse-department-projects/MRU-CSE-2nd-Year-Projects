import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';

export const SkillGapCard = ({ missingSkills = [], careerId = 'career_1' }) => {
  return (
    <div className="feature-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={18} color="var(--accent-rose, #f43f5e)" />
            <span>Priority Skill Gaps</span>
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)' }}>
            Target: Core Path
          </span>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '1rem', lineHeight: 1.5 }}>
          Bridge these missing competencies to elevate your career match rate to 95%+.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {missingSkills.slice(0, 3).map((skill) => (
            <div
              key={skill}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-rose, #f43f5e)' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{skill}</span>
              </div>
              <Link
                to={`/learning-resources?skill=${encodeURIComponent(skill)}`}
                style={{ fontSize: '0.75rem', color: 'var(--primary-400, #818cf8)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              >
                <BookOpen size={12} />
                <span>Learn</span>
              </Link>
            </div>
          ))}
          {missingSkills.length === 0 && (
            <div style={{ color: 'var(--accent-emerald, #10b981)', fontSize: '0.85rem', padding: '0.5rem 0' }}>
              No critical skill gaps identified for your target role!
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))' }}>
        <Link
          to={`/skill-gap?career=${careerId}`}
          style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <span>Full Gap Breakdown & Analysis</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
