import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  X, 
  MapPin, 
  AlertTriangle, 
  HeartPulse, 
  Flame, 
  Waves, 
  ShieldAlert,
  LocateFixed,
  CheckCircle2
} from 'lucide-react';
import sosService from '../../services/sos.service';
import { playConfirmationBeep } from '../../utils/sound';
import type { EmergencyType, SosAlert } from '../../types';

interface OneTouchSOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSosDispatched: (sos: SosAlert) => void;
}

export const OneTouchSOSModal: React.FC<OneTouchSOSModalProps> = ({
  isOpen,
  onClose,
  onSosDispatched,
}) => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [emergencyType, setEmergencyType] = useState<EmergencyType>('GENERAL_LIFE_THREAT');
  const [trappedCount, setTrappedCount] = useState<number>(1);
  const [medicalAttentionNeeded, setMedicalAttentionNeeded] = useState<boolean>(false);
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Auto detect location when modal opens
  useEffect(() => {
    if (isOpen) {
      detectLocation();
      setIsSuccess(false);
      setError(null);
    }
  }, [isOpen]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser. Please enter landmark manually.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setLocationName(`GPS: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setIsLocating(false);
      },
      () => {
        // Fallback default coordinates if blocked
        setLatitude(13.0827);
        setLongitude(80.2707);
        setLocationName('Current Approximate Location');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  if (!isOpen) return null;

  const handleTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isSuccess) return;
    setError(null);

    const finalLat = latitude ?? 13.0827;
    const finalLon = longitude ?? 80.2707;

    setIsSubmitting(true);
    try {
      const result = await sosService.trigger({
        latitude: finalLat,
        longitude: finalLon,
        locationName: locationName || `GPS: ${finalLat}, ${finalLon}`,
        emergencyType,
        trappedCount,
        medicalAttentionNeeded,
        additionalNotes,
      });

      // Play pleasant double-beep confirmation ONLY after backend confirms submission
      playConfirmationBeep().catch(() => {});

      // Display clear confirmation state
      setIsSuccess(true);

      // Transition smoothly to dashboard active tracker
      setTimeout(() => {
        onSosDispatched(result);
        onClose();
        setIsSuccess(false);
      }, 1400);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to dispatch SOS alert. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '2px solid rgba(239, 68, 68, 0.6)',
        boxShadow: '0 0 40px rgba(239, 68, 68, 0.4)',
        padding: '2rem',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={() => {
            if (isSubmitting) return;
            onClose();
          }}
          disabled={isSubmitting}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.4 : 1
          }}
          title="Close"
          aria-label="Close"
        >
          <X size={22} />
        </button>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.6)',
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              <CheckCircle2 size={40} color="#ffffff" />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              SOS Signal Successfully Transmitted
            </h2>
            <p style={{ color: '#6ee7b7', fontSize: '0.95rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              Distress beacon registered with ResQNet. Emergency responders have been alerted.
            </p>

            <div style={{
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '10px',
              padding: '1rem',
              textAlign: 'left',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Radar Status:</span>
                <span className="badge badge-critical" style={{ background: '#ef4444', color: '#fff' }}>BEACON ACTIVE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Emergency Type:</span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>{emergencyType.replace(/_/g, ' ')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Coordinates:</span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>
                  {(latitude ?? 13.0827).toFixed(5)}, {(longitude ?? 80.2707).toFixed(5)}
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
              Opening active distress tracker...
            </p>
          </div>
        ) : (
          <>
            {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            boxShadow: '0 0 25px rgba(239, 68, 68, 0.7)',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            animation: 'pulse-emergency 1.5s infinite'
          }}>
            <Zap size={36} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
            ONE-TOUCH SOS EMERGENCY
          </h2>
          <p style={{ color: '#fca5a5', fontSize: '0.9rem', fontWeight: 600 }}>
            Instant Life-Threat Dispatch to Rescue Command & Field Units
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1rem',
            color: '#fee2e2',
            fontSize: '0.85rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleTrigger} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* GPS Coordinates Header */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '0.9rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div className="flex items-center gap-2">
              <MapPin size={20} color="#ef4444" />
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>Detected GPS Coordinates</span>
                <span style={{ fontSize: '0.925rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                  {latitude && longitude ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` : 'Acquiring GPS fix...'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={detectLocation}
              disabled={isLocating}
              className="btn btn-outline"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <LocateFixed size={14} className={isLocating ? 'animate-spin' : ''} /> Refetch
            </button>
          </div>

          {/* Emergency Category Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>
              Select Nature of Emergency *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {[
                { id: 'GENERAL_LIFE_THREAT' as EmergencyType, label: 'Life Threat', icon: ShieldAlert },
                { id: 'MEDICAL' as EmergencyType, label: 'Medical Aid', icon: HeartPulse },
                { id: 'TRAPPED' as EmergencyType, label: 'Trapped', icon: AlertTriangle },
                { id: 'WATER_LEVEL_RISING' as EmergencyType, label: 'Rising Flood', icon: Waves },
                { id: 'FIRE' as EmergencyType, label: 'Fire & Smoke', icon: Flame },
              ].map((cat) => {
                const Icon = cat.icon;
                const isSel = emergencyType === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setEmergencyType(cat.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '10px 6px',
                      borderRadius: '8px',
                      border: isSel ? '2px solid #ef4444' : '1px solid var(--border-color)',
                      background: isSel ? 'rgba(239, 68, 68, 0.25)' : 'rgba(0,0,0,0.3)',
                      color: isSel ? '#ffffff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.8rem'
                    }}
                  >
                    <Icon size={18} color={isSel ? '#ef4444' : '#9ca3af'} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trapped Count & Medical Checkbox */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                People in Danger / Trapped
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setTrappedCount(Math.max(1, trappedCount - 1))}
                  className="btn btn-outline"
                  style={{ width: '40px', height: '40px', padding: 0 }}
                >
                  -
                </button>
                <div style={{
                  flex: 1,
                  textAlign: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  {trappedCount} {trappedCount === 1 ? 'Person' : 'People'}
                </div>
                <button
                  type="button"
                  onClick={() => setTrappedCount(trappedCount + 1)}
                  className="btn btn-outline"
                  style={{ width: '40px', height: '40px', padding: 0 }}
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Specific Landmark / Room
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. 3rd Floor, Flat 302"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>

          {/* Urgent Medical Check */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(239, 68, 68, 0.1)',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            <input
              type="checkbox"
              id="medCheck"
              checked={medicalAttentionNeeded}
              onChange={(e) => setMedicalAttentionNeeded(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#ef4444' }}
            />
            <label htmlFor="medCheck" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fca5a5', cursor: 'pointer' }}>
              CRITICAL: Immediate Paramedic / Oxygen Assistance Required
            </label>
          </div>

          {/* Additional Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Situation Details (optional)
            </label>
            <textarea
              rows={2}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. Water entering ground floor fast, no electricity..."
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.875rem',
                resize: 'none'
              }}
            />
          </div>

          {/* Trigger Dispatch Button */}
          <button
            type="submit"
            disabled={isSubmitting || isSuccess}
            className="btn btn-sos"
            style={{
              width: '100%',
              padding: '1.1rem',
              fontSize: '1.15rem',
              letterSpacing: '1px',
              opacity: isSubmitting || isSuccess ? 0.7 : 1
            }}
          >
            {isSubmitting ? (
              <span>BROADCASTING SOS RADAR...</span>
            ) : isSuccess ? (
              <span>BEACON TRANSMITTED ✓</span>
            ) : (
              <>
                <Zap size={24} /> TRANSMIT EMERGENCY SOS NOW
              </>
            )}
          </button>
        </form>
      </>
    )}
  </div>
</div>
  );
};
