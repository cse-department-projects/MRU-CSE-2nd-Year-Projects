import React from 'react';
import { Link } from 'react-router-dom';
import { GitMerge, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export const RoadmapProgress = ({ roadmapProgress = 0, careerTitle = 'Full Stack Developer', careerId = 'career_1' }) => {
  return (
    <div className="feature-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <GitMerge size={18} color="#3b82f6" />
            <span>Active Learning Roadmap</span>
          </h3>
          <span style={{ fontSize: '0.78rem', color: '#3b82f6', fontWeight: 600 }}>
            {roadmapProgress}% Completed
          </span>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', marginBottom: '1rem', lineHeight: 1.5 }}>
          Target Track: <strong style={{ color: 'var(--text-main, #f8fafc)' }}>{careerTitle}</strong>
        </p>

        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
          <div style={{ width: `${Math.min(100, roadmapProgress)}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, var(--accent-cyan, #06b6d4))' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <CheckCircle2 size={13} color="var(--accent-emerald, #10b981)" />
            <span>Structured Phases</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Clock size={13} />
            <span>Self-Paced</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))' }}>
        <Link
          to={`/roadmap?career=${careerId}`}
          style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <span>Continue Learning Milestones</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
