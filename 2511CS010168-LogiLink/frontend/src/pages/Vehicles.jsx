import { Link } from 'react-router-dom';
import { Gauge, Search, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';
import Badge from '../components/ui/Badge.jsx';
import Card from '../components/ui/Card.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { Input, Select } from '../components/ui/Input.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import Table from '../components/ui/Table.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { vehicleService } from '../services/vehicleService.js';

const statuses = ['All', 'Available', 'In Transit', 'Delayed', 'Maintenance', 'Idle', 'Offline'];

function statusVariant(status) {
  if (status === 'Available') return 'success';
  if (status === 'In Transit') return 'info';
  if (status === 'Delayed') return 'error';
  if (status === 'Maintenance') return 'warning';
  return 'neutral';
}

export default function Vehicles() {
  const { data, loading, error, reload } = useAsyncData(() => vehicleService.list(), []);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  const vehicles = Array.isArray(data) ? data : [];
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return vehicles.filter((vehicle) => {
      const matchesStatus = status === 'All' || vehicle.status === status;
      const searchable = [
        vehicle.vehicleId,
        vehicle.registration,
        vehicle.type,
        vehicle.driver,
        vehicle.location,
        vehicle.route,
      ].join(' ').toLowerCase();
      return matchesStatus && (!query || searchable.includes(query));
    });
  }, [vehicles, search, status]);

  const columns = [
    {
      key: 'vehicleId',
      label: 'Vehicle ID',
      render: (vehicle) => <Link to={`/vehicles/${vehicle.id || vehicle.vehicleId}`} style={{ fontWeight: 600 }}>{vehicle.vehicleId}</Link>,
    },
    { key: 'registration', label: 'Registration' },
    { key: 'type', label: 'Type' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'currentLoad', label: 'Current Load', render: (vehicle) => `${vehicle.currentLoad || 0}%` },
    { key: 'driver', label: 'Assigned Driver' },
    { key: 'route', label: 'Current Route' },
    { key: 'location', label: 'Location' },
    { key: 'status', label: 'Status', render: (vehicle) => <Badge variant={statusVariant(vehicle.status)}>{vehicle.status}</Badge> },
    {
      key: 'actions',
      label: 'Actions',
      render: (vehicle) => <Link className="button secondary" to={`/vehicles/${vehicle.id || vehicle.vehicleId}`}>View</Link>,
    },
  ];

  if (loading) return <LoadingState title="Loading vehicle registry" />;
  if (error) {
    return (
      <EmptyState
        title="Unable to load vehicles"
        description={error.message || 'The vehicle registry could not be loaded.'}
        action={<button className="button primary" type="button" onClick={reload}>Retry</button>}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Vehicle Registry"
        description="Review the registered transport assets, assignments, capacity, and operational availability."
        actions={<Link className="button primary" to="/fleet"><Truck size={16} /> Manage Fleet</Link>}
      />
      <Card title="Registered Vehicles" subtitle={`${filtered.length} of ${vehicles.length} vehicles`}>
        <div className="toolbar">
          <div style={{ position: 'relative', minWidth: 260 }}>
            <Search size={17} style={{ position: 'absolute', left: 12, top: 12, color: '#6b7280' }} />
            <Input
              style={{ paddingLeft: 38 }}
              placeholder="Search vehicles, registration, driver..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter vehicles by status">
            {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
        </div>
        <Table
          columns={columns}
          rows={filtered}
          emptyTitle="No vehicles match the current filters"
          emptyDescription="Adjust the search or status filter, or register a vehicle from Fleet Management."
        />
      </Card>
    </>
  );
}
