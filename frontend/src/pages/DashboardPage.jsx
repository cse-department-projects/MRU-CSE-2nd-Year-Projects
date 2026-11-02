import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { jobApi } from '../api/jobApi';
import { internshipApi } from '../api/internshipApi';
import { Navbar } from '../components/Navbar';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Modular Dashboard Components
import { DashboardLoadingSkeleton } from '../components/dashboard/DashboardLoadingSkeleton';
import { DashboardErrorState } from '../components/dashboard/DashboardErrorState';
import { DashboardEmptyState } from '../components/dashboard/DashboardEmptyState';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { StatsCards } from '../components/dashboard/StatsCards';
import { CareerSpotlight } from '../components/dashboard/CareerSpotlight';
import { SkillGapCard } from '../components/dashboard/SkillGapCard';
import { ResumeScoreCard } from '../components/dashboard/ResumeScoreCard';
import { RoadmapProgress } from '../components/dashboard/RoadmapProgress';
import { RecommendedJobsSection } from '../components/dashboard/RecommendedJobsSection';
import { RecommendedInternshipsSection } from '../components/dashboard/RecommendedInternshipsSection';
import { RecentActivity } from '../components/dashboard/RecentActivity';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [savedInternshipIds, setSavedInternshipIds] = useState(new Set());

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await authApi.getDashboardSummary();
      setSummary(data || {});

      if (data?.recommendedJobs) {
        const savedJobs = new Set(
          data.recommendedJobs
            .filter((j) => j?.isSaved)
            .map((j) => (j?.job?.id || j?.id))
        );
        setSavedJobIds(savedJobs);
      }

      if (data?.recommendedInternships) {
        const savedInts = new Set(
          data.recommendedInternships
            .filter((i) => i?.isSaved)
            .map((i) => (i?.internship?.id || i?.id))
        );
        setSavedInternshipIds(savedInts);
      }
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
      setError(err.message || 'Unable to connect to backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, [fetchDashboardData]);

  const toggleSaveJob = async (jobId) => {
    try {
      if (savedJobIds.has(jobId)) {
        await jobApi.unsaveJob(jobId);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
      } else {
        await jobApi.saveJob(jobId);
        setSavedJobIds((prev) => new Set(prev).add(jobId));
      }
    } catch (err) {
      console.error('Failed to toggle save job:', err);
    }
  };

  const toggleSaveInternship = async (internshipId) => {
    try {
      if (savedInternshipIds.has(internshipId)) {
        await internshipApi.unsaveInternship(internshipId);
        setSavedInternshipIds((prev) => {
          const next = new Set(prev);
          next.delete(internshipId);
          return next;
        });
      } else {
        await internshipApi.saveInternship(internshipId);
        setSavedInternshipIds((prev) => new Set(prev).add(internshipId));
      }
    } catch (err) {
      console.error('Failed to toggle save internship:', err);
    }
  };

  // 1. Loading State - Never render black screen
  if (loading) {
    return <DashboardLoadingSkeleton />;
  }

  // 2. Error State - Provide interactive retry
  if (error && !summary) {
    return <DashboardErrorState onRetry={fetchDashboardData} errorMessage={error} />;
  }

  const topCareer = summary?.recommendedCareer;
  const isProfileEmpty = (summary?.totalSkillsCount || 0) === 0 && (summary?.profileCompletion || 0) < 30;

  return (
    <ErrorBoundary>
      <div style={{ minHeight: '100vh', background: 'var(--bg-main, #0B0F19)' }}>
        <Navbar />

        <div className="dashboard-container">
          {/* Header */}
          <DashboardHeader
            userName={user?.fullName || summary?.userName || (user?.email ? user.email.split('@')[0] : 'Career Explorer')}
            userEmail={user?.email || summary?.userEmail}
            targetRole={topCareer?.career?.title || topCareer?.title || 'Full Stack Java Developer'}
          />

          {/* If user has no skills / brand new profile, display friendly guidance */}
          {isProfileEmpty && (
            <DashboardEmptyState userName={user?.fullName || summary?.userName} />
          )}

          {/* 6 Key Metric Cards */}
          <StatsCards
            profileCompletion={summary?.profileCompletion ?? 85}
            careerMatch={topCareer?.matchPercentage ?? 88}
            topCareerTitle={topCareer?.career?.title || topCareer?.title || 'Full Stack Developer'}
            resumeScore={summary?.latestAtsScore ?? 80}
            skillsCompleted={summary?.totalSkillsCount ?? 0}
            skillGap={summary?.activeSkillGapsCount ?? 0}
            roadmapProgress={summary?.roadmapProgressPercentage ?? 0}
          />

          {/* Top Recommended Career Spotlight */}
          {topCareer && (
            <CareerSpotlight topCareer={topCareer} />
          )}

          {/* 3 Overview Cards: Skill Gaps, Roadmap Progress, Resume ATS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem'
          }}>
            <SkillGapCard
              missingSkills={topCareer?.missingSkills || []}
              careerId={topCareer?.career?.id || topCareer?.id || 'career_1'}
            />

            <RoadmapProgress
              roadmapProgress={summary?.roadmapProgressPercentage ?? 0}
              careerTitle={topCareer?.career?.title || topCareer?.title || 'Full Stack Developer'}
              careerId={topCareer?.career?.id || topCareer?.id || 'career_1'}
            />

            <ResumeScoreCard
              atsScore={summary?.latestAtsScore ?? 80}
            />
          </div>

          {/* Recommended Jobs & Internships Columns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '2rem',
            marginBottom: '2.5rem'
          }}>
            <RecommendedJobsSection
              recommendedJobs={summary?.recommendedJobs || []}
              savedJobIds={savedJobIds}
              onToggleSave={toggleSaveJob}
            />

            <RecommendedInternshipsSection
              recommendedInternships={summary?.recommendedInternships || []}
              savedInternshipIds={savedInternshipIds}
              onToggleSave={toggleSaveInternship}
            />
          </div>

          {/* Recent Activity Live Stream */}
          <RecentActivity
            totalSkillsCount={summary?.totalSkillsCount ?? 0}
            savedCount={(savedJobIds.size + savedInternshipIds.size) || (summary?.savedOpportunitiesCount ?? 0)}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};
