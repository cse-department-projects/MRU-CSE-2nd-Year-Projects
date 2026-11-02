import React, { useState } from 'react';
import type { CreateHospitalPayload, Hospital } from '../../types';
import hospitalService from '../../services/hospital.service';
import { X, HeartPulse, AlertCircle, Plus, Crosshair } from 'lucide-react';
import useGeolocation from '../../hooks/useGeolocation';

interface CreateHospitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (hospital: Hospital) => void;
}

export const CreateHospitalModal: React.FC<CreateHospitalModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  if (!isOpen) return null;

  const { getLocation, isLoading: isLocating } = useGeolocation();

  const [formData, setFormData] = useState<CreateHospitalPayload>({
    name: '',
    totalBeds: 100,
    availableGeneralBeds: 50,
    availableIcuBeds: 10,
    availableVentilators: 5,
    emergencyPhone: '',
    latitude: 17.3850,
    longitude: 78.4867,
    address: '',
    hasTraumaCenter: true,
    hasBloodBank: true,
    status: 'OPERATIONAL',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchCurrentLocation = () => {
    getLocation((coords) => {
      setFormData((prev) => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim() || !formData.emergencyPhone.trim()) {
      setError('Please provide hospital name, complete address, and emergency phone.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await hospitalService.create(formData);
      onCreated(res);
      onClose();
    } catch (err: unknown) {
      console.error('Failed to register hospital:', err);
      setError('Failed to register hospital facility. Please check values.');
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
      overflowY: 'auto'
    }}>
      <div className="glass-card" style={{ maxWidth: '600px', width: '100%', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
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
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>Register Medical Facility</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Add hospital bed and emergency trauma radar integration</p>
          </div>
        </div>

        {error && (
          <div className="badge badge-critical" style={{ width: '100%', padding: '0.6rem 1rem', marginBottom: '1rem', borderRadius: '8px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Hospital Name *
            </label>
            <input
              type="text"
              placeholder="e.g. City Emergency Trauma & General Hospital"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.6rem 1rem',
                color: '#fff',
                fontSize: '0.9rem'
              }}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Total Hospital Beds *
              </label>
              <input
                type="number"
                min="1"
                value={formData.totalBeds}
                onChange={(e) => setFormData({ ...formData, totalBeds: Number(e.target.value) })}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.6rem 1rem',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Available General Beds *
              </label>
              <input
                type="number"
                min="0"
                value={formData.availableGeneralBeds}
                onChange={(e) => setFormData({ ...formData, availableGeneralBeds: Number(e.target.value) })}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.6rem 1rem',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#fca5a5', marginBottom: '0.3rem' }}>
                Available ICU Beds *
              </label>
              <input
                type="number"
                min="0"
                value={formData.availableIcuBeds}
                onChange={(e) => setFormData({ ...formData, availableIcuBeds: Number(e.target.value) })}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '0.6rem 1rem',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#86efac', marginBottom: '0.3rem' }}>
                Available Ventilators *
              </label>
              <input
                type="number"
                min="0"
                value={formData.availableVentilators}
                onChange={(e) => setFormData({ ...formData, availableVentilators: Number(e.target.value) })}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  padding: '0.6rem 1rem',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Emergency Phone *
              </label>
              <input
                type="text"
                placeholder="24/7 Hotline Number"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.6rem 1rem',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Facility Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
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
                <option value="OPERATIONAL">OPERATIONAL</option>
                <option value="EMERGENCY_ONLY">EMERGENCY ONLY</option>
                <option value="FULL">FULL</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Full Address *
            </label>
            <input
              type="text"
              placeholder="Street address, city, landmark"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.6rem 1rem',
                color: '#fff',
                fontSize: '0.9rem'
              }}
              required
            />
          </div>

          {/* Coordinates */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                GPS Coordinates *
              </label>
              <button
                type="button"
                onClick={handleFetchCurrentLocation}
                className="btn btn-outline"
                style={{ padding: '2px 8px', fontSize: '0.75rem', borderColor: '#3b82f6', color: '#60a5fa' }}
              >
                <Crosshair size={12} className={isLocating ? 'animate-spin' : ''} />
                {isLocating ? 'Acquiring GPS...' : 'Use Current GPS'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.6rem 1rem',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
                required
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.6rem 1rem',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
                required
              />
            </div>
          </div>

          {/* Flags */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Critical Facilities
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.hasTraumaCenter}
                  onChange={(e) => setFormData({ ...formData, hasTraumaCenter: e.target.checked })}
                />
                Level-1 24/7 Trauma Center
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.hasBloodBank}
                  onChange={(e) => setFormData({ ...formData, hasBloodBank: e.target.checked })}
                />
                In-House Blood Bank Available
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ background: '#dc2626' }}>
              <Plus size={16} /> {isLoading ? 'Registering...' : 'Register Hospital'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
