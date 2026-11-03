import { useEffect, useState } from 'react';
import {
  Users, UserCheck, Calendar, DollarSign, Pill,
  Receipt, TrendingUp, Activity, AlertTriangle
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import StatCard from '../../components/shared/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await dashboardService.getAdminDashboard();
      setData(res.data.data);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Patients" value={data?.totalPatients ?? 0} icon={Users} color="blue" />
        <StatCard title="Total Doctors" value={data?.totalDoctors ?? 0} icon={UserCheck} color="green" />
        <StatCard title="Today's Appointments" value={data?.todaysAppointments ?? 0} icon={Calendar} color="indigo" />
        <StatCard title="Total Revenue" value={`₹${(data?.totalRevenue ?? 0).toLocaleString('en-IN')}`} icon={DollarSign} color="green" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Medicines" value={data?.totalMedicines ?? 0} icon={Pill} color="purple" />
        <StatCard title="Low Stock Alerts" value={data?.lowStockMedicines ?? 0} icon={AlertTriangle} color="amber" subtitle="Needs attention" />
        <StatCard title="Pending Bills" value={data?.pendingBills ?? 0} icon={Receipt} color="red" />
        <StatCard title="Monthly Revenue" value={`₹${(data?.monthlyRevenue ?? 0).toLocaleString('en-IN')}`} icon={TrendingUp} color="green" />
      </div>

      {/* Today's Appointments */}
      <Card>
        <Card.Header>
          <Card.Title>Today's Appointments</Card.Title>
          <span className="text-sm text-gray-400">{data?.recentAppointments?.length ?? 0} appointments</span>
        </Card.Header>
        {data?.recentAppointments?.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Calendar size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No appointments today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data?.recentAppointments?.map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-700 rounded-full h-9 w-9 flex items-center justify-center text-xs font-semibold">
                    {apt.patientName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{apt.patientName}</p>
                    <p className="text-xs text-gray-500">Dr. {apt.doctorName} · {apt.specialization}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{apt.appointmentTime}</span>
                  <Badge status={apt.status}>{apt.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
