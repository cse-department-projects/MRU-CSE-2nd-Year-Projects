import React, { useState } from 'react';
import { 
  AlertTriangle, 
  X, 
  LocateFixed, 
  Image as ImageIcon
} from 'lucide-react';
import disasterService from '../../services/disaster.service';
import type { DisasterReport, DisasterType, Severity } from '../../types';

interface DisasterReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportCreated: (report: DisasterReport) => void;
}

export const DisasterReportModal: React.FC<DisasterReportModalProps> = ({
  isOpen,
  onClose,
  onReportCreated,
}) => {
  const [title, setTitle] = useState('');
  const [disasterType, setDisasterType] = useState<DisasterType>('FLOOD');
  const [severity, setSeverity] = useState<Severity>('MEDIUM');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationName, setLocationName] = useState('');
  const [mediaUrls, setMediaUrls] = useState('');
  const [estimatedAffectedPeople, setEstimatedAffectedPeople] = useState<number>(0);

  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocationName(`Near ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        setIsLocating(false);
      },
      () => {
        setLatitude(13.0827);
        setLongitude(80.2707);
        setLocationName('Approximate Coastal Region');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalLat = latitude ?? 13.0827;
    const finalLon = longitude ?? 80.2707;

    setIsSubmitting(true);
    try {
      const created = await disasterService.create({
        title,
        disasterType,
        severity,
        description,
        latitude: finalLat,
        longitude: finalLon,
        locationName: locationName || `GPS: ${finalLat}, ${finalLon}`,
        mediaUrls,
        estimatedAffectedPeople,
      });
      onReportCreated(created);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit disaster report. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '640px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '2rem',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <X size={22} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={24} color="#ef4444" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
              Report Disaster Incident
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Submit verified field intelligence to emergency responders & public alert maps
            </p>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1rem',
            color: '#fca5a5',
            fontSize: '0.85rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Incident Title */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Incident Headline / Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Flash Flood breaching river bank at North Bridge"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.925rem'
              }}
            />
          </div>

          {/* Disaster Type & Severity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Disaster Category *
              </label>
              <select
                value={disasterType}
                onChange={(e) => setDisasterType(e.target.value as DisasterType)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.925rem'
                }}
              >
                <option value="FLOOD">🌊 Flood / Inundation</option>
                <option value="FIRE">🔥 Fire / Explosion</option>
                <option value="EARTHQUAKE">🏚️ Earthquake</option>
                <option value="CYCLONE">🌀 Cyclone / Hurricane</option>
                <option value="LANDSLIDE">⛰️ Landslide</option>
                <option value="TSUNAMI">🌊 Tsunami</option>
                <option value="BUILDING_COLLAPSE">🏢 Building Collapse</option>
                <option value="OTHER">⚠️ Other Threat</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Assessed Severity Level *
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.925rem'
                }}
              >
                <option value="LOW">🟢 Low (Advisory)</option>
                <option value="MEDIUM">🟡 Medium (Moderate Threat)</option>
                <option value="HIGH">🟠 High (Evacuation needed)</option>
                <option value="CRITICAL">🔴 Critical (Immediate Life Danger)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Situation Report & Ground Conditions *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what is happening, blocked roads, water depth, power line failures..."
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.9rem',
                resize: 'none'
              }}
            />
          </div>

          {/* Location & Estimated Count */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Location / Landmark
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Street / Landmark"
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                />
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={isLocating}
                  className="btn btn-outline"
                  title="Auto-detect GPS"
                  style={{ padding: '0.75rem' }}
                >
                  <LocateFixed size={18} color={latitude ? '#34d399' : '#60a5fa'} />
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Estimated People Affected
              </label>
              <input
                type="number"
                min={0}
                value={estimatedAffectedPeople}
                onChange={(e) => setEstimatedAffectedPeople(Number(e.target.value))}
                placeholder="e.g. 50"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          {/* Media URL */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Photograph or Media URL (optional)
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <ImageIcon size={18} color="#6b7280" style={{ position: 'absolute', left: '12px' }} />
              <input
                type="url"
                value={mediaUrls}
                onChange={(e) => setMediaUrls(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '0.5rem', opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? 'Submitting Report...' : 'Broadcast Disaster Incident'}
          </button>
        </form>
      </div>
    </div>
  );
};
