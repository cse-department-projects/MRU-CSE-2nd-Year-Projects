import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, User, ChevronRight } from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';
import { useForm } from 'react-hook-form';

export default function PatientBookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpec, setSelectedSpec] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadSlots(selectedDoctor.id, selectedDate);
    }
  }, [selectedDoctor, selectedDate]);

  const loadDoctors = async () => {
    try {
      const [docRes, specRes] = await Promise.all([
        doctorService.getAvailable(),
        doctorService.getSpecializations()
      ]);
      setDoctors(docRes.data.data);
      setSpecializations(specRes.data.data);
    } catch {
      toast.error('Failed to load doctors');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSlots = async (doctorId, date) => {
    setIsSlotsLoading(true);
    setSelectedSlot(null);
    try {
      const res = await appointmentService.getAvailableSlots(doctorId, date);
      setAvailableSlots(res.data.data);
    } catch {
      toast.error('Failed to load time slots');
    } finally {
      setIsSlotsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!selectedDoctor) return toast.error('Please select a doctor');
    if (!selectedSlot) return toast.error('Please select a time slot');

    setIsSubmitting(true);
    try {
      await appointmentService.book({
        doctorId: selectedDoctor.id,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        reason: data.reason
      });
      toast.success('Appointment booked successfully!');
      navigate('/patient/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDoctors = selectedSpec
    ? doctors.filter(d => d.specialization === selectedSpec)
    : doctors;

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
        <p className="text-sm text-gray-500 mt-1">Schedule a consultation with our specialists</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: Select Doctor */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Filter by Specialization</label>
              <select
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                value={selectedSpec}
                onChange={(e) => { setSelectedSpec(e.target.value); setSelectedDoctor(null); }}
              >
                <option value="">All Specializations</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {filteredDoctors.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <User size={32} className="mx-auto mb-2 opacity-40" />
                  <p>No doctors available in this specialization</p>
                </div>
              ) : (
                filteredDoctors.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoctor(doc)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedDoctor?.id === doc.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
                        selectedDoctor?.id === doc.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {doc.firstName?.[0]}{doc.lastName?.[0]}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">Dr. {doc.firstName} {doc.lastName}</h3>
                        <p className="text-sm text-blue-600 font-medium">{doc.specialization}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{doc.bio}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1"><CalendarIcon size={14} /> {doc.experienceYears} yrs exp</span>
                          <span className="flex items-center gap-1">₹{doc.consultationFee} fee</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Step 2: Time & Details */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarIcon size={18} className="text-blue-600" /> Date & Time
            </h3>
            
            {selectedDoctor ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Select Date</label>
                  <input
                    type="date"
                    min={format(new Date(), 'yyyy-MM-dd')}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Available Slots</label>
                  {isSlotsLoading ? (
                    <div className="flex justify-center py-4"><Spinner /></div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg text-center">No slots available for this date</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {availableSlots.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                            selectedSlot === slot
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Reason for Visit</label>
                  <textarea
                    {...register('reason', { required: 'Please provide a reason' })}
                    rows={3}
                    placeholder="Briefly describe your symptoms or reason for visit..."
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 ${errors.reason ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.reason && <p className="text-xs text-red-600 mt-1">{errors.reason.message}</p>}
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Consultation Fee</span>
                    <span className="font-semibold">₹{selectedDoctor.consultationFee}</span>
                  </div>
                  <p className="text-xs text-gray-400">Payment will be collected at the hospital</p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg" 
                  disabled={!selectedSlot}
                  isLoading={isSubmitting}
                >
                  Confirm Booking
                </Button>
              </form>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <ChevronRight size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Please select a doctor first</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
