import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { prescriptionService } from '../../services/prescriptionService';
import { billService } from '../../services/billService';
import { medicineService } from '../../services/medicineService';
import Table, { Pagination } from '../../components/ui/Table';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { Check, X, FileText, Plus, Trash2 } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { doctorService } from '../../services/doctorService';

export default function DoctorAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [doctorId, setDoctorId] = useState(null);

  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [isBillOpen, setIsBillOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [medicines, setMedicines] = useState([]);

  const prescriptionForm = useForm({
    defaultValues: { items: [{ medicineId: '', dosage: '', frequency: '', duration: '', instructions: '', quantity: 1 }] }
  });
  const { fields, append, remove } = useFieldArray({ control: prescriptionForm.control, name: 'items' });
  const billForm = useForm();

  useEffect(() => {
    loadDoctorProfile();
    loadMedicines();
  }, [user]);

  useEffect(() => {
    if (doctorId) loadAppointments();
  }, [doctorId, page, statusFilter]);

  const loadDoctorProfile = async () => {
    try {
      const res = await doctorService.getMyProfile();
      if (res.data?.data?.id) {
        setDoctorId(res.data.data.id);
      }
    } catch (err) {
      toast.error('Failed to load doctor profile');
    }
  };

  const loadMedicines = async () => {
    try {
      const res = await medicineService.getAll({ page: 0, size: 100 });
      setMedicines(res.data.data.content);
    } catch {}
  };

  const loadAppointments = async () => {
    if (!doctorId) return;
    setIsLoading(true);
    try {
      const res = await appointmentService.getByDoctor(doctorId, { page, size: 10, status: statusFilter || undefined });
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
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleComplete = async (id) => {
    try {
      await appointmentService.complete(id, '');
      toast.success('Appointment marked as complete');
      loadAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const openPrescription = (apt) => {
    setSelectedApt(apt);
    prescriptionForm.reset({
      diagnosis: '',
      notes: '',
      followUpInstructions: '',
      items: [{ medicineId: '', dosage: '', frequency: '', duration: '', instructions: '', quantity: 1 }]
    });
    setIsPrescriptionOpen(true);
  };

  const openBill = (apt) => {
    setSelectedApt(apt);
    billForm.reset({ consultationFee: '', medicineCharges: '', additionalCharges: '', discount: 0, gstPercentage: 18, paymentMethod: 'CASH' });
    setIsBillOpen(true);
  };

  const handlePrescription = async (data) => {
    setIsSubmitting(true);
    try {
      await prescriptionService.create({ ...data, appointmentId: selectedApt.id });
      toast.success('Prescription created successfully');
      setIsPrescriptionOpen(false);
      loadAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create prescription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBill = async (data) => {
    setIsSubmitting(true);
    try {
      await billService.generate({ ...data, appointmentId: selectedApt.id });
      toast.success('Bill generated successfully');
      setIsBillOpen(false);
      loadAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate bill');
    } finally {
      setIsSubmitting(false);
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
      key: 'appointmentDate',
      label: 'Date & Time',
      render: (_, row) => (
        <div>
          <p className="text-sm">{row.appointmentDate ? format(new Date(row.appointmentDate), 'MMM d, yyyy') : '—'}</p>
          <p className="text-xs text-gray-500">{row.appointmentTime}</p>
        </div>
      ),
    },
    { key: 'reason', label: 'Reason', render: (v) => <span className="text-xs text-gray-600">{v}</span> },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v}>{v}</Badge> },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-1 flex-wrap">
          {row.status === 'PENDING' && (
            <button onClick={() => handleConfirm(row.id)} className="px-2 py-1 text-xs bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100">Confirm</button>
          )}
          {(row.status === 'CONFIRMED' || row.status === 'PENDING') && (
            <button onClick={() => handleComplete(row.id)} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">Complete</button>
          )}
          {row.status === 'COMPLETED' && (
            <>
              <button onClick={() => openPrescription(row)} className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100">Prescribe</button>
              {!row.billGenerated && (
                <button onClick={() => openBill(row)} className="px-2 py-1 text-xs bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100">Bill</button>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  const statuses = ['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and track your patient appointments</p>
      </div>

      <Card>
        <div className="flex gap-2 mb-4 flex-wrap">
          {statuses.map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(0); }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s || 'All'}
            </button>
          ))}
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

      {/* Prescription Modal */}
      <Modal isOpen={isPrescriptionOpen} onClose={() => setIsPrescriptionOpen(false)} title="Create Prescription" size="xl">
        <form onSubmit={prescriptionForm.handleSubmit(handlePrescription)} className="space-y-4">
          <Input label="Diagnosis" required {...prescriptionForm.register('diagnosis', { required: true })} />
          <div>
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea {...prescriptionForm.register('notes')} rows={2} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <Input label="Follow-up Instructions" {...prescriptionForm.register('followUpInstructions')} />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">Medicines</label>
              <Button type="button" size="sm" variant="secondary" onClick={() => append({ medicineId: '', dosage: '', frequency: '', duration: '', instructions: '', quantity: 1 })}>
                <Plus size={14} /> Add
              </Button>
            </div>
            <div className="space-y-3">
              {fields.map((field, i) => (
                <div key={field.id} className="p-3 border border-gray-100 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Medicine {i + 1}</span>
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    )}
                  </div>
                  <select {...prescriptionForm.register(`items.${i}.medicineId`, { required: true })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Medicine</option>
                    {medicines.map(m => <option key={m.id} value={m.id}>{m.name} ({m.strength})</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Dosage (e.g. 1 tablet)" {...prescriptionForm.register(`items.${i}.dosage`, { required: true })} />
                    <Input placeholder="Frequency (e.g. twice daily)" {...prescriptionForm.register(`items.${i}.frequency`, { required: true })} />
                    <Input placeholder="Duration (e.g. 7 days)" {...prescriptionForm.register(`items.${i}.duration`, { required: true })} />
                    <Input type="number" placeholder="Qty" min={1} {...prescriptionForm.register(`items.${i}.quantity`)} />
                  </div>
                  <Input placeholder="Special instructions" {...prescriptionForm.register(`items.${i}.instructions`)} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsPrescriptionOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Save Prescription</Button>
          </div>
        </form>
      </Modal>

      {/* Bill Modal */}
      <Modal isOpen={isBillOpen} onClose={() => setIsBillOpen(false)} title="Generate Bill" size="md">
        <form onSubmit={billForm.handleSubmit(handleBill)} className="space-y-4">
          <Input label="Consultation Fee (₹)" type="number" step="0.01" required {...billForm.register('consultationFee', { required: true })} />
          <Input label="Medicine Charges (₹)" type="number" step="0.01" {...billForm.register('medicineCharges')} />
          <Input label="Additional Charges (₹)" type="number" step="0.01" {...billForm.register('additionalCharges')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Discount (%)" type="number" step="0.01" {...billForm.register('discount')} />
            <Input label="GST (%)" type="number" step="0.01" {...billForm.register('gstPercentage')} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Payment Method</label>
            <select {...billForm.register('paymentMethod')} className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="UPI">UPI</option>
              <option value="INSURANCE">Insurance</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsBillOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Generate Bill</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
