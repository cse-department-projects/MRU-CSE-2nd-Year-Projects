import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, CheckCircle2, Bookmark, Sparkles, BookOpen } from 'lucide-react';

export const RecentActivity = ({ totalSkillsCount = 0, savedCount = 0 }) => {
  return (
    <div className="feature-card" style={{ padding: '1.5rem', marginBottom: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Activity size={18} color="var(--primary-400, #818cf8)" />
          <span>Recent Career Guidance Activity</span>
        </h3>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)' }}>Live Stream</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
          padding: '1rem',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald, #10b981)' }}>
            <CheckCircle2 size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{totalSkillsCount} Skills Cataloged</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)', marginTop: '0.2rem' }}>
              Skill matrix calibrated for software engineering match calculation.
            </div>
            <Link to="/skills" style={{ fontSize: '0.75rem', marginTop: '0.4rem', display: 'inline-block' }}>
              Manage Skills →
            </Link>
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
          padding: '1rem',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
            <Bookmark size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{savedCount} Opportunities Bookmarked</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)', marginTop: '0.2rem' }}>
              Saved jobs and internships ready for application submission.
            </div>
            <Link to="/saved-opportunities" style={{ fontSize: '0.75rem', marginTop: '0.4rem', display: 'inline-block' }}>
              View Saved Items →
            </Link>
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.06))',
          padding: '1rem',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan, #06b6d4)' }}>
            <BookOpen size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Curated Learning Resources</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)', marginTop: '0.2rem' }}>
              High-quality tutorials and courses matched to your skill gaps.
            </div>
            <Link to="/learning-resources" style={{ fontSize: '0.75rem', marginTop: '0.4rem', display: 'inline-block' }}>
              Explore Library →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
