import React, { useState } from 'react';
import type { CreateShelterPayload, Shelter } from '../../types';
import shelterService from '../../services/shelter.service';
import { X, Building2, AlertCircle, Plus, Crosshair } from 'lucide-react';

import useGeolocation from '../../hooks/useGeolocation';

interface CreateShelterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (shelter: Shelter) => void;
}

export const CreateShelterModal: React.FC<CreateShelterModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  if (!isOpen) return null;

  const { getLocation, isLoading: isLocating } = useGeolocation();

  const [formData, setFormData] = useState<CreateShelterPayload>({
    name: '',
    type: 'COMMUNITY_HALL',
    totalCapacity: 100,
    currentOccupancy: 0,
    latitude: 17.3850,
    longitude: 78.4867,
    address: '',
    contactPerson: '',
    contactPhone: '',
    foodAvailable: true,
    medicalSupportAvailable: true,
    petFriendly: true,
    powerBackup: true,
    status: 'OPEN',
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
    if (!formData.name.trim() || !formData.address.trim()) {
      setError('Please provide shelter name and complete address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await shelterService.create(formData);
      onCreated(res);
      onClose();
    } catch (err: unknown) {
      console.error('Failed to create shelter:', err);
      setError('Failed to create shelter facility. Please check values.');
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
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '10px', borderRadius: '10px' }}>
            <Building2 size={22} color="#10b981" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>Register Relief Shelter</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Add a verified disaster evacuation / relief facility</p>
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
              Facility Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Central Community Relief Center"
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
                Shelter Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
                <option value="COMMUNITY_HALL">Community Hall</option>
                <option value="STADIUM">Stadium / Arena</option>
                <option value="SCHOOL_CAMPUS">School / University</option>
                <option value="RELIEF_CAMP">Field Relief Camp</option>
                <option value="RELIGIOUS_CENTER">Place of Worship</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Total Capacity (People) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.totalCapacity}
                onChange={(e) => setFormData({ ...formData, totalCapacity: Number(e.target.value) })}
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

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              Full Address *
            </label>
            <input
              type="text"
              placeholder="Street address, locality, landmark"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Contact Person
              </label>
              <input
                type="text"
                placeholder="Facility Manager Name"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.6rem 1rem',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Contact Phone
              </label>
              <input
                type="text"
                placeholder="+91 / Emergency Line"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.6rem 1rem',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          {/* Amenities toggles */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Available Amenities & Logistics
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.foodAvailable}
                  onChange={(e) => setFormData({ ...formData, foodAvailable: e.target.checked })}
                />
                Food & Water Available
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.medicalSupportAvailable}
                  onChange={(e) => setFormData({ ...formData, medicalSupportAvailable: e.target.checked })}
                />
                First-Aid / Medical Aid
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.petFriendly}
                  onChange={(e) => setFormData({ ...formData, petFriendly: e.target.checked })}
                />
                Pet Friendly Area
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#fff', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.powerBackup}
                  onChange={(e) => setFormData({ ...formData, powerBackup: e.target.checked })}
                />
                Generator / Power Backup
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn btn-primary">
              <Plus size={16} /> {isLoading ? 'Registering...' : 'Register Shelter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
