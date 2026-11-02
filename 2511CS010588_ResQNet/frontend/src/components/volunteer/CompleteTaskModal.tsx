import React, { useState } from 'react';
import { X, CheckCircle, Award } from 'lucide-react';
import type { VolunteerTask } from '../../types';

interface CompleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: VolunteerTask | null;
  onComplete: (taskId: number, notes: string) => Promise<void>;
}

export const CompleteTaskModal: React.FC<CompleteTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  onComplete,
}) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onComplete(task.id, notes);
      onClose();
    } catch (err) {
      console.error('Failed to complete task:', err);
      setError('Could not mark task as completed. Please try again.');
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
          maxWidth: '500px',
          padding: '2rem',
          position: 'relative',
          border: '1px solid rgba(16, 185, 129, 0.4)',
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

        <div className="flex items-center gap-3" style={{ marginBottom: '1.25rem' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              padding: '10px',
              borderRadius: '12px',
            }}
          >
            <Award size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
              Finalize Task & Claim Rewards
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Confirm your deployment at <strong>{task.locationName}</strong>
            </p>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '0.85rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{task.title}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.775rem' }}>Reward Bounty</div>
          </div>
          <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: '1.1rem' }}>
            +{task.pointsReward} Points
          </div>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.85rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Mission Completion Notes / Outcome (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Distributed 50 food ration packs and water bottles to families in Sector 4."
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.875rem',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
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
              style={{ padding: '8px 20px', fontSize: '0.85rem', background: '#10b981', fontWeight: 700 }}
            >
              <CheckCircle size={16} /> {loading ? 'Submitting...' : 'Submit & Claim Reward'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CompleteTaskModal;
