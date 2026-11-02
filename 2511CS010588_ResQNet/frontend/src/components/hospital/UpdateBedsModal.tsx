import React, { useState } from 'react';
import type { Hospital, HospitalStatus, UpdateBedsPayload } from '../../types';
import hospitalService from '../../services/hospital.service';
import { X, HeartPulse, AlertCircle, Save, Activity, Wind } from 'lucide-react';

interface UpdateBedsModalProps {
  isOpen: boolean;
  hospital: Hospital | null;
  onClose: () => void;
  onUpdated: (updated: Hospital) => void;
}

export const UpdateBedsModal: React.FC<UpdateBedsModalProps> = ({
  isOpen,
  hospital,
  onClose,
  onUpdated,
}) => {
  if (!isOpen || !hospital) return null;

  const [availableGeneralBeds, setAvailableGeneralBeds] = useState<number>(hospital.availableGeneralBeds);
  const [availableIcuBeds, setAvailableIcuBeds] = useState<number>(hospital.availableIcuBeds);
  const [availableVentilators, setAvailableVentilators] = useState<number>(hospital.availableVentilators);
  const [status, setStatus] = useState<HospitalStatus>(hospital.status);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (availableGeneralBeds < 0 || availableIcuBeds < 0 || availableVentilators < 0) {
      setError('Bed / ventilator counts cannot be negative.');
      return;
    }
    if (availableGeneralBeds > hospital.totalBeds) {
      setError(`Available general beds cannot exceed total beds count of ${hospital.totalBeds}.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload: UpdateBedsPayload = {
        availableGeneralBeds,
        availableIcuBeds,
        availableVentilators,
        status,
      };

      const res = await hospitalService.updateBeds(hospital.id, payload);
      onUpdated(res);
      onClose();
    } catch (err: unknown) {
      console.error('Failed to update hospital beds:', err);
      setError('Failed to update hospital resources. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem',
    }}>
      <div className="glass-card" style={{ maxWidth: '520px', width: '100%', padding: '2rem', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3" style={{ marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '10px', borderRadius: '10px' }}>
            <HeartPulse size={22} color="#ef4444" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Update Bed Availability</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{hospital.name}</p>
          </div>
        </div>

        {error && (
          <div className="badge badge-critical" style={{ width: '100%', padding: '0.6rem 1rem', marginBottom: '1rem', borderRadius: '8px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* General Beds */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              <Activity size={14} color="#38bdf8" /> Available General Ward Beds (Max: {hospital.totalBeds})
            </label>
            <input
              type="number"
              min="0"
              max={hospital.totalBeds}
              value={availableGeneralBeds}
              onChange={(e) => setAvailableGeneralBeds(Number(e.target.value))}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.6rem 1rem',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 700
              }}
              required
            />
          </div>

          {/* ICU Beds & Ventilators in 2 columns */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#fca5a5', marginBottom: '0.4rem' }}>
                <HeartPulse size={14} color="#ef4444" /> Available ICU Beds
              </label>
              <input
                type="number"
                min="0"
                value={availableIcuBeds}
                onChange={(e) => setAvailableIcuBeds(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '0.6rem 1rem',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 700
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#86efac', marginBottom: '0.4rem' }}>
                <Wind size={14} color="#10b981" /> Available Ventilators
              </label>
              <input
                type="number"
                min="0"
                value={availableVentilators}
                onChange={(e) => setAvailableVentilators(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  padding: '0.6rem 1rem',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 700
                }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Facility Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as HospitalStatus)}
              style={{
                width: '100%',
                background: '#111827',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.6rem 1rem',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            >
              <option value="OPERATIONAL">OPERATIONAL (Full Emergency Services)</option>
              <option value="EMERGENCY_ONLY">EMERGENCY ONLY (Trauma Cases Only)</option>
              <option value="FULL">FULL (No Available Beds)</option>
              <option value="CLOSED">CLOSED (Evacuated / Inactive)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ background: '#dc2626' }}>
              <Save size={16} /> {isLoading ? 'Saving...' : 'Save Bed Counts'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
