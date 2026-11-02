import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Bookmark, ExternalLink, ArrowRight } from 'lucide-react';

export const RecommendedJobsSection = ({ recommendedJobs = [], savedJobIds = new Set(), onToggleSave }) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Briefcase size={20} color="var(--primary-400, #818cf8)" />
          <span>Personalized Jobs</span>
        </h2>
        <Link to="/jobs" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <span>View All Jobs</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {recommendedJobs.length > 0 ? (
          recommendedJobs.map((item, index) => {
            const job = item.job || item;
            const jobId = job.id || `job_${index}`;
            const title = job.title || 'Software Engineer';
            const company = job.company || 'Tech Corp';
            const location = job.location || 'Bengaluru';
            const salary = job.salary || 'Competitive';
            const skills = job.skills || [];
            const matchPercentage = item.matchPercentage || 85;
            const isSaved = savedJobIds.has(jobId);
            const appUrl = job.applicationUrl || 'https://careers.google.com';

            return (
              <div
                key={jobId}
                style={{
                  background: 'var(--bg-card, rgba(18, 24, 38, 0.75))',
                  border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                  borderRadius: 'var(--radius-md, 12px)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s, border-color 0.2s'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem', gap: '0.5rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>{title}</h4>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)' }}>
                        {company} • {location}
                      </span>
                    </div>
                    <span style={{
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--primary-100, #e0e7ff)',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}>
                      {matchPercentage}% Match
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', margin: '0.6rem 0' }}>
                    {skills.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          fontSize: '0.72rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          color: 'var(--text-muted, #94a3b8)'
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))'
                }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-emerald, #10b981)' }}>
                    {salary}
                  </span>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => onToggleSave(jobId)}
                      style={{
                        background: isSaved ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${isSaved ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-subtle, rgba(255,255,255,0.08))'}`,
                        color: isSaved ? '#fb7185' : 'var(--text-muted, #94a3b8)',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title={isSaved ? 'Saved to bookmarks' : 'Save Job'}
                    >
                      <Bookmark size={13} style={{ fill: isSaved ? '#fb7185' : 'none' }} />
                    </button>

                    <a
                      href={appUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: 'var(--primary-600, #4f46e5)',
                        color: 'white',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        textDecoration: 'none'
                      }}
                    >
                      <span>Apply</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="feature-card" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted, #94a3b8)' }}>
            No jobs recommended yet. Complete your profile skills to view matches.
          </div>
        )}
      </div>
    </div>
  );
};
