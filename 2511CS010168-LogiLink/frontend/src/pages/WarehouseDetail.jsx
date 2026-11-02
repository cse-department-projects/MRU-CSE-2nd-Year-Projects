import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, CheckCircle2, AlertTriangle, Boxes, Truck, RefreshCw } from 'lucide-react';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import { ProgressBars } from '../components/ui/Charts.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import { Field, Input, Select } from '../components/ui/Input.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import Modal from '../components/ui/Modal.jsx';
import Table from '../components/ui/Table.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { warehouseService } from '../services/warehouseService.js';

export default function WarehouseDetail() {
  const { warehouseId } = useParams();
  const navigate = useNavigate();
  const { notify } = useApp();
  const { data, loading, error, reload, setData } = useAsyncData(() => warehouseService.getById(warehouseId), [warehouseId]);

  // Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editCapacity, setEditCapacity] = useState('');
  const [editOccupancy, setEditOccupancy] = useState(0);
  const [editStatus, setEditStatus] = useState('Active');
  const [editManager, setEditManager] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editError, setEditError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Status modal
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('Active');

  // Delete modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const openEdit = () => {
    if (!data) return;
    setEditName(data.name || '');
    setEditLocation(data.location || '');
    setEditCapacity(data.capacity || '');
    setEditOccupancy(data.occupancy || 0);
    setEditStatus(data.status || 'Active');
    setEditManager(data.manager || '');
    setEditContact(data.contact || '');
    setEditError('');
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      setEditError('Warehouse name cannot be empty.');
      return;
    }
    setEditError('');
    setIsSaving(true);
    try {
      const payload = {
        name: editName.trim(),
        location: editLocation.trim(),
        capacity: editCapacity.trim(),
        occupancy: Number(editOccupancy) || 0,
        status: editStatus,
        manager: editManager.trim(),
        contact: editContact.trim(),
      };
      const updated = await warehouseService.update(warehouseId, payload);
      setData(updated);
      notify(`Warehouse "${updated.name}" updated successfully.`);
      setIsEditOpen(false);
    } catch (err) {
      setEditError(err.message || 'Failed to update warehouse.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const updated = await warehouseService.updateStatus(warehouseId, newStatus);
      setData({ ...data, status: newStatus });
      notify(`Warehouse status changed to ${newStatus}.`);
      setIsStatusOpen(false);
    } catch (err) {
      notify(err.message || 'Failed to update status.', 'error');
    }
  };

  const handleDelete = async () => {
    setDeleteError('');
    setIsDeleting(true);
    try {
      await warehouseService.delete(warehouseId);
      notify(`Warehouse "${data.name}" deleted successfully.`);
      navigate('/warehouse');
    } catch (err) {
      setDeleteError(err.message || 'Cannot delete warehouse.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <LoadingState title="Loading warehouse detail" />;
  if (error) return <ErrorState title="Failed to load warehouse" description={error.message} onRetry={reload} />;
  if (!data) return <ErrorState title="Warehouse not found" description="The requested warehouse does not exist." />;

  const getBadgeVariant = (status) => {
    if (status === 'High Occupancy') return 'warning';
    if (status === 'Inactive') return 'neutral';
    if (status === 'Maintenance') return 'danger';
    return 'success';
  };

  const inventoryItems = data.inventory || [];
  const incomingShipments = data.incomingShipments || [];
  const outgoingShipments = data.outgoingShipments || [];
  const activeOrders = data.activeOrders || [];

  const inventoryColumns = [
    { key: 'sku', label: 'SKU', render: (item) => <strong>{item.sku}</strong> },
    { key: 'product', label: 'Product Name' },
    { key: 'category', label: 'Category' },
    { key: 'quantity', label: 'Total Qty', render: (item) => `${item.quantity} units` },
    { key: 'reserved', label: 'Reserved' },
    {
      key: 'available',
      label: 'Available',
      render: (item) => <strong style={{ color: item.available <= item.reorderLevel ? '#d97706' : 'inherit' }}>{item.available}</strong>,
    },
    { key: 'reorderLevel', label: 'Reorder Level' },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <Badge variant={item.status === 'In Stock' ? 'success' : item.status === 'Low Stock' ? 'warning' : 'danger'}>
          {item.status}
        </Badge>
      ),
    },
  ];

  const incomingColumns = [
    { key: 'id', label: 'Shipment', render: (shipment) => <Link to={`/shipments/${shipment.id}`} style={{ fontWeight: 600 }}>{shipment.id}</Link> },
    { key: 'origin', label: 'Origin' },
    { key: 'driver', label: 'Driver' },
    { key: 'status', label: 'Status', render: (shipment) => <Badge variant={shipment.status === 'Delivered' ? 'success' : 'info'}>{shipment.status}</Badge> },
    { key: 'eta', label: 'ETA' },
  ];

  const outgoingColumns = [
    { key: 'id', label: 'Shipment', render: (shipment) => <Link to={`/shipments/${shipment.id}`} style={{ fontWeight: 600 }}>{shipment.id}</Link> },
    { key: 'destination', label: 'Destination' },
    { key: 'vehicle', label: 'Vehicle' },
    { key: 'status', label: 'Status', render: (shipment) => <Badge variant={shipment.status === 'Delivered' ? 'success' : 'info'}>{shipment.status}</Badge> },
    { key: 'eta', label: 'ETA' },
  ];

  const orderColumns = [
    { key: 'id', label: 'Order ID', render: (order) => <Link to={`/orders/${order.id}`} style={{ fontWeight: 600 }}>{order.id}</Link> },
    { key: 'customer', label: 'Customer' },
    { key: 'origin', label: 'Origin' },
    { key: 'destination', label: 'Destination' },
    { key: 'cargo', label: 'Cargo' },
    { key: 'status', label: 'Status', render: (order) => <Badge variant="info">{order.status}</Badge> },
    { key: 'eta', label: 'ETA' },
  ];

  return (
    <>
      <PageHeader
        title={data.name}
        description={`${data.id} • ${data.location}`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Link className="button secondary" to="/warehouse">
              <ArrowLeft size={16} /> Back to Warehouses
            </Link>
            <Button variant="secondary" icon={Edit} onClick={openEdit}>
              Edit Warehouse
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setNewStatus(data.status || 'Active');
                setIsStatusOpen(true);
              }}
            >
              Update Status
            </Button>
            <Button variant="danger" icon={Trash2} onClick={() => { setDeleteError(''); setIsDeleteOpen(true); }}>
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid cols-2">
        <Card
          title="Warehouse Summary"
          action={<Badge variant={getBadgeVariant(data.status)}>{data.status}</Badge>}
        >
          <div className="detail-list">
            <div className="detail-row"><span>Facility Code</span><strong>{data.id}</strong></div>
            <div className="detail-row"><span>Location</span><strong>{data.location}</strong></div>
            {data.manager && <div className="detail-row"><span>Facility Manager</span><strong>{data.manager}</strong></div>}
            {data.contact && <div className="detail-row"><span>Contact Info</span><strong>{data.contact}</strong></div>}
            <div className="detail-row"><span>Storage Capacity</span><strong>{data.capacity}</strong></div>
            <div className="detail-row"><span>Total Inventory Units</span><strong>{(data.inventoryCount || 0).toLocaleString()} units</strong></div>
            <div className="detail-row"><span>Stored Product SKUs</span><strong>{inventoryItems.length} categories</strong></div>
            <div className="detail-row"><span>Incoming Shipments</span><strong>{data.incoming || 0} scheduled</strong></div>
            <div className="detail-row"><span>Outgoing Shipments</span><strong>{data.outgoing || 0} active</strong></div>
          </div>
        </Card>

        <Card title="Storage Utilization">
          <ProgressBars
            data={[
              { label: 'Occupied', value: data.occupancy || 0, color: (data.occupancy || 0) > 90 ? '#d97706' : '#2563eb' },
              { label: 'Available', value: Math.max(0, 100 - (data.occupancy || 0)), color: '#0d9488' },
            ]}
          />
          <div style={{ marginTop: 24, padding: 12, borderRadius: 8, background: 'var(--color-surface-subtle, rgba(255,255,255,0.04))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Occupancy Rate:</span>
              <strong>{data.occupancy || 0}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Remaining Headroom:</span>
              <strong style={{ color: '#0d9488' }}>{Math.max(0, 100 - (data.occupancy || 0))}%</strong>
            </div>
          </div>
        </Card>
      </div>

      {/* Inventory Stock Breakdown */}
      <div style={{ marginTop: 20 }}>
        <Card
          title="Inventory Stock Stored at this Facility"
          subtitle={`${inventoryItems.length} distinct product line(s)`}
          action={<Link className="button secondary" to="/inventory">View All Inventory</Link>}
        >
          {inventoryItems.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No inventory items are currently assigned directly to this warehouse location.
            </div>
          ) : (
            <Table
              columns={inventoryColumns}
              rows={inventoryItems}
            />
          )}
        </Card>
      </div>

      {/* Shipments Grid */}
      <div className="grid cols-2" style={{ marginTop: 20 }}>
        <Card
          title="Incoming Shipments"
          subtitle={`${incomingShipments.length} incoming transfer(s)`}
        >
          {incomingShipments.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No active incoming shipments destined for this warehouse.
            </div>
          ) : (
            <Table
              columns={incomingColumns}
              rows={incomingShipments}
            />
          )}
        </Card>

        <Card
          title="Outgoing Shipments"
          subtitle={`${outgoingShipments.length} dispatch(es)`}
        >
          {outgoingShipments.length === 0 ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              No active outgoing shipments originating from this facility.
            </div>
          ) : (
            <Table
              columns={outgoingColumns}
              rows={outgoingShipments}
            />
          )}
        </Card>
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <Card title="Associated Logistics Orders" subtitle={`${activeOrders.length} order(s) routed through facility`}>
            <Table
              columns={orderColumns}
              rows={activeOrders}
            />
          </Card>
        </div>
      )}

      {/* Edit Warehouse Modal */}
      {isEditOpen && (
        <Modal
          title={`Edit Warehouse: ${data.name}`}
          confirmLabel={isSaving ? 'Saving...' : 'Save Changes'}
          onConfirm={handleSaveEdit}
          onClose={() => setIsEditOpen(false)}
        >
          {editError && <div style={{ color: 'var(--color-danger)', marginBottom: 12, fontSize: '0.875rem' }}>{editError}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Warehouse Name" required>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </Field>

            <Field label="Location / Address">
              <Input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} />
            </Field>

            <div className="grid cols-2" style={{ gap: 12 }}>
              <Field label="Capacity">
                <Input value={editCapacity} onChange={(e) => setEditCapacity(e.target.value)} />
              </Field>

              <Field label="Occupancy (%)">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editOccupancy}
                  onChange={(e) => setEditOccupancy(e.target.value)}
                />
              </Field>
            </div>

            <div className="grid cols-2" style={{ gap: 12 }}>
              <Field label="Facility Manager">
                <Input value={editManager} onChange={(e) => setEditManager(e.target.value)} />
              </Field>

              <Field label="Contact Phone / Email">
                <Input value={editContact} onChange={(e) => setEditContact(e.target.value)} />
              </Field>
            </div>

            <Field label="Operational Status">
              <Select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                <option value="Active">Active</option>
                <option value="High Occupancy">High Occupancy</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </Field>
          </div>
        </Modal>
      )}

      {/* Status Modal */}
      {isStatusOpen && (
        <Modal
          title={`Change Status for ${data.name}`}
          confirmLabel="Update Status"
          onConfirm={handleUpdateStatus}
          onClose={() => setIsStatusOpen(false)}
        >
          <Field label="Select Status">
            <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              <option value="Active">Active</option>
              <option value="High Occupancy">High Occupancy</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </Field>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteOpen && (
        <Modal
          title={`Delete Warehouse "${data.name}"?`}
          confirmLabel={isDeleting ? 'Deleting...' : 'Delete Warehouse'}
          danger
          onConfirm={handleDelete}
          onClose={() => setIsDeleteOpen(false)}
        >
          {deleteError ? (
            <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginBottom: 12 }}>
              <AlertTriangle size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              {deleteError}
            </div>
          ) : (
            <p>
              Are you sure you want to delete warehouse <strong>{data.name} ({data.id})</strong>?
              {inventoryItems.length > 0 && (
                <span style={{ display: 'block', marginTop: 8, color: '#d97706', fontWeight: 500 }}>
                  Warning: This warehouse has {inventoryItems.length} active inventory item(s). Active facilities cannot be deleted while holding stock.
                </span>
              )}
            </p>
          )}
        </Modal>
      )}
    </>
  );
}
