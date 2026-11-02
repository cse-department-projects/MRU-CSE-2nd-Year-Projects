import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { skillApi } from '../api/skillApi';
import { Target, Plus, Trash2, CheckCircle2, AlertCircle, Sparkles, Filter } from 'lucide-react';
import { ErrorBoundary } from '../components/ErrorBoundary';

export const SkillsPage = () => {
  const [userSkills, setUserSkills] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Add form state
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Programming');
  const [newSkillProficiency, setNewSkillProficiency] = useState('Intermediate');

  const categories = [
    'All',
    'Programming',
    'Web Development',
    'Database',
    'Cloud',
    'DevOps',
    'Data Science',
    'AI/ML',
    'Testing',
    'Soft Skills',
    'Other'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [skills, cat] = await Promise.allSettled([
        skillApi.getMySkills(),
        skillApi.getCatalog()
      ]);
      if (skills.status === 'fulfilled' && Array.isArray(skills.value)) {
        setUserSkills(skills.value);
      }
      if (cat.status === 'fulfilled' && Array.isArray(cat.value)) {
        setCatalog(cat.value);
      }
    } catch (err) {
      console.error('Error loading skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      setIsAdding(true);
      const created = await skillApi.addSkill({
        name: newSkillName.trim(),
        category: newSkillCategory,
        proficiency: newSkillProficiency
      });

      const cleanCreated = created || {
        id: `sk_${Date.now()}`,
        skillName: newSkillName.trim(),
        category: newSkillCategory,
        proficiencyLevel: newSkillProficiency
      };

      const cName = cleanCreated.skillName || cleanCreated.name || newSkillName.trim();

      setUserSkills((prev) => {
        const filtered = prev.filter(s => (s.skillName || s.name || '').toLowerCase() !== cName.toLowerCase());
        return [...filtered, cleanCreated];
      });

      setNewSkillName('');
      setToastMsg(`Skill "${cName}" saved to your MongoDB matrix!`);
      setTimeout(() => setToastMsg(''), 3500);
    } catch (err) {
      console.error('Error adding skill:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateProficiency = async (skillId, newLevel) => {
    try {
      const updated = await skillApi.updateProficiency(skillId, newLevel);
      setUserSkills(prev => prev.map(s => s.id === skillId ? (updated || { ...s, proficiencyLevel: newLevel, proficiency: newLevel }) : s));
      setToastMsg(`Proficiency updated to ${newLevel}`);
      setTimeout(() => setToastMsg(''), 2500);
    } catch (err) {
      console.error('Failed to update proficiency:', err);
      setUserSkills(prev => prev.map(s => s.id === skillId ? { ...s, proficiencyLevel: newLevel, proficiency: newLevel } : s));
    }
  };

  const handleDeleteSkill = async (skillId, skillName) => {
    try {
      await skillApi.removeSkill(skillId);
      setUserSkills(prev => prev.filter(s => s.id !== skillId));
      setToastMsg(`Removed "${skillName}" from your skill profile.`);
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      console.error('Failed to remove skill:', err);
      setUserSkills(prev => prev.filter(s => s.id !== skillId));
    }
  };

  const filteredSkills = selectedCategory === 'All'
    ? userSkills
    : userSkills.filter(s => (s.category || '').toLowerCase() === selectedCategory.toLowerCase());

  const getProficiencyPercentage = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 35;
      case 'intermediate': return 70;
      case 'advanced': return 100;
      default: return 60;
    }
  };

  const getProficiencyColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'var(--accent-amber, #f59e0b)';
      case 'intermediate': return 'var(--accent-cyan, #06b6d4)';
      case 'advanced': return 'var(--accent-emerald, #10b981)';
      default: return 'var(--primary-400, #818cf8)';
    }
  };

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: 'var(--bg-main, #0B0F19)' }}>
        <Navbar />

        <div className="dashboard-container">
          {/* Header */}
          <section className="dashboard-hero" style={{ padding: '2.25rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-purple, #a855f7)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <Target size={16} />
              <span>Technical & Professional Matrix</span>
            </div>
            <h1>Skills & Competencies Management</h1>
            <p>
              Add, categorize, and benchmark your programming languages, frameworks, and tools.
              Your skill portfolio directly influences career recommendations and job matches.
            </p>
          </section>

          {toastMsg && (
            <div className="global-alert success" style={{ marginBottom: '1.5rem' }}>
              <CheckCircle2 size={18} />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* Add Skill Form Card */}
          <div style={{
            background: 'var(--bg-card, rgba(18, 24, 38, 0.75))',
            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
            borderRadius: 'var(--radius-xl, 24px)',
            padding: '1.75rem',
            marginBottom: '2.5rem',
            boxShadow: 'var(--shadow-subtle)'
          }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-100, #e0e7ff)' }}>
              <Plus size={18} color="var(--primary-400, #818cf8)" />
              <span>Add New Competency to MongoDB Profile</span>
            </h3>

            <form onSubmit={handleAddSkill} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) auto', gap: '1rem', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Skill Name</label>
                <input
                  type="text"
                  list="skills-catalog-list"
                  className="input-control"
                  style={{ paddingLeft: '1rem' }}
                  placeholder="e.g. Docker, TypeScript, React, Java"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                />
                <datalist id="skills-catalog-list">
                  {catalog.map((c, i) => <option key={c.id || i} value={c.name || c.skillName} />)}
                </datalist>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Category</label>
                <select
                  className="input-control"
                  style={{ paddingLeft: '1rem' }}
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                >
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Proficiency Level</label>
                <select
                  className="input-control"
                  style={{ paddingLeft: '1rem' }}
                  value={newSkillProficiency}
                  onChange={(e) => setNewSkillProficiency(e.target.value)}
                >
                  <option value="Beginner">Beginner (Foundational)</option>
                  <option value="Intermediate">Intermediate (Hands-on)</option>
                  <option value="Advanced">Advanced (Production-ready)</option>
                </select>
              </div>

              <button type="submit" disabled={isAdding || !newSkillName.trim()} className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem', height: '44px' }}>
                {isAdding ? <div className="spinner" /> : <><Plus size={16} /><span>Add Skill</span></>}
              </button>
            </form>
          </div>

          {/* Category Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {categories.map(cat => {
              const count = cat === 'All'
                ? userSkills.length
                : userSkills.filter(s => (s.category || '').toLowerCase() === cat.toLowerCase()).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: 'var(--radius-full, 9999px)',
                    border: `1px solid ${selectedCategory === cat ? 'var(--primary-500, #6366f1)' : 'var(--border-subtle, rgba(255, 255, 255, 0.08))'}`,
                    background: selectedCategory === cat ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    color: selectedCategory === cat ? 'var(--primary-100, #e0e7ff)' : 'var(--text-muted, #94a3b8)',
                    fontSize: '0.85rem',
                    fontWeight: selectedCategory === cat ? 600 : 400,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <span>{cat}</span>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '10px' }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Skills Grid */}
          {loading ? (
            <div style={{ minHeight: '30vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="spinner" style={{ width: '36px', height: '36px' }} />
            </div>
          ) : filteredSkills.length === 0 ? (
            <div style={{ background: 'var(--bg-card, rgba(18, 24, 38, 0.75))', border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))', borderRadius: 'var(--radius-lg, 16px)', padding: '3rem', textAlign: 'center', color: 'var(--text-muted, #94a3b8)' }}>
              <Target size={36} color="var(--text-dim, #64748b)" style={{ marginBottom: '0.75rem' }} />
              <p>No skills recorded under category "{selectedCategory}". Add one using the form above!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {filteredSkills.map((skill, idx) => {
                const sId = skill.id || `sk_${idx}`;
                const sName = skill.skillName || skill.name || 'Skill';
                const sCategory = skill.category || 'General';
                const sProficiency = skill.proficiency || skill.proficiencyLevel || 'Intermediate';
                const pct = getProficiencyPercentage(sProficiency);
                const color = getProficiencyColor(sProficiency);

                return (
                  <div
                    key={sId}
                    style={{
                      background: 'var(--bg-card, rgba(18, 24, 38, 0.75))',
                      border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                      borderRadius: 'var(--radius-lg, 16px)',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 600, margin: 0 }}>{sName}</h4>
                        <button
                          onClick={() => handleDeleteSkill(sId, sName)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-dim, #64748b)', cursor: 'pointer', padding: '0.2rem' }}
                          title="Remove skill"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', background: 'rgba(255,255,255,0.05)', padding: '0.15rem 0.5rem', borderRadius: '4px', display: 'inline-block', marginBottom: '1rem' }}>
                        {sCategory}
                      </span>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-muted, #94a3b8)' }}>Proficiency</span>
                        <select
                          value={sProficiency}
                          onChange={(e) => handleUpdateProficiency(sId, e.target.value)}
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                            color,
                            fontWeight: 600,
                            borderRadius: '4px',
                            padding: '0.15rem 0.4rem',
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>

                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: color }} />
                      </div>
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
