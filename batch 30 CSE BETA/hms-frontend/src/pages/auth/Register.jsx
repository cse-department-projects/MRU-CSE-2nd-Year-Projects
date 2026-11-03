import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

export default function Register() {
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success('Account created successfully! Welcome to HMS.');
      navigate('/patient', { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-blue-600 rounded-2xl p-3 mb-4 shadow-lg shadow-blue-200">
            <Heart size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Your Account</h1>
          <p className="text-gray-500 text-sm mt-1">Register as a patient to get started</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="Rahul"
                leftIcon={User}
                required
                error={errors.firstName?.message}
                {...register('firstName', {
                  required: 'First name is required',
                  minLength: { value: 2, message: 'Min 2 characters' },
                })}
              />
              <Input
                label="Last Name"
                placeholder="Singh"
                leftIcon={User}
                required
                error={errors.lastName?.message}
                {...register('lastName', {
                  required: 'Last name is required',
                  minLength: { value: 2, message: 'Min 2 characters' },
                })}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              leftIcon={Mail}
              required
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
              })}
            />

            <Input
              label="Phone Number"
              placeholder="+91 9876543210"
              leftIcon={Phone}
              error={errors.phone?.message}
              {...register('phone', {
                pattern: { value: /^[+]?[0-9]{10,15}$/, message: 'Invalid phone number' },
              })}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Create a strong password"
              leftIcon={Lock}
              required
              helperText="Min 8 chars, uppercase, lowercase, and number"
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Must include uppercase, lowercase, and digit',
                },
              })}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              leftIcon={Lock}
              required
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />

            <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
              Create Account
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
