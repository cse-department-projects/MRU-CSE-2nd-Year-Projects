import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { internshipApi } from '../api/internshipApi';
import { GraduationCap, Search, Bookmark, ExternalLink, MapPin, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { ErrorBoundary } from '../components/ErrorBoundary';

export const InternshipsPage = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState('All');
  const [savedInternshipIds, setSavedInternshipIds] = useState(new Set());
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    fetchInternships();
  }, [search, workMode]);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const data = await internshipApi.getInternships({ search, workMode });
      const intList = Array.isArray(data) ? data : [];
      setInternships(intList);
      const saved = new Set(intList.filter((i) => i?.isSaved).map((i) => i?.internship?.id || i?.id));
      setSavedInternshipIds(saved);
    } catch (err) {
      console.error('Error fetching internships:', err);
      setInternships([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async (id, title) => {
    try {
      if (savedInternshipIds.has(id)) {
        await internshipApi.unsaveInternship(id);
        setSavedInternshipIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setToastMsg(`Removed "${title}" from saved internships.`);
      } else {
        await internshipApi.saveInternship(id);
        setSavedInternshipIds((prev) => new Set(prev).add(id));
        setToastMsg(`Saved "${title}" to your bookmarks!`);
      }
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      console.error('Failed to toggle save internship:', err);
    }
  };

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: 'var(--bg-main, #0B0F19)' }}>
        <Navbar />

        <div className="dashboard-container">
          {/* Header */}
          <section className="dashboard-hero" style={{ padding: '2.25rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan, #06b6d4)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <GraduationCap size={16} />
              <span>Internship Matching & Fast-Track Pathways</span>
            </div>
            <h1>Student & Graduate Internships</h1>
            <p>
              Accelerate your industry career with verified technical internships offering competitive stipends, mentorship, and PPO opportunities.
            </p>
          </section>

          {/* Toast Notification */}
          {toastMsg && (
            <div className="global-alert success" style={{ marginBottom: '1.5rem' }}>
              <CheckCircle2 size={18} />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* Filters Bar */}
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
                placeholder="Search internship by role, company, or skill..."
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
            </div>
          </div>

          {/* Internship List */}
          {loading ? (
            <div style={{ minHeight: '35vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner" style={{ width: '36px', height: '36px' }} />
            </div>
          ) : internships.length === 0 ? (
            <div className="feature-card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted, #94a3b8)' }}>
              <GraduationCap size={36} color="var(--text-dim, #64748b)" style={{ margin: '0 auto 0.75rem' }} />
              <p>No internships found matching your query.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {internships.map((item, idx) => {
                const internship = item.internship || item;
                const intId = internship.id || `int_${idx}`;
                const title = internship.title || 'Engineering Intern';
                const company = internship.company || 'Tech Org';
                const loc = internship.location || 'Remote';
                const stipend = internship.stipend || 'Competitive Stipend';
                const duration = internship.duration || '6 Months';
                const mode = internship.workMode || 'Remote';
                const skills = internship.skills || [];
                const matchPct = item.matchPercentage || 85;
                const isSaved = savedInternshipIds.has(intId);
                const appUrl = internship.applicationUrl || 'https://careers.google.com';

                return (
                  <div
                    key={intId}
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
                          background: 'rgba(6, 182, 212, 0.15)',
                          color: 'var(--accent-cyan, #06b6d4)',
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
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-cyan, #06b6d4)', background: 'rgba(6,182,212,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          <DollarSign size={13} /> {stipend}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-emerald, #10b981)', background: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          <Clock size={13} /> {duration}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted, #94a3b8)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          {mode}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted, #94a3b8)', margin: '0.75rem 0', lineHeight: 1.5 }}>
                        {internship.description}
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
                        onClick={() => toggleSave(intId, title)}
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
                        <span>{isSaved ? 'Saved' : 'Save'}</span>
                      </button>

                      <a
                        href={appUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: 'var(--accent-cyan, #06b6d4)',
                          color: '#0b0f19',
                          padding: '0.45rem 1rem',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          textDecoration: 'none'
                        }}
                      >
                        <span>Apply</span>
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
