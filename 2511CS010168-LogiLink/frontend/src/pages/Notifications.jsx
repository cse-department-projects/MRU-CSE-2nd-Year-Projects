import { Bell, Check, CheckCheck, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PriorityBadge } from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { Input, Select } from '../components/ui/Input.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { notificationService } from '../services/notificationService.js';

const categoryOptions = [
  'All',
  'Operational',
  'Shipment',
  'Order',
  'Fleet',
  'Inventory',
  'Warehouse',
  'Route',
];

export default function Notifications() {
  const { notify, refreshUnreadCount } = useApp();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.list();
      setNotifications(Array.isArray(data) ? data : []);
      refreshUnreadCount?.();
    } catch (err) {
      setError(err.message || 'Failed to load notifications.');
      notify(err.message || 'Failed to load notifications.', 'danger');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [notify, refreshUnreadCount]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read && !n.readFlag).length;
  }, [notifications]);

  const displayedNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const isUnread = !n.read && !n.readFlag;
      if (filter === 'unread' && !isUnread) return false;

      if (typeFilter !== 'All') {
        const itemType = String(n.type || '').toLowerCase();
        const selectedType = typeFilter.toLowerCase();
        if (!itemType.includes(selectedType)) return false;
      }

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchTitle = String(n.title || '').toLowerCase().includes(q);
        const matchDesc = String(n.description || '').toLowerCase().includes(q);
        const matchType = String(n.type || '').toLowerCase().includes(q);
        const matchPriority = String(n.priority || '').toLowerCase().includes(q);
        const matchId = String(n.id || n.notificationId || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchType && !matchPriority && !matchId) return false;
      }

      return true;
    });
  }, [notifications, filter, typeFilter, search]);

  const totalPages = Math.max(1, Math.ceil(displayedNotifications.length / pageSize));
  const pagedNotifications = displayedNotifications.slice((page - 1) * pageSize, page * pageSize);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id || n.notificationId === id
            ? { ...n, read: true, readFlag: true }
            : n
        )
      );
      refreshUnreadCount?.();
      notify('Notification marked as read.');
    } catch (err) {
      notify(err.message || 'Failed to mark notification as read.', 'danger');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readFlag: true }))
      );
      refreshUnreadCount?.();
      notify('All notifications marked as read.');
    } catch (err) {
      notify(err.message || 'Failed to mark all as read.', 'danger');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      setNotifications((prev) =>
        prev.filter((n) => n.id !== id && n.notificationId !== id)
      );
      refreshUnreadCount?.();
      notify('Notification dismissed.');
    } catch (err) {
      notify(err.message || 'Failed to dismiss notification.', 'danger');
    }
  };

  const handleClearFilters = () => {
    setFilter('all');
    setTypeFilter('All');
    setSearch('');
    setPage(1);
  };

  if (loading && !notifications.length) {
    return <LoadingState title="Loading notifications..." />;
  }

  if (error && !notifications.length) {
    return (
      <ErrorState
        title="Failed to load notifications"
        description={error}
        onRetry={fetchNotifications}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Notification Center"
        description="Operational alerts for delays, vehicle maintenance, stock risks, new orders, deliveries, and route opportunities."
        actions={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Button
              variant="secondary"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck size={16} style={{ marginRight: 6 }} /> Mark all as read
            </Button>
            <Button variant="secondary" onClick={fetchNotifications}>
              <RefreshCw size={15} style={{ marginRight: 6 }} /> Refresh
            </Button>
          </div>
        }
      />

      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            className={`button ${filter === 'all' ? 'primary' : 'secondary'}`}
            onClick={() => {
              setFilter('all');
              setPage(1);
            }}
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            className={`button ${filter === 'unread' ? 'primary' : 'secondary'}`}
            onClick={() => {
              setFilter('unread');
              setPage(1);
            }}
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
          >
            Unread ({unreadCount})
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: 240 }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: 12, top: 12, color: 'var(--color-gray-500)' }}
            />
            <Input
              style={{ paddingLeft: 36, paddingRight: search ? 32 : 12, height: 38 }}
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            {search && (
              <button
                type="button"
                className="icon-button"
                style={{
                  position: 'absolute',
                  right: 6,
                  top: 8,
                  width: 24,
                  height: 24,
                  padding: 0,
                }}
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            style={{ height: 38, minWidth: 160 }}
          >
            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title={filter === 'unread' ? 'No unread notifications' : 'No notifications'}
          description={
            filter === 'unread'
              ? 'You are all caught up with your operational alerts.'
              : 'New system updates, order movements, and alerts will appear here.'
          }
        />
      ) : displayedNotifications.length === 0 ? (
        <EmptyState
          title="No matching notifications"
          description="No operational alerts match your current filter and search criteria."
          action={
            <Button variant="secondary" onClick={handleClearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid notification-list">
            {pagedNotifications.map((item) => {
              const isUnread = !item.read && !item.readFlag;
              const notifId = item.id || item.notificationId;
              const timeDisplay =
                item.relativeTime ||
                item.displayTime ||
                (item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Just now');

              return (
                <Card
                  key={notifId}
                  className={isUnread ? 'is-unread' : ''}
                  title={
                    <span>
                      {isUnread && <span className="unread-dot" title="Unread" />}
                      {item.title}
                    </span>
                  }
                  subtitle={`${item.type || 'Operational'} • ${timeDisplay}`}
                  action={
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <PriorityBadge priority={item.priority || 'Medium'}>
                        {item.priority || 'Medium'}
                      </PriorityBadge>
                      {isUnread && (
                        <button
                          className="icon-button"
                          style={{ width: 32, height: 32 }}
                          title="Mark as read"
                          type="button"
                          onClick={() => handleMarkRead(notifId)}
                        >
                          <Check size={15} />
                        </button>
                      )}
                      <button
                        className="icon-button"
                        style={{ width: 32, height: 32 }}
                        title="Dismiss"
                        type="button"
                        onClick={() => handleDelete(notifId)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  }
                >
                  <div className="notification-copy">
                    <span
                      className="notification-icon"
                      style={{ opacity: isUnread ? 1 : 0.6 }}
                    >
                      <Bell size={16} />
                    </span>
                    <p>{item.description}</p>
                  </div>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div style={{ marginTop: 20 }}>
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}
