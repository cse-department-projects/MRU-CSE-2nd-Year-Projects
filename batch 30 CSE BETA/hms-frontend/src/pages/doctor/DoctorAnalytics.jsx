import { useEffect, useState } from 'react';
import {
  BarChart3, TrendingUp, Users, Activity, Award, Pill
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { analyticsService } from '../../services/analyticsService';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
const STATUS_COLORS = {
  COMPLETED: '#10b981',
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  CANCELLED: '#ef4444',
  NO_SHOW: '#6b7280',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export default function DoctorAnalytics() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await analyticsService.getDoctorAnalytics();
      setData(res.data.data);
    } catch {
      toast.error('Failed to load analytics');
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

  const appointmentData = (data?.monthlyAppointments || []).map(d => ({
    name: d.label,
    appointments: d.count,
  }));

  const statusData = (data?.appointmentStatusDistribution || []).map(d => ({
    name: d.label,
    value: d.count,
    fill: STATUS_COLORS[d.label] || '#6b7280',
  }));

  const dayOfWeekData = (data?.appointmentsByDayOfWeek || []).map(d => ({
    name: d.label,
    appointments: d.count,
  }));

  const topMedsData = (data?.topPrescribedMedicines || []).map(d => ({
    name: d.label,
    prescriptions: d.count,
  }));

  const diagnosesData = (data?.topDiagnoses || []).map(d => ({
    name: d.label,
    count: d.count,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl">
          <BarChart3 size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Analytics</h1>
          <p className="text-gray-500 text-sm">Your performance insights</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-100">Patients Served</p>
              <p className="text-2xl font-bold mt-1">{data?.totalPatientsServed ?? 0}</p>
            </div>
            <Users size={28} className="text-emerald-200 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100">Completion Rate</p>
              <p className="text-2xl font-bold mt-1">{data?.completionRate ?? 0}%</p>
            </div>
            <Award size={28} className="text-blue-200 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-violet-100">Medicines Prescribed</p>
              <p className="text-2xl font-bold mt-1">{topMedsData.length}</p>
              <p className="text-xs text-violet-200 mt-0.5">Unique medicines</p>
            </div>
            <Pill size={28} className="text-violet-200 opacity-80" />
          </div>
        </div>
      </div>

      {/* Appointment Trend + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title>My Appointment Trend</Card.Title>
            <Activity size={18} className="text-emerald-500" />
          </Card.Header>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={appointmentData}>
                <defs>
                  <linearGradient id="docApptGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="appointments" name="Appointments" stroke="#10b981" fill="url(#docApptGrad)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Status Breakdown</Card.Title>
          </Card.Header>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Busiest Day + Top Medicines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>Busiest Days</Card.Title>
          </Card.Header>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="appointments" name="Appointments" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Top Prescribed Medicines</Card.Title>
            <Pill size={18} className="text-violet-500" />
          </Card.Header>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topMedsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="prescriptions" name="Prescriptions" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Diagnoses */}
      {diagnosesData.length > 0 && (
        <Card>
          <Card.Header>
            <Card.Title>Common Diagnoses</Card.Title>
          </Card.Header>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diagnosesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={150} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Cases" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
