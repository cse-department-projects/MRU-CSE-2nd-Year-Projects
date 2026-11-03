import { useEffect, useState } from 'react';
import { Calendar, Check, X, Filter } from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import Table, { Pagination } from '../../components/ui/Table';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, [page, statusFilter]);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await appointmentService.getAll({ page, size: 10, status: statusFilter || undefined });
      setAppointments(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await appointmentService.confirm(id);
      toast.success('Appointment confirmed');
      loadAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentService.cancel(id);
      toast.success('Appointment cancelled');
      loadAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const columns = [
    {
      key: 'patientName',
      label: 'Patient',
      render: (_, row) => (
        <div>
          <p className="font-medium text-gray-900">{row.patientName}</p>
          <p className="text-xs text-gray-500">{row.patientEmail}</p>
        </div>
      ),
    },
    {
      key: 'doctorName',
      label: 'Doctor',
      render: (_, row) => (
        <div>
          <p className="font-medium text-gray-900">{row.doctorName}</p>
          <p className="text-xs text-gray-500">{row.specialization}</p>
        </div>
      ),
    },
    {
      key: 'appointmentDate',
      label: 'Date & Time',
      render: (_, row) => (
        <div>
          <p className="text-sm font-medium">{row.appointmentDate ? format(new Date(row.appointmentDate), 'MMM d, yyyy') : '—'}</p>
          <p className="text-xs text-gray-500">{row.appointmentTime}</p>
        </div>
      ),
    },
    { key: 'reason', label: 'Reason', render: (v) => <span className="text-sm text-gray-600 line-clamp-1 max-w-32">{v || '—'}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge status={v}>{v}</Badge>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          {row.status === 'PENDING' && (
            <button onClick={() => handleConfirm(row.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Confirm">
              <Check size={15} />
            </button>
          )}
          {(row.status === 'PENDING' || row.status === 'CONFIRMED') && (
            <button onClick={() => handleCancel(row.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Cancel">
              <X size={15} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const statuses = ['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <p className="text-sm text-gray-500 mt-1">Manage all hospital appointments</p>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <Filter size={16} className="text-gray-400" />
          <span className="text-sm text-gray-500 font-medium">Filter:</span>
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
            <Table columns={columns} data={appointments} emptyMessage="No appointments found" />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
