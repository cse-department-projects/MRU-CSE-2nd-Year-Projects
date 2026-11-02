import React, { useState, useEffect } from 'react';
import {
  Radio,
  PhoneCall,
  XCircle,
  Truck,
  RefreshCw,
  Clock,
  ShieldAlert,
  AlertCircle,
  Activity
} from 'lucide-react';
import type { SosAlert, SosStatus } from '../../types';

interface ActiveSosTrackerProps {
  alert: SosAlert;
  onCancel: (id: number) => void;
  onRefresh: () => void;
}

export const ActiveSosTracker: React.FC<ActiveSosTrackerProps> = ({ alert, onCancel, onRefresh }) => {
  // Step 7.4: Automatically updating elapsed response timer ticker
  const [, setTimerTick] = useState<number>(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerTick((t) => t + 1);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const steps: { status: SosStatus; label: string; desc: string }[] = [
    { status: 'ACTIVE', label: '1. Beacon Active', desc: 'Emergency broadcasted' },
    { status: 'ACKNOWLEDGED', label: '2. Triage Review', desc: 'Command center reviewing' },
    { status: 'ASSIGNED', label: '3. Unit Dispatched', desc: 'Rescue squad en route' },
    { status: 'IN_RESCUE', label: '4. In Operation', desc: 'Responders on-site' },
  ];

  const getStepIndex = (currentStatus: SosStatus) => {
    switch (currentStatus) {
      case 'ACTIVE': return 0;
      case 'ACKNOWLEDGED': return 1;
      case 'ASSIGNED': return 2;
      case 'IN_RESCUE': return 3;
      case 'RESOLVED': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(alert.status);

  const formatElapsedTime = (createdAt: string) => {
    const createdTime = new Date(createdAt).getTime();
    if (!createdTime || isNaN(createdTime)) return 'Just now';
    const diffSeconds = Math.max(0, Math.floor((Date.now() - createdTime) / 1000));
    const mins = Math.floor(diffSeconds / 60);
    const secs = diffSeconds % 60;
    if (mins < 1) {
      return `${secs}s ago`;
    } else if (mins < 60) {
      return `${mins}m ${secs}s ago`;
    } else {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours}h ${remainingMins}m ago`;
    }
  };

  const getPriorityStyle = (priority?: string) => {
    switch (priority) {
      case 'CRITICAL':
        return { bg: 'rgba(239, 68, 68, 0.25)', color: '#ef4444', border: '1px solid #ef4444' };
      case 'URGENT':
        return { bg: 'rgba(249, 115, 22, 0.25)', color: '#f97316', border: '1px solid #f97316' };
      case 'HIGH':
        return { bg: 'rgba(245, 158, 11, 0.25)', color: '#fbbf24', border: '1px solid #fbbf24' };
      case 'MEDIUM':
      default:
        return { bg: 'rgba(16, 185, 129, 0.25)', color: '#34d399', border: '1px solid #10b981' };
    }
  };

  const getSafetyGuidance = (type: string) => {
    switch (type) {
      case 'WATER_LEVEL_RISING':
        return {
          title: 'Flood Water Safety Guidelines',
          instruction: 'Move immediately to the highest accessible floor or roof. Avoid basements or enclosed interior rooms. Disconnect electrical switches if safe to do so. Never attempt to walk, wade, or swim through fast-moving flood water.',
        };
      case 'FIRE':
        return {
          title: 'Structure Fire Safety Guidelines',
          instruction: 'Stay low to the floor where air and oxygen are clearest. Check closed doors for heat before opening. Cover nose and mouth with a damp cloth if available. Signal your location from a window if direct exits are cut off.',
        };
      case 'TRAPPED':
        return {
          title: 'Structural Trapping Guidelines',
          instruction: 'Cover mouth and nose with clothing to filter dust. Conserve energy and phone battery. Tap rhythmically in groups of three on metal pipes, beams, or walls so acoustic rescue detectors can pinpoint your position.',
        };
      case 'MEDICAL':
        return {
          title: 'Medical Attention Guidelines',
          instruction: 'Keep the patient still, warm, and calm. Do not move anyone with suspected spinal or head injuries unless there is direct environmental hazard. Apply clean, firm direct pressure to any areas of severe bleeding.',
        };
      case 'GENERAL_LIFE_THREAT':
      default:
        return {
          title: 'Emergency Beacon Guidelines',
          instruction: 'Stay in place if current position is stable. Keep mobile phone line open for responder calls. When search sirens, vehicles, or horns become audible, signal responders using a bright cloth, whistle, or flashlight.',
        };
    }
  };

  const safetyInfo = getSafetyGuidance(alert.emergencyType);
  const priorityStyle = getPriorityStyle(alert.priority);
  const elapsedTimeStr = formatElapsedTime(alert.createdAt);

  return (
    <div className="glass-card" style={{
      border: '2px solid rgba(239, 68, 68, 0.6)',
      boxShadow: '0 0 30px rgba(239, 68, 68, 0.3)',
      backgroundColor: 'rgba(26, 15, 20, 0.95)',
      marginBottom: '2rem',
      padding: '1.75rem'
    }}>
      {/* Scoped Responsive Styles for Steps Grid */}
      <style>{`
        .sos-progress-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        @media (min-width: 768px) {
          .sos-progress-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="flex items-center gap-3">
          <div style={{
            background: '#ef4444',
            padding: '10px',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.8)',
            animation: 'pulse-emergency 1.5s infinite'
          }}>
            <Radio size={24} color="#fff" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                LIVE EMERGENCY SOS ACTIVE
              </h3>

              {/* Triage Priority Badge */}
              <span
                className="badge"
                style={{
                  background: priorityStyle.bg,
                  color: priorityStyle.color,
                  border: priorityStyle.border,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}
              >
                <ShieldAlert size={12} />
                {typeof alert.triageScore === 'number' && !isNaN(alert.triageScore)
                  ? `Score: ${alert.triageScore} · ${alert.priority}`
                  : `PRIORITY: ${alert.priority || 'CRITICAL'}`}
              </span>

              {/* Elapsed Duration Counter */}
              <span
                style={{
                  background: 'rgba(0, 0, 0, 0.45)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#e2e8f0',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Time elapsed since your emergency distress beacon was registered"
              >
                <Clock size={12} color="#60a5fa" />
                {elapsedTimeStr}
              </span>
            </div>

            <p style={{ color: '#fca5a5', fontSize: '0.85rem', marginTop: '4px' }}>
              Hazard: <strong>{alert.emergencyType.replace(/_/g, ' ')}</strong> • Trapped: <strong>{alert.trappedCount} {alert.trappedCount === 1 ? 'person' : 'people'}</strong> • Location: <strong>{alert.locationName}</strong>
              {alert.medicalAttentionNeeded && (
                <span style={{ color: '#ef4444', fontWeight: 700, marginLeft: '8px' }}>
                  🚑 MED-EVAC REQUESTED
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="btn btn-outline"
            style={{ padding: '6px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Refresh emergency status from server"
          >
            <RefreshCw size={14} /> Refresh Status
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to stand down and cancel this emergency SOS alert?')) {
                onCancel(alert.id);
              }
            }}
            className="btn btn-outline"
            style={{ padding: '6px 14px', fontSize: '0.85rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
          >
            <XCircle size={16} /> Cancel SOS
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="sos-progress-grid">
        {steps.map((s, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <div
              key={s.status}
              style={{
                background: isCurrent
                  ? 'rgba(239, 68, 68, 0.25)'
                  : isDone
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(255, 255, 255, 0.03)',
                border: isCurrent
                  ? '1px solid #ef4444'
                  : isDone
                    ? '1px solid #10b981'
                    : '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.75rem',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isCurrent ? '#fff' : isDone ? '#34d399' : 'var(--text-muted)' }}>
                {s.label}
              </div>
              <div style={{ fontSize: '0.7rem', color: isCurrent ? '#fca5a5' : isDone ? '#6ee7b7' : 'var(--text-muted)' }}>
                {s.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Assigned Unit Banner (if assigned) */}
      {alert.assignedTeamName ? (
        <div style={{
          background: 'rgba(59, 130, 246, 0.12)',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          borderRadius: '10px',
          padding: '1.1rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div className="flex items-center gap-3">
            <div style={{
              background: 'rgba(59, 130, 246, 0.25)',
              padding: '10px',
              borderRadius: '10px',
              color: '#60a5fa'
            }}>
              <Truck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span style={{ fontSize: '0.75rem', color: '#93c5fd', textTransform: 'uppercase', fontWeight: 700 }}>
                  Assigned Rescue Squad
                </span>
                {alert.assignedCallSign && (
                  <span style={{ fontSize: '0.75rem', color: '#60a5fa', fontWeight: 800 }}>
                    [{alert.assignedCallSign}]
                  </span>
                )}
                {alert.assignedTeamType && (
                  <span
                    className="badge"
                    style={{
                      fontSize: '0.65rem',
                      background: 'rgba(59, 130, 246, 0.25)',
                      color: '#93c5fd',
                      border: '1px solid rgba(59, 130, 246, 0.4)'
                    }}
                  >
                    {(alert.assignedTeamType || '').replace(/_/g, ' ')}
                  </span>
                )}
                {/* Live Operational Status */}
                {alert.assignedOperationalStatus && (
                  <span
                    className="badge"
                    style={{
                      fontSize: '0.65rem',
                      background: alert.assignedOperationalStatus === 'ON_SITE' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)',
                      color: alert.assignedOperationalStatus === 'ON_SITE' ? '#34d399' : '#fbbf24',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    {alert.assignedOperationalStatus === 'ON_SITE' ? (
                      <>
                        <Activity size={10} className="animate-pulse" /> ON-SITE EXTRACTION
                      </>
                    ) : (
                      <>
                        <Truck size={10} /> EN ROUTE (DISPATCHED)
                      </>
                    )}
                  </span>
                )}
              </div>
              <strong style={{ fontSize: '1.1rem', color: '#ffffff', display: 'block', marginTop: '2px' }}>
                {alert.assignedTeamName}
              </strong>
            </div>
          </div>

          {alert.assignedTeamPhone && (
            <a
              href={`tel:${alert.assignedTeamPhone}`}
              className="btn btn-primary"
              style={{
                padding: '8px 18px',
                fontSize: '0.875rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#2563eb'
              }}
            >
              <PhoneCall size={16} /> Direct Squad Line ({alert.assignedTeamPhone})
            </a>
          )}
        </div>
      ) : (
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '10px',
          padding: '0.85rem 1.15rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          color: '#fcd34d',
          fontSize: '0.875rem'
        }}>
          <Radio size={20} color="#f59e0b" className="animate-pulse" />
          <span>
            <strong>Command Center Triage in Progress:</strong> Your emergency beacon has been broadcasted to regional rescue headquarters. Responders are reviewing priority dispatch for unit assignment.
          </span>
        </div>
      )}

      {/* Relevant Emergency Safety Instructions */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '0.9rem 1.15rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}
      >
        <div className="flex items-center gap-2" style={{ color: '#f87171', fontSize: '0.825rem', fontWeight: 800 }}>
          <AlertCircle size={15} />
          <span>{safetyInfo.title}</span>
        </div>
        <p style={{ color: '#d1d5db', fontSize: '0.8rem', lineHeight: '1.45', margin: 0 }}>
          {safetyInfo.instruction}
        </p>
      </div>
    </div>
  );
};
