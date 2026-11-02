import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Activity, 
  Radio, 
  Truck, 
  CheckCircle2, 
  PhoneCall, 
  MapPin, 
  RefreshCw,
  UserCheck,
  Plus, 
  ListTodo,
  Volume2,
  VolumeX,
  AlertTriangle,
  X,
  Building2,
  HeartPulse,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Users,
  ArrowUpDown,
  Clock
} from 'lucide-react';
import sosService from '../../services/sos.service';
import disasterService from '../../services/disaster.service';
import taskService from '../../services/task.service';
import hospitalService from '../../services/hospital.service';
import shelterService from '../../services/shelter.service';
import { DisasterCard } from '../../components/disaster/DisasterCard';
import { CreateTaskModal } from '../../components/volunteer/CreateTaskModal';
import { TaskCard } from '../../components/volunteer/TaskCard';
import { EmergencyResourceMap } from '../../components/common/EmergencyResourceMap';
import { 
  startContinuousBuzzer, 
  stopContinuousBuzzer, 
  resumeAudioContext,
  isAudioSupported 
} from '../../utils/sound';
import type { 
  DisasterReport, 
  DisasterStatus, 
  Hospital, 
  RescueUnitSummary,
  Shelter, 
  SosAlert, 
  SosStatus, 
  VolunteerTask 
} from '../../types';

