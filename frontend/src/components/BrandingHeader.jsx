import React from 'react';
import { Compass, Sparkles, Target, Award, ArrowUpRight } from 'lucide-react';

export const BrandingHeader = () => {
  return (
    <div className="auth-branding-panel">
      <div>
        <div className="brand-badge">
          <Sparkles size={14} />
          <span>Next-Gen Career Intelligence</span>
        </div>

        <h1 className="brand-title">Smart Career Guidance System</h1>
        <p className="brand-tagline">
          Plan Your Career. Build Your Skills. Find Your Opportunity.
        </p>

        <div className="brand-feature-list">
          <div className="brand-feature-item">
            <div className="brand-feature-icon">
              <Compass size={20} />
            </div>
            <div className="brand-feature-text">
              <h4>AI-Driven Career Pathways</h4>
              <p>Personalized step-by-step roadmaps tailored to your ambitions and strengths.</p>
            </div>
          </div>

          <div className="brand-feature-item">
            <div className="brand-feature-icon">
              <Target size={20} />
            </div>
            <div className="brand-feature-text">
              <h4>Skill Gap Identification</h4>
              <p>Pinpoint exact missing competencies for high-demand market roles.</p>
            </div>
          </div>

          <div className="brand-feature-item">
            <div className="brand-feature-icon">
              <Award size={20} />
            </div>
            <div className="brand-feature-text">
              <h4>Smart Resume Analyzer & Matcher</h4>
              <p>Optimize your profile for verified tech jobs and internship opportunities.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="brand-footer-note">
        <span>Empowering 50,000+ Students & Professionals</span>
        <ArrowUpRight size={14} />
      </div>
    </div>
  );
};
