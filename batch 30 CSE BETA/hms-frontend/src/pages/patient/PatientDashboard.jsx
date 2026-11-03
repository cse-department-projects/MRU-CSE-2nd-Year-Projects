import { useEffect, useState } from 'react';
import { Calendar, Receipt, Pill, Activity } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import StatCard from '../../components/shared/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardService.getPatientDashboard()
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.firstName}!</h1>
          <p className="text-gray-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <Link to="/patient/book-appointment">
          <Button><Calendar size={16} /> Book Appointment</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Appointments" value={data?.totalAppointments ?? 0} icon={Calendar} color="blue" />
        <StatCard title="Upcoming" value={data?.upcomingAppointments ?? 0} icon={Activity} color="indigo" />
        <StatCard title="Pending Bills" value={data?.pendingBills ?? 0} icon={Receipt} color="amber" />
        <StatCard title="Prescriptions" value={data?.totalPrescriptions ?? 0} icon={Pill} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <Card.Header>
            <Card.Title>Upcoming Appointments</Card.Title>
            <Link to="/patient/appointments" className="text-sm text-blue-600 hover:text-blue-700">View all</Link>
          </Card.Header>
          {data?.recentAppointments?.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-gray-400">No upcoming appointments</p>
              <Link to="/patient/book-appointment">
                <Button size="sm" className="mt-3">Book Now</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {data?.recentAppointments?.map(apt => (
                <div key={apt.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Dr. {apt.doctorName}</p>
                    <p className="text-xs text-gray-500">{apt.specialization}</p>
                    <p className="text-xs text-gray-400">{apt.appointmentDate ? format(new Date(apt.appointmentDate), 'MMM d') : ''} · {apt.appointmentTime}</p>
                  </div>
                  <Badge status={apt.status}>{apt.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Bills */}
        <Card>
          <Card.Header>
            <Card.Title>Recent Bills</Card.Title>
            <Link to="/patient/bills" className="text-sm text-blue-600 hover:text-blue-700">View all</Link>
          </Card.Header>
          {data?.recentBills?.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Receipt size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No bills yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data?.recentBills?.map(bill => (
                <div key={bill.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900 font-mono">{bill.invoiceNumber}</p>
                    <p className="text-xs text-gray-500">{bill.createdAt ? format(new Date(bill.createdAt), 'MMM d, yyyy') : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">₹{Number(bill.grandTotal).toLocaleString('en-IN')}</p>
                    <Badge status={bill.paymentStatus}>{bill.paymentStatus}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
