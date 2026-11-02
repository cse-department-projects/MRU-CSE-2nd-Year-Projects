import { Link } from 'react-router-dom';
import { Activity, CheckCircle2, Wrench, WifiOff, Plus, Search, Truck } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { Field, Input, Select } from '../components/ui/Input.jsx';
import { ProgressBars } from '../components/ui/Charts.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import Modal from '../components/ui/Modal.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import Table from '../components/ui/Table.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import KpiCard from '../components/dashboard/KpiCard.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { vehicleService } from '../services/vehicleService.js';
import { driverService } from '../services/driverService.js';

const statusTabs = ['All', 'Available', 'In Transit', 'Delayed', 'Maintenance', 'Idle', 'Offline'];
const vehicleTypes = ['Container Truck', 'Heavy Truck', 'Reefer Truck', 'Light Commercial', 'Flatbed Truck'];

export default function Fleet() {
  const { notify } = useApp();
  const { data, loading, error, setData } = useAsyncData(() => vehicleService.list(), []);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusModalRow, setStatusModalRow] = useState(null);
  const [newStatus, setNewStatus] = useState('Available');
  const [newLocation, setNewLocation] = useState('');
  const [newLoad, setNewLoad] = useState(0);
  const [newMaintenance, setNewMaintenance] = useState('Clear');

  // Create form state
  const [driversList, setDriversList] = useState([]);
  const [formId, setFormId] = useState('');
  const [formReg, setFormReg] = useState('');
  const [formType, setFormType] = useState('Container Truck');
  const [formCapacity, setFormCapacity] = useState('18 t');
  const [formStatus, setFormStatus] = useState('Available');
  const [formDriver, setFormDriver] = useState('Unassigned');
  const [formLocation, setFormLocation] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isCreateOpen) {
      setFormError('');
      driverService.list().then((res) => setDriversList(res || [])).catch(() => setDriversList([]));
    }
  }, [isCreateOpen]);

  const handleCreateVehicle = async () => {
    setIsSubmitting(true);
    setFormError('');
    try {
      const payload = {
        vehicleId: formId.trim() || undefined,
        registration: formReg.trim() || undefined,
        type: formType,
        capacity: formCapacity,
        status: formStatus,
        driver: formDriver !== 'Unassigned' ? formDriver : null,
        location: formLocation.trim() || 'Central Hub',
      };
      const created = await vehicleService.create(payload);
      setData([created, ...(data || [])]);
      notify(`Vehicle ${created.vehicleId} registered successfully.`);
      setIsCreateOpen(false);
      // Reset
      setFormId('');
      setFormReg('');
      setFormType('Container Truck');
      setFormCapacity('18 t');
      setFormStatus('Available');
      setFormDriver('Unassigned');
      setFormLocation('');
    } catch (err) {
      setFormError(err.message || 'Failed to create vehicle.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openStatusModal = (row) => {
    setStatusModalRow(row);
    setNewStatus(row.status || 'Available');
    setNewLocation(row.location || '');
    setNewLoad(row.currentLoad || 0);
    setNewMaintenance(row.maintenance || 'Clear');
  };

  const handleStatusUpdate = async () => {
    if (!statusModalRow) return;
    try {
      const updated = await vehicleService.updateStatus(statusModalRow.id, {
        status: newStatus,
        location: newLocation,
        currentLoad: Number(newLoad),
        maintenance: newMaintenance,
      });
      setData((data || []).map((v) => (v.id === statusModalRow.id ? updated : v)));
      notify(`Vehicle ${statusModalRow.vehicleId} status updated to ${updated.status}.`);
      setStatusModalRow(null);
    } catch (err) {
      notify(err.message || 'Failed to update vehicle status.', 'danger');
    }
  };

  if (loading) return <LoadingState title="Loading fleet" />;

  const safeData = data || [];
  const stats = [
    { label: 'Total Vehicles', value: safeData.length, trend: `+${safeData.length}`, support: 'in fleet', icon: Activity },
    { label: 'Active', value: safeData.filter((v) => ['In Transit', 'Delayed'].includes(v.status)).length, trend: 'on route', support: 'dispatched loads', icon: CheckCircle2 },
    { label: 'Available', value: safeData.filter((v) => v.status === 'Available').length, trend: 'ready', support: 'for dispatch', icon: CheckCircle2 },
    { label: 'Maintenance', value: safeData.filter((v) => v.status === 'Maintenance').length, trend: 'inspection', support: 'service bay', icon: Wrench },
    { label: 'Offline', value: safeData.filter((v) => v.status === 'Offline').length, trend: 'standby', support: 'depot holding', icon: WifiOff },
  ];

  const rows = safeData.filter((vehicle) => {
    const matchesStatus = status === 'All' || vehicle.status === status;
    const text = `${vehicle.vehicleId} ${vehicle.registration} ${vehicle.type} ${vehicle.driver} ${vehicle.location} ${vehicle.capacity}`.toLowerCase();
    return matchesStatus && text.includes(search.toLowerCase());
  });

  const paged = rows.slice((page - 1) * 6, page * 6);
  const totalPages = Math.max(1, Math.ceil(rows.length / 6));

  const columns = [
    {
      key: 'vehicleId',
      label: 'Vehicle ID',
      sortable: true,
      render: (row) => (
        <Link to={`/fleet/${row.id}`} style={{ fontWeight: 600, color: 'var(--color-primary, #2563eb)' }}>
          {row.vehicleId}
        </Link>
      ),
    },
    { key: 'registration', label: 'Registration' },
    { key: 'type', label: 'Type' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'currentLoad', label: 'Current Load', render: (row) => `${row.currentLoad || 0}%` },
    { key: 'driver', label: 'Driver' },
    {
      key: 'activeShipment',
      label: 'Active Load',
      render: (row) => (
        row.activeShipment ? (
          <Link to={`/shipments/${row.activeShipment}`} style={{ color: 'var(--color-primary, #2563eb)', textDecoration: 'underline' }}>
            {row.activeShipment}
          </Link>
        ) : <span style={{ color: '#94a3b8' }}>None</span>
      ),
    },
    { key: 'status', label: 'Status', render: (row) => <Badge>{row.status}</Badge> },
    { key: 'location', label: 'Location' },
    { key: 'lastUpdated', label: 'Last Updated' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="row-actions">
          <Link className="button secondary" to={`/fleet/${row.id}`}>Details</Link>
          <button
            className="icon-button"
            title="Update status"
            onClick={() => openStatusModal(row)}
            aria-label={`Update status for ${row.vehicleId}`}
          >
            <Wrench size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <LoadingState title="Loading fleet assets..." />;
  }

  if (error && !safeData.length) {
    return (
      <ErrorState
        title="Failed to load fleet"
        description={error.message || 'Unable to load fleet data.'}
        onRetry={() => setData(null)}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Fleet Management"
        description="Manage complete transportation assets, utilization, status, and maintenance readiness."
        actions={
          <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
            <Plus size={16} /> Add vehicle
          </Button>
        }
      />

      <div className="grid cols-4">
        {stats.map((stat) => <KpiCard key={stat.label} icon={stat.icon} {...stat} />)}
      </div>

      {safeData.length > 0 && (
        <div className="grid cols-2" style={{ marginTop: 16 }}>
          <Card title="Vehicle Utilization" subtitle="Current load as a percentage of usable capacity">
            <ProgressBars data={safeData.slice(0, 7).map((v) => ({ label: v.vehicleId, value: v.currentLoad || 0 }))} />
          </Card>
          <Card title="Maintenance Watch" subtitle="Vehicles requiring operational review">
            <div className="detail-list">
              {safeData.filter((v) => v.status === 'Maintenance' || v.status === 'Delayed').map((vehicle) => (
                <div className="detail-row" key={vehicle.id}>
                  <span>{vehicle.vehicleId} ({vehicle.type})</span>
                  <strong>{vehicle.maintenance || 'Scheduled Check'}</strong>
                </div>
              ))}
              {safeData.filter((v) => v.status === 'Maintenance' || v.status === 'Delayed').length === 0 && (
                <div style={{ padding: '16px 0', color: '#16a34a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={18} />
                  <span>All vehicles clear of maintenance alerts.</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {safeData.length === 0 ? (
        <Card style={{ marginTop: 16 }}>
          <EmptyState
            title="No vehicles in fleet"
            description="Your organization has no registered vehicles. Click 'Add vehicle' to register your first transport asset."
            action={
              <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
                <Plus size={16} /> Add vehicle
              </Button>
            }
          />
        </Card>
      ) : (
        <Card title="Fleet Register" subtitle="All vehicles available to transportation operations" style={{ marginTop: 16 }}>
          <div className="toolbar">
            <div className="filters">
              <div style={{ position: 'relative', minWidth: 260 }}>
                <Search size={17} style={{ position: 'absolute', left: 12, top: 12, color: '#6b7280' }} />
                <Input
                  style={{ paddingLeft: 38 }}
                  placeholder="Search vehicles..."
                  value={search}
                  onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                />
              </div>
            </div>
            <Tabs
              tabs={statusTabs}
              active={status}
              onChange={(next) => { setStatus(next); setPage(1); }}
            />
          </div>
          <Table
            columns={columns}
            rows={paged}
            emptyTitle="No matching vehicles"
            emptyDescription="Try adjusting your search criteria or status filter."
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </Card>
      )}

      {/* CREATE VEHICLE MODAL */}
      {isCreateOpen && (
        <Modal
          title="Register New Fleet Vehicle"
          confirmLabel={isSubmitting ? "Registering..." : "Register Vehicle"}
          onClose={() => setIsCreateOpen(false)}
          onConfirm={handleCreateVehicle}
        >
          {formError && (
            <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
              {formError}
            </div>
          )}

          <div className="grid cols-2" style={{ gap: 12 }}>
            <Field label="Vehicle ID (Optional)">
              <Input
                placeholder="Auto-generated if blank (e.g. TRK-401)"
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
              />
            </Field>

            <Field label="Registration Number">
              <Input
                placeholder="e.g. TS09 FG 4204"
                value={formReg}
                onChange={(e) => setFormReg(e.target.value)}
              />
            </Field>
          </div>

          <div className="grid cols-2" style={{ gap: 12, marginTop: 12 }}>
            <Field label="Vehicle Type">
              <Select value={formType} onChange={(e) => setFormType(e.target.value)}>
                {vehicleTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>

            <Field label="Capacity">
              <Input
                placeholder="e.g. 18 t"
                value={formCapacity}
                onChange={(e) => setFormCapacity(e.target.value)}
              />
            </Field>
          </div>

          <div className="grid cols-2" style={{ gap: 12, marginTop: 12 }}>
            <Field label="Initial Status">
              <Select value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                {['Available', 'Idle', 'In Transit', 'Maintenance'].map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>

            <Field label="Assign Driver">
              <Select value={formDriver} onChange={(e) => setFormDriver(e.target.value)}>
                <option value="Unassigned">Unassigned</option>
                {driversList.map((d) => (
                  <option key={d.driverId || d.id} value={d.name || d.driverId}>
                    {d.name} ({d.driverId})
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div style={{ marginTop: 12 }}>
            <Field label="Operating Location / Hub">
              <Input
                placeholder="e.g. Central Hub, Hyderabad Depot..."
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
              />
            </Field>
          </div>
        </Modal>
      )}

      {/* QUICK STATUS UPDATE MODAL */}
      {statusModalRow && (
        <Modal
          title={`Update Status: ${statusModalRow.vehicleId}`}
          confirmLabel="Update Vehicle"
          onClose={() => setStatusModalRow(null)}
          onConfirm={handleStatusUpdate}
        >
          <div className="grid cols-2" style={{ gap: 12 }}>
            <Field label="Vehicle Status">
              <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                {['Available', 'In Transit', 'Delayed', 'Maintenance', 'Idle', 'Offline'].map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </Select>
            </Field>

            <Field label="Current Load (%)">
              <Input
                type="number"
                min="0"
                max="100"
                value={newLoad}
                onChange={(e) => setNewLoad(e.target.value)}
              />
            </Field>
          </div>

          <div className="grid cols-2" style={{ gap: 12, marginTop: 12 }}>
            <Field label="Current Location">
              <Input
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="e.g. Hub Bay 3"
              />
            </Field>

            <Field label="Maintenance Readiness">
              <Input
                value={newMaintenance}
                onChange={(e) => setNewMaintenance(e.target.value)}
                placeholder="e.g. Clear, Brake check pending..."
              />
            </Field>
          </div>
        </Modal>
      )}
    </>
  );
}
