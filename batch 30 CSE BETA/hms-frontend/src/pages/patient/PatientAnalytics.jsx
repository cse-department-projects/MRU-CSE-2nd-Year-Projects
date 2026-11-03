import { useEffect, useState } from 'react';
import {
  Activity, Calendar, DollarSign, Pill, TrendingUp, CheckCircle, Clock
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { analyticsService } from '../../services/analyticsService';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' && entry.name?.toLowerCase().includes('amount') || entry.name?.toLowerCase().includes('spending') ? `$${entry.value.toFixed(2)}` : entry.value}
        </p>
      ))}
    </div>
  );
};

export default function PatientAnalytics() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await analyticsService.getPatientAnalytics();
      setData(res.data.data);
    } catch {
      toast.error('Failed to load personal health analytics');
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

  if (!data) {
    return (
      <div className="text-center py-12">
        <Activity className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <p className="text-gray-500 font-medium">No personal analytics records found</p>
      </div>
    );
  }

  const visitsData = (data.monthlyVisits || []).map(d => ({
    month: d.label,
    visits: Number(d.value) || 0
  }));

  const spendingData = (data.monthlySpending || []).map(d => ({
    month: d.label,
    spending: Number(d.value) || 0
  }));

  const statusData = (data.visitStatusDistribution || []).map(d => ({
    name: d.label,
    count: Number(d.value) || 0
  }));

  const medsData = (data.topMedicinesPrescribed || []).map(d => ({
    name: d.label,
    count: Number(d.value) || 0
  }));

  const totalVisitsCount = visitsData.reduce((acc, curr) => acc + curr.visits, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Personal Health & Visit Trends</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your personal healthcare activity, appointment history, prescriptions, and medical spending overview
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Recorded Visits</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalVisitsCount}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Calendar size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Healthcare Spending</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                ${data.totalSpent ? Number(data.totalSpent).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <DollarSign size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-violet-500/10 via-transparent to-transparent border-violet-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Prescribed Medications</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{medsData.length}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <Pill size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Row 1: Monthly Visits and Healthcare Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-blue-600" size={20} />
            <h2 className="text-base font-semibold text-gray-900">Monthly Appointments & Visits</h2>
          </div>
          {visitsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={visitsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="visits" name="Visits" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-16 text-gray-400 text-sm">No appointment history recorded</p>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="text-emerald-600" size={20} />
            <h2 className="text-base font-semibold text-gray-900">Monthly Healthcare Spending ($)</h2>
          </div>
          {spendingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={spendingData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="spending" name="Spending ($)" stroke="#10b981" fill="url(#spendingGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-16 text-gray-400 text-sm">No billing records found</p>
          )}
        </Card>
      </div>

      {/* Row 2: Appointment Status Distribution & Medications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-violet-600" size={20} />
            <h2 className="text-base font-semibold text-gray-900">Appointment Status Breakdown</h2>
          </div>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={50}
                  paddingAngle={4}
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-16 text-gray-400 text-sm">No status data available</p>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Pill className="text-indigo-600" size={20} />
            <h2 className="text-base font-semibold text-gray-900">Most Frequently Prescribed Medications</h2>
          </div>
          {medsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={medsData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Times Prescribed" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-16 text-gray-400 text-sm">No prescription history recorded</p>
          )}
        </Card>
      </div>
    </div>
  );
}
