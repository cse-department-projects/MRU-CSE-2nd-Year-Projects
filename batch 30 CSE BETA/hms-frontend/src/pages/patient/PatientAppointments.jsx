import { useEffect, useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { appointmentService } from '../../services/appointmentService';
import { useAuth } from '../../contexts/AuthContext';
import Table, { Pagination } from '../../components/ui/Table';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function PatientAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [patientId, setPatientId] = useState(null);

  useEffect(() => {
    // We need the patient's specific ID (not the user ID).
    // Let's fetch it from the profile endpoint.
    import('../../services/patientService').then(({ patientService }) => {
      patientService.getMyProfile().then(res => {
        setPatientId(res.data.data.id);
      }).catch(() => {
        toast.error('Failed to load profile');
      });
    });
  }, []);

  useEffect(() => {
    if (patientId) loadAppointments();
  }, [patientId, page]);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await appointmentService.getByPatient(patientId, { page, size: 10 });
      setAppointments(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentService.cancel(id);
      toast.success('Appointment cancelled successfully');
      loadAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const columns = [
    {
      key: 'doctorName',
      label: 'Doctor',
      render: (_, row) => (
        <div>
          <p className="font-medium text-gray-900">Dr. {row.doctorName}</p>
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
    { key: 'reason', label: 'Reason for Visit', render: (v) => <span className="text-sm text-gray-600 line-clamp-1 max-w-xs">{v}</span> },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v}>{v}</Badge> },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        (row.status === 'PENDING' || row.status === 'CONFIRMED') ? (
          <button
            onClick={() => handleCancel(row.id)}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <X size={14} /> Cancel
          </button>
        ) : null
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
          <Calendar size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your appointment history</p>
        </div>
      </div>

      <Card>
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
