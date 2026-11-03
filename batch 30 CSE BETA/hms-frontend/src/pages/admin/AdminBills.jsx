import { useEffect, useState } from 'react';
import { Check, Filter } from 'lucide-react';
import { billService } from '../../services/billService';
import Table, { Pagination } from '../../components/ui/Table';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminBills() {
  const [bills, setBills] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBills();
  }, [page, statusFilter]);

  const loadBills = async () => {
    setIsLoading(true);
    try {
      const res = await billService.getAll({ page, size: 10, paymentStatus: statusFilter || undefined });
      setBills(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch {
      toast.error('Failed to load bills');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await billService.markAsPaid(id, 'CASH');
      toast.success('Bill marked as paid');
      loadBills();
    } catch {
      toast.error('Failed to update payment status');
    }
  };

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice', render: (v) => <span className="font-mono text-sm font-medium text-blue-600">{v}</span> },
    {
      key: 'patientName',
      label: 'Patient',
      render: (_, row) => (
        <div>
          <p className="font-medium text-gray-900">{row.patientName}</p>
          <p className="text-xs text-gray-500">{row.doctorName}</p>
        </div>
      ),
    },
    {
      key: 'grandTotal',
      label: 'Amount',
      render: (v) => <span className="font-semibold text-gray-900">₹{Number(v).toLocaleString('en-IN')}</span>,
    },
    {
      key: 'paymentStatus',
      label: 'Status',
      render: (v) => <Badge status={v}>{v}</Badge>,
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (v) => v ? format(new Date(v), 'MMM d, yyyy') : '—',
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        row.paymentStatus === 'PENDING' ? (
          <Button size="sm" variant="success" onClick={() => handleMarkPaid(row.id)}>
            <Check size={13} /> Mark Paid
          </Button>
        ) : null
      ),
    },
  ];

  const statuses = ['', 'PENDING', 'PAID', 'PARTIAL'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bills & Payments</h1>
        <p className="text-sm text-gray-500 mt-1">Manage all billing and payment records</p>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <Filter size={16} className="text-gray-400" />
          <div className="flex gap-2 flex-wrap">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(0); }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <>
            <Table columns={columns} data={bills} emptyMessage="No bills found" />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
