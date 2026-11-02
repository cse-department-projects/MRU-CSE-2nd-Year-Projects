import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { careerApi } from '../api/careerApi';
import { skillGapApi } from '../api/skillGapApi';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  GitMerge,
  Check,
  ArrowRight,
  Target,
  RotateCcw,
  Plus,
  Filter,
  Search,
  Briefcase
} from 'lucide-react';
import { ErrorBoundary } from '../components/ErrorBoundary';

export const SkillGapPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawParam = searchParams.get('career') || '';

  const [careers, setCareers] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedCareerId, setSelectedCareerId] = useState('');
  const [skillGap, setSkillGap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gapLoading, setGapLoading] = useState(false);
  const [completingSkill, setCompletingSkill] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Initial Load of Career tracks
  useEffect(() => {
    fetchInitialCareers();
  }, []);

  const fetchInitialCareers = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const allCareers = await careerApi.getAllCareers();
      const rawList = Array.isArray(allCareers) && allCareers.length > 0 ? allCareers : [];
      const list = rawList.map((item) => {
        const c = item?.career || item;
        return {
          ...c,
          id: c.id || item.id || c._id || item._id,
          title: c.title || c.roleName || c.careerTitle || c.name || item.title || 'Career Role',
          domain: c.domain || c.category || item.domain || 'General',
          requiredSkills: c.requiredSkills || item.requiredSkills || [],
          preferredSkills: c.preferredSkills || item.preferredSkills || []
        };
      });
      setCareers(list);

      // Validate initial career parameter against loaded list
      const matched = list.find(
        (c) =>
          c.id === rawParam ||
          (c.title || '').toLowerCase() === rawParam.toLowerCase()
      );
      const targetId = matched ? matched.id : (list.length > 0 ? list[0].id : 'c_1');
      setSelectedCareerId(targetId);

      if (matched && matched.domain) {
        setSelectedDomain(matched.domain);
      }

      if (targetId) {
        await fetchGapAnalysis(targetId, list);
      }
    } catch (err) {
      console.error('Error loading initial skill gap data:', err);
      setErrorMessage('Failed to load career tracks.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Skill Gap Analysis for the selected career
  const fetchGapAnalysis = async (careerId, careerList = careers) => {
    if (!careerId) return;
    try {
      setGapLoading(true);
      setErrorMessage('');
      const data = await skillGapApi.analyzeGap(careerId);
      setSkillGap(data);
    } catch (err) {
      console.error('Failed to analyze skill gap:', err);
      // Fallback local computation if network hiccup
      const targetCareer = (careerList.length > 0 ? careerList : careers).find(
        (c) => (c.id || c?.career?.id) === careerId
      );
      if (targetCareer) {
        const roleTitle = targetCareer.title || targetCareer?.career?.title || 'Target Role';
        const req = targetCareer.requiredSkills || targetCareer?.career?.requiredSkills || [];
        setSkillGap({
          careerId: targetCareer.id || targetCareer?.career?.id || careerId,
          careerTitle: roleTitle,
          requiredSkills: req,
          userSkills: [],
          matchedSkills: [],
          missingSkills: req.map((s, idx) => ({
            skillName: s,
            importance: idx < 2 ? 'High' : 'Medium',
            whyRequired: `Core prerequisite for ${roleTitle} workflows.`,
            recommendedResource: `Curated ${s} Masterclass`,
            estimatedDuration: '2-3 Weeks',
            roadmapPosition: `Phase ${(idx % 4) + 1}`
          })),
          matchPercentage: 0
        });
      }
    } finally {
      setGapLoading(false);
    }
  };

  const handleCareerSelect = (careerId) => {
    setSelectedCareerId(careerId);
    setSearchParams({ career: careerId });
    fetchGapAnalysis(careerId);
  };

  const handleDomainChange = (domain) => {
    setSelectedDomain(domain);
    const inDomain = domain === 'All'
      ? careers
      : careers.filter((c) => (c.domain || '').toLowerCase() === domain.toLowerCase());
    if (inDomain.length > 0 && !inDomain.some((c) => c.id === selectedCareerId)) {
      handleCareerSelect(inDomain[0].id);
    }
  };

  const handleMarkCompleted = async (skillName) => {
    try {
      setCompletingSkill(skillName);
      const updated = await skillGapApi.markSkillCompleted(selectedCareerId, skillName);
      setSkillGap(updated);
      setSuccessToast(`🎉 Awesome! Marked "${skillName}" as mastered and synced to profile.`);
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      console.error('Error completing skill:', err);
      // Local optimistic update
      setSkillGap((prev) => {
        if (!prev) return prev;
        const nextMissing = (prev.missingSkills || []).filter((s) => (s.skillName || s) !== skillName);
        const nextMatched = [...(prev.matchedSkills || []), skillName];
        const total = nextMissing.length + nextMatched.length;
        const nextPct = total === 0 ? 100 : Math.round((nextMatched.length / total) * 100);
        return {
          ...prev,
          missingSkills: nextMissing,
          matchedSkills: nextMatched,
          matchPercentage: nextPct
        };
      });
      setSuccessToast(`🎉 Marked "${skillName}" as mastered!`);
      setTimeout(() => setSuccessToast(''), 3000);
    } finally {
      setCompletingSkill('');
    }
  };

  // Available unique domains
  const domains = useMemo(() => {
    const list = careers.map((c) => c.domain || c?.career?.domain).filter(Boolean);
    return ['All', ...new Set(list)];
  }, [careers]);

  // Filtered careers by selected domain
  const filteredCareers = useMemo(() => {
    if (selectedDomain === 'All') return careers;
    return careers.filter((c) => {
      const d = c.domain || c?.career?.domain || '';
      return d.toLowerCase() === selectedDomain.toLowerCase();
    });
  }, [careers, selectedDomain]);

  // Current active career
  const currentCareer = careers.find((c) => (c.id || c?.career?.id) === selectedCareerId) || careers[0] || null;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-main, #0B0F19)' }}>
        <Navbar />
        <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
          <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.95rem' }}>Calculating Skill Gap Matrix...</span>
        </div>
      </div>
    );
  }

  const matchPct = skillGap?.matchPercentage ?? 0;
  const matchedList = skillGap?.matchedSkills || [];
  const missingList = skillGap?.missingSkills || [];
  const matchedCount = matchedList.length;
  const missingCount = missingList.length;
  const totalCount = matchedCount + missingCount;

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
                color: 'var(--accent-rose, #fb7185)',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '0.5rem'
              }}
            >
              <Sparkles size={16} />
              <span>Target Competency Diagnostic Engine</span>
            </div>
            <h1>Skill Gap Analysis & Readiness Assessment</h1>
            <p>
              Evaluate your verified competencies against target industry tracks, identify missing technical requirements,
              and bridge gaps with curated learning milestones.
            </p>
          </section>

          {successToast && (
            <div className="global-alert success" style={{ marginBottom: '1.5rem' }}>
              <CheckCircle2 size={18} />
              <span>{successToast}</span>
            </div>
          )}

          {errorMessage && (
            <div className="global-alert error" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => fetchGapAnalysis(selectedCareerId)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.3rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Interactive Domain & Career Track Selector Card */}
          <div
            style={{
              background: 'var(--bg-card, rgba(18, 24, 38, 0.75))',
              border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
              borderRadius: 'var(--radius-xl, 24px)',
              padding: '1.75rem',
              marginBottom: '2rem',
              boxShadow: 'var(--shadow-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}
          >
            {/* Domain Filter Buttons */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>
                <Filter size={15} color="var(--primary-400, #818cf8)" />
                <span>1. Select Domain:</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {domains.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleDomainChange(d)}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: 'var(--radius-full, 9999px)',
                      border: `1px solid ${selectedDomain === d ? 'var(--primary-500, #6366f1)' : 'var(--border-subtle, rgba(255, 255, 255, 0.08))'}`,
                      background: selectedDomain === d ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                      color: selectedDomain === d ? 'var(--primary-100, #e0e7ff)' : 'var(--text-muted, #94a3b8)',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      fontWeight: selectedDomain === d ? 600 : 400,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Career Track Dropdown & Actions */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
                gap: '1rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <div style={{ flex: '1 1 320px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>
                  <Briefcase size={15} color="var(--accent-cyan, #06b6d4)" />
                  <span>2. Select Career Role for Gap Analysis:</span>
                </div>
                <select
                  value={selectedCareerId}
                  onChange={(e) => handleCareerSelect(e.target.value)}
                  className="input-control"
                  style={{ width: '100%', paddingLeft: '1rem', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}
                >
                  {filteredCareers.map((c) => {
                    const roleTitle = c.title || c?.career?.title || c.roleName || c.name || 'Career Role';
                    const roleDomain = c.domain || c?.career?.domain || '';
                    const roleId = c.id || c?.career?.id || c._id;
                    return (
                      <option key={roleId} value={roleId}>
                        {roleTitle} {roleDomain ? `— [${roleDomain}]` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <Link
                  to={`/career-guidance`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem 1.1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                    borderRadius: 'var(--radius-md, 12px)',
                    color: 'var(--text-main, #f8fafc)',
                    fontSize: '0.85rem',
                    textDecoration: 'none'
                  }}
                >
                  <span>Explore All Careers</span>
                </Link>

                <Link
                  to={`/roadmap?career=${selectedCareerId}`}
                  className="btn-primary"
                  style={{ width: 'auto', padding: '0.65rem 1.25rem', textDecoration: 'none' }}
                >
                  <GitMerge size={16} />
                  <span>Open Roadmap</span>
                </Link>
              </div>
            </div>

            {/* Current Active Career Description */}
            {currentCareer && (
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.85rem 1.15rem', borderRadius: 'var(--radius-md, 12px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted, #94a3b8)' }}>
                  <strong style={{ color: 'var(--text-main, #f8fafc)' }}>{currentCareer.title}</strong>: {currentCareer.description}
                </div>
                {currentCareer.salaryRange && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald, #10b981)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    Package: {currentCareer.salaryRange}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Summary Gauge & Stats */}
          {gapLoading ? (
            <div style={{ minHeight: '30vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner" style={{ width: '36px', height: '36px' }} />
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {/* Match Score */}
                <div className="feature-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)' }}>Target Role Compatibility</span>
                  <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: matchPct >= 75 ? 'var(--accent-emerald, #10b981)' : 'var(--accent-cyan, #06b6d4)' }}>
                    {matchPct}%
                  </h2>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${matchPct}%`, height: '100%', background: matchPct >= 75 ? 'var(--accent-emerald, #10b981)' : 'var(--accent-cyan, #06b6d4)' }} />
                  </div>
                </div>

                {/* Matched Count */}
                <div className="feature-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)' }}>Verified Skills Matched</span>
                  <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: 'var(--accent-emerald, #10b981)' }}>
                    {matchedCount} <span style={{ fontSize: '1.2rem', color: 'var(--text-dim, #64748b)', fontWeight: 400 }}>/ {totalCount || 1}</span>
                  </h2>
                  <span style={{ fontSize: '0.78rem', color: 'var(--accent-emerald, #10b981)' }}>✓ Ready for production use</span>
                </div>

                {/* Missing Count */}
                <div className="feature-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)' }}>Missing Gap Competencies</span>
                  <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: '#fb7185' }}>
                    {missingCount}
                  </h2>
                  <span style={{ fontSize: '0.78rem', color: '#fb7185' }}>⚠ Recommended for upskilling</span>
                </div>
              </div>

              {/* Missing Skills In-Depth Breakdown */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={20} color="var(--accent-rose, #fb7185)" />
                  <span>Missing Skills Action Plan ({missingCount} Skills to Bridge)</span>
                </h2>

                {missingCount === 0 ? (
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2.5rem 2rem', borderRadius: 'var(--radius-lg, 16px)', textAlign: 'center' }}>
                    <CheckCircle2 size={40} color="var(--accent-emerald, #10b981)" style={{ marginBottom: '0.5rem' }} />
                    <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-main, #f8fafc)' }}>All Required Skills Mastered!</h3>
                    <p style={{ color: 'var(--text-muted, #94a3b8)', maxWidth: '500px', margin: '0.5rem auto 1.5rem', lineHeight: 1.5 }}>
                      You have matched 100% of the foundational and core technical skills required for this career track.
                    </p>
                    <Link to={`/jobs?search=${encodeURIComponent(skillGap?.careerTitle || '')}`} className="btn-primary" style={{ width: 'auto', textDecoration: 'none' }}>
                      Explore Verified Job Openings →
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {missingList.map((skillItem, idx) => {
                      const skillName = skillItem.skillName || (typeof skillItem === 'string' ? skillItem : 'Skill');
                      const importance = skillItem.importance || (idx < 2 ? 'High' : 'Medium');
                      const whyReq = skillItem.whyRequired || `Core requirement for professional ${skillGap?.careerTitle || 'software'} development.`;
                      const effort = skillItem.estimatedDuration || '2-3 Weeks';
                      const res = skillItem.recommendedResource || `Curated ${skillName} Masterclass`;
                      const roadmapPos = skillItem.roadmapPosition || `Phase ${(idx % 4) + 1}`;

                      return (
                        <div
                          key={skillName + idx}
                          style={{
                            background: 'var(--bg-card, rgba(18, 24, 38, 0.75))',
                            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                            borderRadius: 'var(--radius-xl, 24px)',
                            padding: '1.5rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem'
                          }}
                        >
                          <div style={{ flex: '1 1 350px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                              <h4 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>{skillName}</h4>
                              <span style={{
                                background: importance === 'High' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: importance === 'High' ? '#fb7185' : '#fbbf24',
                                border: `1px solid ${importance === 'High' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                                fontSize: '0.72rem',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '4px',
                                fontWeight: 600
                              }}>
                                {importance} Priority
                              </span>
                              <span style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted, #94a3b8)', fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                                {roadmapPos}
                              </span>
                            </div>

                            <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.88rem', margin: '0.3rem 0', lineHeight: 1.5 }}>
                              {whyReq}
                            </p>

                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-dim, #64748b)', flexWrap: 'wrap' }}>
                              <span>Estimated Effort: <strong style={{ color: 'var(--text-main, #f8fafc)' }}>{effort}</strong></span>
                              <span>• Resource: <strong style={{ color: 'var(--primary-400, #818cf8)' }}>{res}</strong></span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <Link
                              to={`/learning-resources?skill=${encodeURIComponent(skillName)}`}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.5rem 0.9rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                                borderRadius: '6px',
                                color: 'var(--text-main, #f8fafc)',
                                fontSize: '0.82rem',
                                textDecoration: 'none'
                              }}
                            >
                              <BookOpen size={14} />
                              <span>Learn Skill</span>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleMarkCompleted(skillName)}
                              disabled={completingSkill === skillName}
                              className="btn-primary"
                              style={{
                                width: 'auto',
                                padding: '0.5rem 1rem',
                                fontSize: '0.82rem',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                              }}
                            >
                              {completingSkill === skillName ? (
                                <>
                                  <div className="spinner" style={{ width: '14px', height: '14px' }} />
                                  <span>Updating...</span>
                                </>
                              ) : (
                                <>
                                  <Check size={14} />
                                  <span>Mark as Completed</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Matched Skills List */}
              <div>
                <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={20} color="var(--accent-emerald, #10b981)" />
                  <span>Already Mastered Skills ({matchedCount})</span>
                </h2>
                {matchedCount === 0 ? (
                  <div style={{ background: 'var(--bg-card, rgba(18,24,38,0.75))', padding: '1.5rem', borderRadius: 'var(--radius-md, 12px)', border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))', color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem' }}>
                    You haven't added any skills matching this track yet. Click "Mark as Completed" above or visit the <Link to="/skills" style={{ color: 'var(--primary-400, #818cf8)' }}>Skills Matrix</Link> to add your verified skills.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                    {matchedList.map((sk) => (
                      <div
                        key={sk}
                        style={{
                          background: 'rgba(16, 185, 129, 0.12)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          color: '#a7f3d0',
                          padding: '0.4rem 0.85rem',
                          borderRadius: 'var(--radius-md, 12px)',
                          fontSize: '0.85rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        <Check size={14} />
                        <span>{sk}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};
