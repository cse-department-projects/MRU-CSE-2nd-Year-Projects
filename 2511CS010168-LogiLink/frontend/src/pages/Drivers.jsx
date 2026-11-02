import { Link } from 'react-router-dom';
import { UserCheck, ShieldCheck, AlertCircle, Plus, Search, Truck, Phone, Award, Clock } from 'lucide-react';
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
import { driverService } from '../services/driverService.js';
import { vehicleService } from '../services/vehicleService.js';

const statusTabs = ['All', 'Available', 'On Trip', 'Off Duty', 'Suspended'];
const statusList = ['Available', 'On Trip', 'Off Duty', 'Suspended'];

export default function Drivers() {
  const { notify } = useApp();
  const { data, loading, setData } = useAsyncData(() => driverService.list(), []);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusModalRow, setStatusModalRow] = useState(null);
  const [newStatus, setNewStatus] = useState('Available');
  const [newBase, setNewBase] = useState('HQ');

  // Create form state
  const [vehiclesList, setVehiclesList] = useState([]);
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formStatus, setFormStatus] = useState('Available');
  const [formBase, setFormBase] = useState('HQ');
  const [formVehicle, setFormVehicle] = useState('Unassigned');
  const [formTrips, setFormTrips] = useState(0);
  const [formRating, setFormRating] = useState(5.0);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isCreateOpen) {
      setFormError('');
      vehicleService.list().then((res) => setVehiclesList(res || [])).catch(() => setVehiclesList([]));
    }
  }, [isCreateOpen]);

  const handleCreateDriver = async () => {
    if (!formName.trim()) {
      setFormError('Driver name is required.');
      return;
    }
    setIsSubmitting(true);
    setFormError('');
    try {
      const payload = {
        driverId: formId.trim() || undefined,
        name: formName.trim(),
        contact: formContact.trim() || '+91 90000 00000',
        status: formStatus,
        base: formBase.trim() || 'HQ',
        assignedVehicle: formVehicle !== 'Unassigned' ? formVehicle : undefined,
        totalTrips: Number(formTrips) || 0,
        rating: Number(formRating) || 5.0,
      };
      const created = await driverService.create(payload);
      setData([created, ...(data || [])]);
      notify(`Driver ${created.name} (${created.driverId}) registered successfully.`);
      setIsCreateOpen(false);
      // Reset form
      setFormId('');
      setFormName('');
      setFormContact('');
      setFormStatus('Available');
      setFormBase('HQ');
      setFormVehicle('Unassigned');
      setFormTrips(0);
      setFormRating(5.0);
    } catch (err) {
      setFormError(err.message || 'Failed to register driver.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openStatusModal = (row) => {
    setStatusModalRow(row);
    setNewStatus(row.status || 'Available');
    setNewBase(row.base || 'HQ');
  };

  const handleStatusUpdate = async () => {
    if (!statusModalRow) return;
    setIsSubmitting(true);
    try {
      const updated = await driverService.updateStatus(statusModalRow.id, {
        status: newStatus,
        base: newBase.trim(),
      });
      setData((data || []).map((d) => (d.id === statusModalRow.id ? { ...d, ...updated } : d)));
      notify(`Driver ${statusModalRow.name} status updated to ${newStatus}.`);
      setStatusModalRow(null);
    } catch (err) {
      notify(err.message || 'Failed to update status.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    let result = data || [];
    if (status !== 'All') {
      result = result.filter((d) => (d.status || '').toLowerCase() === status.toLowerCase());
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          (d.name || '').toLowerCase().includes(q) ||
          (d.driverId || '').toLowerCase().includes(q) ||
          (d.contact || '').toLowerCase().includes(q) ||
          (d.assignedVehicle || '').toLowerCase().includes(q) ||
          (d.base || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, status, search]);

  const kpis = useMemo(() => {
    const list = data || [];
    const total = list.length;
    const available = list.filter((d) => (d.status || '').toLowerCase() === 'available').length;
    const onTrip = list.filter((d) => (d.status || '').toLowerCase() === 'on trip').length;
    const offDuty = list.filter(
      (d) => (d.status || '').toLowerCase() === 'off duty' || (d.status || '').toLowerCase() === 'suspended'
    ).length;
    return { total, available, onTrip, offDuty };
  }, [data]);

  const pageSize = 8;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  if (loading) return <LoadingState title="Loading drivers" />;

  const columns = [
    {
      key: 'name',
      label: 'Driver Name',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.driverId}</div>
        </div>
      ),
    },
    { key: 'contact', label: 'Contact' },
    {
      key: 'assignedVehicle',
      label: 'Assigned Vehicle',
      render: (row) => {
        if (!row.assignedVehicle || row.assignedVehicle === 'Unassigned') {
          return <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>;
        }
        return (
          <Link
            to={`/fleet/${row.assignedVehicle}`}
            style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}
          >
            {row.assignedVehicle}
          </Link>
        );
      },
    },
    {
      key: 'activeShipment',
      label: 'Active Shipment',
      render: (row) => {
        if (!row.activeShipment) {
          return <span style={{ color: 'var(--text-muted)' }}>—</span>;
        }
        return (
          <Link
            to={`/shipments/${row.activeShipment}`}
            style={{ color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}
          >
            {row.activeShipment}
          </Link>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const s = (row.status || '').toLowerCase();
        let variant = 'neutral';
        if (s === 'available') variant = 'success';
        else if (s === 'on trip') variant = 'info';
        else if (s === 'suspended') variant = 'error';
        else if (s === 'off duty') variant = 'warning';
        return <Badge variant={variant}>{row.status || 'Available'}</Badge>;
      },
    },
    { key: 'base', label: 'Base' },
    {
      key: 'rating',
      label: 'Trips & Rating',
      render: (row) => (
        <span style={{ fontSize: '0.85rem' }}>
          {row.totalTrips || 0} trips • ★ {row.rating ? Number(row.rating).toFixed(1) : '5.0'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button size="sm" variant="ghost" onClick={() => openStatusModal(row)}>
            Status
          </Button>
          <Link className="button secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.8125rem' }} to={`/drivers/${row.id}`}>
            Details
          </Link>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Driver Management"
        description="Track assignments, performance, availability, and safety status for logistics drivers."
        actions={
          <Button icon={Plus} onClick={() => setIsCreateOpen(true)}>
            Add Driver
          </Button>
        }
      />

      <div className="grid cols-4" style={{ marginBottom: '1.5rem' }}>
        <KpiCard icon={UserCheck} label="Total Drivers" value={kpis.total} trend={`${kpis.total}`} support="registered" />
        <KpiCard icon={ShieldCheck} label="Available" value={kpis.available} trend={`${kpis.available}`} trendDirection="up" support="ready for duty" />
        <KpiCard icon={Truck} label="On Trip" value={kpis.onTrip} trend={`${kpis.onTrip}`} trendDirection="up" support="en route" />
        <KpiCard icon={Clock} label="Off Duty / Other" value={kpis.offDuty} trend={`${kpis.offDuty}`} trendDirection="down" support="inactive/rest" />
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '280px', flex: '1 1 300px' }}>
            <Input
              icon={Search}
              placeholder="Search by name, ID, phone, vehicle, base..."
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
              title="No drivers registered"
              description="Get started by registering your first logistics driver."
              action={
                <Button icon={Plus} onClick={() => setIsCreateOpen(true)}>
                  Add Driver
                </Button>
              }
            />
          ) : (
            <EmptyState
              title="No drivers match filter"
              description="Try adjusting your search query or status filter."
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

      {/* Create Driver Modal */}
      <Modal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Register New Driver">
        {formError && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.875rem' }}>
            {formError}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Field label="Driver ID (Optional, auto-generated if blank)">
            <Input placeholder="e.g. DRV-140" value={formId} onChange={(e) => setFormId(e.target.value)} />
          </Field>
          <Field label="Full Name *">
            <Input placeholder="e.g. John Doe" value={formName} onChange={(e) => setFormName(e.target.value)} />
          </Field>
          <Field label="Contact Phone">
            <Input placeholder="e.g. +91 98765 43210" value={formContact} onChange={(e) => setFormContact(e.target.value)} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Initial Status">
              <Select value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                {statusList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </Field>
            <Field label="Home Base / Depot">
              <Input placeholder="e.g. Central Depot" value={formBase} onChange={(e) => setFormBase(e.target.value)} />
            </Field>
          </div>
          <Field label="Assign Vehicle (Optional)">
            <Select value={formVehicle} onChange={(e) => setFormVehicle(e.target.value)}>
              <option value="Unassigned">Unassigned</option>
              {vehiclesList.map((v) => (
                <option key={v.id || v.vehicleId} value={v.vehicleId}>
                  {v.vehicleId} ({v.registration || v.type})
                </option>
              ))}
            </Select>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Initial Trips">
              <Input type="number" min="0" value={formTrips} onChange={(e) => setFormTrips(e.target.value)} />
            </Field>
            <Field label="Driver Rating">
              <Input type="number" step="0.1" min="1.0" max="5.0" value={formRating} onChange={(e) => setFormRating(e.target.value)} />
            </Field>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDriver} disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register Driver'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quick Status Modal */}
      <Modal open={!!statusModalRow} onClose={() => setStatusModalRow(null)} title={`Update Status: ${statusModalRow?.name}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Field label="Driver Status">
            <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              {statusList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="Base / Current Location">
            <Input placeholder="e.g. HQ or Northern Depot" value={newBase} onChange={(e) => setNewBase(e.target.value)} />
          </Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setStatusModalRow(null)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Save Status'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
