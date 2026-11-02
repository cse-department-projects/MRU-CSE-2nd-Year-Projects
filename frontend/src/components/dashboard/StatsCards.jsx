import React from 'react';
import { User, Compass, FileText, Target, Sparkles, GitMerge } from 'lucide-react';

export const StatsCards = ({
  profileCompletion = 0,
  careerMatch = 0,
  topCareerTitle = 'Software Engineer',
  resumeScore = 0,
  skillsCompleted = 0,
  skillGap = 0,
  roadmapProgress = 0,
}) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '1.25rem',
      marginBottom: '2.5rem'
    }}>
      {/* Card 1: Profile Completion */}
      <div className="feature-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>Profile Completion</span>
          <User size={18} color="var(--primary-400, #818cf8)" />
        </div>
        <h3 style={{ fontSize: '1.8rem', margin: '0.2rem 0' }}>{profileCompletion}%</h3>
        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, profileCompletion)}%`, height: '100%', background: 'var(--primary-500, #6366f1)' }} />
        </div>
      </div>

      {/* Card 2: Career Match */}
      <div className="feature-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>Top Career Match</span>
          <Compass size={18} color="var(--accent-cyan, #06b6d4)" />
        </div>
        <h3 style={{ fontSize: '1.8rem', margin: '0.2rem 0', color: 'var(--accent-cyan, #06b6d4)' }}>
          {careerMatch}%
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {topCareerTitle}
        </span>
      </div>

      {/* Card 3: Resume ATS Score */}
      <div className="feature-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>Resume ATS Score</span>
          <FileText size={18} color="var(--accent-emerald, #10b981)" />
        </div>
        <h3 style={{ fontSize: '1.8rem', margin: '0.2rem 0', color: 'var(--accent-emerald, #10b981)' }}>
          {resumeScore}/100
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>ATS Optimized</span>
      </div>

      {/* Card 4: Verified Skills */}
      <div className="feature-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>Verified Skills</span>
          <Target size={18} color="var(--accent-purple, #a855f7)" />
        </div>
        <h3 style={{ fontSize: '1.8rem', margin: '0.2rem 0' }}>{skillsCompleted}</h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>In active matrix</span>
      </div>

      {/* Card 5: Missing Skills / Gap */}
      <div className="feature-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>Missing Skills</span>
          <Sparkles size={18} color="var(--accent-rose, #f43f5e)" />
        </div>
        <h3 style={{ fontSize: '1.8rem', margin: '0.2rem 0', color: 'var(--accent-rose, #f43f5e)' }}>
          {skillGap}
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>For target role</span>
      </div>

      {/* Card 6: Roadmap Progress */}
      <div className="feature-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>Roadmap Progress</span>
          <GitMerge size={18} color="#3b82f6" />
        </div>
        <h3 style={{ fontSize: '1.8rem', margin: '0.2rem 0', color: '#3b82f6' }}>
          {roadmapProgress}%
        </h3>
        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, roadmapProgress)}%`, height: '100%', background: '#3b82f6' }} />
        </div>
      </div>
    </div>
  );
};
