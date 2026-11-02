import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  AlertTriangle, 
  Award, 
  ListTodo, 
  ShieldAlert, 
  Info,
  ExternalLink 
} from 'lucide-react';
import notificationService from '../../services/notification.service';
import type { NotificationItem, NotificationType } from '../../types';

const formatRelativeTime = (timestamp?: string | number | Date | null): string => {
  if (!timestamp) return 'Recently';

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return 'Recently';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Future timestamp or under 30 seconds
  if (diffInSeconds < 30) {
    return 'Just now';
  }

  // Under 60 minutes
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }

  // Under 24 hours
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }

  // Under 7 days
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }

  // Older notifications: short date format e.g. "Oct 28"
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {})
  });
};

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const [items, count] = await Promise.all([
        notificationService.getAll(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(items);
      setUnreadCount(count);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id: number, linkUrl?: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (linkUrl) {
        setIsOpen(false);
        navigate(linkUrl);
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    setLoading(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'SOS_ALERT':
        return <AlertTriangle size={18} color="#ef4444" />;
      case 'TASK_ASSIGNED':
        return <ListTodo size={18} color="#3b82f6" />;
      case 'TASK_COMPLETED':
        return <CheckCheck size={18} color="#10b981" />;
      case 'REWARD_EARNED':
        return <Award size={18} color="#f59e0b" />;
      case 'DISASTER_VERIFIED':
        return <ShieldAlert size={18} color="#10b981" />;
      case 'ADMIN_ALERT':
        return <ShieldAlert size={18} color="#ef4444" />;
      case 'SYSTEM_BROADCAST':
      default:
        return <Info size={18} color="#a855f7" />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#fff',
          position: 'relative',
          transition: 'all 0.2s ease',
        }}
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={20} color={unreadCount > 0 ? '#fbbf24' : '#9ca3af'} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: '#fff',
              fontSize: '0.65rem',
              fontWeight: 800,
              minWidth: '18px',
              height: '18px',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
              animation: 'pulse 2s infinite',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="glass-card"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 12px)',
            width: 'min(380px, calc(100vw - 2rem))',
            maxWidth: 'calc(100vw - 2rem)',
            maxHeight: '480px',
            overflowY: 'auto',
            zIndex: 100,
            padding: 0,
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            background: 'rgba(17, 24, 39, 0.96)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <div className="flex items-center gap-2">
              <Bell size={16} color="#60a5fa" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#60a5fa',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 6px',
                }}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Bell size={32} color="#4b5563" style={{ margin: '0 auto 0.5rem auto' }} />
                <p style={{ fontSize: '0.85rem' }}>No notifications right now.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleMarkAsRead(item.id, item.linkUrl)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    background: item.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.07)',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = item.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.07)';
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      padding: '8px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {getNotificationIcon(item.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                      <span
                        style={{
                          fontWeight: item.isRead ? 600 : 700,
                          fontSize: '0.85rem',
                          color: item.isRead ? '#e5e7eb' : '#fff',
                        }}
                      >
                        {item.title}
                      </span>
                      {!item.isRead && (
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#3b82f6',
                            display: 'inline-block',
                            flexShrink: 0,
                            marginTop: '4px',
                          }}
                        />
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: '0.775rem',
                        color: 'var(--text-secondary)',
                        marginTop: '2px',
                        lineHeight: 1.35,
                      }}
                    >
                      {item.message}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '6px',
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <span title={item.createdAt ? new Date(item.createdAt).toLocaleString() : undefined}>
                        {formatRelativeTime(item.createdAt)}
                      </span>
                      {item.linkUrl && (
                        <span style={{ color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          View <ExternalLink size={10} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default NotificationDropdown;
