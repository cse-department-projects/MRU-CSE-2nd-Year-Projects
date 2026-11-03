import { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { auditLogService } from '../../services/auditLogService';
import Table, { Pagination } from '../../components/ui/Table';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import api from '../../api/axios';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [page]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/audit-logs', { params: { page, size: 20 } });
      setLogs(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      key: 'action',
      label: 'Action',
      render: (v) => <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{v}</span>,
    },
    { key: 'entityType', label: 'Entity' },
    { key: 'entityId', label: 'Entity ID' },
    {
      key: 'details',
      label: 'Details',
      render: (v) => <span className="text-xs text-gray-600 line-clamp-1 max-w-xs">{v || '—'}</span>,
    },
    {
      key: 'createdAt',
      label: 'Timestamp',
      render: (v) => v ? format(new Date(v), 'MMM d, yyyy HH:mm') : '—',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <ClipboardList className="text-gray-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-sm text-gray-500 mt-1">System activity log</p>
        </div>
      </div>
      <Card>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <>
            <Table columns={columns} data={logs} emptyMessage="No audit logs found" />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
