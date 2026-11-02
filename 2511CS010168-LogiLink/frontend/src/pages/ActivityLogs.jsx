import { Activity, Clock, Eye, Filter, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { Input, Select } from '../components/ui/Input.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import Modal from '../components/ui/Modal.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import Table from '../components/ui/Table.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { activityLogService } from '../services/activityLogService.js';

const actionTypes = [
  'All',
  'CREATE',
  'UPDATE',
  'STATUS_CHANGE',
  'DELETE',
  'STOCK_ADJUSTMENT',
  'REPORT_GENERATED',
  'LOGIN',
  'REGISTER',
  'USER_CREATED',
  'SEED_DATA_CREATED',
];

const entityTypes = [
  'All',
  'Order',
  'Shipment',
  'Vehicle',
  'Driver',
  'Route',
  'Warehouse',
  'Inventory',
  'Product',
  'Report',
  'User',
  'System',
];

function actionVariant(action = '') {
  const upper = String(action).toUpperCase();
  if (['CREATE', 'REGISTER', 'USER_CREATED', 'SEED_DATA_CREATED'].includes(upper)) return 'success';
  if (['UPDATE', 'STATUS_CHANGE'].includes(upper)) return 'info';
  if (['STOCK_ADJUSTMENT', 'LOGIN'].includes(upper)) return 'warning';
  if (['DELETE'].includes(upper)) return 'danger';
  return 'neutral';
}

export default function ActivityLogs() {
  const { notify } = useApp();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [entityFilter, setEntityFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await activityLogService.list({ limit: 500 });
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load activity logs.');
      notify(err.message || 'Failed to load activity logs.', 'danger');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      const matchAction = actionFilter === 'All' || item.action === actionFilter;
      const matchEntity = entityFilter === 'All' || item.entityType === entityFilter;
      const query = search.trim().toLowerCase();
      const matchSearch =
        !query ||
        String(item.description || '').toLowerCase().includes(query) ||
        String(item.user || item.userName || '').toLowerCase().includes(query) ||
        String(item.entityId || '').toLowerCase().includes(query) ||
        String(item.action || '').toLowerCase().includes(query) ||
        String(item.entityType || '').toLowerCase().includes(query);

      return matchAction && matchEntity && matchSearch;
    });
  }, [logs, actionFilter, entityFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const pagedRows = filteredLogs.slice((page - 1) * pageSize, page * pageSize);

  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <strong>{row.relativeTime || row.time || 'Just now'}</strong>
          <small style={{ color: 'var(--color-gray-500)', fontSize: '0.75rem' }}>
            {row.timestamp ? new Date(row.timestamp).toLocaleString() : 'N/A'}
          </small>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (row) => {
        const variant = actionVariant(row.action);
        return <span className={`badge status-badge ${variant}`}>{row.action}</span>;
      },
    },
    {
      key: 'entityType',
      label: 'Entity',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 600 }}>{row.entityType || row.entity || 'General'}</span>
          {row.entityId && (
            <span style={{ marginLeft: 6, color: 'var(--color-primary-600)', fontSize: '0.85rem' }}>
              #{row.entityId}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (row) => <span style={{ color: 'var(--color-gray-800)' }}>{row.description}</span>,
    },
    {
      key: 'user',
      label: 'Triggered By',
      render: (row) => (
        <span style={{ color: 'var(--color-gray-600)', fontSize: '0.875rem' }}>
          {row.user || row.userName || 'System'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Details',
      render: (row) => (
        <button
          className="button secondary"
          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
          type="button"
          onClick={() => setSelectedLog(row)}
        >
          <Eye size={14} style={{ marginRight: 4 }} /> View
        </button>
      ),
    },
  ];

  if (loading && !logs.length) {
    return <LoadingState title="Loading activity logs" />;
  }

  if (error && !logs.length) {
    return (
      <ErrorState
        title="Failed to load activity logs"
        description={error}
        onRetry={fetchLogs}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Activity Logs"
        description="Comprehensive organization-scoped audit trail of all operational actions, status transitions, and data modifications."
        actions={
          <Button variant="secondary" onClick={fetchLogs}>
            <RefreshCw size={15} style={{ marginRight: 6 }} /> Refresh Logs
          </Button>
        }
      />

      <Card>
        <div className="toolbar">
          <div className="filters">
            <div style={{ position: 'relative', minWidth: 260 }}>
              <Search size={17} style={{ position: 'absolute', left: 12, top: 12, color: '#6b7280' }} />
              <Input
                style={{ paddingLeft: 38 }}
                placeholder="Search description, entity, user..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
            >
              {actionTypes.map((action) => (
                <option key={action} value={action}>
                  Action: {action}
                </option>
              ))}
            </Select>
            <Select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setPage(1);
              }}
            >
              {entityTypes.map((entity) => (
                <option key={entity} value={entity}>
                  Entity: {entity}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <Table
          columns={columns}
          rows={pagedRows}
          emptyTitle="No activity logs found"
          emptyDescription="Operational events and user actions will be recorded here automatically."
        />

        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </Card>

      {selectedLog && (
        <Modal
          title={`Audit Log #${selectedLog.id}`}
          onClose={() => setSelectedLog(null)}
          actions={
            <Button variant="secondary" onClick={() => setSelectedLog(null)}>
              Close
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <strong style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)' }}>ACTION:</strong>
              <div style={{ marginTop: 4 }}>
                <span className={`badge status-badge ${actionVariant(selectedLog.action)}`}>
                  {selectedLog.action}
                </span>
              </div>
            </div>
            <div>
              <strong style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)' }}>ENTITY:</strong>
              <p style={{ marginTop: 4, margin: 0, fontWeight: 600 }}>
                {selectedLog.entityType || selectedLog.entity || 'General'} {selectedLog.entityId ? `(#${selectedLog.entityId})` : ''}
              </p>
            </div>
            <div>
              <strong style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)' }}>DESCRIPTION:</strong>
              <p style={{ marginTop: 4, margin: 0 }}>{selectedLog.description}</p>
            </div>
            <div>
              <strong style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)' }}>TRIGGERED BY:</strong>
              <p style={{ marginTop: 4, margin: 0 }}>{selectedLog.user || selectedLog.userName || 'System'}</p>
            </div>
            <div>
              <strong style={{ fontSize: '0.85rem', color: 'var(--color-gray-500)' }}>RECORDED AT:</strong>
              <p style={{ marginTop: 4, margin: 0 }}>
                {selectedLog.timestamp ? new Date(selectedLog.timestamp).toUTCString() : 'N/A'} (
                {selectedLog.relativeTime || selectedLog.time || 'Just now'})
              </p>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
