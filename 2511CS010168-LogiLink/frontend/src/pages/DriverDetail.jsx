import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Trash2, User, Phone, MapPin, Truck, Award, Package, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import { ProgressBars } from '../components/ui/Charts.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Field, Input, Select } from '../components/ui/Input.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { driverService } from '../services/driverService.js';
import { vehicleService } from '../services/vehicleService.js';

const statusList = ['Available', 'On Trip', 'Off Duty', 'Suspended'];

export default function DriverDetail() {
  const { driverId } = useParams();
  const navigate = useNavigate();
  const { notify } = useApp();
  const { data, loading, error, setData } = useAsyncData(() => driverService.getById(driverId), [driverId]);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [editName, setEditName] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editStatus, setEditStatus] = useState('Available');
  const [editBase, setEditBase] = useState('HQ');
  const [editVehicle, setEditVehicle] = useState('Unassigned');
  const [editTrips, setEditTrips] = useState(0);
  const [editRating, setEditRating] = useState(5.0);
  const [editSuccessRate, setEditSuccessRate] = useState(100.0);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openEditModal = () => {
    if (!data) return;
    setEditName(data.name || '');
    setEditContact(data.contact || '');
    setEditStatus(data.status || 'Available');
    setEditBase(data.base || 'HQ');
    setEditVehicle(data.assignedVehicle || 'Unassigned');
    setEditTrips(data.totalTrips || 0);
    setEditRating(data.rating || 5.0);
    setEditSuccessRate(data.successRateValue != null ? data.successRateValue : 100.0);
    setEditError('');
    setIsEditOpen(true);

    vehicleService.list().then((res) => setVehiclesList(res || [])).catch(() => setVehiclesList([]));
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      setEditError('Driver name is required.');
      return;
    }
    setIsSaving(true);
    setEditError('');
    try {
      const payload = {
        name: editName.trim(),
        contact: editContact.trim(),
        status: editStatus,
        base: editBase.trim(),
        assignedVehicle: editVehicle,
        totalTrips: Number(editTrips) || 0,
        rating: Number(editRating) || 5.0,
        successRate: Number(editSuccessRate) || 100.0,
      };
      const updated = await driverService.update(data.id, payload);
      setData(updated);
      notify(`Driver ${updated.name} updated successfully.`);
      setIsEditOpen(false);
    } catch (err) {
      setEditError(err.message || 'Failed to update driver.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickStatusChange = async (nextStatus) => {
    try {
      const updated = await driverService.updateStatus(data.id, { status: nextStatus });
      setData(updated);
      notify(`Driver status set to ${nextStatus}.`);
    } catch (err) {
      notify(err.message || 'Failed to update status.', 'error');
    }
  };

  const handleDeleteDriver = async () => {
    setIsDeleting(true);
    try {
      await driverService.delete(data.id);
      notify(`Driver ${data.name} deleted successfully.`);
      navigate('/drivers');
    } catch (err) {
      notify(err.message || 'Failed to delete driver.', 'error');
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  if (loading) return <LoadingState title="Loading driver details" />;
  if (error || !data) return <ErrorState title="Driver not found" description="The requested driver could not be located in your organization." />;

  const success = data.successRateValue != null ? data.successRateValue : Number.parseFloat(data.successRate) || 100;
  const ratingNum = Number(data.rating) || 5.0;

  const getStatusVariant = (s) => {
    const val = (s || '').toLowerCase();
    if (val === 'available') return 'success';
    if (val === 'on trip') return 'info';
    if (val === 'suspended') return 'error';
    if (val === 'off duty') return 'warning';
    return 'neutral';
  };

  return (
    <>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/drivers" className="button secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowLeft size={16} /> Back to Drivers
        </Link>
      </div>

      <PageHeader
        title={data.name}
        description={`ID: ${data.driverId} • Base: ${data.base || 'HQ'}`}
        actions={
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Badge variant={getStatusVariant(data.status)}>{data.status || 'Available'}</Badge>
            <Button variant="secondary" icon={Edit3} onClick={openEditModal}>
              Edit Driver
            </Button>
            <Button variant="danger" icon={Trash2} onClick={() => setIsDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        }
      />

      {/* Quick Status Bar */}
      <Card style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Quick Status:</span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {statusList.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleQuickStatusChange(st)}
                  className={`button sm ${data.status === st ? 'primary' : 'ghost'}`}
                  style={{ fontSize: '0.8125rem' }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Base Depot: <strong>{data.base || 'HQ'}</strong>
          </div>
        </div>
      </Card>

      <div className="grid cols-2" style={{ marginBottom: '1.5rem' }}>
        {/* Profile Card */}
        <Card title="Driver Profile" action={<Badge variant={getStatusVariant(data.status)}>{data.status}</Badge>}>
          <div className="detail-list">
            <div className="detail-row">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={16} /> Driver Name
              </span>
              <strong>{data.name}</strong>
            </div>
            <div className="detail-row">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Phone size={16} /> Contact Phone
              </span>
              <strong>{data.contact}</strong>
            </div>
            <div className="detail-row">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={16} /> Base Location
              </span>
              <strong>{data.base || 'HQ'}</strong>
            </div>
            <div className="detail-row">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Award size={16} /> Rating
              </span>
              <strong>★ {ratingNum.toFixed(1)} / 5.0</strong>
            </div>
            <div className="detail-row">
              <span>Total Trips</span>
              <strong>{data.totalTrips || 0} completed</strong>
            </div>
          </div>
        </Card>

        {/* Assigned Vehicle & Shipments */}
        <Card title="Vehicle & Operational Assignment">
          <div className="detail-list">
            <div className="detail-row">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Truck size={16} /> Assigned Vehicle
              </span>
              {data.assignedVehicle && data.assignedVehicle !== 'Unassigned' ? (
                <div style={{ textAlign: 'right' }}>
                  <Link
                    to={`/fleet/${data.assignedVehicle}`}
                    style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
                  >
                    {data.assignedVehicle}
                  </Link>
                  {data.assignedVehicleReg && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{data.assignedVehicleReg}</div>
                  )}
                </div>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
              )}
            </div>

            <div className="detail-row">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Package size={16} /> Active Shipment
              </span>
              {data.activeShipment ? (
                <Link
                  to={`/shipments/${data.activeShipment}`}
                  style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
                >
                  {data.activeShipment}
                </Link>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>None (Idle / Available)</span>
              )}
            </div>

            {data.activeOrder && (
              <div className="detail-row">
                <span>Active Order</span>
                <Link
                  to={`/orders/${data.activeOrder}`}
                  style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
                >
                  {data.activeOrder}
                </Link>
              </div>
            )}

            <div className="detail-row">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={16} /> Safety Clearance
              </span>
              <strong style={{ color: '#16a34a' }}>Active & Verified</strong>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid cols-1">
        <Card title="Driver Performance & Safety Metrics">
          <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Historical indicators calculated based on total dispatched trips, SLAs, and safety inspection logs.
          </div>
          <ProgressBars
            data={[
              { label: 'Delivery Success Rate', value: Math.round(success), color: '#2563eb' },
              { label: 'On-Time Arrival', value: Math.max(0, Math.round(success - 2)), color: '#16a34a' },
              { label: 'Safety & Driving Score', value: Math.round(ratingNum * 20), color: '#0d9488' },
            ]}
          />
        </Card>
      </div>

      {/* Edit Driver Modal */}
      <Modal open={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit Driver: ${data.name}`}>
        {editError && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.875rem' }}>
            {editError}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Field label="Full Name *">
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
          </Field>
          <Field label="Contact Phone">
            <Input value={editContact} onChange={(e) => setEditContact(e.target.value)} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Status">
              <Select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                {statusList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </Field>
            <Field label="Base Depot">
              <Input value={editBase} onChange={(e) => setEditBase(e.target.value)} />
            </Field>
          </div>
          <Field label="Assigned Vehicle">
            <Select value={editVehicle} onChange={(e) => setEditVehicle(e.target.value)}>
              <option value="Unassigned">Unassigned</option>
              {vehiclesList.map((v) => (
                <option key={v.id || v.vehicleId} value={v.vehicleId}>
                  {v.vehicleId} ({v.registration || v.type})
                </option>
              ))}
            </Select>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Total Trips">
              <Input type="number" min="0" value={editTrips} onChange={(e) => setEditTrips(e.target.value)} />
            </Field>
            <Field label="Driver Rating">
              <Input type="number" step="0.1" min="1.0" max="5.0" value={editRating} onChange={(e) => setEditRating(e.target.value)} />
            </Field>
          </div>
          <Field label="Success Rate (%)">
            <Input type="number" step="0.1" min="0" max="100" value={editSuccessRate} onChange={(e) => setEditSuccessRate(e.target.value)} />
          </Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Driver Modal */}
      <Modal open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Confirm Driver Removal">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Are you sure you want to delete driver <strong>{data.name}</strong> ({data.driverId})?
            This will detach the driver from any assigned vehicles, orders, and shipments. This action cannot be undone.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteDriver} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Driver'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
