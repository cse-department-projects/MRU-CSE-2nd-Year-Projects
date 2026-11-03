import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { medicineService } from '../../services/medicineService';
import Table, { Pagination } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function PharmacistMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm();

  useEffect(() => {
    loadMedicines();
  }, [page, search]);

  const loadMedicines = async () => {
    setIsLoading(true);
    try {
      const res = await medicineService.getAll({ page, size: 10, search: search || undefined });
      setMedicines(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch {
      toast.error('Failed to load medicines');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setSelectedMedicine(null);
    form.reset({});
    setIsModalOpen(true);
  };

  const openEdit = (medicine) => {
    setSelectedMedicine(medicine);
    form.reset({
      name: medicine.name,
      genericName: medicine.genericName,
      manufacturer: medicine.manufacturer,
      batchNumber: medicine.batchNumber,
      quantity: medicine.quantity,
      expiryDate: medicine.expiryDate,
      price: medicine.price,
      category: medicine.category,
      dosageForm: medicine.dosageForm,
      strength: medicine.strength,
      lowStockThreshold: medicine.lowStockThreshold,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (selectedMedicine) {
        await medicineService.update(selectedMedicine.id, data);
        toast.success('Medicine updated');
      } else {
        await medicineService.create(data);
        toast.success('Medicine added');
      }
      setIsModalOpen(false);
      loadMedicines();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this medicine?')) return;
    try {
      await medicineService.delete(id);
      toast.success('Medicine deactivated');
      loadMedicines();
    } catch {
      toast.error('Failed to deactivate');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Medicine',
      render: (_, row) => (
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">{row.name}</p>
            {row.isLowStock && <AlertTriangle size={14} className="text-amber-500" />}
          </div>
          <p className="text-xs text-gray-500">{row.genericName || '—'} · {row.dosageForm || ''} {row.strength || ''}</p>
        </div>
      ),
    },
    { key: 'category', label: 'Category' },
    { key: 'manufacturer', label: 'Manufacturer' },
    {
      key: 'quantity',
      label: 'Stock',
      render: (v, row) => (
        <span className={`font-semibold ${row.isLowStock ? 'text-amber-600' : 'text-gray-900'}`}>{v}</span>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (v) => `₹${v}`,
    },
    {
      key: 'expiryDate',
      label: 'Expiry',
      render: (v, row) => (
        <span className={row.isExpired ? 'text-red-600 font-medium' : ''}>
          {v ? format(new Date(v), 'MMM yyyy') : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Edit2 size={15} />
          </button>
          <button onClick={() => handleDelete(row.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pharmacy Medicines</h1>
          <p className="text-sm text-gray-500 mt-1">Manage pharmacy inventory and stock levels</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} /> Add Medicine</Button>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Search medicines..."
            leftIcon={Search}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <>
            <Table columns={columns} data={medicines} emptyMessage="No medicines found" />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedMedicine ? 'Edit Medicine' : 'Add Medicine'}
        size="lg"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Medicine Name" required {...form.register('name', { required: true })} />
            <Input label="Generic Name" {...form.register('genericName')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Manufacturer" {...form.register('manufacturer')} />
            <Input label="Batch Number" {...form.register('batchNumber')} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Quantity" type="number" required {...form.register('quantity', { required: true, min: 0 })} />
            <Input label="Price (₹)" type="number" step="0.01" required {...form.register('price', { required: true })} />
            <Input label="Low Stock Alert" type="number" {...form.register('lowStockThreshold')} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Dosage Form" placeholder="Tablet, Capsule..." {...form.register('dosageForm')} />
            <Input label="Strength" placeholder="500mg, 10ml..." {...form.register('strength')} />
            <Input label="Category" {...form.register('category')} />
          </div>
          <Input label="Expiry Date" type="date" {...form.register('expiryDate')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>{selectedMedicine ? 'Save Changes' : 'Add Medicine'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
