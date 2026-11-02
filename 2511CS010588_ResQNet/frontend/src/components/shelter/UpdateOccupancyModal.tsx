import React, { useState } from 'react';
import type { Shelter, ShelterStatus } from '../../types';
import shelterService from '../../services/shelter.service';
import { X, Users, AlertCircle, Save } from 'lucide-react';

interface UpdateOccupancyModalProps {
  isOpen: boolean;
  shelter: Shelter | null;
  onClose: () => void;
  onUpdated: (updated: Shelter) => void;
}

export const UpdateOccupancyModal: React.FC<UpdateOccupancyModalProps> = ({
  isOpen,
  shelter,
  onClose,
  onUpdated,
}) => {
  if (!isOpen || !shelter) return null;

  const [currentOccupancy, setCurrentOccupancy] = useState<number>(shelter.currentOccupancy);
  const [status, setStatus] = useState<ShelterStatus>(shelter.status);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentOccupancy < 0) {
      setError('Occupancy cannot be negative.');
      return;
    }
    if (currentOccupancy > shelter.totalCapacity) {
      setError(`Occupancy cannot exceed total capacity of ${shelter.totalCapacity}.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Update Occupancy
      let res = await shelterService.updateOccupancy(shelter.id, currentOccupancy);

      // 2. If status was changed explicitly, update status as well
      if (status !== shelter.status) {
        res = await shelterService.updateStatus(shelter.id, status);
      }

      onUpdated(res);
      onClose();
    } catch (err: unknown) {
      console.error('Failed to update shelter occupancy:', err);
      setError('Failed to update occupancy. Please try again.');
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
      <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '2rem', position: 'relative' }}>
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
          <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '10px', borderRadius: '10px' }}>
            <Users size={22} color="#38bdf8" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Update Shelter Capacity</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{shelter.name}</p>
          </div>
        </div>

        {error && (
          <div className="badge badge-critical" style={{ width: '100%', padding: '0.6rem 1rem', marginBottom: '1rem', borderRadius: '8px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Current Occupancy (Max: {shelter.totalCapacity})
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '0.6rem 1rem' }}
                onClick={() => setCurrentOccupancy((prev) => Math.max(0, prev - 10))}
              >
                -10
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '0.6rem 1rem' }}
                onClick={() => setCurrentOccupancy((prev) => Math.max(0, prev - 1))}
              >
                -1
              </button>
              <input
                type="number"
                min="0"
                max={shelter.totalCapacity}
                value={currentOccupancy}
                onChange={(e) => setCurrentOccupancy(Number(e.target.value))}
                style={{
                  flex: 1,
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.6rem 1rem',
                  color: '#fff',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  textAlign: 'center'
                }}
                required
              />
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '0.6rem 1rem' }}
                onClick={() => setCurrentOccupancy((prev) => Math.min(shelter.totalCapacity, prev + 1))}
              >
                +1
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '0.6rem 1rem' }}
                onClick={() => setCurrentOccupancy((prev) => Math.min(shelter.totalCapacity, prev + 10))}
              >
                +10
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Operational Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ShelterStatus)}
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
              <option value="OPEN">OPEN (Accepting Evacuees)</option>
              <option value="FULL">FULL (At Max Capacity)</option>
              <option value="CLOSED">CLOSED (Inactive / Maintenance)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn btn-primary">
              <Save size={16} /> {isLoading ? 'Saving...' : 'Save Updates'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
