import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Award, 
  CheckCircle, 
  Play, 
  UserCheck,
  Shield
} from 'lucide-react';
import type { TaskCategory, TaskPriority, TaskStatus, VolunteerTask } from '../../types';

interface TaskCardProps {
  task: VolunteerTask;
  currentUserId?: number;
  onClaim?: (taskId: number) => Promise<void>;
  onStart?: (taskId: number) => Promise<void>;
  onOpenCompleteModal?: (task: VolunteerTask) => void;
  showAssignee?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  currentUserId,
  onClaim,
  onStart,
  onOpenCompleteModal,
  showAssignee = true,
}) => {
  const [loading, setLoading] = useState(false);

  const getPriorityBadgeClass = (priority: TaskPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'badge-critical';
      case 'HIGH':
        return 'badge-danger';
      case 'MEDIUM':
        return 'badge-warning';
      case 'LOW':
      default:
        return 'badge-info';
    }
  };

  const getCategoryLabel = (category: TaskCategory) => {
    return category.replace(/_/g, ' ');
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'OPEN':
        return <span className="badge badge-success">● OPEN (Unclaimed)</span>;
      case 'ASSIGNED':
        return <span className="badge badge-info">● CLAIMED</span>;
      case 'IN_PROGRESS':
        return <span className="badge badge-warning">● IN PROGRESS</span>;
      case 'COMPLETED':
        return <span className="badge badge-success" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>✓ COMPLETED</span>;
      case 'CANCELLED':
        return <span className="badge" style={{ background: 'rgba(107, 114, 128, 0.3)', color: '#9ca3af' }}>CANCELLED</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const isAssignedToMe = currentUserId && task.assignedVolunteerId === currentUserId;

  const handleClaim = async () => {
    if (!onClaim) return;
    setLoading(true);
    try {
      await onClaim(task.id);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!onStart) return;
    setLoading(true);
    try {
      await onStart(task.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        border: isAssignedToMe
          ? '1px solid rgba(245, 158, 11, 0.6)'
          : task.priority === 'CRITICAL'
          ? '1px solid rgba(239, 68, 68, 0.5)'
          : '1px solid var(--border-color)',
        boxShadow: isAssignedToMe ? '0 0 15px rgba(245, 158, 11, 0.15)' : 'none',
        position: 'relative',
        transition: 'transform 0.2s ease',
      }}
    >
      {/* Top badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div className="flex items-center gap-2">
          <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
            {task.priority} PRIORITY
          </span>
          <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#e5e7eb', fontSize: '0.7rem' }}>
            {getCategoryLabel(task.category)}
          </span>
        </div>
        <div>
          {getStatusBadge(task.status)}
        </div>
      </div>

      {/* Title & Points Box */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', flex: 1, margin: 0 }}>
          {task.title}
        </h3>
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.3) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.5)',
            padding: '4px 10px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#fbbf24',
            fontWeight: 800,
            fontSize: '0.85rem',
            flexShrink: 0,
            boxShadow: '0 0 10px rgba(245, 158, 11, 0.25)',
          }}
        >
          <Award size={16} color="#fbbf24" />
          +{task.pointsReward} PTS
        </div>
      </div>

      {/* Description */}
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.45, margin: 0 }}>
        {task.description}
      </p>

      {/* Location, Distance & Contact */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '0.75rem',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          fontSize: '0.825rem',
        }}
      >
        <div className="flex items-center gap-2" style={{ color: '#fff', fontWeight: 600 }}>
          <MapPin size={15} color="#ef4444" />
          <span>{task.locationName}</span>
          {task.distanceKm !== undefined && (
            <span className="badge badge-info" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
              📍 {task.distanceKm} km away
            </span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          <span>Coordinates: {task.latitude.toFixed(4)}, {task.longitude.toFixed(4)}</span>
          {task.contactPhone && (
            <span className="flex items-center gap-1" style={{ color: '#34d399' }}>
              <Phone size={12} /> {task.contactPhone}
            </span>
          )}
        </div>
      </div>

      {/* Creator & Assignee Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span className="flex items-center gap-1">
          <Shield size={12} color="#60a5fa" /> Dispatched by: <strong>{task.createdByName || 'Rescue Command'}</strong>
        </span>
        {showAssignee && task.assignedVolunteerName && (
          <span className="flex items-center gap-1" style={{ color: '#fbbf24' }}>
            <UserCheck size={12} /> Assigned: <strong>{task.assignedVolunteerName}</strong>
          </span>
        )}
      </div>

      {/* Completion notes if present */}
      {task.completionNotes && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            color: '#34d399',
          }}
        >
          <strong>Completion Report:</strong> "{task.completionNotes}"
        </div>
      )}

      {/* Actions */}
      <div
        style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '0.75rem',
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.5rem',
        }}
      >
        {task.status === 'OPEN' && onClaim && (
          <button
            onClick={handleClaim}
            disabled={loading}
            className="btn btn-primary"
            style={{
              padding: '6px 16px',
              fontSize: '0.825rem',
              background: '#f59e0b',
              color: '#000',
              fontWeight: 700,
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <UserCheck size={16} /> {loading ? 'Claiming...' : 'Claim Relief Task'}
          </button>
        )}

        {isAssignedToMe && task.status === 'ASSIGNED' && onStart && (
          <button
            onClick={handleStart}
            disabled={loading}
            className="btn btn-primary"
            style={{
              padding: '6px 16px',
              fontSize: '0.825rem',
              background: '#3b82f6',
              fontWeight: 700,
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <Play size={16} /> {loading ? 'Updating...' : 'Start Task (In Progress)'}
          </button>
        )}

        {isAssignedToMe && (task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS') && onOpenCompleteModal && (
          <button
            onClick={() => onOpenCompleteModal(task)}
            className="btn btn-primary"
            style={{
              padding: '6px 16px',
              fontSize: '0.825rem',
              background: '#10b981',
              fontWeight: 700,
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <CheckCircle size={16} /> Mark Completed (+{task.pointsReward} PTS)
          </button>
        )}

        {task.status === 'COMPLETED' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#34d399',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            <CheckCircle size={16} /> Task Resolved • Points Credited
          </div>
        )}
      </div>
    </div>
  );
};
export default TaskCard;
