import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import Table, { Pagination } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createForm = useForm();
  const editForm = useForm();

  useEffect(() => {
    loadDoctors();
  }, [page, search]);

  const loadDoctors = async () => {
    setIsLoading(true);
    try {
      const res = await doctorService.getAll({ page, size: 10, search: search || undefined });
      setDoctors(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch {
      toast.error('Failed to load doctors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data) => {
    setIsSubmitting(true);
    try {
      await doctorService.create(data);
      toast.success('Doctor created successfully');
      setIsCreateOpen(false);
      createForm.reset();
      loadDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (doctor) => {
    setSelectedDoctor(doctor);
    editForm.reset({
      specialization: doctor.specialization,
      experienceYears: doctor.experienceYears,
      consultationFee: doctor.consultationFee,
      bio: doctor.bio,
      availableDays: doctor.availableDays,
      availableTimeStart: doctor.availableTimeStart,
      availableTimeEnd: doctor.availableTimeEnd,
      qualification: doctor.qualification,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async (data) => {
    setIsSubmitting(true);
    try {
      await doctorService.update(selectedDoctor.id, data);
      toast.success('Doctor updated successfully');
      setIsEditOpen(false);
      loadDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this doctor account?')) return;
    try {
      await doctorService.delete(id);
      toast.success('Doctor deactivated');
      loadDoctors();
    } catch {
      toast.error('Failed to deactivate doctor');
    }
  };

  const columns = [
    {
      key: 'fullName',
      label: 'Doctor',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 text-emerald-700 rounded-full h-8 w-8 flex items-center justify-center text-xs font-semibold shrink-0">
            {row.firstName?.[0]}{row.lastName?.[0]}
          </div>
          <div>
            <p className="font-medium text-gray-900">{row.fullName}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'specialization', label: 'Specialization' },
    { key: 'experienceYears', label: 'Experience', render: (v) => v ? `${v} yrs` : '—' },
    { key: 'consultationFee', label: 'Fee', render: (v) => v ? `₹${v}` : '—' },
    {
      key: 'isAvailable',
      label: 'Status',
      render: (_, row) => (
        <Badge variant={row.isAvailable && row.isActive ? 'success' : 'danger'}>
          {row.isAvailable && row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleEdit(row)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Edit2 size={15} />
          </button>
          <button onClick={() => handleDelete(row.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  const DoctorForm = ({ form, onSubmit, submitLabel, isNew }) => (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {isNew && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" required {...form.register('firstName', { required: true })} />
            <Input label="Last Name" required {...form.register('lastName', { required: true })} />
          </div>
          <Input label="Email" type="email" required {...form.register('email', { required: true })} />
          <Input label="Password" type="password" required {...form.register('password', { required: true })} />
          <Input label="Phone" {...form.register('phone')} />
          <Input label="License Number" required {...form.register('licenseNumber', { required: true })} />
        </>
      )}
      <Input label="Specialization" required {...form.register('specialization', { required: true })} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Experience (years)" type="number" {...form.register('experienceYears')} />
        <Input label="Consultation Fee (₹)" type="number" step="0.01" {...form.register('consultationFee')} />
      </div>
      <Input label="Qualification" {...form.register('qualification')} />
      <Input label="Available Days" placeholder="MONDAY,TUESDAY,WEDNESDAY" {...form.register('availableDays')} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Start Time" type="time" {...form.register('availableTimeStart')} />
        <Input label="End Time" type="time" {...form.register('availableTimeEnd')} />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700">Bio</label>
        <textarea
          {...form.register('bio')}
          rows={3}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Doctor bio..."
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={() => { setIsCreateOpen(false); setIsEditOpen(false); }}>Cancel</Button>
        <Button type="submit" isLoading={isSubmitting}>{submitLabel}</Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all doctor accounts</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus size={16} /> Add Doctor
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Search doctors by name, email, or specialization..."
            leftIcon={Search}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <>
            <Table columns={columns} data={doctors} emptyMessage="No doctors found" />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add New Doctor" size="lg">
        <DoctorForm form={createForm} onSubmit={handleCreate} submitLabel="Create Doctor" isNew />
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Doctor" size="lg">
        <DoctorForm form={editForm} onSubmit={handleUpdate} submitLabel="Save Changes" isNew={false} />
      </Modal>
    </div>
  );
}
