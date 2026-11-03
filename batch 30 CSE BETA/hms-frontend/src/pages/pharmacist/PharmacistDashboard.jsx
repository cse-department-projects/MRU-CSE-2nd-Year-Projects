import { useEffect, useState } from 'react';
import { Pill, AlertTriangle, Calendar, Plus, RefreshCw } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { medicineService } from '../../services/medicineService';
import StatCard from '../../components/shared/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function PharmacistDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStock, setIsUpdatingStock] = useState({});

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await dashboardService.getPharmacistDashboard();
      setData(res.data.data);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAddStock = async (medicineId, currentQty) => {
    setIsUpdatingStock(prev => ({ ...prev, [medicineId]: true }));
    try {
      await medicineService.updateStock(medicineId, 50); // Add 50 units
      toast.success('Added 50 units to stock');
      // Reload dashboard data
      const res = await dashboardService.getPharmacistDashboard();
      setData(res.data.data);
    } catch {
      toast.error('Failed to update stock');
    } finally {
      setIsUpdatingStock(prev => ({ ...prev, [medicineId]: false }));
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pharmacy Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <Button onClick={loadDashboard} variant="secondary" size="sm">
          <RefreshCw size={16} className="mr-1.5" /> Refresh
        </Button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Medicines" value={data?.totalMedicines ?? 0} icon={Pill} color="blue" />
        <StatCard title="Low Stock Alerts" value={data?.lowStockMedicines ?? 0} icon={AlertTriangle} color="amber" subtitle="Needs replenishment" />
        <StatCard title="Expiring (30 Days)" value={data?.expiringMedicines ?? 0} icon={Calendar} color="red" subtitle="Requires attention" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Replenish Panel */}
        <Card>
          <Card.Header>
            <Card.Title>Low Stock Alerts</Card.Title>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
              Action Required
            </span>
          </Card.Header>
          {data?.recentLowStockMedicines?.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Pill size={36} className="mx-auto mb-2 opacity-30 text-green-500" />
              <p className="text-sm">All medicine stock levels are sufficient!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data?.recentLowStockMedicines?.map((med) => (
                <div key={med.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{med.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Current: <span className="font-semibold text-amber-600">{med.quantity}</span> / Threshold: {med.lowStockThreshold}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleQuickAddStock(med.id, med.quantity)}
                    isLoading={isUpdatingStock[med.id]}
                  >
                    <Plus size={14} className="mr-1" /> Add 50
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Info card / quick stats */}
        <Card>
          <Card.Header>
            <Card.Title>Pharmacy Operations Quick Guide</Card.Title>
          </Card.Header>
          <div className="space-y-4 text-sm text-gray-600">
            <p>
              Welcome to the Hospital Management System Pharmacy module. Here you can supervise the active drug and medicine inventory, track expiry timelines, and fulfill orders.
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-blue-800 text-xs">
              <p className="font-semibold mb-1">💡 Inventory replenishment tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Low Stock threshold defaults to 10 units but can be customized per medicine.</li>
                <li>Make sure to deactivate medicines that are no longer supported.</li>
                <li>Always confirm batch numbers and manufacturer names when updating inventory.</li>
              </ul>
            </div>
            <p className="text-xs text-gray-400">
              For system role permissions support or queries, contact the system administrator at admin@hms.com.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
