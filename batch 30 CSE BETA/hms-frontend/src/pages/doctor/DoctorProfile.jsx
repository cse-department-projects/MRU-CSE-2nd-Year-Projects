import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Phone, Briefcase, GraduationCap, Clock, DollarSign, Calendar, ToggleLeft, ToggleRight } from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const DAYS_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctorId, setDoctorId] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedDays, setSelectedDays] = useState([]);
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await doctorService.getMyProfile();
      const d = res.data.data;
      setDoctorId(d.id);
      setIsAvailable(d.isAvailable ?? d.available ?? true);

      const days = d.availableDays ? d.availableDays.split(',').map(s => s.trim()) : [];
      setSelectedDays(days);

      reset({
        phone: d.phone,
        specialization: d.specialization,
        experienceYears: d.experienceYears,
        consultationFee: d.consultationFee,
        bio: d.bio,
        qualification: d.qualification,
        availableTimeStart: d.availableTimeStart,
        availableTimeEnd: d.availableTimeEnd,
      });
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        experienceYears: data.experienceYears ? Number(data.experienceYears) : null,
        consultationFee: data.consultationFee ? Number(data.consultationFee) : null,
        availableDays: selectedDays.join(', '),
        isAvailable,
      };
      await doctorService.updateMyProfile(payload);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your professional information and availability</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center gap-2"><User size={18} className="text-blue-600" /> Personal Information</Card.Title>
          </Card.Header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Phone Number" leftIcon={Phone} {...register('phone')} />
            <Input label="Specialization" leftIcon={Briefcase} {...register('specialization')} />
            <Input label="Qualification" leftIcon={GraduationCap} {...register('qualification')} />
            <Input label="Experience (Years)" type="number" leftIcon={Clock} {...register('experienceYears')} />
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-1">Bio</label>
              <textarea
                {...register('bio')}
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Tell patients about yourself..."
              />
            </div>
          </div>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title className="flex items-center gap-2"><DollarSign size={18} className="text-blue-600" /> Consultation</Card.Title>
          </Card.Header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Consultation Fee (₹)" type="number" leftIcon={DollarSign} {...register('consultationFee')} />
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Accepting Patients</label>
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAvailable ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
              <span className={`text-sm font-medium ${isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title className="flex items-center gap-2"><Calendar size={18} className="text-blue-600" /> Availability Schedule</Card.Title>
          </Card.Header>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Available Days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OPTIONS.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedDays.includes(day)
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Start Time" type="time" leftIcon={Clock} {...register('availableTimeStart')} />
              <Input label="End Time" type="time" leftIcon={Clock} {...register('availableTimeEnd')} />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" isLoading={isSubmitting}>Save Profile</Button>
        </div>
      </form>
    </div>
  );
}
