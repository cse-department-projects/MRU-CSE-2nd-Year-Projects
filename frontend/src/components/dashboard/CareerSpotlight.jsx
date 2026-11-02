import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, GitMerge, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const CareerSpotlight = ({ topCareer }) => {
  if (!topCareer) return null;

  const careerObj = topCareer.career || topCareer;
  const careerId = careerObj.id || 'career_1';
  const title = careerObj.title || 'Full Stack Java Developer';
  const description = careerObj.description || 'Design and build enterprise software using Java, Spring Boot microservices, and React.js.';
  const matchPercentage = topCareer.matchPercentage || 88;
  const matchingSkills = topCareer.matchingSkills || [];
  const missingSkills = topCareer.missingSkills || [];

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
      border: '1px solid var(--border-active, rgba(99, 102, 241, 0.5))',
      borderRadius: 'var(--radius-xl, 24px)',
      padding: '2rem',
      marginBottom: '2.5rem',
      boxShadow: 'var(--shadow-glow, 0 0 35px rgba(99, 102, 241, 0.25))'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-400, #818cf8)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            <Sparkles size={16} /> Top Recommended Career Trajectory
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700 }}>{title}</h2>
          <p style={{ color: 'var(--text-muted, #94a3b8)', maxWidth: '700px', fontSize: '0.92rem', marginTop: '0.3rem', lineHeight: 1.5 }}>
            {description}
          </p>
        </div>

        <div style={{
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          padding: '0.8rem 1.5rem',
          borderRadius: 'var(--radius-md, 12px)',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)', display: 'block' }}>Match Compatibility</span>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-100, #e0e7ff)' }}>{matchPercentage}%</span>
        </div>
      </div>

      {/* Skill tags */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        <div>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-emerald, #10b981)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem' }}>
            <CheckCircle2 size={14} /> Matching Skills ({matchingSkills.length})
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {matchingSkills.length > 0 ? (
              matchingSkills.map((sk) => (
                <span
                  key={sk}
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#a7f3d0',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem'
                  }}
                >
                  {sk}
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--text-dim, #64748b)', fontSize: '0.8rem' }}>No skills recorded yet.</span>
            )}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fb7185', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem' }}>
            <AlertTriangle size={14} /> Skills to Bridge ({missingSkills.length})
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {missingSkills.length > 0 ? (
              missingSkills.map((sk) => (
                <span
                  key={sk}
                  style={{
                    background: 'rgba(244, 63, 94, 0.12)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    color: '#fecdd3',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem'
                  }}
                >
                  {sk}
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--accent-emerald, #10b981)', fontSize: '0.8rem' }}>All required skills mastered! 🎉</span>
            )}
          </div>
        </div>
      </div>

      {/* Career Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link
          to={`/roadmap?career=${careerId}`}
          className="btn-primary"
          style={{ width: 'auto', padding: '0.65rem 1.25rem', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
        >
          <GitMerge size={16} />
          <span>Start Learning Roadmap</span>
        </Link>

        <Link
          to={`/skill-gap?career=${careerId}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.25rem',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
            borderRadius: 'var(--radius-md, 12px)',
            color: 'var(--text-main, #f8fafc)',
            fontSize: '0.9rem',
            fontWeight: 500,
            textDecoration: 'none'
          }}
        >
          <Sparkles size={16} color="var(--accent-rose, #f43f5e)" />
          <span>Analyze Skill Gaps</span>
        </Link>

        <Link
          to="/career-guidance"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.65rem 1.25rem',
            background: 'transparent',
            border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
            borderRadius: 'var(--radius-md, 12px)',
            color: 'var(--primary-400, #818cf8)',
            fontSize: '0.9rem',
            textDecoration: 'none'
          }}
        >
          <span>View All 10+ Career Paths</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
