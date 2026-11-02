import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Radio, 
  Building2, 
  Users, 
  Award, 
  ShieldCheck, 
  Zap,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleSosClick = () => {
    if (!isAuthenticated || !user) {
      navigate(`/login?redirect=${encodeURIComponent('/citizen?openSos=true')}`);
      return;
    }

    if (user.role === 'CITIZEN' || user.role === 'ADMIN') {
      navigate('/citizen?openSos=true');
    } else if (user.role === 'VOLUNTEER') {
      navigate('/volunteer');
    } else if (user.role === 'RESCUE_TEAM') {
      navigate('/rescue');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="container">
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '3.5rem 0 4rem 0', maxWidth: '880px', margin: '0 auto' }}>
        <div className="badge badge-critical" style={{ marginBottom: '1.25rem', padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
          <Radio size={14} /> Live Disaster Response & Emergency Network
        </div>
        <h1 style={{
          fontSize: '3.25rem',
          fontWeight: 800,
          lineHeight: '1.15',
          letterSpacing: '-1px',
          marginBottom: '1.25rem',
          color: '#ffffff'
        }}>
          Every Second Matters. <br />
          <span style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #f97316 60%, #eab308 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Coordinate. Rescue. Survive.
          </span>
        </h1>
        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
          marginBottom: '2.5rem'
        }}>
          ResQNet synchronizes citizens in distress, volunteer first-responders, verified rescue teams, and emergency shelters into a single, high-speed disaster management ecosystem.
        </p>

        {/* Hero Quick Actions */}
        <div className="flex justify-center items-center gap-4" style={{ flexWrap: 'wrap' }}>
          <button
            onClick={handleSosClick}
            className="btn btn-sos"
            style={{ padding: '0.9rem 2rem', fontSize: '1.1rem' }}
          >
            <Zap size={22} /> ONE-TOUCH SOS EMERGENCY
          </button>
          <Link to="/register" className="btn btn-outline" style={{ padding: '0.9rem 1.75rem', fontSize: '1rem' }}>
            <Users size={20} /> Join as Volunteer / Responder
          </Link>
        </div>
      </section>

      {/* Core Operational Pillars */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            System Capabilities & Roles
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Engineered with Spring Boot, MySQL (<code style={{ color: '#60a5fa' }}>ResQNet_Final_DB</code>), React & TypeScript.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Citizen Portal */}
          <Link to="/citizen" className="glass-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              padding: '12px',
              borderRadius: '12px',
              width: 'fit-content',
              marginBottom: '1rem'
            }}>
              <AlertTriangle size={26} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Citizen Portal</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Trigger instant GPS SOS alerts, submit geo-tagged disaster reports with media, and request immediate evacuation or medical aid.
            </p>
            <span className="badge badge-critical">SOS & Reporting</span>
          </Link>

          {/* Volunteer Hub */}
          <Link to="/volunteer" className="glass-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              padding: '12px',
              borderRadius: '12px',
              width: 'fit-content',
              marginBottom: '1rem'
            }}>
              <Award size={26} color="#f59e0b" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Volunteer Hub</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Claim nearby relief tasks (food delivery, first-aid, evacuation support), earn gamified badges, and climb the rescue leaderboard.
            </p>
            <span className="badge badge-warning">Gamified Tasks</span>
          </Link>

          {/* Rescue Team Command */}
          <Link to="/rescue" className="glass-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.1)',
              padding: '12px',
              borderRadius: '12px',
              width: 'fit-content',
              marginBottom: '1rem'
            }}>
              <Activity size={26} color="#3b82f6" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Rescue Command</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Live SOS queue, priority triage, automated unit dispatch, real-time spatial radar, and incident verification operations.
            </p>
            <span className="badge badge-info">Tactical Radar</span>
          </Link>

          {/* Emergency Resources */}
          <Link to="/shelters" className="glass-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '12px',
              borderRadius: '12px',
              width: 'fit-content',
              marginBottom: '1rem'
            }}>
              <Building2 size={26} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Shelters & Hospitals</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Real-time directory of available shelter capacity, hospital general/ICU beds, ventilators, and trauma centers with route maps.
            </p>
            <span className="badge badge-success">Resource Tracker Active →</span>
          </Link>

        </div>
      </section>

      {/* Emergency Response Network Status Banner */}
      <div className="glass-card" style={{
        borderColor: 'rgba(59, 130, 246, 0.3)',
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(30, 58, 138, 0.2) 100%)',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div className="flex items-center justify-center gap-2" style={{ marginBottom: '0.75rem' }}>
          <ShieldCheck size={24} color="#60a5fa" />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
            Emergency Response Network
          </h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', maxWidth: '720px', margin: '0 auto' }}>
          ResQNet brings together citizen SOS alerts, emergency reporting, rescue team coordination, volunteer relief tasks, and shelter and hospital information to support disaster response.
        </p>
      </div>
    </div>
  );
};
