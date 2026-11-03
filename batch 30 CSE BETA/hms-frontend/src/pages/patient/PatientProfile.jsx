import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Phone, MapPin, Calendar, HeartPulse, Droplet, Activity } from 'lucide-react';
import { patientService } from '../../services/patientService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function PatientProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await patientService.getMyProfile();
      const p = res.data.data;
      reset({
        phone: p.phone,
        dateOfBirth: p.dateOfBirth,
        gender: p.gender,
        bloodGroup: p.bloodGroup,
        address: p.address,
        emergencyContact: p.emergencyContact,
        emergencyContactName: p.emergencyContactName,
        medicalHistory: p.medicalHistory,
        allergies: p.allergies,
      });
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await patientService.updateMyProfile(data);
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
        <p className="text-sm text-gray-500 mt-1">Manage your personal and medical information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center gap-2"><User size={18} className="text-blue-600"/> Personal Information</Card.Title>
          </Card.Header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Phone Number" leftIcon={Phone} {...register('phone')} />
            <Input label="Date of Birth" type="date" leftIcon={Calendar} {...register('dateOfBirth')} />
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Gender</label>
              <select {...register('gender')} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Blood Group</label>
              <select {...register('bloodGroup')} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
                <option value="">Select Blood Group</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <Input label="Address" leftIcon={MapPin} {...register('address')} />
            </div>
          </div>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title className="flex items-center gap-2"><Activity size={18} className="text-blue-600"/> Emergency & Medical</Card.Title>
          </Card.Header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Emergency Contact Name" {...register('emergencyContactName')} />
            <Input label="Emergency Contact Phone" leftIcon={Phone} {...register('emergencyContact')} />
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-1">Medical History (Chronic illnesses, surgeries)</label>
              <textarea {...register('medicalHistory')} rows={3} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 block mb-1 flex items-center gap-2">Allergies (Food, drugs, environmental)</label>
              <textarea {...register('allergies')} rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" />
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
