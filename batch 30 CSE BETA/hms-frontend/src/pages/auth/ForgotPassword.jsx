import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, Heart, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/authService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setSubmitted(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-blue-600 rounded-2xl p-3 mb-4 shadow-lg shadow-blue-200">
            <Heart size={28} className="text-white" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {submitted ? (
            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-500 text-sm mb-6">
                If an account exists with that email, we've sent a password reset link.
              </p>
              <Link to="/login">
                <Button variant="secondary" className="w-full">
                  <ArrowLeft size={16} /> Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Forgot Password?</h2>
              <p className="text-sm text-gray-500 mb-6">
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                  Send Reset Link
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1">
                  <ArrowLeft size={14} /> Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
