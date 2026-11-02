import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldAlert, 
  Users, 
  Building2, 
  ListTodo, 
  RefreshCw, 
  Search, 
  ShieldCheck, 
  ShieldX, 
  AlertTriangle,
  Plus
} from 'lucide-react';
import adminService from '../../services/admin.service';
import volunteerService from '../../services/volunteer.service';
import { CreateTaskModal } from '../../components/volunteer/CreateTaskModal';
import type { AdminStats, AdminUserSummary, Role } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdatingUser, setIsUpdatingUser] = useState<number | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load admin management data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    setIsUpdatingUser(userId);
    try {
      const updated = await adminService.updateUserStatus(userId, { isActive: !currentStatus });
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch (err) {
      console.error('Failed to toggle user status:', err);
    } finally {
      setIsUpdatingUser(null);
    }
  };

  const handleChangeRole = async (userId: number, newRole: Role) => {
    setIsUpdatingUser(userId);
    try {
      const updated = await adminService.updateUserRole(userId, { role: newRole });
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch (err) {
      console.error('Failed to change user role:', err);
    } finally {
      setIsUpdatingUser(null);
    }
  };

  const handleToggleVolunteerVerification = async (userId: number, currentVerified: boolean) => {
    setIsUpdatingUser(userId);
    try {
      await volunteerService.verifyVolunteer(userId, !currentVerified);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, volunteerVerified: !currentVerified } : u))
      );
    } catch (err) {
      console.error('Failed to verify volunteer certification:', err);
    } finally {
      setIsUpdatingUser(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (selectedRole !== 'ALL' && u.role !== selectedRole) return false;
    if (selectedStatus === 'ACTIVE' && !u.isActive) return false;
    if (selectedStatus === 'INACTIVE' && u.isActive) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.rescueUnitName && u.rescueUnitName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="container">
      {/* Header Profile Bar */}
      <div
        className="glass-card"
        style={{
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
        }}
      >
        <div className="flex items-center gap-4">
          <div
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              padding: '16px',
              borderRadius: '16px',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldAlert size={32} color="#fff" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                System Administration Command
              </h1>
              <span
                className="badge"
                style={{
                  background: 'rgba(139, 92, 246, 0.25)',
                  color: '#c4b5fd',
                  border: '1px solid rgba(139, 92, 246, 0.5)',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                }}
              >
                SUPER-ADMIN AUTHORITY
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
              Administrator: <strong>{user?.fullName}</strong> • Database: <code style={{ color: '#60a5fa' }}>ResQNet_Final_DB</code> • RBAC: <strong>ACTIVE</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem', background: '#8b5cf6', fontWeight: 700 }}
          >
            <Plus size={16} /> Broadcast System Task
          </button>

          <button
            onClick={fetchAdminData}
            className="btn btn-outline"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Sync Metrics
          </button>
        </div>
      </div>

      {/* Real-time System Analytics Grid */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
            System Infrastructure & Incident Overview
          </h2>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {/* Total Registered Users */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Registered Users</span>
              <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '6px', borderRadius: '8px' }}>
                <Users size={18} color="#a78bfa" />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
              {stats?.totalUsers ?? users.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              👥 {stats?.totalCitizens ?? 0} Citizens • 🤝 {stats?.totalVolunteers ?? 0} Volunteers • 🚒 {stats?.totalRescueTeams ?? 0} Rescuers
            </div>
          </div>

          {/* Active SOS Distresses */}
          <div className="glass-card" style={{ padding: '1.25rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.825rem', color: '#fca5a5', fontWeight: 600 }}>Active SOS Alerts</span>
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '6px', borderRadius: '8px' }}>
                <AlertTriangle size={18} color="#ef4444" />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444', marginBottom: '0.25rem' }}>
              {stats?.activeSosCount ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Live distress beacons requiring field response
            </div>
          </div>

          {/* Shelters & Hospitals */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Shelters & Hospital Beds</span>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '6px', borderRadius: '8px' }}>
                <Building2 size={18} color="#10b981" />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', marginBottom: '0.25rem' }}>
              {stats?.openShelterCount ?? 0} Shelters
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              🏥 {stats?.operationalHospitalsCount ?? 0} Hospitals • 🛏️ {stats?.totalAvailableBeds ?? 0} Beds Available
            </div>
          </div>

          {/* Relief Tasks */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Volunteer Relief Tasks</span>
              <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '6px', borderRadius: '8px' }}>
                <ListTodo size={18} color="#f59e0b" />
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24', marginBottom: '0.25rem' }}>
              {stats?.totalTasks ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ⚡ {stats?.activeTasks ?? 0} Active / Open • ✓ {stats?.completedTasks ?? 0} Resolved
            </div>
          </div>
        </div>
      </section>

      {/* User Management Section */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
              System User Directory & Role Permissions ({filteredUsers.length})
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Manage responder authorizations, modify access levels, and toggle system account active status
            </p>
          </div>
        </div>

        {/* Filter Controls */}
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
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone or rescue unit..."
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

          <div className="flex items-center gap-2">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filter Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.8rem',
              }}
            >
              <option value="ALL">All Roles</option>
              <option value="CITIZEN">CITIZEN</option>
              <option value="VOLUNTEER">VOLUNTEER</option>
              <option value="RESCUE_TEAM">RESCUE TEAM</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Account Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.8rem',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Disabled / Inactive</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>ID</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>User / Contact</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Role Level</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Sector Information</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Volunteer Certification</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Account Access</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Role Change</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No users match the search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = user?.id === u.id;
                    return (
                      <tr
                        key={u.id}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          background: isSelf ? 'rgba(139, 92, 246, 0.05)' : 'transparent',
                          transition: 'background 0.2s',
                        }}
                      >
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                          #{u.id}
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 700, color: '#fff' }}>
                            {u.fullName} {isSelf && <span className="badge badge-info" style={{ fontSize: '0.6rem' }}>YOU</span>}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.775rem' }}>
                            {u.email}
                          </div>
                          {u.phone && (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.725rem' }}>
                              📞 {u.phone}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          <span
                            className="badge"
                            style={{
                              background:
                                u.role === 'ADMIN'
                                  ? 'rgba(139, 92, 246, 0.2)'
                                  : u.role === 'RESCUE_TEAM'
                                  ? 'rgba(59, 130, 246, 0.2)'
                                  : u.role === 'VOLUNTEER'
                                  ? 'rgba(245, 158, 11, 0.2)'
                                  : 'rgba(16, 185, 129, 0.2)',
                              color:
                                u.role === 'ADMIN'
                                  ? '#c4b5fd'
                                  : u.role === 'RESCUE_TEAM'
                                  ? '#93c5fd'
                                  : u.role === 'VOLUNTEER'
                                  ? '#fbbf24'
                                  : '#6ee7b7',
                              fontWeight: 700,
                            }}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          {u.role === 'VOLUNTEER' && (
                            <div style={{ fontSize: '0.775rem' }}>
                              <span style={{ color: '#fbbf24' }}>{u.volunteerPoints || 0} PTS</span> • Tier: <strong>{u.volunteerTier || 'BRONZE'}</strong>
                            </div>
                          )}
                          {u.role === 'RESCUE_TEAM' && (
                            <div style={{ fontSize: '0.775rem', color: '#93c5fd' }}>
                              Unit: <strong>{u.rescueUnitName || 'Field Unit'}</strong> {u.rescueTeamType && `(${u.rescueTeamType})`}
                            </div>
                          )}
                          {u.role === 'CITIZEN' && (
                            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                              Blood: {u.bloodGroup || 'UNKNOWN'}
                            </div>
                          )}
                          {u.role === 'ADMIN' && (
                            <div style={{ fontSize: '0.775rem', color: '#c4b5fd' }}>
                              System Root
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          {u.role === 'VOLUNTEER' ? (
                            <button
                              onClick={() => handleToggleVolunteerVerification(u.id, !!u.volunteerVerified)}
                              disabled={isUpdatingUser === u.id}
                              style={{
                                background: u.volunteerVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                border: u.volunteerVerified ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)',
                                color: u.volunteerVerified ? '#34d399' : 'var(--text-secondary)',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              {u.volunteerVerified ? (
                                <>
                                  <ShieldCheck size={14} color="#34d399" /> Verified Responder
                                </>
                              ) : (
                                <>
                                  <ShieldX size={14} color="#9ca3af" /> Unverified (Click to Verify)
                                </>
                              )}
                            </button>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                          )}
                        </td>

                        <td style={{ padding: '12px 16px' }}>
                          <button
                            onClick={() => handleToggleStatus(u.id, u.isActive)}
                            disabled={isSelf || isUpdatingUser === u.id}
                            style={{
                              background: u.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              border: u.isActive ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                              color: u.isActive ? '#34d399' : '#f87171',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: isSelf ? 'not-allowed' : 'pointer',
                            }}
                          >
                            ● {u.isActive ? 'Active (Enabled)' : 'Disabled / Suspended'}
                          </button>
                        </td>

                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <select
                            value={u.role}
                            disabled={isSelf || isUpdatingUser === u.id}
                            onChange={(e) => handleChangeRole(u.id, e.target.value as Role)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              background: 'rgba(0, 0, 0, 0.4)',
                              border: '1px solid var(--border-color)',
                              color: '#fff',
                              fontSize: '0.75rem',
                              cursor: isSelf ? 'not-allowed' : 'pointer',
                            }}
                          >
                            <option value="CITIZEN">CITIZEN</option>
                            <option value="VOLUNTEER">VOLUNTEER</option>
                            <option value="RESCUE_TEAM">RESCUE_TEAM</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Admin Task Creation Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onTaskCreated={() => {
          fetchAdminData();
        }}
      />
    </div>
  );
};
export default AdminDashboard;
