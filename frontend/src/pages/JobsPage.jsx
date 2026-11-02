import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { jobApi } from '../api/jobApi';
import { Briefcase, Search, Filter, Bookmark, ExternalLink, MapPin, DollarSign, Award, CheckCircle2, Clock } from 'lucide-react';
import { ErrorBoundary } from '../components/ErrorBoundary';

export const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState('All');
  const [location, setLocation] = useState('All');
  const [minMatch, setMinMatch] = useState(0);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [search, workMode, location, minMatch]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await jobApi.getJobs({ search, workMode, location, minMatch });
      const jobList = Array.isArray(data) ? data : [];
      setJobs(jobList);
      const saved = new Set(jobList.filter((j) => j?.isSaved).map((j) => j?.job?.id || j?.id));
      setSavedJobIds(saved);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async (jobId, jobTitle) => {
    try {
      if (savedJobIds.has(jobId)) {
        await jobApi.unsaveJob(jobId);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
        setToastMsg(`Removed "${jobTitle}" from saved jobs.`);
      } else {
        await jobApi.saveJob(jobId);
        setSavedJobIds((prev) => new Set(prev).add(jobId));
        setToastMsg(`Saved "${jobTitle}" to your bookmarked opportunities!`);
      }
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      console.error('Failed to toggle save job:', err);
    }
  };

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: 'var(--bg-main, #0B0F19)' }}>
        <Navbar />

        <div className="dashboard-container">
          {/* Header */}
          <section className="dashboard-hero" style={{ padding: '2.25rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-400, #818cf8)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <Briefcase size={16} />
              <span>Personalized Job Recommendation Engine</span>
            </div>
            <h1>Full-Time Job Opportunities</h1>
            <p>
              Discover open positions matched dynamically against your verified skills, experience level, and preferred work mode.
            </p>
          </section>

          {/* Toast Msg */}
          {toastMsg && (
            <div className="global-alert success" style={{ marginBottom: '1.5rem' }}>
              <CheckCircle2 size={18} />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* Search & Filters */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card, rgba(18, 24, 38, 0.75))',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg, 16px)',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            marginBottom: '2rem'
          }}>
            <div className="input-wrapper" style={{ flex: '1 1 280px', maxWidth: '420px' }}>
              <span className="input-icon-left"><Search size={18} /></span>
              <input
                type="text"
                className="input-control"
                placeholder="Search by role, company, or tech stack..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)' }}>Work Mode:</span>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value)}
                  className="input-control"
                  style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  <option value="All">All Modes</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Onsite">Onsite</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)' }}>Min Match:</span>
                <select
                  value={minMatch}
                  onChange={(e) => setMinMatch(Number(e.target.value))}
                  className="input-control"
                  style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  <option value={0}>Any Match</option>
                  <option value={60}>60%+ Match</option>
                  <option value={75}>75%+ Match</option>
                  <option value={85}>85%+ Match</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job List */}
          {loading ? (
            <div style={{ minHeight: '35vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner" style={{ width: '36px', height: '36px' }} />
            </div>
          ) : jobs.length === 0 ? (
            <div className="feature-card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted, #94a3b8)' }}>
              <Briefcase size={36} color="var(--text-dim, #64748b)" style={{ margin: '0 auto 0.75rem' }} />
              <p>No job positions match the selected filters. Try broadening your search.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {jobs.map((item, idx) => {
                const job = item.job || item;
                const jobId = job.id || `job_${idx}`;
                const title = job.title || 'Software Engineer';
                const company = job.company || 'Enterprise Corp';
                const loc = job.location || 'Bengaluru';
                const salary = job.salary || 'Competitive';
                const mode = job.workMode || 'Hybrid';
                const exp = job.experience || '0-2 Years';
                const skills = job.skills || [];
                const matchPct = item.matchPercentage || 85;
                const isSaved = savedJobIds.has(jobId);
                const appUrl = job.applicationUrl || 'https://careers.google.com';

                return (
                  <div
                    key={jobId}
                    className="feature-card"
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderRadius: 'var(--radius-xl, 24px)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem', gap: '0.5rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.2rem' }}>{title}</h3>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)' }}>
                            {company} • {loc}
                          </span>
                        </div>
                        <span style={{
                          background: 'rgba(99, 102, 241, 0.15)',
                          color: 'var(--primary-100, #e0e7ff)',
                          padding: '0.25rem 0.6rem',
                          borderRadius: 'var(--radius-full, 9999px)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          whiteSpace: 'nowrap'
                        }}>
                          {matchPct}% Match
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', margin: '0.75rem 0', flexWrap: 'wrap', fontSize: '0.8rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-emerald, #10b981)', background: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          <DollarSign size={13} /> {salary}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-cyan, #06b6d4)', background: 'rgba(6,182,212,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          <Clock size={13} /> {mode}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted, #94a3b8)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          {exp}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted, #94a3b8)', margin: '0.75rem 0', lineHeight: 1.5 }}>
                        {job.description}
                      </p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', margin: '0.75rem 0' }}>
                        {skills.map((s) => (
                          <span
                            key={s}
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              fontSize: '0.75rem',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              color: 'var(--text-main, #f8fafc)'
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
                      marginTop: '1rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))'
                    }}>
                      <button
                        onClick={() => toggleSave(jobId, title)}
                        style={{
                          background: isSaved ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${isSaved ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-subtle, rgba(255,255,255,0.08))'}`,
                          color: isSaved ? '#fb7185' : 'var(--text-muted, #94a3b8)',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.82rem'
                        }}
                      >
                        <Bookmark size={14} style={{ fill: isSaved ? '#fb7185' : 'none' }} />
                        <span>{isSaved ? 'Saved' : 'Save Job'}</span>
                      </button>

                      <a
                        href={appUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary"
                        style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '0.82rem', textDecoration: 'none' }}
                      >
                        <span>Apply Now</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};
