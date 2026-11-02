import React from 'react';
import { Award, Trophy, ShieldCheck, Flame, Medal } from 'lucide-react';
import type { LeaderboardEntry } from '../../types';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: number;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  currentUserId,
}) => {
  const getTierColor = (tier: string) => {
    switch (tier?.toUpperCase()) {
      case 'PLATINUM':
        return { bg: 'rgba(168, 85, 247, 0.2)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.4)' };
      case 'GOLD':
        return { bg: 'rgba(245, 158, 11, 0.2)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.4)' };
      case 'SILVER':
        return { bg: 'rgba(156, 163, 175, 0.2)', text: '#e5e7eb', border: 'rgba(156, 163, 175, 0.4)' };
      case 'BRONZE':
      default:
        return { bg: 'rgba(217, 119, 6, 0.2)', text: '#f59e0b', border: 'rgba(217, 119, 6, 0.4)' };
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span
          style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
            color: '#000',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 0 12px rgba(251, 191, 36, 0.5)',
          }}
        >
          <Trophy size={14} /> #1 TOP HERO
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span
          style={{
            background: 'linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%)',
            color: '#000',
            fontWeight: 800,
            padding: '4px 8px',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Medal size={14} /> #2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
            color: '#fff',
            fontWeight: 800,
            padding: '4px 8px',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Medal size={14} /> #3
        </span>
      );
    }
    return (
      <span style={{ fontWeight: 700, color: 'var(--text-secondary)', paddingLeft: '8px' }}>
        #{rank}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Gamification Tiers Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card" style={{ padding: '1rem', border: '1px solid rgba(217, 119, 6, 0.3)' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.4rem' }}>
            <Award size={18} color="#d97706" />
            <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.9rem' }}>BRONZE TIER</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>
            0 - 199 Points • 0+ Missions. Entry responder level.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '1rem', border: '1px solid rgba(156, 163, 175, 0.3)' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.4rem' }}>
            <Award size={18} color="#e5e7eb" />
            <span style={{ fontWeight: 700, color: '#e5e7eb', fontSize: '0.9rem' }}>SILVER TIER</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>
            200 - 499 Points or 4+ Completed Missions.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '1rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.4rem' }}>
            <Award size={18} color="#fbbf24" />
            <span style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.9rem' }}>GOLD TIER</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>
            500 - 999 Points or 10+ Completed Missions.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '1rem', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.4rem' }}>
            <Flame size={18} color="#c084fc" />
            <span style={{ fontWeight: 700, color: '#c084fc', fontSize: '0.9rem' }}>PLATINUM TIER</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0 }}>
            1000+ Points or 20+ Completed Missions. Master Responder.
          </p>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div
        className="glass-card"
        style={{
          padding: 0,
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
        }}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div className="flex items-center gap-2">
            <Trophy size={20} color="#fbbf24" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Live Volunteer Honor Roll & Leaderboard
            </h3>
          </div>
          <span className="badge badge-warning">
            ● Real-Time Point Standings
          </span>
        </div>

        {entries.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Trophy size={36} color="#6b7280" style={{ margin: '0 auto 0.75rem auto' }} />
            <p>No volunteer mission completions recorded yet. Complete tasks to rank up!</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Rank</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Volunteer Responder</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Tier Level</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'center' }}>Missions Completed</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Total Points</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const isMe = currentUserId && entry.userId === currentUserId;
                  const tierStyle = getTierColor(entry.currentTier);
                  return (
                    <tr
                      key={entry.userId}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: isMe ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                        transition: 'background 0.2s',
                      }}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        {getRankBadge(entry.rank)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div className="flex items-center gap-2">
                          <strong style={{ color: isMe ? '#fbbf24' : '#fff', fontSize: '0.95rem' }}>
                            {entry.fullName}
                          </strong>
                          {isMe && (
                            <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                              YOU
                            </span>
                          )}
                          {entry.isVerified && (
                            <span title="Verified Responder" style={{ display: 'inline-flex', alignItems: 'center' }}>
                              <ShieldCheck size={16} color="#34d399" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            background: tierStyle.bg,
                            color: tierStyle.text,
                            border: `1px solid ${tierStyle.border}`,
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        >
                          {entry.currentTier || 'BRONZE'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600, color: '#e5e7eb' }}>
                        {entry.tasksCompleted}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '1rem' }}>
                          {entry.totalPoints} PTS
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default LeaderboardTable;
