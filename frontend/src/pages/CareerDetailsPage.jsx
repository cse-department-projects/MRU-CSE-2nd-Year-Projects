import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { careerApi } from '../api/careerApi';
import { jobApi } from '../api/jobApi';
import { internshipApi } from '../api/internshipApi';
import { resourceApi } from '../api/resourceApi';
import { Compass, GitMerge, Sparkles, Briefcase, GraduationCap, ArrowLeft, CheckCircle2, TrendingUp, DollarSign, Award, BookOpen, RotateCcw, ChevronRight, Layers } from 'lucide-react';
import { ErrorBoundary } from '../components/ErrorBoundary';

export const CareerDetailsPage = () => {
  const { id } = useParams();
  const [career, setCareer] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [relatedInternships, setRelatedInternships] = useState([]);
  const [relatedResources, setRelatedResources] = useState([]);
  const [allCareers, setAllCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchCareerDetails();
  }, [id]);

  const fetchCareerDetails = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      // Fetch career & match info safely
      const careerRes = await careerApi.getCareerById(id);
      setCareer(careerRes);

      const [matchRes, jobsRes, intRes, allCRes] = await Promise.allSettled([
        careerApi.getCareerMatch(id),
        jobApi.getJobs({ search: careerRes?.title || '' }),
        internshipApi.getInternships({ search: careerRes?.title || '' }),
        careerApi.getAllCareers()
      ]);

      if (matchRes.status === 'fulfilled') setMatchData(matchRes.value);
      if (jobsRes.status === 'fulfilled' && Array.isArray(jobsRes.value)) setRelatedJobs(jobsRes.value.slice(0, 6));
      if (intRes.status === 'fulfilled' && Array.isArray(intRes.value)) setRelatedInternships(intRes.value.slice(0, 6));
      if (allCRes.status === 'fulfilled' && Array.isArray(allCRes.value)) {
        const normList = allCRes.value.map((item) => {
          const c = item?.career || item;
          return {
            ...c,
            id: c.id || item.id || c._id || item._id,
            title: c.title || c.roleName || c.name || 'Career Role',
            domain: c.domain || item.domain || ''
          };
        });
        setAllCareers(normList.filter((c) => c.id !== id).slice(0, 5));
      }

      // Fetch related resources
      try {
        const topSkill = careerRes?.requiredSkills?.[0] || 'Java';
        const resList = await resourceApi.getResources({ skill: topSkill });
        if (Array.isArray(resList)) setRelatedResources(resList.slice(0, 6));
      } catch (e) {
        // non-blocking
      }
    } catch (err) {
      console.error('Error loading career details:', err);
      setErrorMessage(err.message || 'Unable to load career details from the server.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-main, #0B0F19)' }}>
        <Navbar />
        <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
          <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.95rem' }}>Loading Career Blueprint...</span>
        </div>
      </div>
    );
  }

  if (errorMessage || !career) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-main, #0B0F19)' }}>
        <Navbar />
        <div className="dashboard-container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <div style={{
            background: 'var(--bg-card, rgba(18,24,38,0.75))',
            border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
            borderRadius: 'var(--radius-xl, 24px)',
            padding: '3.5rem 2rem',
            maxWidth: '560px',
            margin: '0 auto'
          }}>
            <Compass size={48} color="var(--accent-rose, #fb7185)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', color: 'var(--text-main, #f8fafc)' }}>
              {errorMessage ? 'Unable to Load Career Details' : 'Career Profile Not Found'}
            </h2>
            <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.5 }}>
              {errorMessage || 'The requested career pathway does not exist in the database or may have been updated.'}
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={fetchCareerDetails}
                className="btn-primary"
                style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <RotateCcw size={15} />
                <span>Retry</span>
              </button>

              <Link
                to="/career-guidance"
                style={{
                  padding: '0.65rem 1.25rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                Browse All Careers
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const reqSkills = career.requiredSkills || ['Java', 'Spring Boot', 'SQL', 'React', 'Git'];
  const prefSkills = career.preferredSkills || ['Docker', 'MongoDB', 'AWS', 'CI/CD'];
  const responsibilities = career.responsibilities || [
    'Design and build high-throughput microservices and APIs',
    'Develop reactive, glassmorphic client web applications',
    'Optimize database queries and data persistence transactions',
    'Implement authentication and authorization security layers',
    'Automate testing, containerization, and cloud deployments'
  ];
  const progression = career.careerProgression || ['Junior Developer', 'Mid-Level Engineer', 'Senior Lead', 'Principal Architect'];
  const matchPct = matchData?.matchPercentage ?? 85;

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: 'var(--bg-main, #0B0F19)' }}>
        <Navbar />

        <div className="dashboard-container">
          {/* Back button */}
          <div style={{ marginBottom: '1.5rem' }}>
            <Link to="/career-guidance" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted, #94a3b8)', fontSize: '0.88rem', textDecoration: 'none' }}>
              <ArrowLeft size={16} /> Back to Career Guidance
            </Link>
          </div>

          {/* Hero Banner */}
          <section className="dashboard-hero" style={{ padding: '2.5rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <span style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: 'var(--primary-100, #e0e7ff)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full, 9999px)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'inline-block',
                  marginBottom: '0.75rem'
                }}>
                  {career.domain || 'Software Engineering'}
                </span>
                <h1 style={{ fontSize: '2.4rem', margin: '0 0 0.5rem' }}>{career.title}</h1>
                <p style={{ color: 'var(--text-muted, #94a3b8)', maxWidth: '750px', fontSize: '1.05rem', lineHeight: 1.6 }}>
                  {career.description}
                </p>
              </div>

              {matchData && (
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))', padding: '1.25rem 2rem', borderRadius: 'var(--radius-lg, 16px)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', display: 'block' }}>Your Skill Match</span>
                  <span style={{ fontSize: '2.4rem', fontWeight: 800, color: matchPct >= 75 ? 'var(--accent-emerald, #10b981)' : 'var(--accent-cyan, #06b6d4)' }}>
                    {matchPct}%
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))' }}>
                <DollarSign size={16} color="var(--accent-emerald, #10b981)" />
                <span style={{ fontSize: '0.88rem' }}>Salary: <strong>{career.salaryRange || '₹8.5 LPA - ₹18.0 LPA'}</strong></span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))' }}>
                <Award size={16} color="var(--accent-cyan, #06b6d4)" />
                <span style={{ fontSize: '0.88rem' }}>Experience: <strong>{career.experienceLevel || 'Fresher / Entry Level'}</strong></span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))' }}>
                <TrendingUp size={16} color="var(--accent-amber, #f59e0b)" />
                <span style={{ fontSize: '0.88rem' }}>Market Demand: <strong>{career.marketDemand || 'Very High'}</strong></span>
              </div>
            </div>
          </section>

          {/* Action Trigger Buttons */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <Link to={`/roadmap?career=${career.id}`} className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
              <GitMerge size={17} />
              <span>Start Interactive Roadmap</span>
            </Link>

            <Link to={`/skill-gap?career=${career.id}`} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md, 12px)',
              color: '#fb7185',
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              <Sparkles size={17} />
              <span>Perform Skill Gap Audit</span>
            </Link>

            <Link to={`/jobs?search=${encodeURIComponent(career.title)}`} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 'var(--radius-md, 12px)',
              color: 'var(--primary-100, #e0e7ff)',
              fontWeight: 600,
              textDecoration: 'none'
            }}>
              <Briefcase size={17} />
              <span>View Matching Jobs</span>
            </Link>
          </div>

          {/* Core Grid: Skills & Responsibilities */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
            {/* Required & Preferred Skills */}
            <div className="feature-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: 'var(--accent-cyan, #06b6d4)' }}>
                Required & Preferred Skills
              </h3>

              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-dim, #64748b)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                  CORE REQUIRED SKILLS ({reqSkills.length}):
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {reqSkills.map((s) => (
                    <span key={s} style={{ background: 'rgba(99, 102, 241, 0.18)', border: '1px solid rgba(99, 102, 241, 0.35)', color: 'var(--primary-100, #e0e7ff)', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-dim, #64748b)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                  PREFERRED & ADVANCED SKILLS ({prefSkills.length}):
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                  {prefSkills.map((s) => (
                    <span key={s} style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))', color: 'var(--text-muted, #94a3b8)', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Core Responsibilities */}
            <div className="feature-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: 'var(--accent-emerald, #10b981)' }}>
                Day-to-Day Responsibilities
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: 0 }}>
                {responsibilities.map((resp, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    <CheckCircle2 size={16} color="var(--accent-emerald, #10b981)" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Career Progression Pathway Ladder */}
          <div className="feature-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main, #f8fafc)' }}>
              <TrendingUp size={20} color="var(--accent-cyan, #06b6d4)" />
              <span>Hierarchical Career Growth Ladder</span>
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {progression.map((step, idx) => (
                <React.Fragment key={idx}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                    padding: '0.85rem 1.25rem',
                    borderRadius: 'var(--radius-md, 12px)',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    color: idx === 0 ? 'var(--accent-emerald, #10b981)' : idx === progression.length - 1 ? 'var(--accent-cyan, #06b6d4)' : 'var(--text-main, #f8fafc)'
                  }}>
                    {step}
                  </div>
                  {idx < progression.length - 1 && (
                    <ChevronRight size={18} color="var(--text-dim, #64748b)" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Related Jobs Section (5+) */}
          {relatedJobs.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={20} color="var(--primary-400, #818cf8)" />
                <span>Related Full-Time Job Openings ({relatedJobs.length})</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {relatedJobs.map((item, idx) => {
                  const job = item.job || item;
                  return (
                    <div key={job.id || idx} className="feature-card" style={{ padding: '1.25rem' }}>
                      <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.2rem' }}>{job.title}</h4>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', display: 'block', marginBottom: '0.6rem' }}>
                        {job.company} • {job.location} • <strong style={{ color: 'var(--accent-emerald, #10b981)' }}>{job.salary}</strong>
                      </span>
                      <a href={job.applicationUrl || 'https://careers.google.com'} target="_blank" rel="noreferrer" className="btn-primary" style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.8rem', textDecoration: 'none' }}>
                        Apply Online →
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Related Other Careers (5+) */}
          {allCareers.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Compass size={20} color="var(--accent-cyan, #06b6d4)" />
                <span>Explore Other Related Career Pathways</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                {allCareers.map((c) => (
                  <Link
                    key={c.id}
                    to={`/careers/${c.id}`}
                    className="feature-card"
                    style={{ padding: '1.25rem', textDecoration: 'none', color: 'inherit' }}
                  >
                    <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-100, #e0e7ff)', fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                      {c.domain}
                    </span>
                    <h4 style={{ fontSize: '1.1rem', margin: '0.5rem 0 0.2rem', color: 'var(--text-main, #f8fafc)' }}>{c.title}</h4>
                    <span style={{ fontSize: '0.82rem', color: 'var(--accent-emerald, #10b981)' }}>{c.salaryRange}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};
