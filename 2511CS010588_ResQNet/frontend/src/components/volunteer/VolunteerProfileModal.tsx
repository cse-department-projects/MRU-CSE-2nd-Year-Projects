import React, { useState } from 'react';
import { X, Save, Shield, MapPin, Phone, Heart, User } from 'lucide-react';
import type { AvailabilityStatus, BloodGroup, UpdateVolunteerProfilePayload, VolunteerProfileResponse } from '../../types';
import volunteerService from '../../services/volunteer.service';

interface VolunteerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: VolunteerProfileResponse | null;
  onProfileUpdated: (updated: VolunteerProfileResponse) => void;
}

export const VolunteerProfileModal: React.FC<VolunteerProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
}) => {
  const [skills, setSkills] = useState(profile?.skills || '');
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>(
    profile?.availabilityStatus || 'AVAILABLE'
  );
  const [preferredRadiusKm, setPreferredRadiusKm] = useState<number>(profile?.preferredRadiusKm || 25);
  const [phone, setPhone] = useState(profile?.phone || '');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>(profile?.bloodGroup || 'UNKNOWN');
  const [emergencyContactName, setEmergencyContactName] = useState(profile?.emergencyContactName || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(profile?.emergencyContactPhone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [latitude, setLatitude] = useState<number | undefined>(profile?.currentLatitude);
  const [longitude, setLongitude] = useState<number | undefined>(profile?.currentLongitude);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Unable to fetch GPS position. Please set manually or allow browser permissions.');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: UpdateVolunteerProfilePayload = {
      skills,
      availabilityStatus,
      preferredRadiusKm: Number(preferredRadiusKm),
      phone,
      bloodGroup,
      emergencyContactName,
      emergencyContactPhone,
      address,
      currentLatitude: latitude,
      currentLongitude: longitude,
    };

    try {
      const updated = await volunteerService.updateMyProfile(payload);
      onProfileUpdated(updated);
      onClose();
    } catch (err: unknown) {
      console.error('Failed to update volunteer profile:', err);
      setError('Failed to save profile changes. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
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
          maxWidth: '650px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          position: 'relative',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3" style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              padding: '10px',
              borderRadius: '12px',
            }}
          >
            <Shield size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
              Edit Volunteer Responder Profile
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Update your deployment readiness, skills, and emergency contact details
            </p>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.875rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Availability & Radius */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Availability Status
              </label>
              <select
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value as AvailabilityStatus)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                }}
              >
                <option value="AVAILABLE">AVAILABLE (Ready for Dispatch)</option>
                <option value="BUSY">BUSY (On Assignment / Occupied)</option>
                <option value="OFFLINE">OFFLINE (Stand Down)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Preferred Dispatch Radius (km)
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={preferredRadiusKm}
                onChange={(e) => setPreferredRadiusKm(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                }}
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Skills & Certifications (Comma separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. First Aid Certified, CPR, Boat Operator, Drone Pilot, Food Supply"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-color)',
                color: '#fff',
              }}
            />
          </div>

          {/* Contact & Blood Group */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <Phone size={14} style={{ display: 'inline', marginRight: '4px' }} /> Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0199"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <Heart size={14} style={{ display: 'inline', marginRight: '4px' }} /> Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                }}
              >
                <option value="UNKNOWN">UNKNOWN</option>
                <option value="A_POS">A+</option>
                <option value="A_NEG">A-</option>
                <option value="B_POS">B+</option>
                <option value="B_NEG">B-</option>
                <option value="O_POS">O+</option>
                <option value="O_NEG">O-</option>
                <option value="AB_POS">AB+</option>
                <option value="AB_NEG">AB-</option>
              </select>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <User size={14} style={{ display: 'inline', marginRight: '4px' }} /> Emergency Contact Name
              </label>
              <input
                type="text"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                placeholder="Next of kin / contact person"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <Phone size={14} style={{ display: 'inline', marginRight: '4px' }} /> Emergency Contact Phone
              </label>
              <input
                type="tel"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                placeholder="+1 555-0988"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                }}
              />
            </div>
          </div>

          {/* Address & GPS */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Base Address / Operations Center
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Relief Sector, Downtown"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-color)',
                color: '#fff',
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={latitude ?? ''}
                onChange={(e) => setLatitude(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="e.g. 37.7749"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={longitude ?? ''}
                onChange={(e) => setLongitude(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="e.g. -122.4194"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={handleGetLocation}
              className="btn btn-outline"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <MapPin size={14} /> Detect Current GPS Location
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ padding: '8px 20px', fontSize: '0.85rem', background: '#f59e0b', color: '#000', fontWeight: 700 }}
              >
                <Save size={16} /> {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
export default VolunteerProfileModal;
