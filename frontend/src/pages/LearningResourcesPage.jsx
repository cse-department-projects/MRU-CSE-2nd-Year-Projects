import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { resourceApi } from '../api/resourceApi';
import { BookOpen, ExternalLink, Filter, Clock, Award, PlayCircle, BookCheck } from 'lucide-react';

export const LearningResourcesPage = () => {
  const [searchParams] = useSearchParams();
  const initialSkill = searchParams.get('skill') || 'All';

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState(initialSkill);
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    fetchResources();
  }, [selectedSkill, selectedDifficulty, selectedType]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await resourceApi.getResources({
        skill: selectedSkill,
        difficulty: selectedDifficulty,
        type: selectedType
      });
      setResources(data);
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const skillsList = ['All', 'Java', 'Spring Boot', 'React', 'SQL', 'Docker', 'AWS', 'Data Structures', 'JavaScript', 'MongoDB', 'REST API', 'Git', 'Machine Learning'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const types = ['All', 'Course', 'Video', 'Tutorial', 'Practice', 'Documentation'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />

      <div className="dashboard-container">
        {/* Header */}
        <section className="dashboard-hero" style={{ padding: '2.25rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#14b8a6', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <BookOpen size={16} />
            <span>Curated Upskilling Ecosystem</span>
          </div>
          <h1>Technical Learning Resources & Masterclasses</h1>
          <p>
            Access top-tier courses, hands-on coding practice sets, video tutorials, and official documentation
            mapped specifically to bridge your identified skill gaps.
          </p>
        </section>

        {/* Filters Bar */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'flex-end'
        }}>
          <div>
            <label className="form-label">Filter by Target Skill</label>
            <select
              className="input-control"
              style={{ paddingLeft: '1rem' }}
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
            >
              {skillsList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label">Difficulty Level</label>
            <select
              className="input-control"
              style={{ paddingLeft: '1rem' }}
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label">Content Type</label>
            <select
              className="input-control"
              style={{ paddingLeft: '1rem' }}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Resource Cards */}
        {loading ? (
          <div style={{ minHeight: '35vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner" style={{ width: '36px', height: '36px' }} />
          </div>
        ) : resources.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>No learning resources found for the selected combination.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {resources.map((res) => (
              <div
                key={res.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                    <span style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: 'var(--primary-100)', fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
                      {res.platform}
                    </span>
                    <span style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', fontSize: '0.72rem', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                      {res.type}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{res.title}</h3>

                  <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    <span>Target Skill: <strong style={{ color: 'var(--accent-cyan)' }}>{res.skillName}</strong></span>
                    <span>•</span>
                    <span>Level: <strong>{res.difficulty}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    <Clock size={13} /> {res.estimatedDuration}
                  </span>

                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary"
                    style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '0.82rem', textDecoration: 'none' }}
                  >
                    <span>Start Learning</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
