import React from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Compass, Sparkles, Target, Award, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProtectedLayout = ({ title, subtitle, icon: Icon, children }) => {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />
      <div className="dashboard-container">
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        <section className="dashboard-hero" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            {Icon && (
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-400)'
              }}>
                <Icon size={22} />
              </div>
            )}
            <div>
              <h1 style={{ fontSize: '1.75rem', marginBottom: '0.2rem' }}>{title}</h1>
              <p style={{ fontSize: '0.95rem' }}>{subtitle}</p>
            </div>
          </div>
        </section>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          backdropFilter: 'blur(16px)'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export const ProfilePage = () => {
  const { user } = useAuth();
  return (
    <ProtectedLayout title="User Profile" subtitle="Manage your authenticated career credentials" icon={ShieldCheck}>
      <h3 style={{ marginBottom: '1rem' }}>Personal Information</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Full Name</span>
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{user?.fullName || 'Demo User'}</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Address</span>
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{user?.email}</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Security Role</span>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>{user?.role || 'ROLE_USER'}</p>
        </div>
      </div>
    </ProtectedLayout>
  );
};

export const CareerGuidancePage = () => (
  <ProtectedLayout title="Career Guidance" subtitle="Explore customized pathways and AI guidance" icon={Compass}>
    <p style={{ color: 'var(--text-muted)' }}>
      AI Recommendation Engine is analyzing your career profile against current industry demand.
    </p>
  </ProtectedLayout>
);

export const SkillsPage = () => (
  <ProtectedLayout title="Skills Matrix" subtitle="Verify and benchmark your skill sets" icon={Target}>
    <p style={{ color: 'var(--text-muted)' }}>
      Manage your technical and soft skill competencies to tailor job recommendations.
    </p>
  </ProtectedLayout>
);

export const SkillGapPage = () => (
  <ProtectedLayout title="Skill Gap Analysis" subtitle="Find missing competencies for your target roles" icon={Sparkles}>
    <p style={{ color: 'var(--text-muted)' }}>
      Analyze the delta between your present skill set and dream tech roles.
    </p>
  </ProtectedLayout>
);

export const RoadmapPage = () => (
  <ProtectedLayout title="Career Roadmap" subtitle="Milestone-based learning roadmap" icon={Compass}>
    <p style={{ color: 'var(--text-muted)' }}>
      Follow structured milestones designed to guide you into target engineering roles.
    </p>
  </ProtectedLayout>
);

export const ResumeAnalyzerPage = () => (
  <ProtectedLayout title="Resume Analyzer" subtitle="ATS scoring and resume audit" icon={Award}>
    <p style={{ color: 'var(--text-muted)' }}>
      Upload your resume to receive instantaneous feedback on keyword matching and layout compatibility.
    </p>
  </ProtectedLayout>
);

export const ResumeMatcherPage = () => (
  <ProtectedLayout title="Resume Matcher" subtitle="Match resume against job specifications" icon={Award}>
    <p style={{ color: 'var(--text-muted)' }}>
      Check how well your current resume matches specific job descriptions.
    </p>
  </ProtectedLayout>
);

export const JobsPage = () => (
  <ProtectedLayout title="Job Opportunities" subtitle="Browse verified full-time positions" icon={Compass}>
    <p style={{ color: 'var(--text-muted)' }}>
      Explore personalized job openings tailored to your verified skill portfolio.
    </p>
  </ProtectedLayout>
);

export const InternshipsPage = () => (
  <ProtectedLayout title="Internships" subtitle="Find university and graduate internships" icon={Compass}>
    <p style={{ color: 'var(--text-muted)' }}>
      Search curated internship listings designed for students and early-career engineers.
    </p>
  </ProtectedLayout>
);

export const SavedOpportunitiesPage = () => (
  <ProtectedLayout title="Saved Opportunities" subtitle="Your bookmarked jobs and internships" icon={Compass}>
    <p style={{ color: 'var(--text-muted)' }}>
      Track your saved job openings and internship applications in one place.
    </p>
  </ProtectedLayout>
);

export const LearningResourcesPage = () => (
  <ProtectedLayout title="Learning Resources" subtitle="Recommended courses and tutorials" icon={Compass}>
    <p style={{ color: 'var(--text-muted)' }}>
      Access top-rated learning paths and certification resources to level up your skills.
    </p>
  </ProtectedLayout>
);

export const SettingsPage = () => (
  <ProtectedLayout title="Account Settings" subtitle="Security and notification preferences" icon={ShieldCheck}>
    <p style={{ color: 'var(--text-muted)' }}>
      Manage your password, session preferences, and notification options.
    </p>
  </ProtectedLayout>
);
