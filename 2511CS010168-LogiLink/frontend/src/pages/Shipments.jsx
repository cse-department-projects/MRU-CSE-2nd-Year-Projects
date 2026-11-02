import { Link } from 'react-router-dom';
import { Plus, Search, Truck, Navigation, CheckCircle2, AlertCircle } from 'lucide-react';
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
import PageHeader from '../components/layout/PageHeader.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { shipmentService } from '../services/shipmentService.js';
import { orderService } from '../services/orderService.js';
import { vehicleService } from '../services/vehicleService.js';
import { driverService } from '../services/driverService.js';

const statuses = ['All', 'Pending', 'Confirmed', 'Dispatched', 'In Transit', 'Delivered', 'Delayed', 'Cancelled'];
const stageOptions = ['Order Created', 'Confirmed', 'Dispatched', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'];

export default function Shipments() {
  const { notify } = useApp();
  const { data, loading, setData } = useAsyncData(() => shipmentService.list(), []);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [page, setPage] = useState(1);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [statusModalRow, setStatusModalRow] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newStage, setNewStage] = useState('');
  const [newLocation, setNewLocation] = useState('');

  // Create form state
  const [ordersList, setOrdersList] = useState([]);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [driversList, setDriversList] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('Unassigned');
  const [selectedDriver, setSelectedDriver] = useState('Unassigned');
  const [formStatus, setFormStatus] = useState('Dispatched');
  const [formStage, setFormStage] = useState('Dispatched');
  const [formLocation, setFormLocation] = useState('');
  const [formEta, setFormEta] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load orders, vehicles, and drivers for the create modal when it opens
  useEffect(() => {
    if (isCreateOpen) {
      setFormError('');
      Promise.all([
        orderService.list().catch(() => []),
        vehicleService.list().catch(() => []),
        driverService.list().catch(() => []),
      ]).then(([ordRes, vehRes, drvRes]) => {
        setOrdersList(ordRes || []);
        setVehiclesList(vehRes || []);
        setDriversList(drvRes || []);
      });
    }
  }, [isCreateOpen]);

  // When order is selected in create modal, auto-populate associated fields
  const handleOrderChange = (orderId) => {
    setSelectedOrderId(orderId);
    setFormError('');
    const matched = ordersList.find((o) => o.orderId === orderId || o.id === orderId);
    if (matched) {
      if (matched.vehicle && matched.vehicle !== 'Unassigned') {
        setSelectedVehicle(matched.vehicle);
      }
      if (matched.driver && matched.driver !== 'Unassigned') {
        setSelectedDriver(matched.driver);
      }
      setFormLocation(matched.origin ? `${matched.origin} Terminal` : 'Origin Terminal');
      setFormEta(matched.eta || 'Scheduled');
    }
  };

  const handleCreateShipment = async () => {
    if (!selectedOrderId) {
      setFormError('Please select an order for this shipment.');
      return;
    }
    setIsSubmitting(true);
    setFormError('');
    try {
      const payload = {
        orderId: selectedOrderId,
        vehicle: selectedVehicle !== 'Unassigned' ? selectedVehicle : null,
        driver: selectedDriver !== 'Unassigned' ? selectedDriver : null,
        status: formStatus,
        stage: formStage,
        currentLocation: formLocation,
        eta: formEta,
      };
      const created = await shipmentService.create(payload);
      setData([created, ...(data || [])]);
      notify(`Shipment ${created.shipmentId} created successfully.`);
      setIsCreateOpen(false);
      // Reset form
      setSelectedOrderId('');
      setSelectedVehicle('Unassigned');
      setSelectedDriver('Unassigned');
      setFormLocation('');
      setFormEta('');
    } catch (err) {
      setFormError(err.message || 'Failed to create shipment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusModalRow) return;
    try {
      const updated = await shipmentService.updateStatus(statusModalRow.id, {
        status: newStatus || statusModalRow.status,
        stage: newStage || statusModalRow.stage,
        currentLocation: newLocation || statusModalRow.currentLocation,
      });
      setData((data || []).map((s) => (s.id === statusModalRow.id ? updated : s)));
      notify(`Shipment ${statusModalRow.shipmentId} updated to ${updated.status}.`);
      setStatusModalRow(null);
    } catch (err) {
      notify(err.message || 'Failed to update shipment status.', 'danger');
    }
  };

  const openStatusModal = (row) => {
    setStatusModalRow(row);
    setNewStatus(row.status || 'In Transit');
    setNewStage(row.stage || 'In Transit');
    setNewLocation(row.currentLocation || '');
  };

  const rows = useMemo(() => {
    return (data || []).filter((shipment) => {
      const matchesStatus = status === 'All' || shipment.status === status;
      const text = `${shipment.shipmentId} ${shipment.orderId} ${shipment.origin} ${shipment.destination} ${shipment.vehicle} ${shipment.driver} ${shipment.currentLocation}`.toLowerCase();
      return matchesStatus && text.includes(search.toLowerCase());
    });
  }, [data, search, status]);

  const paged = rows.slice((page - 1) * 5, page * 5);
  const totalPages = Math.max(1, Math.ceil(rows.length / 5));

  if (loading) return <LoadingState title="Loading shipment tracking" />;

  const columns = [
    {
      key: 'shipmentId',
      label: 'Shipment ID',
      sortable: true,
      render: (row) => (
        <Link to={`/shipments/${row.id}`} style={{ fontWeight: 600, color: 'var(--color-primary, #2563eb)' }}>
          {row.shipmentId}
        </Link>
      ),
    },
    {
      key: 'orderId',
      label: 'Order ID',
      render: (row) => (
        row.orderId ? (
          <Link to={`/orders/${row.orderId}`} style={{ color: 'var(--color-text, #1e293b)', textDecoration: 'underline' }}>
            {row.orderId}
          </Link>
        ) : <span style={{ color: '#94a3b8' }}>Unassigned</span>
      ),
    },
    { key: 'origin', label: 'Origin' },
    { key: 'destination', label: 'Destination' },
    { key: 'currentLocation', label: 'Current location' },
    { key: 'status', label: 'Status', render: (row) => <Badge>{row.status}</Badge> },
    { key: 'vehicle', label: 'Vehicle' },
    { key: 'driver', label: 'Driver' },
    { key: 'eta', label: 'ETA' },
    { key: 'createdDate', label: 'Created date' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="row-actions">
          <Link className="button secondary" to={`/shipments/${row.id}`}>Timeline</Link>
          <button
            className="icon-button"
            title="Update status"
            onClick={() => openStatusModal(row)}
            aria-label={`Update status for ${row.shipmentId}`}
          >
            <Navigation size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Shipment Tracking"
        description="Monitor every shipment from order creation through final delivery."
        actions={
          <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
            <Plus size={16} /> Add shipment
          </Button>
        }
      />

      {(!data || data.length === 0) ? (
        <Card>
          <EmptyState
            title="No shipments yet"
            description="Your organization has no shipments recorded. Create your first shipment from an existing order to start real-time tracking."
            action={
              <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
                <Plus size={16} /> Add shipment
              </Button>
            }
          />
        </Card>
      ) : (
        <Card>
          <div className="toolbar">
            <div className="filters">
              <div style={{ position: 'relative', minWidth: 260 }}>
                <Search size={17} style={{ position: 'absolute', left: 12, top: 12, color: '#6b7280' }} />
                <Input
                  style={{ paddingLeft: 38 }}
                  placeholder="Search shipments..."
                  value={search}
                  onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                />
              </div>
            </div>
            <Tabs
              tabs={statuses}
              active={status}
              onChange={(next) => { setStatus(next); setPage(1); }}
            />
          </div>
          <Table
            columns={columns}
            rows={paged}
            emptyTitle="No matching shipments"
            emptyDescription="Try adjusting your search criteria or status filter."
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </Card>
      )}

      {/* CREATE SHIPMENT MODAL */}
      {isCreateOpen && (
        <Modal
          title="Create New Shipment"
          confirmLabel={isSubmitting ? "Creating..." : "Create Shipment"}
          onClose={() => setIsCreateOpen(false)}
          onConfirm={handleCreateShipment}
        >
          {formError && (
            <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={18} />
              <span>{formError}</span>
            </div>
          )}

          <Field label="Associated Order" required error={!selectedOrderId && formError ? 'Order is required' : ''}>
            <Select
              value={selectedOrderId}
              onChange={(e) => handleOrderChange(e.target.value)}
              aria-label="Select order"
            >
              <option value="">-- Select an Order from your Organization --</option>
              {ordersList.map((ord) => (
                <option key={ord.orderId || ord.id} value={ord.orderId || ord.id}>
                  {ord.orderId} — {ord.customer || 'Customer'} ({ord.origin} → {ord.destination}) [{ord.status}]
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid cols-2" style={{ gap: 12, marginTop: 12 }}>
            <Field label="Vehicle">
              <Select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)}>
                <option value="Unassigned">Unassigned</option>
                {vehiclesList.map((v) => (
                  <option key={v.vehicleId || v.id} value={v.vehicleId || v.id}>
                    {v.vehicleId} ({v.type || 'Truck'})
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Driver">
              <Select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)}>
                <option value="Unassigned">Unassigned</option>
                {driversList.map((d) => (
                  <option key={d.driverId || d.id} value={d.name || d.driverId}>
                    {d.name} ({d.driverId})
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid cols-2" style={{ gap: 12, marginTop: 12 }}>
            <Field label="Status">
              <Select value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                {['Pending', 'Confirmed', 'Dispatched', 'In Transit', 'Delivered', 'Delayed', 'Cancelled'].map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </Select>
            </Field>

            <Field label="Stage">
              <Select value={formStage} onChange={(e) => setFormStage(e.target.value)}>
                {stageOptions.map((stg) => (
                  <option key={stg} value={stg}>{stg}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid cols-2" style={{ gap: 12, marginTop: 12 }}>
            <Field label="Current Location">
              <Input
                placeholder="e.g. Origin Terminal, Hub A..."
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
              />
            </Field>

            <Field label="ETA">
              <Input
                placeholder="e.g. Tomorrow 14:00"
                value={formEta}
                onChange={(e) => setFormEta(e.target.value)}
              />
            </Field>
          </div>
        </Modal>
      )}

      {/* QUICK STATUS UPDATE MODAL */}
      {statusModalRow && (
        <Modal
          title={`Update Shipment ${statusModalRow.shipmentId}`}
          confirmLabel="Update Status"
          onClose={() => setStatusModalRow(null)}
          onConfirm={handleStatusUpdate}
        >
          <p style={{ marginBottom: 16, color: '#64748b' }}>
            Updating shipment status for order <strong>{statusModalRow.orderId}</strong> ({statusModalRow.origin} → {statusModalRow.destination}).
          </p>

          <Field label="Status">
            <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              {['Pending', 'Confirmed', 'Dispatched', 'In Transit', 'Delivered', 'Delayed', 'Cancelled'].map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </Select>
          </Field>

          <div style={{ marginTop: 12 }}>
            <Field label="Timeline Stage">
              <Select value={newStage} onChange={(e) => setNewStage(e.target.value)}>
                {stageOptions.map((stg) => (
                  <option key={stg} value={stg}>{stg}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div style={{ marginTop: 12 }}>
            <Field label="Current Location">
              <Input
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Update current checkpoint or location"
              />
            </Field>
          </div>
        </Modal>
      )}
    </>
  );
}
