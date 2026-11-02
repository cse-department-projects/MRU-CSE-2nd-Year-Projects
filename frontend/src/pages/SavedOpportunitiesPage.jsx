import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { jobApi } from '../api/jobApi';
import { internshipApi } from '../api/internshipApi';
import { Bookmark, Briefcase, GraduationCap, Trash2, ExternalLink, MapPin, DollarSign, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ErrorBoundary } from '../components/ErrorBoundary';

export const SavedOpportunitiesPage = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [savedInternships, setSavedInternships] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const [jobs, internships] = await Promise.all([
        jobApi.getSavedJobs(),
        internshipApi.getSavedInternships(),
      ]);
      setSavedJobs(Array.isArray(jobs) ? jobs : []);
      setSavedInternships(Array.isArray(internships) ? internships : []);
    } catch (err) {
      console.error('Error fetching saved opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveJob = async (id, title) => {
    try {
      await jobApi.unsaveJob(id);
      setSavedJobs((prev) => prev.filter((j) => (j?.job?.id || j?.id) !== id));
      setToastMsg(`Removed "${title}" from your bookmarks.`);
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      console.error('Error unsaving job:', err);
    }
  };

  const handleUnsaveInternship = async (id, title) => {
    try {
      await internshipApi.unsaveInternship(id);
      setSavedInternships((prev) => prev.filter((i) => (i?.internship?.id || i?.id) !== id));
      setToastMsg(`Removed "${title}" from your bookmarks.`);
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      console.error('Error unsaving internship:', err);
    }
  };

  const totalSavedCount = savedJobs.length + savedInternships.length;

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: 'var(--bg-main, #0B0F19)' }}>
        <Navbar />

        <div className="dashboard-container">
          {/* Header */}
          <section className="dashboard-hero" style={{ padding: '2.25rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#fb7185', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <Bookmark size={16} />
              <span>Bookmarked Opportunities</span>
            </div>
            <h1>Saved Jobs & Internships</h1>
            <p>
              Manage your shortlisted positions, monitor application deadlines, and apply directly.
            </p>
          </section>

          {/* Toast Notification */}
          {toastMsg && (
            <div className="global-alert success" style={{ marginBottom: '1.5rem' }}>
              <CheckCircle2 size={18} />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* Tab Filter */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: 'var(--radius-full, 9999px)',
                border: `1px solid ${activeTab === 'all' ? 'var(--primary-500, #6366f1)' : 'var(--border-subtle, rgba(255,255,255,0.08))'}`,
                background: activeTab === 'all' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                color: activeTab === 'all' ? 'var(--primary-100, #e0e7ff)' : 'var(--text-muted, #94a3b8)',
                fontSize: '0.88rem',
                fontWeight: activeTab === 'all' ? 600 : 400,
                cursor: 'pointer'
              }}
            >
              All Bookmarks ({totalSavedCount})
            </button>

            <button
              onClick={() => setActiveTab('jobs')}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: 'var(--radius-full, 9999px)',
                border: `1px solid ${activeTab === 'jobs' ? 'var(--primary-500, #6366f1)' : 'var(--border-subtle, rgba(255,255,255,0.08))'}`,
                background: activeTab === 'jobs' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                color: activeTab === 'jobs' ? 'var(--primary-100, #e0e7ff)' : 'var(--text-muted, #94a3b8)',
                fontSize: '0.88rem',
                fontWeight: activeTab === 'jobs' ? 600 : 400,
                cursor: 'pointer'
              }}
            >
              Saved Jobs ({savedJobs.length})
            </button>

            <button
              onClick={() => setActiveTab('internships')}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: 'var(--radius-full, 9999px)',
                border: `1px solid ${activeTab === 'internships' ? 'var(--primary-500, #6366f1)' : 'var(--border-subtle, rgba(255,255,255,0.08))'}`,
                background: activeTab === 'internships' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                color: activeTab === 'internships' ? 'var(--primary-100, #e0e7ff)' : 'var(--text-muted, #94a3b8)',
                fontSize: '0.88rem',
                fontWeight: activeTab === 'internships' ? 600 : 400,
                cursor: 'pointer'
              }}
            >
              Saved Internships ({savedInternships.length})
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ minHeight: '30vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner" style={{ width: '36px', height: '36px' }} />
            </div>
          ) : totalSavedCount === 0 ? (
            <div style={{ background: 'var(--bg-card, rgba(18,24,38,0.75))', border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))', borderRadius: 'var(--radius-lg, 16px)', padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted, #94a3b8)' }}>
              <Bookmark size={40} color="var(--text-dim, #64748b)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-main, #f8fafc)' }}>No Saved Opportunities Yet</h3>
              <p style={{ maxWidth: '500px', margin: '0.5rem auto 1.5rem', lineHeight: 1.5 }}>
                When you explore jobs or internships, click the bookmark icon to save them here for fast application follow-up.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link to="/jobs" className="btn-primary" style={{ width: 'auto', textDecoration: 'none' }}>Browse Jobs</Link>
                <Link to="/internships" style={{ padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', color: 'white', textDecoration: 'none' }}>
                  Browse Internships
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Jobs List */}
              {(activeTab === 'all' || activeTab === 'jobs') && savedJobs.map((item, idx) => {
                const job = item.job || item;
                const jobId = job.id || `job_${idx}`;
                const title = job.title || 'Software Engineer';
                const company = job.company || 'Tech Corp';
                const location = job.location || 'Bengaluru';
                const salary = job.salary || 'Competitive';
                const workMode = job.workMode || 'Hybrid';
                const appUrl = job.applicationUrl || 'https://careers.google.com';

                return (
                  <div
                    key={jobId}
                    style={{
                      background: 'var(--bg-card, rgba(18, 24, 38, 0.75))',
                      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                      borderRadius: 'var(--radius-xl, 24px)',
                      padding: '1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1.25rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <Briefcase size={16} color="var(--primary-400, #818cf8)" />
                        <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{title}</h3>
                        <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-100, #e0e7ff)', fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          {workMode}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)' }}>
                        {company} • {location} • <strong style={{ color: 'var(--accent-emerald, #10b981)' }}>{salary}</strong>
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <a
                        href={appUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary"
                        style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.82rem', textDecoration: 'none' }}
                      >
                        <span>Apply Now</span>
                        <ExternalLink size={14} />
                      </a>

                      <button
                        onClick={() => handleUnsaveJob(jobId, title)}
                        style={{
                          background: 'rgba(244, 63, 94, 0.1)',
                          border: '1px solid rgba(244, 63, 94, 0.3)',
                          color: '#fb7185',
                          padding: '0.5rem 0.8rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.82rem'
                        }}
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Internships List */}
              {(activeTab === 'all' || activeTab === 'internships') && savedInternships.map((item, idx) => {
                const internship = item.internship || item;
                const internshipId = internship.id || `int_${idx}`;
                const title = internship.title || 'Software Intern';
                const company = internship.company || 'Tech Org';
                const location = internship.location || 'Remote';
                const stipend = internship.stipend || 'Competitive Stipend';
                const workMode = internship.workMode || 'Remote';
                const appUrl = internship.applicationUrl || 'https://careers.google.com';

                return (
                  <div
                    key={internshipId}
                    style={{
                      background: 'var(--bg-card, rgba(18, 24, 38, 0.75))',
                      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                      borderRadius: 'var(--radius-xl, 24px)',
                      padding: '1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1.25rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <GraduationCap size={16} color="var(--accent-cyan, #06b6d4)" />
                        <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{title}</h3>
                        <span style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan, #06b6d4)', fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          {workMode}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)' }}>
                        {company} • {location} • <strong style={{ color: 'var(--accent-cyan, #06b6d4)' }}>{stipend}</strong>
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <a
                        href={appUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary"
                        style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.82rem', textDecoration: 'none' }}
                      >
                        <span>Apply Now</span>
                        <ExternalLink size={14} />
                      </a>

                      <button
                        onClick={() => handleUnsaveInternship(internshipId, title)}
                        style={{
                          background: 'rgba(244, 63, 94, 0.1)',
                          border: '1px solid rgba(244, 63, 94, 0.3)',
                          color: '#fb7185',
                          padding: '0.5rem 0.8rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.82rem'
                        }}
                      >
                        <Trash2 size={14} />
                        <span>Remove</span>
                      </button>
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
