import { Boxes, ClipboardList, PackageCheck, Truck, Warehouse, Clock3, Gauge, AlertTriangle } from 'lucide-react';
import Badge from '../components/ui/Badge.jsx';
import Card from '../components/ui/Card.jsx';
import { DonutChart, LineChart, ProgressBars } from '../components/ui/Charts.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import Table from '../components/ui/Table.jsx';
import KpiCard from '../components/dashboard/KpiCard.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { analyticsService } from '../services/analyticsService.js';
import { orderService } from '../services/orderService.js';

const icons = [ClipboardList, Truck, PackageCheck, Clock3, Gauge, Truck, Warehouse, AlertTriangle];

export default function Dashboard() {
  const dashboard = useAsyncData(() => analyticsService.dashboard(), []);
  const orders = useAsyncData(() => orderService.list(), []);

  if (dashboard.loading || orders.loading) return <LoadingState title="Loading dashboard command center" />;
  if (dashboard.error || orders.error) return <ErrorState />;

  const recentColumns = [
    { key: 'orderId', label: 'Order ID' },
    { key: 'customer', label: 'Customer' },
    { key: 'origin', label: 'Origin' },
    { key: 'destination', label: 'Destination' },
    { key: 'status', label: 'Status', render: (row) => <Badge>{row.status}</Badge> },
    { key: 'vehicle', label: 'Vehicle' },
    { key: 'eta', label: 'ETA' },
    { key: 'actions', label: 'Actions', render: () => <button className="button secondary" type="button">View</button> },
  ];

  return (
    <>
      <PageHeader
        title="Logistics Command Center"
        description="A live operational view of orders, dispatch health, fleet capacity, warehouse stock, and delivery risks."
      />
      <div className="grid cols-4">
        {dashboard.data.kpis.map((kpi, index) => (
          <KpiCard key={kpi.label} icon={icons[index]} {...kpi} />
        ))}
      </div>
      <div className="grid cols-2" style={{ marginTop: 16 }}>
        <Card title="Shipment Performance" subtitle="Delivered, in transit, and delayed shipment trend">
          <LineChart data={dashboard.data.shipmentPerformance} />
          <div className="filters">
            <span className="badge success">Delivered</span>
            <span className="badge info">In Transit</span>
            <span className="badge warning">Delayed</span>
          </div>
        </Card>
        <Card title="Fleet Utilization" subtitle="Vehicle capacity currently assigned">
          <ProgressBars data={dashboard.data.fleetUtilization} />
        </Card>
      </div>
      <div className="grid cols-3" style={{ marginTop: 16 }}>
        <Card title="Delivery Status" subtitle="Operational split across active loads">
          <DonutChart data={dashboard.data.deliveryStatus} />
        </Card>
        <Card title="Warehouse Inventory" subtitle="Stock control snapshot">
          <div className="detail-list">
            <div className="detail-row">
              <span>Total inventory</span>
              <strong>{(dashboard.data.warehouseInventory?.totalStock ?? 0).toLocaleString()} units</strong>
            </div>
            <div className="detail-row">
              <span>Low stock items</span>
              <strong>{dashboard.data.warehouseInventory?.lowStockSkus ?? 0} SKUs</strong>
            </div>
            <div className="detail-row">
              <span>Out of stock</span>
              <strong>{dashboard.data.warehouseInventory?.outOfStockSkus ?? 0} SKUs</strong>
            </div>
            <div className="detail-row">
              <span>Recently received</span>
              <strong>{(dashboard.data.warehouseInventory?.recentlyReceived ?? 0).toLocaleString()} units</strong>
            </div>
          </div>
        </Card>
        <Card title="Operations Watch" subtitle="Priority issues">
          <div className="detail-list">
            <div className="detail-row">
              <span>Delayed corridors</span>
              <strong>{dashboard.data.operationsWatch?.delayedCorridors || 'None (Corridors clear)'}</strong>
            </div>
            <div className="detail-row">
              <span>Dispatch queue</span>
              <strong>{dashboard.data.operationsWatch?.dispatchQueue ?? 0} orders</strong>
            </div>
            <div className="detail-row">
              <span>Maintenance holds</span>
              <strong>{dashboard.data.operationsWatch?.maintenanceHolds ?? 0} vehicles</strong>
            </div>
            <div className="detail-row">
              <span>Capacity risk</span>
              <strong>{dashboard.data.operationsWatch?.capacityRisk || 'Nominal (< 80%)'}</strong>
            </div>
          </div>
        </Card>
      </div>
      <Card title="Recent Orders" subtitle="Latest order activity ready for operations review" className="" style={{ marginTop: 16 }}>
        <Table columns={recentColumns} rows={orders.data.slice(0, 6)} />
      </Card>
    </>
  );
}
