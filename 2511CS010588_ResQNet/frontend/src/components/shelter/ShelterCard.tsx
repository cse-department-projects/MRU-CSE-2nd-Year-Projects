import React from 'react';
import type { Shelter } from '../../types';
import { 
  MapPin, 
  Phone, 
  User, 
  Utensils, 
  HeartPulse, 
  Dog, 
  Zap, 
  Navigation,
  Edit3
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

interface ShelterCardProps {
  shelter: Shelter;
  onUpdateOccupancy?: (shelter: Shelter) => void;
  onSelectOnMap?: (shelter: Shelter) => void;
}

export const ShelterCard: React.FC<ShelterCardProps> = ({
  shelter,
  onUpdateOccupancy,
  onSelectOnMap,
}) => {
  const { user } = useAuth();
  const isAuthorized = user && ['RESCUE_TEAM', 'ADMIN', 'VOLUNTEER'].includes(user.role);

  const available = shelter.availableCapacity ?? Math.max(0, shelter.totalCapacity - shelter.currentOccupancy);
  const occupancyPercent = shelter.occupancyPercentage ?? (
    shelter.totalCapacity > 0 ? Math.round((shelter.currentOccupancy / shelter.totalCapacity) * 100) : 0
  );

  const getStatusBadge = () => {
    switch (shelter.status) {
      case 'OPEN':
        return <span className="badge badge-success">OPEN • ACCEPTING</span>;
      case 'FULL':
        return <span className="badge badge-critical">FULL CAPACITY</span>;
      case 'CLOSED':
        return <span className="badge badge-warning" style={{ background: 'rgba(107, 114, 128, 0.2)', color: '#9ca3af' }}>CLOSED</span>;
      default:
        return <span className="badge badge-info">{shelter.status}</span>;
    }
  };

  const getProgressColor = () => {
    if (occupancyPercent >= 100) return '#ef4444';
    if (occupancyPercent >= 80) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
            <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
              {shelter.type.replace(/_/g, ' ')}
            </span>
            {shelter.distanceKm !== undefined && (
              <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                {shelter.distanceKm.toFixed(1)} km away
              </span>
            )}
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
            {shelter.name}
          </h3>
        </div>
        {getStatusBadge()}
      </div>

      {/* Address */}
      <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        <MapPin size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
        <span>{shelter.address}</span>
      </div>

      {/* Capacity Progress Bar */}
      <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.35rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Capacity Load:</span>
          <span style={{ fontWeight: 700, color: getProgressColor() }}>
            {shelter.currentOccupancy} / {shelter.totalCapacity} ({occupancyPercent}%)
          </span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${Math.min(100, occupancyPercent)}%`,
              height: '100%',
              background: getProgressColor(),
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Available Beds: <strong style={{ color: available > 0 ? '#34d399' : '#f87171' }}>{available}</strong></span>
          <span>Max Capacity: {shelter.totalCapacity}</span>
        </div>
      </div>

      {/* Amenities & Flags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', fontSize: '0.75rem' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          borderRadius: '6px',
          background: shelter.foodAvailable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.04)',
          color: shelter.foodAvailable ? '#34d399' : '#6b7280'
        }}>
          <Utensils size={12} /> Food Supply
        </span>

        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          borderRadius: '6px',
          background: shelter.medicalSupportAvailable ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255,255,255,0.04)',
          color: shelter.medicalSupportAvailable ? '#60a5fa' : '#6b7280'
        }}>
          <HeartPulse size={12} /> Medical Aid
        </span>

        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          borderRadius: '6px',
          background: shelter.petFriendly ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.04)',
          color: shelter.petFriendly ? '#fbbf24' : '#6b7280'
        }}>
          <Dog size={12} /> Pet Friendly
        </span>

        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          borderRadius: '6px',
          background: shelter.powerBackup ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.04)',
          color: shelter.powerBackup ? '#c084fc' : '#6b7280'
        }}>
          <Zap size={12} /> Generator
        </span>
      </div>

      {/* Contact info */}
      {(shelter.contactPerson || shelter.contactPhone) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
          {shelter.contactPerson && (
            <span className="flex items-center gap-1">
              <User size={13} /> {shelter.contactPerson}
            </span>
          )}
          {shelter.contactPhone && (
            <a href={`tel:${shelter.contactPhone}`} className="flex items-center gap-1" style={{ color: '#38bdf8', textDecoration: 'none' }}>
              <Phone size={13} /> {shelter.contactPhone}
            </a>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', flexWrap: 'wrap' }}>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${shelter.latitude},${shelter.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline"
          style={{ flex: 1, padding: '6px 12px', fontSize: '0.8rem' }}
        >
          <Navigation size={14} color="#3b82f6" /> Directions
        </a>

        {onSelectOnMap && (
          <button
            onClick={() => onSelectOnMap(shelter)}
            className="btn btn-outline"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <MapPin size={14} /> Map View
          </button>
        )}

        {isAuthorized && onUpdateOccupancy && (
          <button
            onClick={() => onUpdateOccupancy(shelter)}
            className="btn btn-primary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#0284c7' }}
          >
            <Edit3 size={14} /> Manage Capacity
          </button>
        )}
      </div>
    </div>
  );
};
