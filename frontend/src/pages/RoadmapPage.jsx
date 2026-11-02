import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { careerApi } from '../api/careerApi';
import { roadmapApi } from '../api/roadmapApi';
import { GitMerge, CheckCircle2, RotateCcw, BookOpen, Clock, Layers, Sparkles, ChevronRight, Check, AlertCircle, Filter, Briefcase } from 'lucide-react';
import { ErrorBoundary } from '../components/ErrorBoundary';

export const RoadmapPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawParam = searchParams.get('career') || '';

  const [careers, setCareers] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedCareerId, setSelectedCareerId] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingTaskId, setTogglingTaskId] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchCareers();
  }, []);

  const fetchCareers = async () => {
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

      const matched = list.find(
        (c) => c.id === rawParam || (c.title || '').toLowerCase() === rawParam.toLowerCase()
      );
      const targetId = matched ? matched.id : (list.length > 0 ? list[0].id : 'c_1');
      setSelectedCareerId(targetId);

      if (matched && matched.domain) {
        setSelectedDomain(matched.domain);
      }

      if (targetId) {
        await fetchRoadmap(targetId);
      }
    } catch (err) {
      console.error('Error fetching careers for roadmap:', err);
      setErrorMessage('Unable to load career pathways.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoadmap = async (careerId) => {
    if (!careerId) return;
    try {
      setErrorMessage('');
      const data = await roadmapApi.getRoadmapByCareer(careerId);
      setRoadmap(data);
    } catch (err) {
      console.error('Failed to load roadmap:', err);
      setErrorMessage('Failed to load roadmap. Please try again.');
    }
  };

  const handleCareerChange = (newId) => {
    setSelectedCareerId(newId);
    setSearchParams({ career: newId });
    fetchRoadmap(newId);
  };

  const handleDomainChange = (domain) => {
    setSelectedDomain(domain);
    const inDomain = domain === 'All'
      ? careers
      : careers.filter((c) => (c.domain || '').toLowerCase() === domain.toLowerCase());
    if (inDomain.length > 0 && !inDomain.some((c) => c.id === selectedCareerId)) {
      handleCareerChange(inDomain[0].id);
    }
  };

  const domains = useMemo(() => {
    const list = careers.map((c) => c.domain || c?.career?.domain).filter(Boolean);
    return ['All', ...new Set(list)];
  }, [careers]);

  const filteredCareers = useMemo(() => {
    if (selectedDomain === 'All') return careers;
    return careers.filter((c) => {
      const d = c.domain || c?.career?.domain || '';
      return d.toLowerCase() === selectedDomain.toLowerCase();
    });
  }, [careers, selectedDomain]);

  const handleToggleTask = async (taskId) => {
    if (!roadmap || !roadmap.id) return;
    try {
      setTogglingTaskId(taskId);
      const updated = await roadmapApi.toggleTask(roadmap.id, taskId);
      setRoadmap(updated);
      setToastMsg(`Milestone task updated! Progress: ${updated.progressPercentage}%`);
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      console.error('Failed to toggle task:', err);
      // Fallback local toggle to ensure instant UX responsiveness
      setRoadmap((prev) => {
        if (!prev) return prev;
        let total = 0;
        let completedCount = 0;
        const nextPhases = (prev.phases || []).map((ph) => {
          const nextTasks = (ph.tasks || []).map((t) => {
            total++;
            const tId = t.taskId || t.id;
            const isTarget = tId === taskId;
            const nextDone = isTarget ? !t.completed : t.completed;
            if (nextDone) completedCount++;
            return { ...t, completed: nextDone };
          });
          return { ...ph, tasks: nextTasks };
        });
        const pct = total === 0 ? 0 : Math.round((completedCount / total) * 100);
        return { ...prev, phases: nextPhases, progressPercentage: pct };
      });
    } finally {
      setTogglingTaskId('');
    }
  };

  const handleResetRoadmap = async () => {
    if (!roadmap || !roadmap.id) return;
    if (window.confirm('Are you sure you want to reset all completed tasks for this roadmap?')) {
      try {
        const reset = await roadmapApi.resetRoadmap(roadmap.id);
        setRoadmap(reset);
        setToastMsg('Roadmap progress has been reset to 0%.');
        setTimeout(() => setToastMsg(''), 3000);
      } catch (err) {
        console.error('Failed to reset roadmap:', err);
        setRoadmap((prev) => {
          if (!prev) return prev;
          const nextPhases = (prev.phases || []).map((ph) => ({
            ...ph,
            tasks: (ph.tasks || []).map((t) => ({ ...t, completed: false })),
          }));
          return { ...prev, phases: nextPhases, progressPercentage: 0, completedTasks: [] };
        });
      }
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-main, #0B0F19)' }}>
        <Navbar />
        <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
          <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.95rem' }}>Loading Learning Roadmap...</span>
        </div>
      </div>
    );
  }

  const progress = roadmap?.progressPercentage ?? 0;
  const phases = roadmap?.phases || [];

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: 'var(--bg-main, #0B0F19)' }}>
        <Navbar />

        <div className="dashboard-container">
          {/* Hero Section */}
          <section className="dashboard-hero" style={{ padding: '2.25rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#3b82f6', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <GitMerge size={16} />
              <span>Interactive Multi-Phase Career Pathway</span>
            </div>
            <h1>Step-by-Step Career Learning Roadmaps</h1>
            <p>
              Follow structured, milestone-driven technical curricula designed to take you from foundational syntax
              to enterprise cloud production deployments.
            </p>
          </section>

          {toastMsg && (
            <div className="global-alert success" style={{ marginBottom: '1.5rem' }}>
              <CheckCircle2 size={18} />
              <span>{toastMsg}</span>
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
                onClick={() => fetchRoadmap(selectedCareerId)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '0.3rem 0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Roadmap Career Selector & Progress Gauge */}
          <div style={{
            background: 'var(--bg-card, rgba(18, 24, 38, 0.75))',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            borderRadius: 'var(--radius-xl, 24px)',
            padding: '1.75rem',
            marginBottom: '2.5rem',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            {/* Domain Filter Pills */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>
                <Filter size={15} color="var(--primary-400, #818cf8)" />
                <span>1. Filter Track by Domain:</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {domains.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleDomainChange(d)}
                    style={{
                      padding: '0.35rem 0.8rem',
                      borderRadius: 'var(--radius-full, 9999px)',
                      border: `1px solid ${selectedDomain === d ? 'var(--primary-500, #6366f1)' : 'var(--border-subtle, rgba(255, 255, 255, 0.08))'}`,
                      background: selectedDomain === d ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                      color: selectedDomain === d ? 'var(--primary-100, #e0e7ff)' : 'var(--text-muted, #94a3b8)',
                      fontSize: '0.8rem',
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ flex: '1 1 320px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>
                  <Briefcase size={15} color="var(--accent-cyan, #06b6d4)" />
                  <span>2. Select Career Track Roadmap:</span>
                </div>
                <select
                  value={selectedCareerId}
                  onChange={(e) => handleCareerChange(e.target.value)}
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', display: 'block' }}>Overall Completion</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6' }}>{progress}%</span>
                </div>

                <button
                  type="button"
                  onClick={handleResetRoadmap}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.55rem 0.9rem',
                    background: 'rgba(244, 63, 94, 0.1)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    color: '#fb7185',
                    borderRadius: 'var(--radius-md, 12px)',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600
                  }}
                  title="Reset all tasks"
                >
                  <RotateCcw size={14} />
                  <span>Reset Progress</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
          </div>

          {/* Roadmap Phases List */}
          {phases.length === 0 ? (
            <div style={{
              background: 'var(--bg-card, rgba(18,24,38,0.75))',
              border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
              borderRadius: 'var(--radius-lg, 16px)',
              padding: '3rem 2rem',
              textAlign: 'center'
            }}>
              <GitMerge size={36} color="var(--text-dim, #64748b)" style={{ margin: '0 auto 0.75rem' }} />
              <h3>Choose a career to start your personalized roadmap.</h3>
              <p style={{ color: 'var(--text-muted, #94a3b8)', margin: '0.5rem auto 1.5rem', maxWidth: '480px' }}>
                Select any career track above to generate a phased curriculum tailored to your background.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {phases.map((phase, phaseIndex) => {
                const phaseId = phase.phaseId || `p_${phaseIndex}`;
                const phaseTitle = phase.title || phase.phaseTitle || `Phase ${phaseIndex + 1}`;
                const phaseDesc = phase.description || 'Master foundational paradigms and tasks.';
                const phaseDuration = phase.estimatedDuration || '3-4 Weeks';
                const phaseSkills = phase.skills || [];
                const phaseTasks = phase.tasks || [];
                const phaseResources = phase.resources || ['Official Documentation', 'Interactive Tutorials'];

                return (
                  <div
                    key={phaseId}
                    style={{
                      background: 'var(--bg-card, rgba(18, 24, 38, 0.75))',
                      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                      borderRadius: 'var(--radius-xl, 24px)',
                      padding: '2rem',
                      position: 'relative'
                    }}
                  >
                    {/* Phase Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                          <span style={{
                            background: 'rgba(59, 130, 246, 0.2)',
                            border: '1px solid rgba(59, 130, 246, 0.4)',
                            color: '#93c5fd',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.6rem',
                            borderRadius: 'var(--radius-full, 9999px)'
                          }}>
                            Phase {phaseIndex + 1}
                          </span>
                          <h3 style={{ fontSize: '1.35rem', margin: 0 }}>{phaseTitle}</h3>
                        </div>
                        <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.92rem', margin: 0 }}>{phaseDesc}</p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan, #06b6d4)', fontSize: '0.85rem', background: 'rgba(6, 182, 212, 0.1)', padding: '0.35rem 0.75rem', borderRadius: '6px' }}>
                        <Clock size={15} />
                        <span>Estimated: {phaseDuration}</span>
                      </div>
                    </div>

                    {/* Skills targeted in this phase */}
                    {phaseSkills.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim, #64748b)' }}>Core Focus Skills:</span>
                        {phaseSkills.map((sk) => (
                          <span key={sk} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))', color: 'var(--text-main, #f8fafc)', padding: '0.15rem 0.55rem', borderRadius: '4px', fontSize: '0.78rem' }}>
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actionable Tasks Checklist */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-400, #818cf8)', display: 'block', marginBottom: '0.6rem' }}>
                        Milestone Action Items (Click to Complete):
                      </span>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {phaseTasks.map((task, tIdx) => {
                          const taskId = task.taskId || task.id || `task_${phaseIndex}_${tIdx}`;
                          const isChecked = Boolean(task.completed);
                          const isUpdating = togglingTaskId === taskId;

                          return (
                            <div
                              key={taskId}
                              onClick={() => !isUpdating && handleToggleTask(taskId)}
                              style={{
                                background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                                border: `1px solid ${isChecked ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle, rgba(255, 255, 255, 0.08))'}`,
                                padding: '0.85rem 1.25rem',
                                borderRadius: 'var(--radius-md, 12px)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <div
                                style={{
                                  width: '22px',
                                  height: '22px',
                                  borderRadius: '5px',
                                  border: `2px solid ${isChecked ? 'var(--accent-emerald, #10b981)' : 'var(--border-subtle, rgba(255, 255, 255, 0.2))'}`,
                                  background: isChecked ? 'var(--accent-emerald, #10b981)' : 'transparent',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  flexShrink: 0
                                }}
                              >
                                {isChecked && <Check size={14} />}
                              </div>

                              <span style={{
                                fontSize: '0.92rem',
                                color: isChecked ? '#a7f3d0' : 'var(--text-main, #f8fafc)',
                                textDecoration: isChecked ? 'line-through' : 'none'
                              }}>
                                {task.title}
                              </span>

                              {isUpdating && (
                                <div className="spinner" style={{ width: '14px', height: '14px', marginLeft: 'auto' }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Recommended Resources Links */}
                    {phaseResources && phaseResources.length > 0 && (
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <BookOpen size={15} color="var(--accent-cyan, #06b6d4)" />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>Recommended Phase Guides:</span>
                        {phaseResources.map((res, i) => (
                          <span key={i} style={{ fontSize: '0.8rem', color: 'var(--primary-100, #e0e7ff)', background: 'rgba(99, 102, 241, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                            {res}
                          </span>
                        ))}
                      </div>
                    )}
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
