import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, Clock, FileText } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import StatCard from '../../components/shared/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function DoctorDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardService.getDoctorDashboard()
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Patients" value={data?.todaysPatients ?? 0} icon={Calendar} color="blue" />
        <StatCard title="Completed" value={data?.completedAppointments ?? 0} icon={CheckCircle} color="green" />
        <StatCard title="Pending" value={data?.pendingAppointments ?? 0} icon={Clock} color="amber" />
        <StatCard title="Prescriptions" value={data?.totalPrescriptions ?? 0} icon={FileText} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>Today's Schedule</Card.Title>
            <span className="text-sm text-gray-400">{data?.todaysAppointments?.length ?? 0}</span>
          </Card.Header>
          {data?.todaysAppointments?.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Calendar size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No appointments today</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data?.todaysAppointments?.map(apt => (
                <div key={apt.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{apt.patientName}</p>
                    <p className="text-xs text-gray-500">{apt.reason?.substring(0, 50)}...</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500">{apt.appointmentTime}</span>
                    <Badge status={apt.status}>{apt.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Upcoming Appointments</Card.Title>
          </Card.Header>
          {data?.upcomingAppointments?.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Clock size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data?.upcomingAppointments?.slice(0, 5).map(apt => (
                <div key={apt.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{apt.patientName}</p>
                    <p className="text-xs text-gray-500">{apt.appointmentDate ? format(new Date(apt.appointmentDate), 'MMM d') : ''} · {apt.appointmentTime}</p>
                  </div>
                  <Badge status={apt.status}>{apt.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
