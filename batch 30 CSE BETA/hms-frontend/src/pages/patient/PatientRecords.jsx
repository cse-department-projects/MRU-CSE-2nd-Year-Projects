import { useEffect, useState } from 'react';
import { Receipt, FileText, Activity, CreditCard } from 'lucide-react';
import { billService } from '../../services/billService';
import { prescriptionService } from '../../services/prescriptionService';
import Table, { Pagination } from '../../components/ui/Table';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

export function PatientBills() {
  const [bills, setBills] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [patientId, setPatientId] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    import('../../services/patientService').then(({ patientService }) => {
      patientService.getMyProfile().then(res => {
        setPatientId(res.data.data.id);
      }).catch(() => toast.error('Failed to load profile'));
    });
  }, []);

  useEffect(() => {
    if (patientId) loadBills();
  }, [patientId, page]);

  const loadBills = async () => {
    setIsLoading(true);
    try {
      const res = await billService.getByPatient(patientId, { page, size: 10 });
      setBills(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch {
      toast.error('Failed to load bills');
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice', render: (v) => <span className="font-mono text-sm font-medium text-blue-600">{v}</span> },
    {
      key: 'doctorName',
      label: 'Consultation',
      render: (_, row) => (
        <div>
          <p className="font-medium text-gray-900">Dr. {row.doctorName}</p>
          <p className="text-xs text-gray-500">{row.createdAt ? format(new Date(row.createdAt), 'MMM d, yyyy') : ''}</p>
        </div>
      ),
    },
    { key: 'grandTotal', label: 'Amount', render: (v) => <span className="font-semibold text-gray-900">₹{Number(v).toLocaleString('en-IN')}</span> },
    { key: 'paymentStatus', label: 'Status', render: (v) => <Badge status={v}>{v}</Badge> },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <button onClick={() => setSelectedBill(row)} className="text-xs font-medium text-blue-600 hover:text-blue-800">
          View Details
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-100 text-amber-600 rounded-xl"><Receipt size={20} /></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bills</h1>
          <p className="text-sm text-gray-500 mt-1">View your billing history</p>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <>
            <Table columns={columns} data={bills} emptyMessage="No bills found" />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Modal isOpen={!!selectedBill} onClose={() => setSelectedBill(null)} title="Invoice Details" size="md">
        {selectedBill && (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <p className="text-xs text-gray-500 uppercase">Invoice Number</p>
                <p className="font-mono font-bold text-lg text-gray-900">{selectedBill.invoiceNumber}</p>
              </div>
              <Badge status={selectedBill.paymentStatus}>{selectedBill.paymentStatus}</Badge>
            </div>
            
            <div className="space-y-2 py-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Consultation Fee</span>
                <span className="font-medium">₹{selectedBill.consultationFee}</span>
              </div>
              {selectedBill.medicineCharges > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Medicine Charges</span>
                  <span className="font-medium">₹{selectedBill.medicineCharges}</span>
                </div>
              )}
              {selectedBill.additionalCharges > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Additional Charges</span>
                  <span className="font-medium">₹{selectedBill.additionalCharges}</span>
                </div>
              )}
              {selectedBill.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({selectedBill.discount}%)</span>
                  <span className="font-medium">-₹{(selectedBill.consultationFee + selectedBill.medicineCharges + selectedBill.additionalCharges) * selectedBill.discount / 100}</span>
                </div>
              )}
              <div className="flex justify-between text-sm border-t pt-2 mt-2">
                <span className="text-gray-600">GST ({selectedBill.gstPercentage}%)</span>
                <span className="font-medium">₹{selectedBill.gstAmount}</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
              <span className="font-bold text-gray-900">Grand Total</span>
              <span className="font-bold text-xl text-blue-600">₹{selectedBill.grandTotal}</span>
            </div>

            {selectedBill.paymentStatus === 'PENDING' && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                <CreditCard className="text-amber-600 shrink-0" size={24} />
                <p className="text-sm text-amber-800">
                  Payment for this bill is pending. Please complete your payment at the hospital reception.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [patientId, setPatientId] = useState(null);
  const [selectedRx, setSelectedRx] = useState(null);

  useEffect(() => {
    import('../../services/patientService').then(({ patientService }) => {
      patientService.getMyProfile().then(res => setPatientId(res.data.data.id));
    });
  }, []);

  useEffect(() => {
    if (patientId) loadPrescriptions();
  }, [patientId, page]);

  const loadPrescriptions = async () => {
    setIsLoading(true);
    try {
      const res = await prescriptionService.getByPatient(patientId, { page, size: 10 });
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
      key: 'doctorName',
      label: 'Doctor',
      render: (_, row) => (
        <div>
          <p className="font-medium text-gray-900">Dr. {row.doctorName}</p>
          <p className="text-xs text-gray-500">{row.doctorSpecialization}</p>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (v) => <span className="text-sm">{v ? format(new Date(v), 'MMM d, yyyy') : '—'}</span>,
    },
    { key: 'diagnosis', label: 'Diagnosis', render: (v) => <span className="text-sm text-gray-700">{v}</span> },
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
          <p className="text-sm text-gray-500 mt-1">View your medical prescriptions</p>
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
                <h3 className="font-bold text-lg text-gray-900">Dr. {selectedRx.doctorName}</h3>
                <p className="text-sm text-gray-500">{selectedRx.doctorSpecialization}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Date: {selectedRx.createdAt ? format(new Date(selectedRx.createdAt), 'MMM d, yyyy') : ''}</p>
                <p className="text-sm text-gray-600 mt-1"><span className="font-semibold text-gray-900">Diagnosis:</span> {selectedRx.diagnosis}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><FileText size={16} className="text-blue-600"/> Prescribed Medicines</h4>
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
