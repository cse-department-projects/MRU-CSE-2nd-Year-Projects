import { useEffect, useState } from 'react';
import {
  BarChart3, TrendingUp, Users, Activity, DollarSign, PieChart as PieChartIcon,
  Calendar, Stethoscope
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

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const CustomTooltip = ({ active, payload, label, isCurrency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {isCurrency ? formatCurrency(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await analyticsService.getAdminAnalytics();
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

  const revenueData = (data?.monthlyRevenue || []).map(d => ({
    name: d.label,
    revenue: Number(d.value || 0),
  }));

  const appointmentData = (data?.monthlyAppointments || []).map(d => ({
    name: d.label,
    appointments: d.count,
  }));

  const statusData = (data?.appointmentStatusDistribution || []).map(d => ({
    name: d.label,
    value: d.count,
    fill: STATUS_COLORS[d.label] || '#6b7280',
  }));

  const genderData = (data?.genderDistribution || []).map((d, i) => ({
    name: d.label,
    value: d.count,
    fill: COLORS[i % COLORS.length],
  }));

  const ageData = (data?.ageGroupDistribution || []).map(d => ({
    name: d.label,
    patients: d.count,
  }));

  const deptRevenueData = (data?.revenueByDepartment || []).map(d => ({
    name: d.label,
    revenue: Number(d.value || 0),
  }));

  const dayOfWeekData = (data?.appointmentsByDayOfWeek || []).map(d => ({
    name: d.label,
    appointments: d.count,
  }));

  const paymentStatusData = (data?.paymentStatusDistribution || []).map((d, i) => ({
    name: d.label,
    value: d.count,
    fill: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'][i % 4],
  }));

  const topDoctorsData = (data?.topDoctorsByAppointments || []).map(d => ({
    name: d.label,
    completed: d.count,
  }));

  const registrationData = (data?.monthlyPatientRegistrations || []).map(d => ({
    name: d.label,
    registrations: d.count,
  }));

  const bloodGroupData = (data?.bloodGroupDistribution || []).map((d, i) => ({
    name: d.label,
    value: d.count,
    fill: COLORS[i % COLORS.length],
  }));

  const deptAppointmentData = (data?.appointmentsByDepartment || []).map(d => ({
    name: d.label,
    appointments: d.count,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl">
          <BarChart3 size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 text-sm">Hospital-wide insights and trends</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-100">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(data?.totalRevenue)}</p>
            </div>
            <DollarSign size={28} className="text-green-200 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100">This Month</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(data?.currentMonthRevenue)}</p>
            </div>
            <TrendingUp size={28} className="text-blue-200 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-violet-100">Total Appointments</p>
              <p className="text-2xl font-bold mt-1">
                {appointmentData.reduce((sum, d) => sum + (d.appointments || 0), 0)}
              </p>
            </div>
            <Calendar size={28} className="text-violet-200 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-100">Departments</p>
              <p className="text-2xl font-bold mt-1">{deptAppointmentData.length}</p>
            </div>
            <Stethoscope size={28} className="text-amber-200 opacity-80" />
          </div>
        </div>
      </div>

      {/* Revenue Trend */}
      <Card>
        <Card.Header>
          <Card.Title>Revenue Trend (Last 12 Months)</Card.Title>
          <TrendingUp size={18} className="text-green-500" />
        </Card.Header>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip isCurrency />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" fill="url(#revenueGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Appointment Trend + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title>Appointment Trend</Card.Title>
            <Activity size={18} className="text-blue-500" />
          </Card.Header>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="appointments" name="Appointments" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Appointment Status</Card.Title>
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

      {/* Revenue by Department + Appointments by Day */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>Revenue by Department</Card.Title>
          </Card.Header>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptRevenueData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip content={<CustomTooltip isCurrency />} />
                <Bar dataKey="revenue" name="Revenue" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Appointments by Day of Week</Card.Title>
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
      </div>

      {/* Demographics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>Gender Distribution</Card.Title>
            <Users size={18} className="text-violet-500" />
          </Card.Header>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {genderData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Age Group Distribution</Card.Title>
          </Card.Header>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="patients" name="Patients" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Blood Group Distribution</Card.Title>
          </Card.Header>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={bloodGroupData} cx="50%" cy="50%" outerRadius={80} paddingAngle={2} dataKey="value">
                  {bloodGroupData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Patient Registrations + Payment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>Patient Registrations</Card.Title>
          </Card.Header>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationData}>
                <defs>
                  <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="registrations" name="Registrations" stroke="#8b5cf6" fill="url(#regGrad)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Payment Status</Card.Title>
          </Card.Header>
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {paymentStatusData.map((entry, i) => (
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

      {/* Top Doctors + Dept Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <Card.Title>Top Doctors (by Completed Appointments)</Card.Title>
          </Card.Header>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDoctorsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Appointments by Department</Card.Title>
          </Card.Header>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptAppointmentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="appointments" name="Appointments" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
