import React from 'react';
import type { Hospital } from '../../types';
import { 
  MapPin, 
  Phone, 
  HeartPulse, 
  Activity, 
  Wind, 
  ShieldAlert, 
  Droplet,
  Navigation,
  Edit3
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

interface HospitalCardProps {
  hospital: Hospital;
  onUpdateBeds?: (hospital: Hospital) => void;
  onSelectOnMap?: (hospital: Hospital) => void;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({
  hospital,
  onUpdateBeds,
  onSelectOnMap,
}) => {
  const { user } = useAuth();
  const isAuthorized = user && ['RESCUE_TEAM', 'ADMIN'].includes(user.role);

  const getStatusBadge = () => {
    switch (hospital.status) {
      case 'OPERATIONAL':
        return <span className="badge badge-success">OPERATIONAL</span>;
      case 'FULL':
        return <span className="badge badge-critical">FULL CAPACITY</span>;
      case 'EMERGENCY_ONLY':
        return <span className="badge badge-warning">EMERGENCY ONLY</span>;
      case 'CLOSED':
        return <span className="badge badge-warning" style={{ background: 'rgba(107, 114, 128, 0.2)', color: '#9ca3af' }}>CLOSED</span>;
      default:
        return <span className="badge badge-info">{hospital.status}</span>;
    }
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
            <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
              HOSPITAL FACILITY
            </span>
            {hospital.distanceKm !== undefined && (
              <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                {hospital.distanceKm.toFixed(1)} km away
              </span>
            )}
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
            {hospital.name}
          </h3>
        </div>
        {getStatusBadge()}
      </div>

      {/* Address */}
      <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        <MapPin size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
        <span>{hospital.address}</span>
      </div>

      {/* Critical Resources Radar Grid */}
      <div className="grid grid-cols-3 gap-2" style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '10px' }}>
        {/* General Beds */}
        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '8px' }}>
          <div className="flex items-center justify-center gap-1" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
            <Activity size={13} color="#38bdf8" /> Gen Beds
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: hospital.availableGeneralBeds > 0 ? '#38bdf8' : '#ef4444' }}>
            {hospital.availableGeneralBeds}
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>of {hospital.totalBeds} Total</span>
        </div>

        {/* ICU Beds */}
        <div style={{ textAlign: 'center', background: 'rgba(239, 68, 68, 0.08)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div className="flex items-center justify-center gap-1" style={{ fontSize: '0.7rem', color: '#fca5a5', marginBottom: '2px' }}>
            <HeartPulse size={13} color="#ef4444" /> ICU Beds
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: hospital.availableIcuBeds > 0 ? '#f87171' : '#6b7280' }}>
            {hospital.availableIcuBeds}
          </div>
          <span style={{ fontSize: '0.65rem', color: hospital.availableIcuBeds > 0 ? '#34d399' : '#ef4444' }}>
            {hospital.availableIcuBeds > 0 ? '● Available' : '● Critical'}
          </span>
        </div>

        {/* Ventilators */}
        <div style={{ textAlign: 'center', background: 'rgba(16, 185, 129, 0.08)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div className="flex items-center justify-center gap-1" style={{ fontSize: '0.7rem', color: '#86efac', marginBottom: '2px' }}>
            <Wind size={13} color="#10b981" /> Ventilators
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: hospital.availableVentilators > 0 ? '#34d399' : '#6b7280' }}>
            {hospital.availableVentilators}
          </div>
          <span style={{ fontSize: '0.65rem', color: hospital.availableVentilators > 0 ? '#34d399' : '#ef4444' }}>
            {hospital.availableVentilators > 0 ? '● Ready' : '● In Use'}
          </span>
        </div>
      </div>

      {/* Trauma Center & Blood Bank Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', fontSize: '0.75rem' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          borderRadius: '6px',
          background: hospital.hasTraumaCenter ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.04)',
          color: hospital.hasTraumaCenter ? '#f87171' : '#6b7280'
        }}>
          <ShieldAlert size={12} /> {hospital.hasTraumaCenter ? '24/7 Level 1 Trauma Center' : 'No Trauma Center'}
        </span>

        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          borderRadius: '6px',
          background: hospital.hasBloodBank ? 'rgba(220, 38, 38, 0.15)' : 'rgba(255,255,255,0.04)',
          color: hospital.hasBloodBank ? '#fca5a5' : '#6b7280'
        }}>
          <Droplet size={12} /> {hospital.hasBloodBank ? 'Blood Bank In-House' : 'No Blood Bank'}
        </span>
      </div>

      {/* Emergency Phone */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Emergency Line:</span>
        <a href={`tel:${hospital.emergencyPhone}`} className="flex items-center gap-1" style={{ color: '#f87171', fontWeight: 700, textDecoration: 'none' }}>
          <Phone size={14} /> {hospital.emergencyPhone}
        </a>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', flexWrap: 'wrap' }}>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline"
          style={{ flex: 1, padding: '6px 12px', fontSize: '0.8rem' }}
        >
          <Navigation size={14} color="#3b82f6" /> Directions
        </a>

        {onSelectOnMap && (
          <button
            onClick={() => onSelectOnMap(hospital)}
            className="btn btn-outline"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <MapPin size={14} /> Map View
          </button>
        )}

        {isAuthorized && onUpdateBeds && (
          <button
            onClick={() => onUpdateBeds(hospital)}
            className="btn btn-primary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#dc2626' }}
          >
            <Edit3 size={14} /> Manage Beds
          </button>
        )}
      </div>
    </div>
  );
};
