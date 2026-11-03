import { useEffect, useState } from 'react';
import { Search, Trash2, Eye } from 'lucide-react';
import { patientService } from '../../services/patientService';
import Table, { Pagination } from '../../components/ui/Table';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, [page, search]);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const res = await patientService.getAll({ page, size: 10, search: search || undefined });
      setPatients(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch {
      toast.error('Failed to load patients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this patient account?')) return;
    try {
      await patientService.delete(id);
      toast.success('Patient deactivated');
      loadPatients();
    } catch {
      toast.error('Failed to deactivate patient');
    }
  };

  const columns = [
    {
      key: 'fullName',
      label: 'Patient',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="bg-violet-100 text-violet-700 rounded-full h-8 w-8 flex items-center justify-center text-xs font-semibold">
            {row.firstName?.[0]}{row.lastName?.[0]}
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.fullName}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', label: 'Phone' },
    { key: 'gender', label: 'Gender' },
    { key: 'bloodGroup', label: 'Blood Group' },
    {
      key: 'createdAt',
      label: 'Registered',
      render: (v) => v ? format(new Date(v), 'MMM d, yyyy') : '—',
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (_, row) => (
        <Badge variant={row.isActive ? 'success' : 'danger'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <button
          onClick={() => handleDelete(row.id)}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={15} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <p className="text-sm text-gray-500 mt-1">View and manage all patient records</p>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Search patients by name, email, or phone..."
            leftIcon={Search}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <>
            <Table columns={columns} data={patients} emptyMessage="No patients found" />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