export const RescueDashboard: React.FC = () => {
  const { user } = useAuth();

  const [activeSosQueue, setActiveSosQueue] = useState<SosAlert[]>([]);
  const [pendingDisasters, setPendingDisasters] = useState<DisasterReport[]>([]);
  const [dispatchedTasks, setDispatchedTasks] = useState<VolunteerTask[]>([]);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [sortMode, setSortMode] = useState<'TRIAGE_PRIORITY' | 'NEWEST_FIRST'>('TRIAGE_PRIORITY');
  const [ownershipFilter, setOwnershipFilter] = useState<'ALL' | 'MY_UNIT' | 'UNASSIGNED'>('ALL');

  // Step 7.4: Local timer ticker for live mission duration counters without full dashboard refetches
  const [, setTimerTick] = useState<number>(0);
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimerTick((t) => t + 1);
    }, 15000);
    return () => clearInterval(timerInterval);
  }, []);

  // Format elapsed mission duration and determine color threshold (Green < 10m, Amber 10-30m, Red > 30m)
  const getElapsedDurationInfo = (createdAt: string) => {
    const createdTime = new Date(createdAt).getTime();
    if (!createdTime || isNaN(createdTime)) {
      return { text: 'Just now', color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.35)' };
    }
    const diffMinutes = Math.max(0, Math.floor((Date.now() - createdTime) / 60000));

    let text = `${diffMinutes}m elapsed`;
    if (diffMinutes < 1) {
      text = '< 1m elapsed';
    } else if (diffMinutes >= 60) {
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      text = `${hours}h ${mins}m elapsed`;
    }

    if (diffMinutes < 10) {
      // Green: under 10 minutes
      return { text, color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.35)' };
    } else if (diffMinutes <= 30) {
      // Amber: 10–30 minutes
      return { text, color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)' };
    } else {
      // Red: over 30 minutes
      return { text, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.5)' };
    }
  };

  // Step 7.3: Rescue Squad Dispatch & Roster state
  const [rescueUnits, setRescueUnits] = useState<RescueUnitSummary[]>([]);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState<boolean>(false);
  const [dispatchingSos, setDispatchingSos] = useState<SosAlert | null>(null);
  const [dispatchFilterType, setDispatchFilterType] = useState<string>('ALL');
  const [dispatchAvailabilityFilter, setDispatchAvailabilityFilter] = useState<string>('ALL');
  const [dispatchSearchQuery, setDispatchSearchQuery] = useState<string>('');
  const [dispatchModalError, setDispatchModalError] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);

  // Step 2: Emergency buzzer & acknowledgement state
  const [audioBlocked, setAudioBlocked] = useState<boolean>(false);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [acknowledgingId, setAcknowledgingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Step 6.3: Tactical Geospatial Radar state
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [isRadarCollapsed, setIsRadarCollapsed] = useState<boolean>(false);
  const [showSosLayer, setShowSosLayer] = useState<boolean>(true);
  const [showDisasterLayer, setShowDisasterLayer] = useState<boolean>(true);
  const [showHospitalLayer, setShowHospitalLayer] = useState<boolean>(true);
  const [showShelterLayer, setShowShelterLayer] = useState<boolean>(true);
  const [selectedSosId, setSelectedSosId] = useState<number | null>(null);
  const [selectedDisasterId, setSelectedDisasterId] = useState<number | null>(null);

  const fetchRescueData = async () => {
    setIsLoading(true);
    try {
      const [queue, disasters, tasks, units] = await Promise.all([
        sosService.getActiveQueue(),
        disasterService.getAll(),
        taskService.getAll(),
        sosService.getRescueUnits().catch((err) => {
          console.error('Error fetching rescue units roster:', err);
          return [] as RescueUnitSummary[];
        }),
      ]);
      setActiveSosQueue(queue);
      setPendingDisasters(disasters.filter((d) => d.status === 'PENDING' || d.status === 'VERIFIED'));
      setDispatchedTasks(tasks);
      setRescueUnits(units);
    } catch (err) {
      console.error('Error fetching rescue command center data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStaticResources = async () => {
    try {
      const [hospitalsData, sheltersData] = await Promise.all([
        hospitalService.getAll(),
        shelterService.getAll(),
      ]);
      setHospitals(hospitalsData);
      setShelters(sheltersData);
    } catch (err) {
      console.error('Error fetching static emergency resources for tactical radar:', err);
    }
  };

  const handleSyncRadar = async () => {
    await Promise.all([fetchRescueData(), fetchStaticResources()]);
  };

  useEffect(() => {
    fetchRescueData();
    fetchStaticResources();
    const interval = setInterval(fetchRescueData, 8000);
    return () => clearInterval(interval);
  }, []);

  // Filter unacknowledged alerts that need active buzzer
  const unacknowledgedSos = activeSosQueue.filter((item) => item.status === 'ACTIVE');
  const hasUnacknowledged = unacknowledgedSos.length > 0;

  // Manage continuous emergency buzzer based on presence of ACTIVE alerts
  useEffect(() => {
    let isMounted = true;

    const syncAlarm = async () => {
      if (hasUnacknowledged) {
        const { playing, blocked } = await startContinuousBuzzer();
        if (isMounted) {
          setAudioPlaying(playing);
          setAudioBlocked(blocked);
        }
      } else {
        stopContinuousBuzzer();
        if (isMounted) {
          setAudioPlaying(false);
          setAudioBlocked(false);
        }
      }
    };

    syncAlarm();

    return () => {
      isMounted = false;
    };
  }, [hasUnacknowledged]);

  // Clean up all audio resources immediately on unmount
  useEffect(() => {
    return () => {
      stopContinuousBuzzer();
    };
  }, []);

  // User interaction listener to resume audio if blocked by browser autoplay
  useEffect(() => {
    const handleUserInteraction = () => {
      if (audioBlocked && hasUnacknowledged) {
        handleEnableSound();
      }
    };

    window.addEventListener('click', handleUserInteraction, { once: true });
    return () => {
      window.removeEventListener('click', handleUserInteraction);
    };
  }, [audioBlocked, hasUnacknowledged]);

  // Explicit user action to enable emergency siren when blocked
  const handleEnableSound = async () => {
    const resumed = await resumeAudioContext();
    if (resumed) {
      setAudioBlocked(false);
      if (hasUnacknowledged) {
        const { playing, blocked } = await startContinuousBuzzer();
        setAudioPlaying(playing);
        setAudioBlocked(blocked);
      }
    }
  };

  // Per-alert acknowledgement handler
  const handleAcknowledgeSos = async (id: number) => {
    setActionError(null);
    setAcknowledgingId(id);
    try {
      // Call existing backend status-update API
      const updated = await sosService.updateStatus(id, 'ACKNOWLEDGED');

      // Update local state: keeps alert visible with ACKNOWLEDGED status
      setActiveSosQueue((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );

      // Check if any other unacknowledged alerts remain
      const remainingActive = activeSosQueue.filter(
        (item) => item.id !== id && item.status === 'ACTIVE'
      );

      // Stop buzzer ONLY if no other unacknowledged alerts remain
      if (remainingActive.length === 0) {
        stopContinuousBuzzer();
        setAudioPlaying(false);
        setAudioBlocked(false);
      }
    } catch (err: any) {
      console.error('Failed to acknowledge SOS alert:', err);
      setActionError(
        err.response?.data?.message || `Failed to acknowledge SOS #${id}. Emergency alarm remains active.`
      );
    } finally {
      setAcknowledgingId(null);
    }
  };

  const handleUpdateSosStatus = async (id: number, status: SosStatus) => {
    try {
      const updated = await sosService.updateStatus(id, status);
      setActiveSosQueue((prev) =>
        prev
          .map((item) => (item.id === id ? updated : item))
          .filter((item) => item.status !== 'RESOLVED' && item.status !== 'FALSE_ALARM')
      );
    } catch (err) {
      console.error('Failed to update SOS status:', err);
    }
  };

  const handleConfirmResolve = (sos: SosAlert) => {
    const citizenDetails = sos.userName ? `citizen "${sos.userName}"` : `beacon #${sos.id}`;
    const isConfirmed = window.confirm(
      `Confirm Safe Rescue:\n\nAre you sure you want to mark ${citizenDetails} as safely rescued and resolve this emergency beacon?\n\nThis will complete the operation and remove the alert from the active queue.`
    );
    if (!isConfirmed) return;
    handleUpdateSosStatus(sos.id, 'RESOLVED');
  };

  const handleAssignToMe = async (sosId: number) => {
    if (!user) return;
    setActionError(null);
    try {
      const updated = await sosService.assign(sosId, user.id);
      setActiveSosQueue((prev) => prev.map((item) => (item.id === sosId ? updated : item)));
      // Refresh rescue units roster to reflect updated workload and status
      sosService.getRescueUnits().then(setRescueUnits).catch(console.error);
    } catch (err: any) {
      console.error('Failed to assign SOS to team:', err);
      setActionError(err.response?.data?.message || 'Failed to assign rescue unit');
    }
  };

  const handleOpenDispatchModal = (sos: SosAlert) => {
    setDispatchingSos(sos);
    setDispatchModalError(null);
    setIsDispatchModalOpen(true);
  };

  const handleCloseDispatchModal = () => {
    setIsDispatchModalOpen(false);
    setDispatchingSos(null);
    setDispatchModalError(null);
  };

  const handleConfirmDispatch = async (targetUserId: number) => {
    if (!dispatchingSos) return;
    setIsDispatching(true);
    setDispatchModalError(null);
    try {
      const updated = await sosService.assign(dispatchingSos.id, targetUserId);
      setActiveSosQueue((prev) =>
        prev.map((item) => (item.id === dispatchingSos.id ? updated : item))
      );
      // Refresh rescue units roster
      const refreshedUnits = await sosService.getRescueUnits();
      setRescueUnits(refreshedUnits);
      setIsDispatchModalOpen(false);
      setDispatchingSos(null);
    } catch (err: any) {
      console.error('Failed to dispatch squad:', err);
      setDispatchModalError(
        err.response?.data?.message || 'Failed to dispatch squad. Unit may be inactive or unavailable.'
      );
    } finally {
      setIsDispatching(false);
    }
  };

  const handleVerifyDisaster = async (id: number, status: DisasterStatus) => {
    try {
      const updated = await disasterService.verify(id, { status });
      setPendingDisasters((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } catch (err) {
      console.error('Failed to verify disaster report:', err);
    }
  };

  const filteredSosQueue = activeSosQueue.filter((item) => {
    if (filterType !== 'ALL' && item.emergencyType !== filterType) {
      return false;
    }
    if (ownershipFilter === 'MY_UNIT') {
      return user?.id != null && item.assignedTeamId === user.id;
    }
    if (ownershipFilter === 'UNASSIGNED') {
      return !item.assignedTeamId;
    }
    return true;
  });

  // Priority score fallback resolver for consistent sorting without inventing displayed scores
  const getEffectiveSortScore = (sos: SosAlert): number => {
    if (typeof sos.triageScore === 'number' && !isNaN(sos.triageScore)) {
      return sos.triageScore;
    }
    // Neutral fallback based on priority tier if backend didn't supply triageScore
    switch (sos.priority) {
      case 'CRITICAL':
        return 75;
      case 'URGENT':
        return 55;
      case 'HIGH':
        return 35;
      case 'MEDIUM':
        return 15;
      default:
        return 50; // Neutral fallback: does not silently classify unknown emergencies as low priority
    }
  };

  // Sorted and filtered SOS queue
  const sortedAndFilteredSosQueue = [...filteredSosQueue].sort((a, b) => {
    if (sortMode === 'TRIAGE_PRIORITY') {
      const scoreA = getEffectiveSortScore(a);
      const scoreB = getEffectiveSortScore(b);
      if (scoreB !== scoreA) {
        return scoreB - scoreA; // Highest triage score first
      }
      // Oldest alert first for ties (longest waiting time gets priority)
      const timeA = new Date(a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt).getTime() || 0;
      return timeA - timeB;
    } else {
      // Newest first
      const timeA = new Date(a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt).getTime() || 0;
      return timeB - timeA;
    }
  });

  // Priority badge styling
  const getPriorityBadgeStyle = (priority?: string) => {
    switch (priority) {
      case 'CRITICAL':
        return {
          background: 'rgba(239, 68, 68, 0.2)',
          color: '#ef4444',
          border: '1px solid rgba(239, 68, 68, 0.5)',
        };
      case 'URGENT':
        return {
          background: 'rgba(249, 115, 22, 0.2)',
          color: '#f97316',
          border: '1px solid rgba(249, 115, 22, 0.5)',
        };
      case 'HIGH':
        return {
          background: 'rgba(245, 158, 11, 0.2)',
          color: '#fbbf24',
          border: '1px solid rgba(245, 158, 11, 0.5)',
        };
      case 'MEDIUM':
      default:
        return {
          background: 'rgba(16, 185, 129, 0.2)',
          color: '#34d399',
          border: '1px solid rgba(16, 185, 129, 0.5)',
        };
    }
  };

  // Operational Triage Statistics (calculated only from active unresolved alerts)
  const unresolvedAlerts = activeSosQueue.filter(
    (alert) => alert.status !== 'RESOLVED' && alert.status !== 'FALSE_ALARM'
  );

  const totalTrappedPeople = unresolvedAlerts.reduce((sum, alert) => {
    const count = typeof alert.trappedCount === 'number' && !isNaN(alert.trappedCount) && alert.trappedCount > 0 ? alert.trappedCount : 0;
    return sum + count;
  }, 0);

  const totalMedicalNeeded = unresolvedAlerts.filter((alert) => Boolean(alert.medicalAttentionNeeded)).length;

  const criticalCount = unresolvedAlerts.filter((alert) => alert.priority === 'CRITICAL').length;
  const urgentCount = unresolvedAlerts.filter((alert) => alert.priority === 'URGENT').length;
  const highCount = unresolvedAlerts.filter((alert) => alert.priority === 'HIGH').length;
  const mediumCount = unresolvedAlerts.filter((alert) => alert.priority === 'MEDIUM').length;

  const myUnitActiveMissions = unresolvedAlerts.filter(
    (alert) => user?.id != null && alert.assignedTeamId === user.id
  ).length;

  // Filtered rescue units for the dispatch modal
  const filteredRescueUnits = rescueUnits.filter((unit) => {
    if (dispatchFilterType !== 'ALL' && unit.teamType !== dispatchFilterType) return false;
    if (dispatchAvailabilityFilter !== 'ALL' && unit.operationalStatus !== dispatchAvailabilityFilter) return false;
    if (dispatchSearchQuery.trim()) {
      const q = dispatchSearchQuery.toLowerCase();
      const matchUnit = unit.unitName?.toLowerCase().includes(q);
      const matchCall = unit.callSign?.toLowerCase().includes(q);
      const matchName = unit.fullName?.toLowerCase().includes(q);
      if (!matchUnit && !matchCall && !matchName) return false;
    }
    return true;
  });

  const userLocation =
    user?.currentLatitude && user?.currentLongitude
      ? { latitude: user.currentLatitude, longitude: user.currentLongitude }
      : null;

  const verifiedDisasters = pendingDisasters.filter((d) => d.status === 'VERIFIED');
  const displayDisasters = verifiedDisasters.length > 0 ? verifiedDisasters : pendingDisasters;
  const selectedSos = selectedSosId ? activeSosQueue.find((s) => s.id === selectedSosId) : null;

  return (
    <div className="container">
      {/* Header Profile Bar */}
      <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="flex items-center gap-4">
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            padding: '14px',
            borderRadius: '14px',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
          }}>
            <Activity size={28} color="#fff" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Rescue Tactical Command</h1>
              <span className="badge badge-info">Tactical Response Team</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Unit: <strong>{user?.fullName}</strong> • Active SOS in Queue: <strong style={{ color: '#ef4444' }}>{activeSosQueue.length} Alerts</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem', background: '#f59e0b', color: '#000', fontWeight: 700 }}
          >
            <Plus size={16} /> Dispatch Relief Task
          </button>
          <button
            onClick={handleSyncRadar}
            className="btn btn-outline"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Sync Tactical Radar
          </button>
          <span className="badge badge-critical" style={{ padding: '0.5rem 1rem' }}>
            <Radio size={14} className="animate-pulse" /> Live Dispatch Radar Active
          </span>
          {!isAudioSupported() ? (
            <span
              className="badge"
              style={{
                padding: '0.5rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.06)',
                color: 'var(--text-muted)'
              }}
              title="Web Audio is not supported by this browser"
            >
              <VolumeX size={14} /> Audio Unavailable
            </span>
          ) : audioPlaying ? (
            <span
              className="badge badge-critical"
              style={{
                padding: '0.5rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#dc2626',
                color: '#fff'
              }}
            >
              <Volume2 size={14} className="animate-pulse" /> Siren Active
            </span>
          ) : audioBlocked ? (
            <button
              onClick={handleEnableSound}
              className="badge badge-warning"
              style={{
                padding: '0.5rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                background: 'rgba(245, 158, 11, 0.25)',
                color: '#fbbf24',
                fontWeight: 700
              }}
              title="Browser autoplay restriction has suspended the buzzer. Click to enable emergency sound."
            >
              <VolumeX size={14} /> Sound Blocked (Click to Enable)
            </button>
          ) : (
            <span
              className="badge badge-success"
              style={{
                padding: '0.5rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}
              title="Web Audio engine is active and ready to alert on incoming distress beacons"
            >
              <Volume2 size={14} /> Siren Armed & Ready
            </span>
          )}
        </div>
      </div>

      {/* Tactical Geospatial Radar Section */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div
          className="glass-card"
          style={{
            borderColor: 'rgba(59, 130, 246, 0.4)',
            boxShadow: '0 0 25px rgba(59, 130, 246, 0.15)',
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
          }}
        >
          {/* Radar Header & Controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: isRadarCollapsed ? 0 : '1.25rem',
            }}
          >
            <div>
              <div className="flex items-center gap-2">
                <span
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    padding: '6px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Activity size={20} color="#60a5fa" />
                </span>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                  Tactical Geospatial Radar
                </h2>
                <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                  Live Spatial Overlay
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginTop: '3px' }}>
                Real-time spatial tracking of incoming distress beacons, disaster hazard zones, and casualty reception facilities
              </p>
            </div>

            {/* Layer Toggles and Collapse Buttons */}
            <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
              {/* SOS Layer Toggle */}
              <button
                type="button"
                onClick={() => setShowSosLayer(!showSosLayer)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: showSosLayer ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  background: showSosLayer ? 'rgba(239, 68, 68, 0.22)' : 'rgba(0, 0, 0, 0.4)',
                  color: showSosLayer ? '#fee2e2' : 'var(--text-muted)',
                  transition: 'all 0.2s ease',
                }}
                title={showSosLayer ? 'Hide SOS beacons layer' : 'Show SOS beacons layer'}
              >
                <Radio size={14} color={showSosLayer ? '#ef4444' : '#6b7280'} />
                <span>SOS Beacons ({activeSosQueue.length})</span>
              </button>

              {/* Disaster Incidents Layer Toggle */}
              <button
                type="button"
                onClick={() => setShowDisasterLayer(!showDisasterLayer)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: showDisasterLayer ? '1px solid #f97316' : '1px solid var(--border-color)',
                  background: showDisasterLayer ? 'rgba(249, 115, 22, 0.22)' : 'rgba(0, 0, 0, 0.4)',
                  color: showDisasterLayer ? '#ffedd5' : 'var(--text-muted)',
                  transition: 'all 0.2s ease',
                }}
                title={showDisasterLayer ? 'Hide disaster hazards layer' : 'Show disaster hazards layer'}
              >
                <AlertTriangle size={14} color={showDisasterLayer ? '#f97316' : '#6b7280'} />
                <span>Hazards ({displayDisasters.length})</span>
              </button>

              {/* Emergency Hospitals Layer Toggle */}
              <button
                type="button"
                onClick={() => setShowHospitalLayer(!showHospitalLayer)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: showHospitalLayer ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                  background: showHospitalLayer ? 'rgba(59, 130, 246, 0.22)' : 'rgba(0, 0, 0, 0.4)',
                  color: showHospitalLayer ? '#dbeafe' : 'var(--text-muted)',
                  transition: 'all 0.2s ease',
                }}
                title={showHospitalLayer ? 'Hide hospital layer' : 'Show hospital layer'}
              >
                <HeartPulse size={14} color={showHospitalLayer ? '#3b82f6' : '#6b7280'} />
                <span>Hospitals ({hospitals.length})</span>
              </button>

              {/* Evacuation Shelters Layer Toggle */}
              <button
                type="button"
                onClick={() => setShowShelterLayer(!showShelterLayer)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: showShelterLayer ? '1px solid #10b981' : '1px solid var(--border-color)',
                  background: showShelterLayer ? 'rgba(16, 185, 129, 0.22)' : 'rgba(0, 0, 0, 0.4)',
                  color: showShelterLayer ? '#d1fae5' : 'var(--text-muted)',
                  transition: 'all 0.2s ease',
                }}
                title={showShelterLayer ? 'Hide shelter layer' : 'Show shelter layer'}
              >
                <Building2 size={14} color={showShelterLayer ? '#10b981' : '#6b7280'} />
                <span>Shelters ({shelters.length})</span>
              </button>

              {/* Collapse / Expand Toggle */}
              <button
                type="button"
                onClick={() => setIsRadarCollapsed(!isRadarCollapsed)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 11px',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-secondary)',
                }}
                title={isRadarCollapsed ? 'Expand tactical radar' : 'Minimize tactical radar'}
              >
                {isRadarCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                <span>{isRadarCollapsed ? 'Expand Radar' : 'Minimize'}</span>
              </button>
            </div>
          </div>

          {/* Map Body (Rendered when not collapsed) */}
          {!isRadarCollapsed && (
            <div>
              {selectedSos && (
                <div
                  style={{
                    background: 'rgba(250, 204, 21, 0.12)',
                    border: '1px solid rgba(250, 204, 21, 0.4)',
                    borderRadius: '8px',
                    padding: '0.5rem 0.85rem',
                    marginBottom: '0.85rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.825rem',
                    color: '#fef08a',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>Active Radar Focus:</span>
                    <strong style={{ color: '#ffffff' }}>SOS #{selectedSos.id} ({selectedSos.userName || 'Citizen'})</strong>
                    <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>
                      {selectedSos.emergencyType.replace(/_/g, ' ')}
                    </span>
                    <span>• {selectedSos.trappedCount} Trapped</span>
                    {selectedSos.medicalAttentionNeeded && (
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>• MED-EVAC NEEDED</span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedSosId(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#fef08a',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      textDecoration: 'underline',
                    }}
                  >
                    Clear Focus
                  </button>
                </div>
              )}

              <EmergencyResourceMap
                userLocation={userLocation}
                sosAlerts={sortedAndFilteredSosQueue}
                disasters={displayDisasters}
                hospitals={hospitals}
                shelters={shelters}
                showSosAlerts={showSosLayer}
                showDisasters={showDisasterLayer}
                showHospitals={showHospitalLayer}
                showShelters={showShelterLayer}
                selectedSosId={selectedSosId}
                selectedDisasterId={selectedDisasterId}
                onSelectSos={(sos) => setSelectedSosId(sos.id)}
                onSelectDisaster={(disaster) => setSelectedDisasterId(disaster.id)}
                height="460px"
              />
            </div>
          )}
        </div>
      </section>

      {/* Operational Triage Statistics Bar */}
      <section style={{ marginBottom: '1.75rem' }}>
        <div
          className="glass-card"
          style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.92) 0%, rgba(30, 41, 59, 0.92) 100%)',
            borderColor: 'rgba(59, 130, 246, 0.35)',
            boxShadow: '0 0 20px rgba(15, 23, 42, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div className="flex items-center gap-2">
              <Activity size={16} color="#60a5fa" />
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Operational Triage Overview
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Active Unresolved Emergencies: <strong style={{ color: '#fff' }}>{unresolvedAlerts.length}</strong>
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {/* Total Trapped People */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: totalTrappedPeople > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.75rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  background: totalTrappedPeople > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: totalTrappedPeople > 0 ? '#ef4444' : 'var(--text-muted)',
                  padding: '8px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Trapped Persons
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: totalTrappedPeople > 0 ? '#ef4444' : '#ffffff' }}>
                  {totalTrappedPeople}
                </div>
              </div>
            </div>

            {/* Medical Evacuation Needed */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: totalMedicalNeeded > 0 ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.75rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  background: totalMedicalNeeded > 0 ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: totalMedicalNeeded > 0 ? '#f43f5e' : 'var(--text-muted)',
                  padding: '8px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <HeartPulse size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Med-Evac Needed
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: totalMedicalNeeded > 0 ? '#f43f5e' : '#ffffff' }}>
                  {totalMedicalNeeded}
                </div>
              </div>
            </div>

            {/* My Squad Active Missions */}
            <div
              style={{
                background: myUnitActiveMissions > 0 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0, 0, 0, 0.35)',
                border: myUnitActiveMissions > 0 ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.75rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  background: myUnitActiveMissions > 0 ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                  color: myUnitActiveMissions > 0 ? '#60a5fa' : 'var(--text-muted)',
                  padding: '8px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Truck size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                  My Squad Missions
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: myUnitActiveMissions > 0 ? '#60a5fa' : '#ffffff' }}>
                  {myUnitActiveMissions}
                </div>
              </div>
            </div>

            {/* CRITICAL Priority Alerts */}
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '0.75rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.7rem', color: '#fca5a5', textTransform: 'uppercase', fontWeight: 700 }}>
                  Critical
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444' }}>
                  {criticalCount}
                </div>
              </div>
              <span className="badge badge-critical" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                &ge; 65
              </span>
            </div>

            {/* URGENT Priority Alerts */}
            <div
              style={{
                background: 'rgba(249, 115, 22, 0.08)',
                border: '1px solid rgba(249, 115, 22, 0.3)',
                borderRadius: '8px',
                padding: '0.75rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.7rem', color: '#fdba74', textTransform: 'uppercase', fontWeight: 700 }}>
                  Urgent
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f97316' }}>
                  {urgentCount}
                </div>
              </div>
              <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(249, 115, 22, 0.2)', color: '#f97316' }}>
                45-64
              </span>
            </div>

            {/* HIGH Priority Alerts */}
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                padding: '0.75rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.7rem', color: '#fde047', textTransform: 'uppercase', fontWeight: 700 }}>
                  High
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24' }}>
                  {highCount}
                </div>
              </div>
              <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                25-44
              </span>
            </div>

            {/* MEDIUM Priority Alerts */}
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                padding: '0.75rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.7rem', color: '#86efac', textTransform: 'uppercase', fontWeight: 700 }}>
                  Medium
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
                  {mediumCount}
                </div>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                &lt; 25
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Live SOS Emergency Triage Section */}
      <section style={{ marginBottom: '3.5rem' }}>
        {/* Action Error Notification */}
        {actionError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #ef4444',
            borderRadius: '10px',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <div className="flex items-center gap-2" style={{ color: '#fca5a5', fontSize: '0.875rem', fontWeight: 600 }}>
              <AlertTriangle size={18} color="#ef4444" />
              <span>{actionError}</span>
            </div>
            <button
              onClick={() => setActionError(null)}
              style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title="Dismiss error"
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Emergency Alarm & Browser Audio Banner */}
        {hasUnacknowledged && (
          <div style={{
            background: audioBlocked ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: audioBlocked ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(239, 68, 68, 0.6)',
            boxShadow: audioBlocked ? 'none' : '0 0 25px rgba(239, 68, 68, 0.25)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div className="flex items-center gap-3">
              <div style={{
                background: audioBlocked ? '#f59e0b' : '#ef4444',
                padding: '10px',
                borderRadius: '10px',
                animation: audioBlocked ? 'none' : 'pulse-emergency 1.5s infinite',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {audioBlocked ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>
                    {unacknowledgedSos.length} UNACKNOWLEDGED EMERGENCY SOS BEACON{unacknowledgedSos.length > 1 ? 'S' : ''} DETECTED
                  </strong>
                  <span className="badge badge-critical" style={{ animation: 'pulse-emergency 1.5s infinite' }}>
                    SIREN {audioPlaying ? 'ACTIVE' : audioBlocked ? 'MUTED BY BROWSER' : 'STANDBY'}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {audioPlaying
                    ? 'Continuous tactical emergency buzzer is actively sounding until all beacons are acknowledged.'
                    : audioBlocked
                    ? 'Browser autoplay restriction has suspended the buzzer. Click "Enable Emergency Sound" to activate siren.'
                    : 'Immediate command response required to triage incoming distress beacon.'}
                </p>
              </div>
            </div>

            {audioBlocked && (
              <button
                onClick={handleEnableSound}
                className="btn btn-sos"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <Volume2 size={16} /> Enable Emergency Sound
              </button>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div className="flex items-center gap-2">
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                Live SOS Emergency Triage Queue ({sortedAndFilteredSosQueue.length})
              </h2>
              {activeSosQueue.length > 0 && (
                <span className="badge badge-critical" style={{ animation: 'pulse-emergency 1.5s infinite' }}>
                  CRITICAL QUEUE
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Real-time incoming distress beacons prioritized by deterministic triage severity and wait time
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Ownership Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(0,0,0,0.35)', padding: '3px 6px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, paddingLeft: '4px' }}>
                View:
              </span>
              <button
                type="button"
                onClick={() => setOwnershipFilter('ALL')}
                style={{
                  padding: '4px 9px',
                  borderRadius: '6px',
                  border: 'none',
                  background: ownershipFilter === 'ALL' ? 'rgba(59, 130, 246, 0.35)' : 'transparent',
                  color: ownershipFilter === 'ALL' ? '#60a5fa' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="View all distress signals across the surveillance sector"
              >
                All Sector Incidents
              </button>
              <button
                type="button"
                onClick={() => setOwnershipFilter('MY_UNIT')}
                style={{
                  padding: '4px 9px',
                  borderRadius: '6px',
                  border: 'none',
                  background: ownershipFilter === 'MY_UNIT' ? 'rgba(59, 130, 246, 0.35)' : 'transparent',
                  color: ownershipFilter === 'MY_UNIT' ? '#60a5fa' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
                title="Filter emergencies specifically assigned to your unit"
              >
                <Truck size={12} />
                Assigned to My Unit {myUnitActiveMissions > 0 && `(${myUnitActiveMissions})`}
              </button>
              <button
                type="button"
                onClick={() => setOwnershipFilter('UNASSIGNED')}
                style={{
                  padding: '4px 9px',
                  borderRadius: '6px',
                  border: 'none',
                  background: ownershipFilter === 'UNASSIGNED' ? 'rgba(239, 68, 68, 0.35)' : 'transparent',
                  color: ownershipFilter === 'UNASSIGNED' ? '#fca5a5' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Filter unassigned emergency beacons awaiting responder dispatch"
              >
                Unassigned Incidents
              </button>
            </div>

            {/* Queue Sorting Mode Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.35)', padding: '3px 6px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', paddingLeft: '4px' }}>
                <ArrowUpDown size={12} /> Sort:
              </span>
              <button
                type="button"
                onClick={() => setSortMode('TRIAGE_PRIORITY')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: sortMode === 'TRIAGE_PRIORITY' ? 'rgba(59, 130, 246, 0.35)' : 'transparent',
                  color: sortMode === 'TRIAGE_PRIORITY' ? '#60a5fa' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
                title="Sort by deterministic triage score descending, then longest waiting first"
              >
                <ShieldAlert size={12} />
                Triage Priority
              </button>
              <button
                type="button"
                onClick={() => setSortMode('NEWEST_FIRST')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: sortMode === 'NEWEST_FIRST' ? 'rgba(59, 130, 246, 0.35)' : 'transparent',
                  color: sortMode === 'NEWEST_FIRST' ? '#60a5fa' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
                title="Sort by timestamp descending (newest incoming alerts first)"
              >
                <Clock size={12} />
                Newest First
              </button>
            </div>

            {/* Emergency Type Filters */}
            <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '8px' }}>
              {['ALL', 'GENERAL_LIFE_THREAT', 'MEDICAL', 'TRAPPED', 'WATER_LEVEL_RISING', 'FIRE'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: filterType === t ? 'rgba(239, 68, 68, 0.3)' : 'transparent',
                    color: filterType === t ? '#fff' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {t.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {sortedAndFilteredSosQueue.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '2.5rem', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399', marginBottom: '0.25rem' }}>
              All Emergency Beacons Cleared
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              No pending active SOS distress signals matching your active filter. Standing by on frequency.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {sortedAndFilteredSosQueue.map((sos) => {
              const durationInfo = getElapsedDurationInfo(sos.createdAt);
              const isMyUnitMission = user?.id != null && sos.assignedTeamId === user.id;

              return (
              <div
                key={sos.id}
                onClick={() => setSelectedSosId(sos.id)}
                className="glass-card"
                style={{
                  cursor: 'pointer',
                  outline: selectedSosId === sos.id ? '2px solid #facc15' : 'none',
                  outlineOffset: '2px',
                  borderColor: sos.status === 'ACTIVE'
                    ? '#ef4444'
                    : isMyUnitMission
                    ? '#3b82f6'
                    : sos.status === 'ACKNOWLEDGED'
                    ? 'rgba(245, 158, 11, 0.6)'
                    : sos.status === 'ASSIGNED'
                    ? 'rgba(59, 130, 246, 0.6)'
                    : sos.status === 'IN_RESCUE'
                    ? 'rgba(16, 185, 129, 0.6)'
                    : sos.status === 'RESOLVED'
                    ? 'rgba(16, 185, 129, 0.3)'
                    : sos.medicalAttentionNeeded
                    ? 'rgba(239, 68, 68, 0.7)'
                    : 'rgba(245, 158, 11, 0.5)',
                  boxShadow: sos.status === 'ACTIVE'
                    ? '0 0 25px rgba(239, 68, 68, 0.35)'
                    : isMyUnitMission
                    ? '0 0 22px rgba(59, 130, 246, 0.3)'
                    : sos.status === 'ASSIGNED'
                    ? '0 0 20px rgba(59, 130, 246, 0.2)'
                    : sos.status === 'IN_RESCUE'
                    ? '0 0 20px rgba(16, 185, 129, 0.2)'
                    : sos.medicalAttentionNeeded
                    ? '0 0 15px rgba(239, 68, 68, 0.15)'
                    : 'none',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Triage Priority Badge */}
                    <span
                      className="badge"
                      style={{
                        ...getPriorityBadgeStyle(sos.priority),
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        letterSpacing: '0.02em',
                      }}
                      title={typeof sos.triageScore === 'number' && !isNaN(sos.triageScore)
                        ? `Deterministic triage score: ${sos.triageScore}/95`
                        : `Assigned priority: ${sos.priority || 'MEDIUM'}`}
                    >
                      <ShieldAlert size={12} />
                      {typeof sos.triageScore === 'number' && !isNaN(sos.triageScore)
                        ? `Score: ${sos.triageScore} · ${sos.priority || 'STANDARD'}`
                        : `Priority: ${sos.priority || 'STANDARD'}`}
                    </span>

                    {/* My Squad Badge */}
                    {isMyUnitMission && (
                      <span
                        className="badge"
                        style={{
                          background: 'rgba(59, 130, 246, 0.25)',
                          color: '#93c5fd',
                          border: '1px solid #3b82f6',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <Truck size={11} /> MY SQUAD
                      </span>
                    )}

                    <span className="badge badge-critical">{sos.emergencyType.replace(/_/g, ' ')}</span>
                    {sos.medicalAttentionNeeded && (
                      <span className="badge badge-critical" style={{ background: '#ef4444', color: '#fff' }}>
                        MED-EVAC NEEDED
                      </span>
                    )}
                  </div>
                  {sos.status === 'ACTIVE' ? (
                    <span className="badge badge-critical" style={{ animation: 'pulse-emergency 1.5s infinite', background: '#dc2626', color: '#fff' }}>
                      🚨 ALARM ACTIVE • UNACKNOWLEDGED
                    </span>
                  ) : sos.status === 'ACKNOWLEDGED' ? (
                    <span className="badge badge-warning" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                      ✓ ACKNOWLEDGED (STANDBY)
                    </span>
                  ) : sos.status === 'ASSIGNED' ? (
                    <span className="badge badge-info" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.4)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Truck size={13} /> SQUAD DISPATCHED
                    </span>
                  ) : sos.status === 'IN_RESCUE' ? (
                    <span className="badge badge-success" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Activity size={13} className="animate-pulse" /> ON-SITE RESCUE IN PROGRESS
                    </span>
                  ) : sos.status === 'RESOLVED' ? (
                    <span className="badge badge-success" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} /> RESCUE COMPLETED
                    </span>
                  ) : (
                    <span className="badge badge-warning">
                      Status: {sos.status}
                    </span>
                  )}
                </div>

                {/* Citizen Details */}
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
                    {sos.userName || 'Distressed Citizen'}
                  </h3>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                    <span>Phone: <strong>{sos.userPhone || 'Not provided'}</strong></span>
                    <span>Blood: <strong style={{ color: '#f87171' }}>{sos.userBloodGroup || 'UNKNOWN'}</strong></span>
                    <span>Trapped: <strong style={{ color: '#fbbf24' }}>{sos.trappedCount} People</strong></span>
                  </div>
                </div>

                {/* Location & Time */}
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                  fontSize: '0.85rem'
                }}>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} color="#ef4444" />
                    <span style={{ color: '#fff', fontWeight: 600 }}>{sos.locationName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <span>Coordinates: {sos.latitude.toFixed(4)}, {sos.longitude.toFixed(4)}</span>
                    <div className="flex items-center gap-2">
                      <span>Beacon: {new Date(sos.createdAt).toLocaleTimeString()}</span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: durationInfo.color,
                          background: durationInfo.bg,
                          border: `1px solid ${durationInfo.border}`,
                          borderRadius: '5px',
                          padding: '2px 7px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                        title={`Mission elapsed wait duration: ${durationInfo.text}`}
                      >
                        <Clock size={11} /> {durationInfo.text}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Situation Notes */}
                {sos.additionalNotes && (
                  <p style={{ fontSize: '0.85rem', color: '#e5e7eb', fontStyle: 'italic', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '6px' }}>
                    "{sos.additionalNotes}"
                  </p>
                )}

                {/* Assigned Squad Info / Unassigned Indicator */}
                {sos.assignedTeamName ? (
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                      <div className="flex items-center gap-2" style={{ fontSize: '0.825rem', color: '#60a5fa', fontWeight: 700 }}>
                        <Truck size={15} /> Assigned: <strong>{sos.assignedTeamName}</strong>
                        {sos.assignedCallSign && <span style={{ color: '#93c5fd', fontSize: '0.75rem' }}>[{sos.assignedCallSign}]</span>}
                      </div>
                      {sos.assignedOperationalStatus && (
                        <span className="badge" style={{
                          fontSize: '0.65rem',
                          background: sos.assignedOperationalStatus === 'STANDBY' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: sos.assignedOperationalStatus === 'STANDBY' ? '#34d399' : '#fbbf24',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          {sos.assignedOperationalStatus}
                        </span>
                      )}
                    </div>
                    {sos.assignedTeamType && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Specialization: <strong style={{ color: '#e2e8f0' }}>{sos.assignedTeamType.replace(/_/g, ' ')}</strong>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px dashed rgba(239, 68, 68, 0.4)',
                    borderRadius: '8px',
                    padding: '0.55rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.78rem',
                    color: '#fca5a5'
                  }}>
                    <AlertTriangle size={15} color="#ef4444" />
                    <span><strong>Unassigned Distress Beacon:</strong> Immediate squad dispatch required.</span>
                  </div>
                )}

                {/* Tactical Action Buttons */}
                <div style={{
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '0.85rem',
                  marginTop: 'auto',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  {sos.userPhone && (
                    <a
                      href={`tel:${sos.userPhone}`}
                      className="btn btn-outline"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                    >
                      <PhoneCall size={14} /> Direct Call
                    </a>
                  )}

                  {!sos.assignedTeamId ? (
                    <>
                      <button
                        onClick={() => handleAssignToMe(sos.id)}
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#2563eb' }}
                        title="Self-assign this distress beacon to your current unit"
                      >
                        <UserCheck size={14} /> Assign to Me
                      </button>
                      <button
                        onClick={() => handleOpenDispatchModal(sos)}
                        className="btn btn-outline"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.5)' }}
                        title="Browse available rescue squads and dispatch a specialized unit"
                      >
                        <Truck size={14} /> Dispatch Squad...
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleOpenDispatchModal(sos)}
                      className="btn btn-outline"
                      style={{ padding: '6px 10px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}
                      title="Reassign or transfer this emergency beacon to another rescue squad"
                    >
                      <RefreshCw size={13} /> Re-dispatch Squad...
                    </button>
                  )}

                  {sos.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleAcknowledgeSos(sos.id)}
                      disabled={acknowledgingId === sos.id}
                      className="btn btn-sos"
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.8rem',
                        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                        fontWeight: 700
                      }}
                      title="Acknowledge alert and stop its alarm"
                    >
                      {acknowledgingId === sos.id ? (
                        'Silencing...'
                      ) : (
                        <>
                          <VolumeX size={15} /> Acknowledge & Silence
                        </>
                      )}
                    </button>
                  )}

                  {sos.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleUpdateSosStatus(sos.id, 'IN_RESCUE')}
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#f59e0b' }}
                    >
                      <Activity size={14} /> Mark On-Site (In Rescue)
                    </button>
                  )}

                  <button
                    onClick={() => handleConfirmResolve(sos)}
                    className="btn btn-primary"
                    style={{ padding: '6px 14px', fontSize: '0.8rem', background: '#10b981', marginLeft: 'auto', fontWeight: 600 }}
                    title="Confirm safe rescue and resolve emergency beacon"
                  >
                    <CheckCircle2 size={14} /> Mark Rescued
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Disaster Incident Verification & Field Reports */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
            Disaster Verification & Incident Radar ({pendingDisasters.length})
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Verify citizen-submitted incident reports to authorize regional sirens and volunteer task generation
          </p>
        </div>

        {pendingDisasters.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              No unverified disaster reports pending approval.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {pendingDisasters.map((report) => (
              <DisasterCard
                key={report.id}
                report={report}
                showAdminActions={true}
                onVerify={handleVerifyDisaster}
              />
            ))}
          </div>
        )}
      </section>

      {/* Volunteer Relief Task Dispatches Section */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
              Volunteer Relief Task Dispatches ({dispatchedTasks.length})
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Broadcasted supply delivery, medical aid, search support, and logistics tasks assigned to volunteers
            </p>
          </div>
          <button
            onClick={() => setIsCreateTaskModalOpen(true)}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.85rem', background: '#f59e0b', color: '#000', fontWeight: 700 }}
          >
            <Plus size={16} /> New Relief Dispatch
          </button>
        </div>

        {dispatchedTasks.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '2.5rem' }}>
            <ListTodo size={36} color="#6b7280" style={{ margin: '0 auto 0.75rem auto' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              No volunteer relief tasks dispatched yet.
            </p>
            <button
              onClick={() => setIsCreateTaskModalOpen(true)}
              className="btn btn-primary"
              style={{ background: '#f59e0b', color: '#000', fontWeight: 700 }}
            >
              <Plus size={16} /> Dispatch First Task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {dispatchedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                currentUserId={user?.id}
              />
            ))}
          </div>
        )}
      </section>

      {/* Task Creation Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onTaskCreated={(newTask) => {
          setDispatchedTasks((prev) => [newTask, ...prev]);
        }}
      />

      {/* Step 7.3: Squad Dispatch & Unit Selection Modal */}
      {isDispatchModalOpen && dispatchingSos && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '820px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
              borderColor: 'rgba(59, 130, 246, 0.5)',
              boxShadow: '0 0 35px rgba(59, 130, 246, 0.25)',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <div className="flex items-center gap-2">
                  <Truck size={22} color="#60a5fa" />
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                    Dispatch Tactical Rescue Squad
                  </h2>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                  Select an eligible, specialized response unit to take operational ownership of this emergency distress beacon.
                </p>
              </div>
              <button
                onClick={handleCloseDispatchModal}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}
                title="Close dispatch modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Target Beacon Briefing */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Target Beacon:</span>
                  <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>
                    SOS #{dispatchingSos.id} — {dispatchingSos.userName || 'Distressed Citizen'}
                  </strong>
                  <span className="badge badge-critical" style={{ fontSize: '0.7rem' }}>
                    {dispatchingSos.emergencyType.replace(/_/g, ' ')}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  <span>📍 {dispatchingSos.locationName}</span>
                  <span>Trapped: <strong style={{ color: '#fbbf24' }}>{dispatchingSos.trappedCount}</strong></span>
                  {dispatchingSos.medicalAttentionNeeded && (
                    <span style={{ color: '#ef4444', fontWeight: 700 }}>🚑 MED-EVAC NEEDED</span>
                  )}
                </div>
              </div>
              <div>
                <span
                  className="badge"
                  style={{
                    ...getPriorityBadgeStyle(dispatchingSos.priority),
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                  }}
                >
                  <ShieldAlert size={12} />
                  {typeof dispatchingSos.triageScore === 'number' && !isNaN(dispatchingSos.triageScore)
                    ? `Score: ${dispatchingSos.triageScore} · ${dispatchingSos.priority}`
                    : `Priority: ${dispatchingSos.priority}`}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {dispatchModalError && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#fca5a5',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <AlertTriangle size={18} color="#ef4444" />
                <span>{dispatchModalError}</span>
              </div>
            )}

            {/* Roster Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Specialization Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Unit Type:</span>
                <select
                  value={dispatchFilterType}
                  onChange={(e) => setDispatchFilterType(e.target.value)}
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  <option value="ALL">All Specializations</option>
                  <option value="FIRE_RESCUE">Fire Rescue</option>
                  <option value="FLOOD_RESCUE">Flood Rescue</option>
                  <option value="MEDICAL_EMERGENCY">Medical Emergency</option>
                  <option value="DISASTER_RESPONSE_FORCE">Disaster Response Force</option>
                  <option value="POLICE_SECURITY">Police / Security</option>
                  <option value="GENERAL_RELIEF">General Relief</option>
                </select>
              </div>

              {/* Availability Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Status:</span>
                <select
                  value={dispatchAvailabilityFilter}
                  onChange={(e) => setDispatchAvailabilityFilter(e.target.value)}
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="STANDBY">Ready (Standby)</option>
                  <option value="DISPATCHED">Dispatched</option>
                  <option value="ON_SITE">On-Site</option>
                  <option value="OFF_DUTY">Off Duty</option>
                </select>
              </div>

              {/* Text Search */}
              <input
                type="text"
                placeholder="Search unit by name or call sign..."
                value={dispatchSearchQuery}
                onChange={(e) => setDispatchSearchQuery(e.target.value)}
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  minWidth: '200px',
                }}
              />
            </div>

            {/* Units Roster Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
              {filteredRescueUnits.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No rescue squads found matching your filter criteria.
                </div>
              ) : (
                filteredRescueUnits.map((unit) => {
                  const isCurrentlyAssigned = dispatchingSos.assignedTeamId === unit.userId;
                  const isOffDuty = unit.operationalStatus === 'OFF_DUTY';
                  const isStandby = unit.operationalStatus === 'STANDBY';

                  return (
                    <div
                      key={unit.userId}
                      style={{
                        background: isCurrentlyAssigned
                          ? 'rgba(59, 130, 246, 0.12)'
                          : isOffDuty
                          ? 'rgba(255, 255, 255, 0.02)'
                          : 'rgba(0, 0, 0, 0.35)',
                        border: isCurrentlyAssigned
                          ? '1px solid #3b82f6'
                          : isOffDuty
                          ? '1px solid rgba(255, 255, 255, 0.08)'
                          : isStandby
                          ? '1px solid rgba(16, 185, 129, 0.35)'
                          : '1px solid var(--border-color)',
                        borderRadius: '10px',
                        padding: '0.9rem 1.15rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                        opacity: isOffDuty ? 0.6 : 1,
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div className="flex items-center gap-2">
                          <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>
                            {unit.unitName}
                          </strong>
                          {unit.callSign && (
                            <span style={{ fontSize: '0.75rem', color: '#93c5fd', fontWeight: 700 }}>
                              [{unit.callSign}]
                            </span>
                          )}
                          <span
                            className="badge"
                            style={{
                              fontSize: '0.65rem',
                              background: 'rgba(59, 130, 246, 0.2)',
                              color: '#60a5fa',
                              border: '1px solid rgba(59, 130, 246, 0.4)',
                            }}
                          >
                            {(unit.teamType || 'DISASTER_RESPONSE_FORCE').replace(/_/g, ' ')}
                          </span>
                          <span
                            className="badge"
                            style={{
                              fontSize: '0.65rem',
                              background:
                                unit.operationalStatus === 'STANDBY'
                                  ? 'rgba(16, 185, 129, 0.2)'
                                  : unit.operationalStatus === 'DISPATCHED'
                                  ? 'rgba(245, 158, 11, 0.2)'
                                  : unit.operationalStatus === 'ON_SITE'
                                  ? 'rgba(59, 130, 246, 0.2)'
                                  : 'rgba(107, 114, 128, 0.2)',
                              color:
                                unit.operationalStatus === 'STANDBY'
                                  ? '#34d399'
                                  : unit.operationalStatus === 'DISPATCHED'
                                  ? '#fbbf24'
                                  : unit.operationalStatus === 'ON_SITE'
                                  ? '#60a5fa'
                                  : '#9ca3af',
                            }}
                          >
                            {unit.operationalStatus || 'STANDBY'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          <span>Commander: <strong>{unit.fullName}</strong></span>
                          <span>Crew: <strong>{unit.memberCount || 1} responders</strong></span>
                          <span>Workload: <strong style={{ color: (unit.activeAssignmentCount || 0) > 0 ? '#fbbf24' : '#34d399' }}>
                            {unit.activeAssignmentCount || 0} Active {(unit.activeAssignmentCount || 0) === 1 ? 'Mission' : 'Missions'}
                          </strong></span>
                          {unit.vehicleType && <span>Vehicle: <strong>{unit.vehicleType}</strong></span>}
                        </div>
                      </div>

                      <div>
                        {isCurrentlyAssigned ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: '#60a5fa',
                              padding: '6px 12px',
                              background: 'rgba(59, 130, 246, 0.15)',
                              borderRadius: '6px',
                            }}
                          >
                            <UserCheck size={14} /> Currently Assigned
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={isOffDuty || isDispatching}
                            onClick={() => handleConfirmDispatch(unit.userId)}
                            className="btn btn-primary"
                            style={{
                              padding: '6px 14px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              background: isOffDuty ? '#4b5563' : '#2563eb',
                              cursor: isOffDuty ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {isDispatching ? (
                              'Dispatching...'
                            ) : isOffDuty ? (
                              'Unit Off-Duty'
                            ) : (
                              <>
                                <Truck size={14} /> Dispatch Squad
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
              <button
                type="button"
                onClick={handleCloseDispatchModal}
                className="btn btn-outline"
                style={{ padding: '6px 16px', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
