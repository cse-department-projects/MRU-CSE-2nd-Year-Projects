import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Award, 
  ListTodo, 
  Trophy, 
  ShieldCheck, 
  RefreshCw, 
  Flame, 
  Edit3,
  Search,
  Crosshair
} from 'lucide-react';
import volunteerService from '../../services/volunteer.service';
import taskService from '../../services/task.service';
import { TaskCard } from '../../components/volunteer/TaskCard';
import { VolunteerProfileModal } from '../../components/volunteer/VolunteerProfileModal';
import { CompleteTaskModal } from '../../components/volunteer/CompleteTaskModal';
import { LeaderboardTable } from '../../components/volunteer/LeaderboardTable';
import type { 
  AvailabilityStatus, 
  LeaderboardEntry, 
  VolunteerProfileResponse, 
  VolunteerTask 
} from '../../types';

export interface VolunteerDashboardProps {
  initialTab?: 'AVAILABLE' | 'MY_TASKS' | 'LEADERBOARD';
  openProfile?: boolean;
}

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({
  initialTab,
  openProfile = false,
}) => {
  const { user } = useAuth();
  const location = useLocation();

  const getInitialTab = (): 'AVAILABLE' | 'MY_TASKS' | 'LEADERBOARD' => {
    if (initialTab) return initialTab;
    if (location.pathname.endsWith('/tasks')) return 'MY_TASKS';
    if (location.pathname.endsWith('/rewards')) return 'LEADERBOARD';
    return 'AVAILABLE';
  };

  const [profile, setProfile] = useState<VolunteerProfileResponse | null>(null);
  const [availableTasks, setAvailableTasks] = useState<VolunteerTask[]>([]);
  const [myTasks, setMyTasks] = useState<VolunteerTask[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const [activeTab, setActiveTab] = useState<'AVAILABLE' | 'MY_TASKS' | 'LEADERBOARD'>(getInitialTab);
  const [isLoading, setIsLoading] = useState(true);

  // Filters for available tasks
  const [selectedRadius, setSelectedRadius] = useState<number>(30);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(
    openProfile || location.pathname.endsWith('/profile')
  );
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<VolunteerTask | null>(null);

  const fetchAllVolunteerData = async () => {
    setIsLoading(true);
    try {
      const [profileData, myTasksData, leaderboardData] = await Promise.all([
        volunteerService.getMyProfile(),
        taskService.getMyTasks(),
        volunteerService.getLeaderboard(25),
      ]);

      setProfile(profileData);
      setMyTasks(myTasksData);
      setLeaderboard(leaderboardData);

      // Fetch nearby/available tasks with coordinates if available
      const lat = profileData.currentLatitude || user?.currentLatitude;
      const lon = profileData.currentLongitude || user?.currentLongitude;
      const radius = profileData.preferredRadiusKm || selectedRadius;

      const tasks = await taskService.getAvailable(lat, lon, radius);
      setAvailableTasks(tasks);
    } catch (err) {
      console.error('Failed to load volunteer hub data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllVolunteerData();
    const interval = setInterval(fetchAllVolunteerData, 12000);
    return () => clearInterval(interval);
  }, [selectedRadius]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    } else if (location.pathname.endsWith('/tasks')) {
      setActiveTab('MY_TASKS');
    } else if (location.pathname.endsWith('/rewards')) {
      setActiveTab('LEADERBOARD');
    }

    if (openProfile || location.pathname.endsWith('/profile')) {
      setIsProfileModalOpen(true);
    }
  }, [location.pathname, initialTab, openProfile]);

  const handleClaimTask = async (taskId: number) => {
    try {
      const claimed = await taskService.assign(taskId);
      setAvailableTasks((prev) => prev.filter((t) => t.id !== taskId));
      setMyTasks((prev) => [claimed, ...prev]);
      setActiveTab('MY_TASKS');
    } catch (err) {
      console.error('Failed to claim task:', err);
    }
  };

  const handleStartTask = async (taskId: number) => {
    try {
      const updated = await taskService.updateStatus(taskId, { status: 'IN_PROGRESS' });
      setMyTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch (err) {
      console.error('Failed to start task:', err);
    }
  };

  const handleCompleteTask = async (taskId: number, notes: string) => {
    try {
      const updated = await taskService.complete(taskId, notes);
      setMyTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      // Refresh profile to reflect newly awarded points & badge tier
      const refreshedProfile = await volunteerService.getMyProfile();
      setProfile(refreshedProfile);
    } catch (err) {
      console.error('Failed to complete task:', err);
      throw err;
    }
  };

  const handleQuickStatusChange = async (newStatus: AvailabilityStatus) => {
    if (!profile) return;
    try {
      const updated = await volunteerService.updateMyProfile({ availabilityStatus: newStatus });
      setProfile(updated);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Tier calculation for progress bar
  const calculateTierProgress = () => {
    const points = profile?.totalPoints || 0;
    const currentTier = profile?.currentTier || 'BRONZE';

    if (currentTier === 'PLATINUM' || points >= 1000) {
      return { targetTier: 'MAX TIER', nextPoints: 1000, current: points, percentage: 100, remaining: 0 };
    }
    if (currentTier === 'GOLD' || points >= 500) {
      const nextPoints = 1000;
      const progress = ((points - 500) / 500) * 100;
      return { targetTier: 'PLATINUM', nextPoints, current: points, percentage: Math.min(100, Math.max(0, progress)), remaining: nextPoints - points };
    }
    if (currentTier === 'SILVER' || points >= 200) {
      const nextPoints = 500;
      const progress = ((points - 200) / 300) * 100;
      return { targetTier: 'GOLD', nextPoints, current: points, percentage: Math.min(100, Math.max(0, progress)), remaining: nextPoints - points };
    }
    // Bronze
    const nextPoints = 200;
    const progress = (points / 200) * 100;
    return { targetTier: 'SILVER', nextPoints, current: points, percentage: Math.min(100, Math.max(0, progress)), remaining: nextPoints - points };
  };

  const tierProgress = calculateTierProgress();

  // Filter available tasks
  const filteredAvailableTasks = availableTasks.filter((t) => {
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
    if (selectedPriority !== 'ALL' && t.priority !== selectedPriority) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.locationName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeAssignedTasks = myTasks.filter((t) => t.status === 'ASSIGNED' || t.status === 'IN_PROGRESS');
  const completedMyTasks = myTasks.filter((t) => t.status === 'COMPLETED');

  return (
    <div className="container">
      {/* Volunteer Header Profile Bar */}
      <div
        className="glass-card"
        style={{
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
        }}
      >
        <div className="flex items-center gap-4">
          <div
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              padding: '16px',
              borderRadius: '16px',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Award size={32} color="#fff" />
          </div>
          <div>
            <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Volunteer Operations: {profile?.fullName || user?.fullName}
              </h1>
              <span
                className="badge"
                style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#fbbf24',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                }}
              >
                ★ {profile?.currentTier || 'BRONZE'} RESPONDER
              </span>
              {profile?.isVerified && (
                <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <ShieldCheck size={13} /> Verified
                </span>
              )}
            </div>

            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.35rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span>Total Points: <strong style={{ color: '#fbbf24' }}>{profile?.totalPoints ?? 0} PTS</strong></span>
              <span>•</span>
              <span>Missions Completed: <strong style={{ color: '#34d399' }}>{profile?.tasksCompleted ?? 0}</strong></span>
              <span>•</span>
              <span>Rank: <strong style={{ color: '#60a5fa' }}>#{profile?.leaderboardRank ?? 1} on Leaderboard</strong></span>
            </div>
          </div>
        </div>

        {/* Readiness Status & Actions */}
        <div className="flex items-center gap-3">
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '8px' }}>
            {(['AVAILABLE', 'BUSY', 'OFFLINE'] as AvailabilityStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => handleQuickStatusChange(status)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background:
                    profile?.availabilityStatus === status
                      ? status === 'AVAILABLE'
                        ? '#10b981'
                        : status === 'BUSY'
                        ? '#f59e0b'
                        : '#6b7280'
                      : 'transparent',
                  color: profile?.availabilityStatus === status ? '#fff' : 'var(--text-secondary)',
                }}
              >
                ● {status}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="btn btn-outline"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Edit3 size={15} /> Edit Profile
          </button>

          <button
            onClick={fetchAllVolunteerData}
            className="btn btn-outline"
            style={{ padding: '8px 12px' }}
            title="Refresh Data"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Gamification Tier Progression Tracker */}
      <div
        className="glass-card"
        style={{
          marginBottom: '2rem',
          padding: '1.25rem 1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(15, 23, 42, 0.6)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="flex items-center gap-2">
            <Flame size={18} color="#fbbf24" />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
              Tier Progression: <strong>{profile?.currentTier || 'BRONZE'}</strong>
            </span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {tierProgress.targetTier === 'MAX TIER' ? (
              <strong style={{ color: '#c084fc' }}>★ Maximum Master Responder Tier Achieved</strong>
            ) : (
              <>
                <strong style={{ color: '#fbbf24' }}>{tierProgress.remaining} PTS</strong> needed to unlock{' '}
                <strong style={{ color: '#60a5fa' }}>{tierProgress.targetTier} TIER</strong>
              </>
            )}
          </span>
        </div>

        <div
          style={{
            height: '10px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${tierProgress.percentage}%`,
              background: 'linear-gradient(90deg, #f59e0b 0%, #10b981 100%)',
              borderRadius: '6px',
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '2rem',
          paddingBottom: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setActiveTab('AVAILABLE')}
          style={{
            background: activeTab === 'AVAILABLE' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
            border: activeTab === 'AVAILABLE' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
            color: activeTab === 'AVAILABLE' ? '#fbbf24' : 'var(--text-secondary)',
            padding: '10px 18px',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Crosshair size={18} /> Available Relief Radar ({availableTasks.length})
        </button>

        <button
          onClick={() => setActiveTab('MY_TASKS')}
          style={{
            background: activeTab === 'MY_TASKS' ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            border: activeTab === 'MY_TASKS' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
            color: activeTab === 'MY_TASKS' ? '#60a5fa' : 'var(--text-secondary)',
            padding: '10px 18px',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ListTodo size={18} /> My Active Missions ({activeAssignedTasks.length})
        </button>

        <button
          onClick={() => setActiveTab('LEADERBOARD')}
          style={{
            background: activeTab === 'LEADERBOARD' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            border: activeTab === 'LEADERBOARD' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
            color: activeTab === 'LEADERBOARD' ? '#34d399' : 'var(--text-secondary)',
            padding: '10px 18px',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Trophy size={18} /> Leaderboard & Rewards
        </button>
      </div>

      {/* TAB 1: Available Relief Tasks Radar */}
      {activeTab === 'AVAILABLE' && (
        <section>
          {/* Filter Bar */}
          <div
            className="glass-card"
            style={{
              marginBottom: '1.5rem',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search relief tasks by title, location or supplies..."
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '0.8rem',
                }}
              >
                <option value="ALL">All Categories</option>
                <option value="FOOD_DISTRIBUTION">Food & Water</option>
                <option value="FIRST_AID">First Aid</option>
                <option value="SEARCH_ASSISTANCE">Search Support</option>
                <option value="SHELTER_SUPPORT">Shelter Support</option>
                <option value="EVACUATION_HELP">Evacuation Help</option>
                <option value="LOGISTICS">Logistics</option>
                <option value="COMMUNITY_PATROL">Community Patrol</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Priority:</span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '0.8rem',
                }}
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Radius Selector */}
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Radar Radius:</span>
              <select
                value={selectedRadius}
                onChange={(e) => setSelectedRadius(Number(e.target.value))}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '0.8rem',
                }}
              >
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
                <option value={500}>All Regions</option>
              </select>
            </div>
          </div>

          {filteredAvailableTasks.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <Crosshair size={40} color="#6b7280" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                No Open Relief Tasks in Your Area
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '480px', margin: '0 auto' }}>
                Currently no unclaimed tasks matching your filters within {selectedRadius} km. Stand by for live rescue dispatches or widen your search radius.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {filteredAvailableTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  currentUserId={user?.id}
                  onClaim={handleClaimTask}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: My Active Missions */}
      {activeTab === 'MY_TASKS' && (
        <section>
          {/* In-Progress Section */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
                Current Deployments ({activeAssignedTasks.length})
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Missions claimed by you awaiting execution and completion report
              </p>
            </div>

            {activeAssignedTasks.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '2.5rem', border: '1px dashed rgba(255, 255, 255, 0.15)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>
                  You do not have any active claimed tasks. Browse the relief radar to claim open assignments.
                </p>
                <button
                  onClick={() => setActiveTab('AVAILABLE')}
                  className="btn btn-primary"
                  style={{ background: '#f59e0b', color: '#000', fontWeight: 700 }}
                >
                  <Crosshair size={16} /> Open Relief Radar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {activeAssignedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    currentUserId={user?.id}
                    onStart={handleStartTask}
                    onOpenCompleteModal={(t) => {
                      setTaskToComplete(t);
                      setIsCompleteModalOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Completed History Section */}
          {completedMyTasks.length > 0 && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>
                  Completed Mission History ({completedMyTasks.length})
                </h2>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {completedMyTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* TAB 3: Leaderboard & Rewards */}
      {activeTab === 'LEADERBOARD' && (
        <LeaderboardTable
          entries={leaderboard}
          currentUserId={user?.id}
        />
      )}

      {/* Profile Modal */}
      <VolunteerProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onProfileUpdated={(updated) => setProfile(updated)}
      />

      {/* Complete Task Modal */}
      <CompleteTaskModal
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setTaskToComplete(null);
        }}
        task={taskToComplete}
        onComplete={handleCompleteTask}
      />
    </div>
  );
};
export default VolunteerDashboard;
