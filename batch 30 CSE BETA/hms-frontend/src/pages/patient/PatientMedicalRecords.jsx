import { useEffect, useState } from 'react';
import { ClipboardList, Calendar, Stethoscope, AlertCircle } from 'lucide-react';
import { medicalRecordService } from '../../services/medicalRecordService';
import { patientService } from '../../services/patientService';
import Table, { Pagination } from '../../components/ui/Table';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function PatientMedicalRecords() {
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [patientId, setPatientId] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    patientService.getMyProfile()
      .then(res => setPatientId(res.data.data.id))
      .catch(() => toast.error('Failed to load profile'));
  }, []);

  useEffect(() => {
    if (patientId) loadRecords();
  }, [patientId, page]);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const res = await medicalRecordService.getByPatient(patientId, { page, size: 10 });
      setRecords(res.data.data.content);
      setTotalPages(res.data.data.totalPages);
    } catch {
      toast.error('Failed to load medical records');
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
      key: 'diagnosis',
      label: 'Diagnosis',
      render: (v) => <span className="text-sm text-gray-700">{v || '—'}</span>,
    },
    {
      key: 'visitDate',
      label: 'Visit Date',
      render: (v) => <span className="text-sm">{v ? format(new Date(v), 'MMM d, yyyy') : '—'}</span>,
    },
    {
      key: 'followUpRequired',
      label: 'Follow-up',
      render: (v) => (
        <Badge status={v === 'Yes' ? 'PENDING' : 'COMPLETED'}>
          {v || 'No'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <button onClick={() => setSelectedRecord(row)} className="text-xs font-medium text-blue-600 hover:text-blue-800">
          View Details
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-teal-100 text-teal-600 rounded-xl"><ClipboardList size={20} /></div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Medical Records</h1>
          <p className="text-sm text-gray-500 mt-1">View your complete medical history</p>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <>
            <Table columns={columns} data={records} emptyMessage="No medical records found" />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Modal isOpen={!!selectedRecord} onClose={() => setSelectedRecord(null)} title="Medical Record Details" size="lg">
        {selectedRecord && (
          <div className="space-y-5">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Dr. {selectedRecord.doctorName}</h3>
                <p className="text-sm text-gray-500">{selectedRecord.doctorSpecialization}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 flex items-center gap-1 justify-end">
                  <Calendar size={14} className="text-gray-400" />
                  {selectedRecord.visitDate ? format(new Date(selectedRecord.visitDate), 'MMM d, yyyy') : '—'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedRecord.diagnosis && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Stethoscope size={12} /> Diagnosis
                  </p>
                  <p className="text-sm text-gray-900 font-medium">{selectedRecord.diagnosis}</p>
                </div>
              )}
              {selectedRecord.symptoms && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <AlertCircle size={12} /> Symptoms
                  </p>
                  <p className="text-sm text-gray-900">{selectedRecord.symptoms}</p>
                </div>
              )}
            </div>

            {selectedRecord.treatment && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-1">Treatment</p>
                <p className="text-sm text-blue-900">{selectedRecord.treatment}</p>
              </div>
            )}

            {selectedRecord.reports && (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1">Reports</p>
                <p className="text-sm text-amber-900">{selectedRecord.reports}</p>
              </div>
            )}

            {selectedRecord.doctorNotes && (
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <p className="text-xs font-semibold text-indigo-800 uppercase tracking-wide mb-1">Doctor's Notes</p>
                <p className="text-sm text-indigo-900">{selectedRecord.doctorNotes}</p>
              </div>
            )}

            {selectedRecord.followUpRequired && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-xs font-semibold text-emerald-800 uppercase">Follow-up Required:</span>
                <span className="text-sm font-medium text-emerald-900">{selectedRecord.followUpRequired}</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
