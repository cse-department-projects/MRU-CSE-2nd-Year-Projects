import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { CareerGuidancePage } from './pages/CareerGuidancePage';
import { CareerDetailsPage } from './pages/CareerDetailsPage';
import { SkillGapPage } from './pages/SkillGapPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { SkillsPage } from './pages/SkillsPage';
import { JobsPage } from './pages/JobsPage';
import { InternshipsPage } from './pages/InternshipsPage';
import { SavedOpportunitiesPage } from './pages/SavedOpportunitiesPage';
import { ResumeAnalyzerPage } from './pages/ResumeAnalyzerPage';
import { ResumeMatcherPage } from './pages/ResumeMatcherPage';
import { LearningResourcesPage } from './pages/LearningResourcesPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

export const App = () => {
  return (
    <>
      {/* Background ambient lighting effects */}
      <div className="ambient-bg">
        <div className="glow-orb-1" />
        <div className="glow-orb-2" />
        <div className="glow-orb-3" />
      </div>

      <ErrorBoundary>
        <Routes>
          {/* Public Authentication Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPasswordPage />
              </PublicRoute>
            }
          />

          {/* Protected Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Profile Route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Career Guidance & Recommendation Routes */}
          <Route
            path="/career-guidance"
            element={
              <ProtectedRoute>
                <CareerGuidancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/careers"
            element={
              <ProtectedRoute>
                <CareerGuidancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/career-details/:id"
            element={
              <ProtectedRoute>
                <CareerDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/careers/:id"
            element={
              <ProtectedRoute>
                <CareerDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* Skills Management */}
          <Route
            path="/skills"
            element={
              <ProtectedRoute>
                <SkillsPage />
              </ProtectedRoute>
            }
          />

          {/* Skill Gap Analysis */}
          <Route
            path="/skill-gap"
            element={
              <ProtectedRoute>
                <SkillGapPage />
              </ProtectedRoute>
            }
          />

          {/* Learning Roadmap */}
          <Route
            path="/roadmap"
            element={
              <ProtectedRoute>
                <RoadmapPage />
              </ProtectedRoute>
            }
          />

          {/* Job Recommendations */}
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <JobsPage />
              </ProtectedRoute>
            }
          />

          {/* Internship Recommendations */}
          <Route
            path="/internships"
            element={
              <ProtectedRoute>
                <InternshipsPage />
              </ProtectedRoute>
            }
          />

          {/* Saved Opportunities */}
          <Route
            path="/saved-opportunities"
            element={
              <ProtectedRoute>
                <SavedOpportunitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SavedOpportunitiesPage />
              </ProtectedRoute>
            }
          />

          {/* Resume Analyzer */}
          <Route
            path="/resume-analyzer"
            element={
              <ProtectedRoute>
                <ResumeAnalyzerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume"
            element={
              <ProtectedRoute>
                <ResumeAnalyzerPage />
              </ProtectedRoute>
            }
          />

          {/* Resume vs Job Matcher */}
          <Route
            path="/resume-matcher"
            element={
              <ProtectedRoute>
                <ResumeMatcherPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume-match"
            element={
              <ProtectedRoute>
                <ResumeMatcherPage />
              </ProtectedRoute>
            }
          />

          {/* Learning Resources */}
          <Route
            path="/learning-resources"
            element={
              <ProtectedRoute>
                <LearningResourcesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <LearningResourcesPage />
              </ProtectedRoute>
            }
          />

          {/* Settings */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Default Redirections */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ErrorBoundary>
    </>
  );
};
