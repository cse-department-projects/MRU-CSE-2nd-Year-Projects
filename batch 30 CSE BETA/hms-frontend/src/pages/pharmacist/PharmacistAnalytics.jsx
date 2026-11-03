import { useEffect, useState } from 'react';
import {
  Pill, AlertTriangle, DollarSign, Package, PieChart as PieChartIcon,
  TrendingUp, BarChart3, Clock
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { analyticsService } from '../../services/analyticsService';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#84cc16'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {entry.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function PharmacistAnalytics() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await analyticsService.getPharmacistAnalytics();
      setData(res.data.data);
    } catch {
      toast.error('Failed to load pharmacy analytics');
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
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <p className="text-gray-500 font-medium">No analytics data available</p>
      </div>
    );
  }

  const categoryData = (data.categoryDistribution || []).map(d => ({
    name: d.label,
    count: Number(d.value) || 0
  }));

  const stockLevelsData = (data.stockLevelsByCategory || []).map(d => ({
    name: d.label,
    units: Number(d.value) || 0
  }));

  const topConsumedData = (data.topConsumedMedicines || []).map(d => ({
    name: d.label,
    prescriptions: Number(d.value) || 0
  }));

  const expiryData = (data.expiryForecast || []).map(d => ({
    name: d.label,
    count: Number(d.value) || 0
  }));

  const dosageData = (data.dosageFormDistribution || []).map(d => ({
    name: d.label,
    count: Number(d.value) || 0
  }));

  const totalMedicines = categoryData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pharmacy & Inventory Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">
          Stock levels, medication consumption trends, category breakdowns, and expiry forecasts
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Inventory Value</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                ${data.totalInventoryValue ? Number(data.totalInventoryValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <DollarSign size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Medicines Listed</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalMedicines}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Package size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categories</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{categoryData.length}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <PieChartIcon size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Top Consumed Types</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{topConsumedData.length}</h3>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Pill size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Row 1: Stock Levels and Expiry Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="text-blue-600" size={20} />
            <h2 className="text-base font-semibold text-gray-900">Stock Levels by Category</h2>
          </div>
          {stockLevelsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockLevelsData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="units" name="Units in Stock" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-16 text-gray-400 text-sm">No stock data available</p>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-amber-600" size={20} />
            <h2 className="text-base font-semibold text-gray-900">Expiry Forecast (Upcoming)</h2>
          </div>
          {expiryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expiryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Expiring Batches" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-16 text-gray-400 text-sm">No expiring stock recorded</p>
          )}
        </Card>
      </div>

      {/* Row 2: Top Prescribed / Consumed Medicines & Category Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-emerald-600" size={20} />
            <h2 className="text-base font-semibold text-gray-900">Most Prescribed Medicines (Demand)</h2>
          </div>
          {topConsumedData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topConsumedData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={120} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="prescriptions" name="Prescriptions Dispensed" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-16 text-gray-400 text-sm">No consumption records available</p>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="text-purple-600" size={20} />
            <h2 className="text-base font-semibold text-gray-900">Dosage Form Distribution</h2>
          </div>
          {dosageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dosageData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={50}
                  paddingAngle={3}
                >
                  {dosageData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-16 text-gray-400 text-sm">No dosage forms available</p>
          )}
        </Card>
      </div>
    </div>
  );
}
