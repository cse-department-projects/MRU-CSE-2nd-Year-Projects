import React, { useState } from 'react';
import { X, Plus, MapPin, Award, Phone } from 'lucide-react';
import type { CreateTaskPayload, TaskCategory, TaskPriority, VolunteerTask } from '../../types';
import taskService from '../../services/task.service';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: VolunteerTask) => void;
  defaultDisasterId?: number;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onTaskCreated,
  defaultDisasterId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('LOGISTICS');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [pointsReward, setPointsReward] = useState<number>(50);
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState<number>(37.7749);
  const [longitude, setLongitude] = useState<number>(-122.4194);
  const [contactPhone, setContactPhone] = useState('');
  const [relatedDisasterId, setRelatedDisasterId] = useState<number | undefined>(defaultDisasterId);

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
          setError('Unable to fetch current GPS coordinates.');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !locationName.trim()) {
      setError('Please fill in title, description, and location name.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload: CreateTaskPayload = {
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      pointsReward: Number(pointsReward),
      locationName: locationName.trim(),
      latitude: Number(latitude),
      longitude: Number(longitude),
      contactPhone: contactPhone.trim() || undefined,
      relatedDisasterId: relatedDisasterId ? Number(relatedDisasterId) : undefined,
    };

    try {
      const created = await taskService.create(payload);
      onTaskCreated(created);
      onClose();
    } catch (err: unknown) {
      console.error('Failed to create relief task:', err);
      setError('Failed to dispatch task. Please verify input fields.');
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
          border: '1px solid rgba(59, 130, 246, 0.4)',
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
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              padding: '10px',
              borderRadius: '12px',
            }}
          >
            <Plus size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>
              Dispatch Volunteer Relief Task
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Broadcast relief assignments to local field volunteers and responder networks
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distribute Emergency Ration Kits at Community Hall"
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
              Description & Detailed Instructions *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the mission requirements, exact contact point, supplies needed, safety precautions..."
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                resize: 'vertical',
              }}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                }}
              >
                <option value="FOOD_DISTRIBUTION">Food & Water Distribution</option>
                <option value="FIRST_AID">First Aid & Medical</option>
                <option value="SEARCH_ASSISTANCE">Search Support & Assistance</option>
                <option value="SHELTER_SUPPORT">Shelter Support & Management</option>
                <option value="EVACUATION_HELP">Evacuation Help & Transport</option>
                <option value="LOGISTICS">Logistics & Supply Transport</option>
                <option value="COMMUNITY_PATROL">Community Patrol & Outreach</option>
                <option value="OTHER">Other Relief Task</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                }}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <Award size={14} style={{ display: 'inline', marginRight: '4px', color: '#fbbf24' }} /> Bounty Points
              </label>
              <input
                type="number"
                min="10"
                max="500"
                step="5"
                value={pointsReward}
                onChange={(e) => setPointsReward(Number(e.target.value))}
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

          {/* Location details */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> Location / Landmark Name *
            </label>
            <input
              type="text"
              required
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Sector 7 Community Gymnasium, Riverside Road"
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
                Latitude *
              </label>
              <input
                type="number"
                step="any"
                required
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
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
                Longitude *
              </label>
              <input
                type="number"
                step="any"
                required
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <Phone size={14} style={{ display: 'inline', marginRight: '4px' }} /> Point of Contact Phone
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 555-0144"
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
                Related Incident Report ID (Optional)
              </label>
              <input
                type="number"
                value={relatedDisasterId ?? ''}
                onChange={(e) => setRelatedDisasterId(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Disaster ID"
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
              <MapPin size={14} /> Use Current GPS Coordinates
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
                style={{ padding: '8px 20px', fontSize: '0.85rem', background: '#3b82f6', fontWeight: 700 }}
              >
                <Plus size={16} /> {loading ? 'Dispatching...' : 'Dispatch Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CreateTaskModal;
