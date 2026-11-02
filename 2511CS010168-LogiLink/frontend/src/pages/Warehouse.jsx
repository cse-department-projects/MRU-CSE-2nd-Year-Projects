import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownToLine, ArrowUpFromLine, Boxes, Plus, Search, Warehouse as WarehouseIcon } from 'lucide-react';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import { ProgressBars } from '../components/ui/Charts.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { Field, Input, Select } from '../components/ui/Input.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import Modal from '../components/ui/Modal.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import KpiCard from '../components/dashboard/KpiCard.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { warehouseService } from '../services/warehouseService.js';

const statusTabs = ['All', 'Active', 'High Occupancy', 'Inactive', 'Maintenance'];

export default function Warehouse() {
  const { notify } = useApp();
  const { data, loading, error, reload, setData } = useAsyncData(() => warehouseService.list(), []);

  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Create Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formCapacity, setFormCapacity] = useState('25,000 sq ft');
  const [formOccupancy, setFormOccupancy] = useState(40);
  const [formStatus, setFormStatus] = useState('Active');
  const [formManager, setFormManager] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Status Modal state
  const [statusModalWarehouse, setStatusModalWarehouse] = useState(null);
  const [targetStatus, setTargetStatus] = useState('Active');

  const warehouses = data || [];

  const filtered = useMemo(() => {
    return warehouses.filter((w) => {
      const matchSearch =
        search === '' ||
        (w.name && w.name.toLowerCase().includes(search.toLowerCase())) ||
        (w.warehouseCode && w.warehouseCode.toLowerCase().includes(search.toLowerCase())) ||
        (w.location && w.location.toLowerCase().includes(search.toLowerCase())) ||
        (w.manager && w.manager.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter === 'All' || w.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [warehouses, search, statusFilter]);

  const handleCreate = async () => {
    if (!formName.trim()) {
      setFormError('Warehouse name is required.');
      return;
    }
    setFormError('');
    setIsSubmitting(true);
    try {
      const payload = {
        name: formName.trim(),
        warehouseCode: formCode.trim() || undefined,
        location: formLocation.trim() || 'Central Distribution Hub',
        capacity: formCapacity.trim() || '25,000 sq ft',
        occupancy: Number(formOccupancy) || 0,
        status: formStatus,
        manager: formManager.trim() || undefined,
        contact: formContact.trim() || undefined,
      };
      const created = await warehouseService.create(payload);
      setData([created, ...warehouses]);
      notify(`Warehouse "${created.name}" created successfully.`);
      setIsCreateOpen(false);
      // Reset form
      setFormName('');
      setFormCode('');
      setFormLocation('');
      setFormCapacity('25,000 sq ft');
      setFormOccupancy(40);
      setFormStatus('Active');
      setFormManager('');
      setFormContact('');
    } catch (err) {
      setFormError(err.message || 'Failed to create warehouse.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusModalWarehouse) return;
    try {
      const updated = await warehouseService.updateStatus(statusModalWarehouse.id, targetStatus);
      setData(warehouses.map((w) => (w.id === statusModalWarehouse.id ? { ...w, status: targetStatus } : w)));
      notify(`Warehouse ${statusModalWarehouse.name} status updated to ${targetStatus}.`);
      setStatusModalWarehouse(null);
    } catch (err) {
      notify(err.message || 'Failed to update status.', 'error');
    }
  };

  if (loading) return <LoadingState title="Loading warehouses" />;
  if (error) return <ErrorState title="Failed to load warehouses" description={error.message} onRetry={reload} />;

  const totalIncoming = warehouses.reduce((sum, w) => sum + (w.incoming || 0), 0);
  const totalOutgoing = warehouses.reduce((sum, w) => sum + (w.outgoing || 0), 0);
  const avgOccupancy = warehouses.length > 0 ? Math.round(warehouses.reduce((sum, w) => sum + (w.occupancy || 0), 0) / warehouses.length) : 0;
  const availableStoragePct = 100 - avgOccupancy;

  const getBadgeVariant = (status) => {
    if (status === 'High Occupancy') return 'warning';
    if (status === 'Inactive') return 'neutral';
    if (status === 'Maintenance') return 'danger';
    return 'success';
  };

  return (
    <>
      <PageHeader
        title="Warehouse Management"
        description="Manage storage capacity, occupancy, inventory counts, and inbound/outbound movement."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setIsCreateOpen(true)}>
            Add Warehouse
          </Button>
        }
      />

      <div className="grid cols-4">
        <KpiCard icon={WarehouseIcon} label="Total warehouses" value={warehouses.length} trend="+1" support="network growth" />
        <KpiCard
          icon={Boxes}
          label="Available storage"
          value={`${availableStoragePct}%`}
          trend={availableStoragePct < 20 ? '-5%' : '+2%'}
          support="remaining space"
          trendDirection={availableStoragePct < 20 ? 'down' : 'up'}
        />
        <KpiCard icon={ArrowDownToLine} label="Incoming shipments" value={totalIncoming} trend="+8" support="scheduled today" />
        <KpiCard icon={ArrowUpFromLine} label="Outgoing shipments" value={totalOutgoing} trend="+11" support="dispatching today" />
      </div>

      <div className="card" style={{ marginTop: 16, padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', minWidth: 260 }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <Input
              style={{ paddingLeft: 34 }}
              placeholder="Search by code, name, location, manager..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Tabs tabs={statusTabs} active={statusFilter} onChange={setStatusFilter} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ marginTop: 16 }}>
          <EmptyState
            title="No warehouses found"
            description={search || statusFilter !== 'All' ? 'No warehouses match your current search or status filter.' : 'No warehouses registered yet.'}
          />
        </div>
      ) : (
        <div className="grid cols-2" style={{ marginTop: 16 }}>
          {filtered.map((warehouse) => (
            <Card
              key={warehouse.id}
              title={warehouse.name}
              subtitle={`${warehouse.id} • ${warehouse.location}`}
              action={
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onClick={() => {
                    setStatusModalWarehouse(warehouse);
                    setTargetStatus(warehouse.status || 'Active');
                  }}
                  title="Click to change status"
                >
                  <Badge variant={getBadgeVariant(warehouse.status)}>{warehouse.status}</Badge>
                </button>
              }
            >
              <div className="detail-list">
                <div className="detail-row">
                  <span>Capacity</span>
                  <strong>{warehouse.capacity}</strong>
                </div>
                <div className="detail-row">
                  <span>Inventory count</span>
                  <strong>{(warehouse.inventoryCount || 0).toLocaleString()} units</strong>
                </div>
                {warehouse.manager && (
                  <div className="detail-row">
                    <span>Manager</span>
                    <strong>{warehouse.manager}</strong>
                  </div>
                )}
                <div className="detail-row">
                  <span>Incoming</span>
                  <strong>{warehouse.incoming || 0} shipments</strong>
                </div>
                <div className="detail-row">
                  <span>Outgoing</span>
                  <strong>{warehouse.outgoing || 0} shipments</strong>
                </div>
              </div>

              <ProgressBars
                data={[
                  {
                    label: 'Occupancy',
                    value: warehouse.occupancy || 0,
                    color: warehouse.occupancy > 90 ? '#d97706' : '#2563eb',
                  },
                ]}
              />

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Link className="button secondary" to={`/warehouse/${warehouse.id}`} style={{ flex: 1, textAlign: 'center' }}>
                  Open warehouse
                </Link>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setStatusModalWarehouse(warehouse);
                    setTargetStatus(warehouse.status || 'Active');
                  }}
                >
                  Status
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Warehouse Modal */}
      {isCreateOpen && (
        <Modal
          title="Add New Warehouse"
          confirmLabel={isSubmitting ? 'Creating...' : 'Create Warehouse'}
          onConfirm={handleCreate}
          onClose={() => setIsCreateOpen(false)}
        >
          {formError && <div style={{ color: 'var(--color-danger)', marginBottom: 12, fontSize: '0.875rem' }}>{formError}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Warehouse Name" required>
              <Input
                placeholder="e.g. Pune Regional Hub"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </Field>

            <div className="grid cols-2" style={{ gap: 12 }}>
              <Field label="Warehouse Code (Optional)">
                <Input
                  placeholder="e.g. WH-PUN-01 (Auto-generated if empty)"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                />
              </Field>

              <Field label="Status">
                <Select value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                  <option value="Active">Active</option>
                  <option value="High Occupancy">High Occupancy</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </Field>
            </div>

            <Field label="Location / Address">
              <Input
                placeholder="e.g. Chakan MIDC Phase 2, Pune"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
              />
            </Field>

            <div className="grid cols-2" style={{ gap: 12 }}>
              <Field label="Storage Capacity">
                <Input
                  placeholder="e.g. 35,000 sq ft"
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(e.target.value)}
                />
              </Field>

              <Field label="Initial Occupancy (%)">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formOccupancy}
                  onChange={(e) => setFormOccupancy(e.target.value)}
                />
              </Field>
            </div>

            <div className="grid cols-2" style={{ gap: 12 }}>
              <Field label="Facility Manager">
                <Input
                  placeholder="e.g. Rajesh Sharma"
                  value={formManager}
                  onChange={(e) => setFormManager(e.target.value)}
                />
              </Field>

              <Field label="Contact Phone / Email">
                <Input
                  placeholder="e.g. +91 98220 11223"
                  value={formContact}
                  onChange={(e) => setFormContact(e.target.value)}
                />
              </Field>
            </div>
          </div>
        </Modal>
      )}

      {/* Quick Status Modal */}
      {statusModalWarehouse && (
        <Modal
          title={`Update Status: ${statusModalWarehouse.name}`}
          confirmLabel="Update Status"
          onConfirm={handleUpdateStatus}
          onClose={() => setStatusModalWarehouse(null)}
        >
          <Field label="Operational Status">
            <Select value={targetStatus} onChange={(e) => setTargetStatus(e.target.value)}>
              <option value="Active">Active</option>
              <option value="High Occupancy">High Occupancy</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </Field>
        </Modal>
      )}
    </>
  );
}
