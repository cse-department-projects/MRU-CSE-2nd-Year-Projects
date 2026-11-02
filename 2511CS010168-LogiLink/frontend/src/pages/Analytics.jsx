import { BarChart3, Clock3, Fuel, Gauge, PackageCheck, Truck, Warehouse } from 'lucide-react';
import Card from '../components/ui/Card.jsx';
import { ProgressBars } from '../components/ui/Charts.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import KpiCard from '../components/dashboard/KpiCard.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { analyticsService } from '../services/analyticsService.js';

function MetricGroup({ title, items, icon: Icon }) {
  if (!items || items.length === 0) return null;
  return (
    <Card title={title}>
      <div className="grid cols-2">
        {items.map((item) => (
          <KpiCard
            key={item.label}
            icon={Icon}
            label={item.label}
            value={item.value}
            trend={item.trend}
            support="current period"
          />
        ))}
      </div>
    </Card>
  );
}

export default function Analytics() {
  const { data, loading, error } = useAsyncData(() => analyticsService.analytics(), []);
  if (loading) return <LoadingState title="Loading analytics" />;
  if (error || !data) return <ErrorState message="Unable to load operational analytics." />;

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Operational intelligence across transportation, fleet, warehouse, and dispatch performance."
      />
      <div className="grid">
        <MetricGroup title="Transportation Analytics" items={data.transportation || []} icon={PackageCheck} />
        <div className="grid cols-2">
          <MetricGroup title="Fleet Analytics" items={data.fleet || []} icon={Truck} />
          <MetricGroup title="Warehouse Analytics" items={data.warehouse || []} icon={Warehouse} />
        </div>
        <MetricGroup title="Operational Analytics" items={data.operations || []} icon={BarChart3} />
        <div className="grid cols-3">
          <Card title="Route Efficiency Trend" subtitle="Corridor performance">
            {data.routeEfficiency && data.routeEfficiency.length > 0 ? (
              <ProgressBars data={data.routeEfficiency} />
            ) : (
              <p style={{ padding: '16px 0', color: '#6b7280', fontSize: '13px' }}>No active route data for this organization.</p>
            )}
          </Card>
          <Card title="Fleet by Vehicle Type" subtitle="Capacity utilization">
            {data.fleetByType && data.fleetByType.length > 0 ? (
              <ProgressBars data={data.fleetByType} />
            ) : (
              <p style={{ padding: '16px 0', color: '#6b7280', fontSize: '13px' }}>No vehicles registered for this organization.</p>
            )}
          </Card>
          <Card title="Dispatch Health" subtitle="Operational distribution">
            {data.dispatchHealth && data.dispatchHealth.length > 0 ? (
              <ProgressBars data={data.dispatchHealth} />
            ) : (
              <p style={{ padding: '16px 0', color: '#6b7280', fontSize: '13px' }}>No dispatch activity recorded yet.</p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
