import { Link } from 'react-router-dom';
import {
  MapPinned,
  WandSparkles,
  Plus,
  Search,
  Truck,
  User,
  ArrowRight,
  Clock,
  Fuel,
  Edit3,
  Trash2,
  CheckCircle2,
  Navigation,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { Field, Input, Select } from '../components/ui/Input.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import Modal from '../components/ui/Modal.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import Table from '../components/ui/Table.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import KpiCard from '../components/dashboard/KpiCard.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { routeService } from '../services/routeService.js';
import { vehicleService } from '../services/vehicleService.js';
import { driverService } from '../services/driverService.js';
import InteractiveMap from '../components/map/InteractiveMap.jsx';
import LocationSearchInput from '../components/map/LocationSearchInput.jsx';

const statusTabs = ['All', 'Active', 'Scheduled', 'Delayed', 'Completed', 'Inactive'];
const statusList = ['Active', 'Scheduled', 'Delayed', 'Completed', 'Inactive'];

export default function RoutesPage() {
  const { notify } = useApp();
  const { data, loading, setData } = useAsyncData(() => routeService.list(), []);

  // Filter & Search & Pagination
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);

  // Optimizer state
  const [planOrigin, setPlanOrigin] = useState('Hyderabad');
  const [planOriginGeo, setPlanOriginGeo] = useState({ name: 'Hyderabad', lat: 17.3850, lng: 78.4867 });
  const [planDestination, setPlanDestination] = useState('Vijayawada');
  const [planDestGeo, setPlanDestGeo] = useState({ name: 'Vijayawada', lat: 16.5062, lng: 80.6480 });
  const [planStops, setPlanStops] = useState('Suryapet, Nandigama');
  const [planVehicle, setPlanVehicle] = useState('Unassigned');
  const [result, setResult] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [activeViewRoute, setActiveViewRoute] = useState(null);

  // Vehicles & Drivers lists for dropdowns
  const [vehiclesList, setVehiclesList] = useState([]);
  const [driversList, setDriversList] = useState([]);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailModalRow, setDetailModalRow] = useState(null);
  const [editModalRow, setEditModalRow] = useState(null);
  const [statusModalRow, setStatusModalRow] = useState(null);
  const [deleteModalRow, setDeleteModalRow] = useState(null);

  // Form states (Modal)
  const [formId, setFormId] = useState('');
  const [formOrigin, setFormOrigin] = useState('');
  const [formOriginGeo, setFormOriginGeo] = useState(null);
  const [formDestination, setFormDestination] = useState('');
  const [formDestGeo, setFormDestGeo] = useState(null);
  const [formStops, setFormStops] = useState('');
  const [formDistance, setFormDistance] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formFuel, setFormFuel] = useState('');
  const [formStatus, setFormStatus] = useState('Active');
  const [formVehicle, setFormVehicle] = useState('Unassigned');
  const [formDriver, setFormDriver] = useState('Unassigned');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status Modal State
  const [newStatus, setNewStatus] = useState('Active');

  useEffect(() => {
    vehicleService.list().then((res) => setVehiclesList(res || [])).catch(() => setVehiclesList([]));
    driverService.list().then((res) => setDriversList(res || [])).catch(() => setDriversList([]));
  }, []);

  const handleOptimize = async () => {
    if (!planOrigin.trim() || !planDestination.trim()) {
      notify('Please enter both Origin and Destination.', 'error');
      return;
    }
    setOptimizing(true);
    setActiveViewRoute(null);
    try {
      const opt = await routeService.optimizeGeo({
        origin: planOrigin.trim(),
        originLat: planOriginGeo?.lat,
        originLng: planOriginGeo?.lng,
        destination: planDestination.trim(),
        destinationLat: planDestGeo?.lat,
        destinationLng: planDestGeo?.lng,
        stops: planStops.trim(),
        vehicle: planVehicle !== 'Unassigned' ? planVehicle : undefined,
      });
      setResult(opt);
      notify(`Route calculated: ${opt.distance} (${opt.estimatedTime})`);
    } catch (err) {
      notify(err.message || 'Failed to calculate route geometry.', 'error');
    } finally {
      setOptimizing(false);
    }
  };

  const handleSaveOptimizedAsRoute = async () => {
    if (!result) return;
    setIsSubmitting(true);
    try {
      const originLat = result.waypoints?.[0]?.latitude ?? planOriginGeo?.lat;
      const originLng = result.waypoints?.[0]?.longitude ?? planOriginGeo?.lng;
      const destLat = (result.waypoints && result.waypoints.length > 1)
        ? result.waypoints[result.waypoints.length - 1]?.latitude
        : planDestGeo?.lat;
      const destLng = (result.waypoints && result.waypoints.length > 1)
        ? result.waypoints[result.waypoints.length - 1]?.longitude
        : planDestGeo?.lng;

      const payload = {
        origin: result.origin || planOrigin,
        originLat,
        originLng,
        destination: result.destination || planDestination,
        destinationLat: destLat,
        destinationLng: destLng,
        stops: result.stops || planStops,
        stopsData: JSON.stringify(result.waypoints || []),
        routeGeometry: JSON.stringify(result.geometry || []),
        optimizedOrder: JSON.stringify(result.optimizedOrder || []),
        distance: result.optimized?.distance || result.distance || '275 km',
        estimatedTime: result.optimized?.time || result.estimatedTime || '4h 00m',
        fuelEstimate: result.optimized?.fuel || result.fuelEstimate || '65 L',
        vehicle: planVehicle !== 'Unassigned' ? planVehicle : undefined,
        status: 'Active',
      };
      const created = await routeService.create(payload);
      setData([created, ...(data || [])]);
      notify(`Optimized route ${created.routeId} saved to register.`);
    } catch (err) {
      notify(err.message || 'Failed to save route.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mapOrigin = useMemo(() => {
    if (activeViewRoute?.originLat != null && activeViewRoute?.originLng != null) {
      return { name: activeViewRoute.origin, lat: activeViewRoute.originLat, lng: activeViewRoute.originLng };
    }
    if (result?.waypoints?.[0]) {
      return { name: result.origin, lat: result.waypoints[0].latitude, lng: result.waypoints[0].longitude };
    }
    return planOriginGeo || { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 };
  }, [activeViewRoute, result, planOriginGeo]);

  const mapDestination = useMemo(() => {
    if (activeViewRoute?.destinationLat != null && activeViewRoute?.destinationLng != null) {
      return { name: activeViewRoute.destination, lat: activeViewRoute.destinationLat, lng: activeViewRoute.destinationLng };
    }
    if (result?.waypoints && result.waypoints.length > 1) {
      const last = result.waypoints[result.waypoints.length - 1];
      return { name: result.destination, lat: last.latitude, lng: last.longitude };
    }
    return planDestGeo || { name: 'Vijayawada', lat: 16.5062, lng: 80.6480 };
  }, [activeViewRoute, result, planDestGeo]);

  const mapStops = useMemo(() => {
    if (activeViewRoute?.stopsData) {
      try {
        const parsed = typeof activeViewRoute.stopsData === 'string' ? JSON.parse(activeViewRoute.stopsData) : activeViewRoute.stopsData;
        if (Array.isArray(parsed) && parsed.length > 2) {
          return parsed.slice(1, -1).map((s, idx) => ({
            name: s.name || `Waypoint ${idx + 1}`,
            lat: s.latitude,
            lng: s.longitude,
            number: idx + 1
          }));
        }
      } catch (e) {}
    }
    if (result?.waypoints && result.waypoints.length > 2) {
      return result.waypoints.slice(1, -1).map((s, idx) => ({
        name: s.name || `Waypoint ${idx + 1}`,
        lat: s.latitude,
        lng: s.longitude,
        number: idx + 1
      }));
    }
    return [];
  }, [activeViewRoute, result]);

  const mapGeometry = useMemo(() => {
    if (activeViewRoute?.routeGeometry) {
      return activeViewRoute.routeGeometry;
    }
    if (result?.geometry) {
      return result.geometry;
    }
    return null;
  }, [activeViewRoute, result]);

  const openCreateModal = () => {
    setFormId('');
    setFormOrigin('');
    setFormDestination('');
    setFormStops('');
    setFormDistance('280 km');
    setFormTime('5h 15m');
    setFormFuel('75 L');
    setFormStatus('Active');
    setFormVehicle('Unassigned');
    setFormDriver('Unassigned');
    setFormError('');
    setIsCreateOpen(true);
  };

  const handleCreateRoute = async () => {
    if (!formOrigin.trim() || !formDestination.trim()) {
      setFormError('Origin and Destination are required.');
      return;
    }
    setIsSubmitting(true);
    setFormError('');
    try {
      const payload = {
        routeId: formId.trim() || undefined,
        origin: formOrigin.trim(),
        destination: formDestination.trim(),
        stops: formStops.trim(),
        distance: formDistance.trim() || '250 km',
        estimatedTime: formTime.trim() || '4h 30m',
        fuelEstimate: formFuel.trim() || '65 L',
        status: formStatus,
        vehicle: formVehicle !== 'Unassigned' ? formVehicle : undefined,
        driver: formDriver !== 'Unassigned' ? formDriver : undefined,
      };
      const created = await routeService.create(payload);
      setData([created, ...(data || [])]);
      notify(`Route ${created.routeId} created successfully.`);
      setIsCreateOpen(false);
    } catch (err) {
      setFormError(err.message || 'Failed to create route.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (row) => {
    setEditModalRow(row);
    setFormOrigin(row.origin || '');
    setFormDestination(row.destination || '');
    setFormStops(row.stops || '');
    setFormDistance(row.distance || '');
    setFormTime(row.time || row.estimatedTime || '');
    setFormFuel(row.fuel || row.fuelEstimate || '');
    setFormStatus(row.status || 'Active');
    setFormVehicle(row.vehicle || 'Unassigned');
    setFormDriver(row.driverId || row.driver || 'Unassigned');
    setFormError('');
  };

  const handleSaveEdit = async () => {
    if (!editModalRow) return;
    if (!formOrigin.trim() || !formDestination.trim()) {
      setFormError('Origin and Destination are required.');
      return;
    }
    setIsSubmitting(true);
    setFormError('');
    try {
      const payload = {
        origin: formOrigin.trim(),
        destination: formDestination.trim(),
        stops: formStops.trim(),
        distance: formDistance.trim(),
        estimatedTime: formTime.trim(),
        fuelEstimate: formFuel.trim(),
        status: formStatus,
        vehicle: formVehicle !== 'Unassigned' ? formVehicle : 'Unassigned',
        driver: formDriver !== 'Unassigned' ? formDriver : 'Unassigned',
      };
      const updated = await routeService.update(editModalRow.id, payload);
      setData((data || []).map((r) => (r.id === editModalRow.id ? { ...r, ...updated } : r)));
      notify(`Route ${updated.routeId} updated successfully.`);
      setEditModalRow(null);
    } catch (err) {
      setFormError(err.message || 'Failed to update route.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openStatusModal = (row) => {
    setStatusModalRow(row);
    setNewStatus(row.status || 'Active');
  };

  const handleStatusUpdate = async () => {
    if (!statusModalRow) return;
    setIsSubmitting(true);
    try {
      const updated = await routeService.updateStatus(statusModalRow.id, { status: newStatus });
      setData((data || []).map((r) => (r.id === statusModalRow.id ? { ...r, ...updated } : r)));
      notify(`Route ${statusModalRow.routeId} status set to ${newStatus}.`);
      setStatusModalRow(null);
    } catch (err) {
      notify(err.message || 'Failed to update route status.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoute = async () => {
    if (!deleteModalRow) return;
    setIsSubmitting(true);
    try {
      await routeService.delete(deleteModalRow.id);
      setData((data || []).filter((r) => r.id !== deleteModalRow.id));
      notify(`Route ${deleteModalRow.routeId} deleted successfully.`);
      setDeleteModalRow(null);
    } catch (err) {
      notify(err.message || 'Failed to delete route.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    let list = data || [];
    if (status !== 'All') {
      list = list.filter((r) => (r.status || '').toLowerCase() === status.toLowerCase());
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          (r.routeId || '').toLowerCase().includes(q) ||
          (r.origin || '').toLowerCase().includes(q) ||
          (r.destination || '').toLowerCase().includes(q) ||
          (r.stops || '').toLowerCase().includes(q) ||
          (r.vehicle || '').toLowerCase().includes(q) ||
          (r.driver || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, status, search]);

  const kpis = useMemo(() => {
    const list = data || [];
    const total = list.length;
    const active = list.filter((r) => (r.status || '').toLowerCase() === 'active').length;
    const scheduled = list.filter((r) => (r.status || '').toLowerCase() === 'scheduled').length;
    const delayed = list.filter((r) => (r.status || '').toLowerCase() === 'delayed').length;
    return { total, active, scheduled, delayed };
  }, [data]);

  const pageSize = 8;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  if (loading) return <LoadingState title="Loading routes" />;

  const getStatusVariant = (st) => {
    const s = (st || '').toLowerCase();
    if (s === 'active') return 'success';
    if (s === 'delayed') return 'error';
    if (s === 'scheduled') return 'info';
    if (s === 'completed') return 'neutral';
    return 'warning';
  };

  const columns = [
    {
      key: 'routeId',
      label: 'Route ID',
      render: (row) => <strong style={{ color: 'var(--primary)' }}>{row.routeId || row.id}</strong>,
    },
    {
      key: 'path',
      label: 'Origin → Destination',
      render: (row) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
            <span>{row.origin}</span>
            <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
            <span>{row.destination}</span>
          </div>
          {row.stops && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Via: {row.stops}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'vehicle',
      label: 'Vehicle',
      render: (row) => {
        if (!row.vehicle || row.vehicle === 'Unassigned') {
          return <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>;
        }
        return (
          <Link to={`/fleet/${row.vehicle}`} style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>
            {row.vehicle}
          </Link>
        );
      },
    },
    {
      key: 'driver',
      label: 'Driver',
      render: (row) => {
        if (!row.driver || row.driver === 'Unassigned') {
          return <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>;
        }
        return (
          <span style={{ fontWeight: 500 }}>
            {row.driverId ? (
              <Link to={`/drivers/${row.driverId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                {row.driver}
              </Link>
            ) : (
              row.driver
            )}
          </span>
        );
      },
    },
    {
      key: 'distance',
      label: 'Distance & Time',
      render: (row) => (
        <span style={{ fontSize: '0.85rem' }}>
          {row.distance || '—'} • {row.time || row.estimatedTime || '—'}
        </span>
      ),
    },
    {
      key: 'fuel',
      label: 'Fuel Est.',
      render: (row) => <span>{row.fuel || row.fuelEstimate || '—'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant={getStatusVariant(row.status)}>{row.status || 'Active'}</Badge>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setDetailModalRow(row);
              setActiveViewRoute(row);
            }}
            title="View details"
          >
            <Eye size={15} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => openStatusModal(row)} title="Update status">
            Status
          </Button>
          <Button size="sm" variant="ghost" onClick={() => openEditModal(row)} title="Edit route">
            <Edit3 size={15} />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDeleteModalRow(row)} title="Delete route" style={{ color: '#ef4444' }}>
            <Trash2 size={15} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Route Optimization & Dispatch"
        description="Plan distribution paths, analyze AI fuel/time savings, and manage fleet route assignments."
        actions={
          <Button icon={Plus} onClick={openCreateModal}>
            Add Route
          </Button>
        }
      />

      {/* KPI Overview */}
      <div className="grid cols-4" style={{ marginBottom: '1.5rem' }}>
        <KpiCard icon={Navigation} label="Total Routes" value={kpis.total} trend={`${kpis.total}`} support="registered" />
        <KpiCard icon={CheckCircle2} label="Active Routes" value={kpis.active} trend={`${kpis.active}`} trendDirection="up" support="in progress" />
        <KpiCard icon={Clock} label="Scheduled" value={kpis.scheduled} trend={`${kpis.scheduled}`} trendDirection="neutral" support="upcoming" />
        <KpiCard icon={AlertTriangle} label="Delayed / Congested" value={kpis.delayed} trend={`${kpis.delayed}`} trendDirection="down" support="requires attention" />
      </div>

      {/* Route Planner & Canvas */}
      <div className="grid cols-2" style={{ marginBottom: '1.5rem' }}>
        <Card title="Plan & Optimize Route">
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <Field label="Origin Hub">
              <LocationSearchInput
                value={planOrigin}
                onChange={(val) => {
                  setPlanOrigin(val);
                  setPlanOriginGeo(null);
                }}
                onSelect={(item) => {
                  if (item) {
                    setPlanOrigin(item.name);
                    setPlanOriginGeo({ name: item.name, lat: item.latitude, lng: item.longitude });
                  }
                }}
                placeholder="Search origin city, hub, warehouse..."
              />
            </Field>
            <Field label="Destination Hub">
              <LocationSearchInput
                value={planDestination}
                onChange={(val) => {
                  setPlanDestination(val);
                  setPlanDestGeo(null);
                }}
                onSelect={(item) => {
                  if (item) {
                    setPlanDestination(item.name);
                    setPlanDestGeo({ name: item.name, lat: item.latitude, lng: item.longitude });
                  }
                }}
                placeholder="Search destination city, hub, warehouse..."
              />
            </Field>
            <Field label="Intermediate Stops">
              <Input value={planStops} onChange={(e) => setPlanStops(e.target.value)} placeholder="e.g. Suryapet, Nandigama (comma-separated)" />
            </Field>
            <Field label="Assign Vehicle">
              <Select value={planVehicle} onChange={(e) => setPlanVehicle(e.target.value)}>
                <option value="Unassigned">Unassigned</option>
                {vehiclesList.map((v) => (
                  <option key={v.id || v.vehicleId} value={v.vehicleId}>
                    {v.vehicleId} ({v.type})
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Button onClick={handleOptimize} disabled={optimizing}>
              <WandSparkles size={16} /> {optimizing ? 'Calculating Optimum Road Path...' : 'Optimize Route'}
            </Button>
            {result && (
              <Button variant="secondary" onClick={handleSaveOptimizedAsRoute} disabled={isSubmitting}>
                Save as Planned Route
              </Button>
            )}
            {activeViewRoute && (
              <Button variant="ghost" onClick={() => setActiveViewRoute(null)}>
                Clear Route View
              </Button>
            )}
          </div>
        </Card>

        <Card title="Route Canvas & Geography" subtitle="Interactive corridor GIS road geometry, waypoints, and dispatch nodes">
          <div style={{ position: 'relative', width: '100%', minHeight: 320 }}>
            <InteractiveMap
              origin={mapOrigin}
              destination={mapDestination}
              stops={mapStops}
              routeGeometry={mapGeometry}
              height="320px"
            />
            <div style={{ position: 'absolute', bottom: '12px', left: '16px', zIndex: 1000, background: 'rgba(15,23,42,0.88)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', color: '#94a3b8', pointerEvents: 'none', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
              Corridor: <strong style={{ color: '#fff' }}>{mapOrigin?.name || planOrigin} → {mapDestination?.name || planDestination}</strong>
              {result?.distance && <span style={{ marginLeft: 8, color: '#38bdf8' }}>• {result.distance}</span>}
              {result?.estimatedTime && <span style={{ marginLeft: 8, color: '#a7f3d0' }}>• {result.estimatedTime}</span>}
            </div>
          </div>
        </Card>
      </div>

      {result && (
        <div className="grid cols-3 route-results" style={{ marginBottom: '1.5rem' }}>
          <Card title="Standard Direct Route">
            <h3 style={{ color: 'var(--text-main)', margin: '0.5rem 0' }}>{result.original.distance}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{result.original.time} • Est. Fuel: {result.original.fuel}</p>
          </Card>
          <Card title="Optimized AI Route">
            <h3 style={{ color: '#16a34a', margin: '0.5rem 0' }}>{result.optimized.distance}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{result.optimized.time} • Est. Fuel: {result.optimized.fuel}</p>
          </Card>
          <Card title="Estimated Savings">
            <h3 style={{ color: '#2563eb', margin: '0.5rem 0' }}>{result.savings.distance} saved</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{result.savings.time} quicker • {result.savings.fuel} fuel saved</p>
          </Card>
        </div>
      )}

      {/* Route Register Table */}
      <Card title="Route Register">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '280px', flex: '1 1 300px' }}>
            <Input
              icon={Search}
              placeholder="Search by route ID, origin, destination, vehicle, driver..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Tabs
            tabs={statusTabs}
            active={status}
            onChange={(val) => {
              setStatus(val);
              setPage(1);
            }}
          />
        </div>

        {filtered.length === 0 ? (
          (data || []).length === 0 ? (
            <EmptyState
              title="No routes registered"
              description="Get started by creating your first distribution route or saving an optimized corridor."
              action={
                <Button icon={Plus} onClick={openCreateModal}>
                  Add Route
                </Button>
              }
            />
          ) : (
            <EmptyState
              title="No routes match filter"
              description="Try adjusting your search keywords or status filter."
            />
          )
        ) : (
          <>
            <Table columns={columns} rows={paginated} />
            <div style={{ marginTop: '1rem' }}>
              <Pagination page={page} totalPages={Math.ceil(filtered.length / pageSize)} onPageChange={setPage} />
            </div>
          </>
        )}
      </Card>

      {/* Create Route Modal */}
      <Modal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Register New Route">
        {formError && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.875rem' }}>
            {formError}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Field label="Route Code (Optional, auto-generated if blank)">
            <Input placeholder="e.g. RTE-9025" value={formId} onChange={(e) => setFormId(e.target.value)} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Origin Hub *">
              <Input placeholder="e.g. Hyderabad" value={formOrigin} onChange={(e) => setFormOrigin(e.target.value)} />
            </Field>
            <Field label="Destination Hub *">
              <Input placeholder="e.g. Vijayawada" value={formDestination} onChange={(e) => setFormDestination(e.target.value)} />
            </Field>
          </div>
          <Field label="Intermediate Stops (comma-separated)">
            <Input placeholder="e.g. Suryapet, Nandigama" value={formStops} onChange={(e) => setFormStops(e.target.value)} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <Field label="Distance">
              <Input placeholder="e.g. 276 km" value={formDistance} onChange={(e) => setFormDistance(e.target.value)} />
            </Field>
            <Field label="Est. Duration">
              <Input placeholder="e.g. 5h 05m" value={formTime} onChange={(e) => setFormTime(e.target.value)} />
            </Field>
            <Field label="Fuel Estimate">
              <Input placeholder="e.g. 74 L" value={formFuel} onChange={(e) => setFormFuel(e.target.value)} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Assigned Vehicle">
              <Select value={formVehicle} onChange={(e) => setFormVehicle(e.target.value)}>
                <option value="Unassigned">Unassigned</option>
                {vehiclesList.map((v) => (
                  <option key={v.id || v.vehicleId} value={v.vehicleId}>
                    {v.vehicleId} ({v.registration || v.type})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Assigned Driver">
              <Select value={formDriver} onChange={(e) => setFormDriver(e.target.value)}>
                <option value="Unassigned">Unassigned</option>
                {driversList.map((d) => (
                  <option key={d.id || d.driverId} value={d.driverId}>
                    {d.name} ({d.driverId})
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Route Status">
            <Select value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
              {statusList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRoute} disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register Route'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Route Modal */}
      <Modal open={!!editModalRow} onClose={() => setEditModalRow(null)} title={`Edit Route: ${editModalRow?.routeId}`}>
        {formError && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.875rem' }}>
            {formError}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Origin Hub *">
              <Input value={formOrigin} onChange={(e) => setFormOrigin(e.target.value)} />
            </Field>
            <Field label="Destination Hub *">
              <Input value={formDestination} onChange={(e) => setFormDestination(e.target.value)} />
            </Field>
          </div>
          <Field label="Intermediate Stops">
            <Input value={formStops} onChange={(e) => setFormStops(e.target.value)} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <Field label="Distance">
              <Input value={formDistance} onChange={(e) => setFormDistance(e.target.value)} />
            </Field>
            <Field label="Est. Duration">
              <Input value={formTime} onChange={(e) => setFormTime(e.target.value)} />
            </Field>
            <Field label="Fuel Estimate">
              <Input value={formFuel} onChange={(e) => setFormFuel(e.target.value)} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Assigned Vehicle">
              <Select value={formVehicle} onChange={(e) => setFormVehicle(e.target.value)}>
                <option value="Unassigned">Unassigned</option>
                {vehiclesList.map((v) => (
                  <option key={v.id || v.vehicleId} value={v.vehicleId}>
                    {v.vehicleId} ({v.registration || v.type})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Assigned Driver">
              <Select value={formDriver} onChange={(e) => setFormDriver(e.target.value)}>
                <option value="Unassigned">Unassigned</option>
                {driversList.map((d) => (
                  <option key={d.id || d.driverId} value={d.driverId}>
                    {d.name} ({d.driverId})
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Route Status">
            <Select value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
              {statusList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setEditModalRow(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quick Status Modal */}
      <Modal open={!!statusModalRow} onClose={() => setStatusModalRow(null)} title={`Update Status: ${statusModalRow?.routeId}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Field label="Route Operational Status">
            <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              {statusList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setStatusModalRow(null)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Status'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Route Detail Inspection Modal */}
      <Modal open={!!detailModalRow} onClose={() => setDetailModalRow(null)} title={`Route Details: ${detailModalRow?.routeId}`}>
        {detailModalRow && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Corridor</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{detailModalRow.origin} → {detailModalRow.destination}</div>
              </div>
              <Badge variant={getStatusVariant(detailModalRow.status)}>{detailModalRow.status}</Badge>
            </div>
            <div className="detail-list">
              <div className="detail-row">
                <span>Waypoints / Stops</span>
                <strong>{detailModalRow.stops || 'Direct non-stop corridor'}</strong>
              </div>
              <div className="detail-row">
                <span>Total Distance</span>
                <strong>{detailModalRow.distance || '—'}</strong>
              </div>
              <div className="detail-row">
                <span>Estimated Drive Time</span>
                <strong>{detailModalRow.time || detailModalRow.estimatedTime || '—'}</strong>
              </div>
              <div className="detail-row">
                <span>Estimated Fuel Consumption</span>
                <strong>{detailModalRow.fuel || detailModalRow.fuelEstimate || '—'}</strong>
              </div>
              <div className="detail-row">
                <span>Assigned Fleet Vehicle</span>
                {detailModalRow.vehicle && detailModalRow.vehicle !== 'Unassigned' ? (
                  <Link to={`/fleet/${detailModalRow.vehicle}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    {detailModalRow.vehicle} {detailModalRow.vehicleReg ? `(${detailModalRow.vehicleReg})` : ''}
                  </Link>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                )}
              </div>
              <div className="detail-row">
                <span>Assigned Driver</span>
                {detailModalRow.driver && detailModalRow.driver !== 'Unassigned' ? (
                  <span style={{ fontWeight: 600 }}>
                    {detailModalRow.driverId ? (
                      <Link to={`/drivers/${detailModalRow.driverId}`} style={{ color: 'inherit' }}>
                        {detailModalRow.driver}
                      </Link>
                    ) : (
                      detailModalRow.driver
                    )}
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
                )}
              </div>
              <div className="detail-row">
                <span>Live Active Shipments</span>
                <strong>{detailModalRow.activeShipmentsCount || 0} shipments</strong>
              </div>
              <div className="detail-row">
                <span>Associated Orders</span>
                <strong>{detailModalRow.activeOrdersCount || 0} orders</strong>
              </div>
            </div>

            <div style={{ marginTop: '0.75rem', width: '100%', height: '240px', borderRadius: '8px', overflow: 'hidden' }}>
              <InteractiveMap
                origin={{ name: detailModalRow.origin, lat: detailModalRow.originLat ?? 17.3850, lng: detailModalRow.originLng ?? 78.4867 }}
                destination={{ name: detailModalRow.destination, lat: detailModalRow.destinationLat ?? 16.5062, lng: detailModalRow.destinationLng ?? 80.6480 }}
                stops={detailModalRow.stopsData ? (() => {
                  try {
                    const parsed = typeof detailModalRow.stopsData === 'string' ? JSON.parse(detailModalRow.stopsData) : detailModalRow.stopsData;
                    if (Array.isArray(parsed) && parsed.length > 2) {
                      return parsed.slice(1, -1).map((s, idx) => ({ name: s.name, lat: s.latitude, lng: s.longitude, number: idx + 1 }));
                    }
                  } catch (e) {}
                  return [];
                })() : []}
                routeGeometry={detailModalRow.routeGeometry}
                height="240px"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button onClick={() => setDetailModalRow(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteModalRow} onClose={() => setDeleteModalRow(null)} title="Confirm Route Removal">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Are you sure you want to delete route <strong>{deleteModalRow?.routeId}</strong> ({deleteModalRow?.origin} → {deleteModalRow?.destination})?
            This route will be detached from any existing shipments and orders. This action cannot be undone.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setDeleteModalRow(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteRoute} disabled={isSubmitting}>
              {isSubmitting ? 'Deleting...' : 'Delete Route'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
