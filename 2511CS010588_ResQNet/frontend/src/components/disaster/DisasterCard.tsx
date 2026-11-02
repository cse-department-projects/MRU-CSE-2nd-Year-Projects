import React from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Flame, 
  Waves, 
  Building, 
  Wind 
} from 'lucide-react';
import type { DisasterReport, DisasterStatus, Severity } from '../../types';

interface DisasterCardProps {
  report: DisasterReport;
  onVerify?: (id: number, status: DisasterStatus) => void;
  showAdminActions?: boolean;
}

export const DisasterCard: React.FC<DisasterCardProps> = ({
  report,
  onVerify,
  showAdminActions = false,
}) => {
  const getSeverityBadgeClass = (severity: Severity) => {
    switch (severity) {
      case 'CRITICAL': return 'badge-critical';
      case 'HIGH': return 'badge-warning';
      case 'MEDIUM': return 'badge-info';
      case 'LOW': return 'badge-success';
      default: return 'badge-info';
    }
  };

  const getStatusBadgeClass = (status: DisasterStatus) => {
    switch (status) {
      case 'VERIFIED': return 'badge-success';
      case 'IN_PROGRESS': return 'badge-warning';
      case 'RESOLVED': return 'badge-info';
      case 'REJECTED': return 'badge-critical';
      default: return 'badge-warning';
    }
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'FIRE': return <Flame size={18} color="#f97316" />;
      case 'FLOOD':
      case 'TSUNAMI': return <Waves size={18} color="#0ea5e9" />;
      case 'CYCLONE': return <Wind size={18} color="#a855f7" />;
      case 'BUILDING_COLLAPSE':
      case 'EARTHQUAKE': return <Building size={18} color="#eab308" />;
      default: return <AlertTriangle size={18} color="#ef4444" />;
    }
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.5rem' }}>
        <div className="flex items-center gap-2">
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '6px',
            borderRadius: '8px'
          }}>
            {getCategoryIcon(report.disasterType)}
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              {report.disasterType.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`badge ${getSeverityBadgeClass(report.severity)}`}>
            {report.severity}
          </span>
          <span className={`badge ${getStatusBadgeClass(report.status)}`}>
            {report.status}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem', lineHeight: '1.3' }}>
        {report.title}
      </h3>

      {/* Description */}
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '1rem', flex: 1 }}>
        {report.description}
      </p>

      {/* Optional Photo Thumbnail */}
      {report.mediaUrls && (
        <div style={{ marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden', maxHeight: '160px', border: '1px solid var(--border-color)' }}>
          <img
            src={report.mediaUrls}
            alt={report.title}
            style={{ width: '100%', height: '160px', objectFit: 'cover' }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Meta Footer */}
      <div style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '0.75rem',
        marginTop: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
            <MapPin size={14} color="#ef4444" /> {report.locationName || `${report.latitude.toFixed(3)}, ${report.longitude.toFixed(3)}`}
          </span>
          {report.distanceKm !== undefined && (
            <span style={{ color: '#60a5fa', fontWeight: 600 }}>{report.distanceKm} km away</span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="flex items-center gap-1">
            <Users size={14} /> Affected: <strong style={{ color: '#f3f4f6' }}>{report.estimatedAffectedPeople || 0}</strong>
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} /> {new Date(report.createdAt).toLocaleDateString()} {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {report.verifiedByName && (
          <div className="flex items-center gap-1" style={{ color: '#34d399', fontSize: '0.75rem' }}>
            <ShieldCheck size={14} /> Verified by: {report.verifiedByName}
          </div>
        )}

        {/* Verification Actions for Rescue/Admin */}
        {showAdminActions && onVerify && report.status === 'PENDING' && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              onClick={() => onVerify(report.id, 'VERIFIED')}
              className="btn btn-primary"
              style={{ flex: 1, padding: '6px 10px', fontSize: '0.75rem', background: '#10b981' }}
            >
              <CheckCircle2 size={14} /> Verify & Broadcast
            </button>
            <button
              onClick={() => onVerify(report.id, 'REJECTED')}
              className="btn btn-outline"
              style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#f87171' }}
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
