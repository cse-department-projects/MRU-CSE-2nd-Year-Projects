import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { prescriptionService } from '../../services/prescriptionService';
import { doctorService } from '../../services/doctorService';
import Table, { Pagination } from '../../components/ui/Table';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [doctorId, setDoctorId] = useState(null);
  const [selectedRx, setSelectedRx] = useState(null);

  useEffect(() => {
    doctorService.getMyProfile()
      .then(res => setDoctorId(res.data.data.id))
      .catch(() => toast.error('Failed to load doctor profile'));
  }, []);

  useEffect(() => {
    if (doctorId) loadPrescriptions();
  }, [doctorId, page]);

  const loadPrescriptions = async () => {
    setIsLoading(true);
    try {
      const res = await prescriptionService.getByDoctor(doctorId, { page, size: 10 });
      setPrescriptions(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch {
      toast.error('Failed to load prescriptions');
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      key: 'patientName',
      label: 'Patient',
      render: (v) => <span className="font-medium text-gray-900">{v}</span>,
    },
    {
      key: 'diagnosis',
      label: 'Diagnosis',
      render: (v) => <span className="text-sm text-gray-700">{v || '—'}</span>,
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (v) => <span className="text-sm">{v ? format(new Date(v), 'MMM d, yyyy') : '—'}</span>,
    },
    {
      key: 'items',
      label: 'Medicines',
      render: (v) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
          {v?.length || 0} items
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <button onClick={() => setSelectedRx(row)} className="text-xs font-medium text-blue-600 hover:text-blue-800">
          View Details
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><FileText size={20} /></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Prescriptions</h1>
          <p className="text-sm text-gray-500 mt-1">Prescriptions you have written for patients</p>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <>
            <Table columns={columns} data={prescriptions} emptyMessage="No prescriptions found" />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Modal isOpen={!!selectedRx} onClose={() => setSelectedRx(null)} title="Prescription Details" size="lg">
        {selectedRx && (
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{selectedRx.patientName}</h3>
                <p className="text-sm text-gray-500">Patient</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  Date: {selectedRx.createdAt ? format(new Date(selectedRx.createdAt), 'MMM d, yyyy') : ''}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold text-gray-900">Diagnosis:</span> {selectedRx.diagnosis}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText size={16} className="text-blue-600" /> Prescribed Medicines
              </h4>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Medicine</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Dosage</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Frequency</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedRx.items?.map(item => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{item.medicineName}</p>
                          <p className="text-xs text-gray-500">{item.dosageForm} {item.strength}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{item.dosage}</td>
                        <td className="px-4 py-3 text-gray-700">{item.frequency}</td>
                        <td className="px-4 py-3 text-gray-700">{item.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedRx.notes && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-1">Doctor's Notes</p>
                <p className="text-sm text-blue-900">{selectedRx.notes}</p>
              </div>
            )}
            {selectedRx.followUpInstructions && (
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide mb-1">Follow-up Instructions</p>
                <p className="text-sm text-emerald-900">{selectedRx.followUpInstructions}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
