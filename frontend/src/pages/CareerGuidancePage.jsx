import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { careerApi } from '../api/careerApi';
import {
  Compass,
  Sparkles,
  Target,
  ArrowRight,
  GitMerge,
  Briefcase,
  GraduationCap,
  Search,
  Filter,
  X,
  RotateCcw,
  CheckCircle2,
  Layers,
  Code
} from 'lucide-react';
import { ErrorBoundary } from '../components/ErrorBoundary';

export const CareerGuidancePage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedSkill, setSelectedSkill] = useState('All');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const data = await careerApi.getRecommendations();
      const list = Array.isArray(data) ? data : [];
      setRecommendations(list);
    } catch (err) {
      console.error('Error fetching career recommendations:', err);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique domains
  const domains = useMemo(() => {
    const list = recommendations
      .map((r) => r?.career?.domain || r?.domain)
      .filter(Boolean);
    return ['All', ...new Set(list)];
  }, [recommendations]);

  // Extract all unique skills across recommendations
  const allSkills = useMemo(() => {
    const skillSet = new Set();
    recommendations.forEach((r) => {
      const career = r.career || r;
      (career?.requiredSkills || []).forEach((sk) => skillSet.add(sk));
      (career?.optionalSkills || []).forEach((sk) => skillSet.add(sk));
      (r?.matchingSkills || []).forEach((sk) => skillSet.add(sk));
    });
    return ['All', ...Array.from(skillSet).sort((a, b) => a.localeCompare(b))];
  }, [recommendations]);

  // Dynamic filtering based on search, domain, and skill
  const filteredList = useMemo(() => {
    let result = recommendations || [];

    // 1. Filter by Domain
    if (selectedDomain !== 'All') {
      result = result.filter((item) => {
        const career = item.career || item;
        return (career?.domain || '').toLowerCase() === selectedDomain.toLowerCase();
      });
    }

    // 2. Filter by Skill
    if (selectedSkill !== 'All') {
      const targetSkill = selectedSkill.toLowerCase();
      result = result.filter((item) => {
        const career = item.career || item;
        const required = (career?.requiredSkills || []).map((sk) => sk.toLowerCase());
        const optional = (career?.optionalSkills || []).map((sk) => sk.toLowerCase());
        const matching = (item?.matchingSkills || []).map((sk) => sk.toLowerCase());
        return (
          required.includes(targetSkill) ||
          optional.includes(targetSkill) ||
          matching.includes(targetSkill)
        );
      });
    }

    // 3. Filter by Search keywords
    if (search.trim()) {
      const searchTerms = search.toLowerCase().trim().split(/\s+/);
      result = result.filter((item) => {
        const career = item.career || item;
        const title = (career?.title || '').toLowerCase();
        const domain = (career?.domain || '').toLowerCase();
        const desc = (career?.description || '').toLowerCase();
        const reqSkills = (career?.requiredSkills || []).map((sk) => sk.toLowerCase());
        const optSkills = (career?.optionalSkills || []).map((sk) => sk.toLowerCase());
        const allText = `${title} ${domain} ${desc} ${reqSkills.join(' ')} ${optSkills.join(' ')}`;

        // Match if all search terms or the whole phrase match
        return searchTerms.every((term) => allText.includes(term)) || allText.includes(search.toLowerCase().trim());
      });
    }

    return result;
  }, [recommendations, selectedDomain, selectedSkill, search]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedDomain('All');
    setSelectedSkill('All');
  };

  const hasActiveFilters = search.trim() !== '' || selectedDomain !== 'All' || selectedSkill !== 'All';

  const quickTracks = [
    { label: 'Full Stack Web Developer', searchVal: 'Full Stack' },
    { label: 'Frontend React Specialist', searchVal: 'Frontend' },
    { label: 'Backend Services Engineer', searchVal: 'Backend' },
    { label: 'Cloud & DevOps', searchVal: 'Cloud' },
    { label: 'AI / Machine Learning', searchVal: 'Artificial Intelligence' },
    { label: 'Data & Analytics', searchVal: 'Data' }
  ];

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: 'var(--bg-main, #0B0F19)' }}>
        <Navbar />

        <div className="dashboard-container">
          {/* Header */}
          <section className="dashboard-hero" style={{ padding: '2.25rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--accent-cyan, #06b6d4)',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '0.5rem'
              }}
            >
              <Compass size={16} />
              <span>AI-Driven Transparent Matching Algorithm</span>
            </div>
            <h1>Career Guidance & Recommendation Pathways</h1>
            <p>
              Explore personalized career pathways ranked by match percentage based on your verified skills,
              academic specialization, and career preferences. Select your domain and skill to discover tailored paths.
            </p>
          </section>

          {/* Search, Domain, & Skill Filter Controls Panel */}
          <div
            style={{
              background: 'var(--bg-card, rgba(18, 24, 38, 0.75))',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
              borderRadius: 'var(--radius-xl, 24px)',
              padding: '1.5rem',
              marginBottom: '2rem',
              boxShadow: 'var(--shadow-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}
          >
            {/* Primary Filter Row: Search Input + Domain Dropdown + Skill Dropdown */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem',
                alignItems: 'center'
              }}
            >
              {/* Search Bar */}
              <div className="input-wrapper">
                <span className="input-icon-left">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  className="input-control"
                  placeholder="Search role (e.g. Full Stack Web Developer)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    style={{
                      position: 'absolute',
                      right: '0.85rem',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-dim, #64748b)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Domain Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 500 }}>
                  <Filter size={14} color="var(--primary-400, #818cf8)" />
                  <span>Select Domain:</span>
                </div>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="input-control"
                  style={{ paddingLeft: '1rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  <option value="All">All Domains ({domains.length - 1} available)</option>
                  {domains.filter((d) => d !== 'All').map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Skill Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 500 }}>
                  <Target size={14} color="var(--accent-emerald, #10b981)" />
                  <span>Select Skill:</span>
                </div>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="input-control"
                  style={{ paddingLeft: '1rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  <option value="All">All Skills ({allSkills.length - 1} available)</option>
                  {allSkills.filter((s) => s !== 'All').map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Filter Shortcut Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim, #64748b)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Popular Tracks:
              </span>
              {quickTracks.map((qt) => {
                const isSelected = search.toLowerCase() === qt.searchVal.toLowerCase();
                return (
                  <button
                    key={qt.label}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSearch('');
                      } else {
                        setSearch(qt.searchVal);
                      }
                    }}
                    style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: 'var(--radius-full, 9999px)',
                      border: `1px solid ${isSelected ? 'var(--primary-500, #6366f1)' : 'var(--border-subtle, rgba(255,255,255,0.08))'}`,
                      background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                      color: isSelected ? 'var(--primary-100, #e0e7ff)' : 'var(--text-muted, #94a3b8)',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      fontWeight: isSelected ? 600 : 400,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {qt.label}
                  </button>
                );
              })}
            </div>

            {/* Active Filters Summary Bar */}
            {hasActiveFilters && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  paddingTop: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>Active Filters:</span>
                  {selectedDomain !== 'All' && (
                    <span
                      style={{
                        background: 'rgba(99, 102, 241, 0.2)',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                        color: 'var(--primary-100, #e0e7ff)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full, 9999px)',
                        fontSize: '0.78rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      Domain: {selectedDomain}
                      <X size={13} style={{ cursor: 'pointer' }} onClick={() => setSelectedDomain('All')} />
                    </span>
                  )}
                  {selectedSkill !== 'All' && (
                    <span
                      style={{
                        background: 'rgba(16, 185, 129, 0.2)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        color: '#a7f3d0',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full, 9999px)',
                        fontSize: '0.78rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      Skill: {selectedSkill}
                      <X size={13} style={{ cursor: 'pointer' }} onClick={() => setSelectedSkill('All')} />
                    </span>
                  )}
                  {search.trim() && (
                    <span
                      style={{
                        background: 'rgba(6, 182, 212, 0.2)',
                        border: '1px solid rgba(6, 182, 212, 0.4)',
                        color: 'var(--accent-cyan, #06b6d4)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full, 9999px)',
                        fontSize: '0.78rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      Search: "{search.trim()}"
                      <X size={13} style={{ cursor: 'pointer' }} onClick={() => setSearch('')} />
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fb7185',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontWeight: 600
                  }}
                >
                  <RotateCcw size={13} />
                  <span>Clear All Filters</span>
                </button>
              </div>
            )}
          </div>

          {/* Results Count Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 500 }}>
              Showing <strong style={{ color: 'var(--text-main, #f8fafc)' }}>{filteredList.length}</strong> Career Pathway{filteredList.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Loading Spinner */}
          {loading ? (
            <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner" style={{ width: '36px', height: '36px' }} />
            </div>
          ) : filteredList.length === 0 ? (
            <div className="feature-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', color: 'var(--text-muted, #94a3b8)' }}>
              <Target size={40} color="var(--text-dim, #64748b)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main, #f8fafc)', marginBottom: '0.5rem' }}>
                No matching career pathways found
              </h3>
              <p style={{ maxWidth: '460px', margin: '0.5rem auto 1.5rem', fontSize: '0.92rem' }}>
                We couldn't find any career tracks matching your selected domain, skill, or search query.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-primary"
                style={{ width: 'auto', display: 'inline-flex', margin: '0 auto' }}
              >
                <RotateCcw size={16} />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {filteredList.map((item, idx) => {
                const career = item.career || item;
                const careerId = career.id || `career_${idx}`;
                const title = career.title || 'Software Career';
                const domain = career.domain || 'Software Engineering';
                const description = career.description || 'Build high-performance digital services.';
                const salaryRange = career.salaryRange || '₹8,00,000 - ₹18,00,000 / yr';
                const matchPercentage = item.matchPercentage || 85;
                const matchingSkills = item.matchingSkills || [];
                const missingSkills = item.missingSkills || [];

                return (
                  <div
                    key={careerId}
                    style={{
                      background: 'var(--bg-card, rgba(18, 24, 38, 0.75))',
                      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                      borderRadius: 'var(--radius-xl, 24px)',
                      padding: '2rem',
                      boxShadow: 'var(--shadow-subtle)',
                      transition: 'all var(--transition-normal)'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: '1.25rem',
                        marginBottom: '1.25rem'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{title}</h2>
                          <button
                            type="button"
                            onClick={() => setSelectedDomain(domain)}
                            title={`Filter by domain: ${domain}`}
                            style={{
                              background: 'rgba(99, 102, 241, 0.15)',
                              border: '1px solid rgba(99, 102, 241, 0.3)',
                              color: 'var(--primary-100, #e0e7ff)',
                              padding: '0.2rem 0.65rem',
                              borderRadius: 'var(--radius-full, 9999px)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            {domain}
                          </button>
                        </div>
                        <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.92rem', maxWidth: '750px', lineHeight: 1.5 }}>
                          {description}
                        </p>
                        <span style={{ fontSize: '0.82rem', color: 'var(--accent-emerald, #10b981)', display: 'block', marginTop: '0.4rem' }}>
                          Typical Industry Package: <strong>{salaryRange}</strong>
                        </span>
                      </div>

                      <div
                        style={{
                          textAlign: 'right',
                          background: 'rgba(255,255,255,0.03)',
                          padding: '0.75rem 1.25rem',
                          borderRadius: 'var(--radius-md, 12px)',
                          border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))'
                        }}
                      >
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', display: 'block' }}>
                          Match Compatibility
                        </span>
                        <span
                          style={{
                            fontSize: '1.85rem',
                            fontWeight: 800,
                            color: matchPercentage >= 75 ? 'var(--accent-emerald, #10b981)' : 'var(--accent-cyan, #06b6d4)'
                          }}
                        >
                          {matchPercentage}%
                        </span>
                      </div>
                    </div>

                    {/* Skills Grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '1.25rem',
                        marginBottom: '1.5rem',
                        background: 'rgba(0,0,0,0.2)',
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--radius-md, 12px)'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-emerald, #10b981)', display: 'block', marginBottom: '0.4rem' }}>
                          ✓ Matching Skills ({matchingSkills.length}):
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {matchingSkills.length > 0 ? (
                            matchingSkills.map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setSelectedSkill(s)}
                                title={`Filter by skill: ${s}`}
                                style={{
                                  background: selectedSkill === s ? 'var(--accent-emerald, #10b981)' : 'rgba(16, 185, 129, 0.15)',
                                  color: selectedSkill === s ? '#000000' : '#a7f3d0',
                                  border: `1px solid ${selectedSkill === s ? '#10b981' : 'transparent'}`,
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: '4px',
                                  fontSize: '0.78rem',
                                  cursor: 'pointer',
                                  fontWeight: selectedSkill === s ? 700 : 500
                                }}
                              >
                                {s}
                              </button>
                            ))
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim, #64748b)' }}>None matched yet</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fb7185', display: 'block', marginBottom: '0.4rem' }}>
                          ⚠ Missing Skills to Acquire ({missingSkills.length}):
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {missingSkills.length > 0 ? (
                            missingSkills.map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setSelectedSkill(s)}
                                title={`Filter by skill: ${s}`}
                                style={{
                                  background: selectedSkill === s ? '#fb7185' : 'rgba(244, 63, 94, 0.12)',
                                  color: selectedSkill === s ? '#000000' : '#fecdd3',
                                  border: `1px solid ${selectedSkill === s ? '#fb7185' : 'transparent'}`,
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: '4px',
                                  fontSize: '0.78rem',
                                  cursor: 'pointer',
                                  fontWeight: selectedSkill === s ? 700 : 500
                                }}
                              >
                                {s}
                              </button>
                            ))
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'var(--accent-emerald, #10b981)' }}>
                              All core skills matched! 🎉
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <Link
                        to={`/career-details/${careerId}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.55rem 1rem',
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
                          borderRadius: 'var(--radius-md, 12px)',
                          color: 'var(--text-main, #f8fafc)',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          textDecoration: 'none'
                        }}
                      >
                        <span>View Career Details</span>
                        <ArrowRight size={14} />
                      </Link>

                      <Link
                        to={`/roadmap?career=${careerId}`}
                        className="btn-primary"
                        style={{ width: 'auto', padding: '0.55rem 1.1rem', fontSize: '0.85rem', textDecoration: 'none' }}
                      >
                        <GitMerge size={14} />
                        <span>Start Roadmap</span>
                      </Link>

                      <Link
                        to={`/skill-gap?career=${careerId}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.55rem 1rem',
                          background: 'rgba(236, 72, 153, 0.12)',
                          border: '1px solid rgba(236, 72, 153, 0.3)',
                          borderRadius: 'var(--radius-md, 12px)',
                          color: '#f472b6',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          textDecoration: 'none'
                        }}
                      >
                        <Sparkles size={14} />
                        <span>Analyze Skill Gap</span>
                      </Link>

                      <Link
                        to={`/jobs?search=${encodeURIComponent(title)}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.55rem 1rem',
                          background: 'rgba(99, 102, 241, 0.12)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          borderRadius: 'var(--radius-md, 12px)',
                          color: 'var(--primary-100, #e0e7ff)',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          textDecoration: 'none'
                        }}
                      >
                        <Briefcase size={14} />
                        <span>View Jobs</span>
                      </Link>

                      <Link
                        to={`/internships?search=${encodeURIComponent(title)}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.55rem 1rem',
                          background: 'rgba(6, 182, 212, 0.12)',
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                          borderRadius: 'var(--radius-md, 12px)',
                          color: 'var(--accent-cyan, #06b6d4)',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          textDecoration: 'none'
                        }}
                      >
                        <GraduationCap size={14} />
                        <span>View Internships</span>
                      </Link>
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
