import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Truck, User, MapPin, Gauge, AlertCircle, CheckCircle2 } from 'lucide-react';
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
import { vehicleService } from '../services/vehicleService.js';
import { driverService } from '../services/driverService.js';

const statusList = ['Available', 'In Transit', 'Delayed', 'Maintenance', 'Idle', 'Offline'];
const vehicleTypes = ['Container Truck', 'Heavy Truck', 'Reefer Truck', 'Light Commercial', 'Flatbed Truck'];

export default function VehicleDetail() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { notify } = useApp();
  const { data, loading, error, setData } = useAsyncData(() => vehicleService.getById(vehicleId), [vehicleId]);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [driversList, setDriversList] = useState([]);
  const [editReg, setEditReg] = useState('');
  const [editType, setEditType] = useState('Container Truck');
  const [editCapacity, setEditCapacity] = useState('18 t');
  const [editLoad, setEditLoad] = useState(0);
  const [editStatus, setEditStatus] = useState('Available');
  const [editDriver, setEditDriver] = useState('Unassigned');
  const [editLocation, setEditLocation] = useState('');
  const [editMaintenance, setEditMaintenance] = useState('Clear');
  const [editRoute, setEditRoute] = useState('Unassigned');
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const openEditModal = () => {
    if (!data) return;
    setEditReg(data.registration || '');
    setEditType(data.type || 'Container Truck');
    setEditCapacity(data.capacity || '18 t');
    setEditLoad(data.currentLoad || 0);
    setEditStatus(data.status || 'Available');
    setEditDriver(data.driver || 'Unassigned');
    setEditLocation(data.location || '');
    setEditMaintenance(data.maintenance || 'Clear');
    setEditRoute(data.route || 'Unassigned');
    setEditError('');
    setIsEditOpen(true);

    driverService.list().then((res) => setDriversList(res || [])).catch(() => setDriversList([]));
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    setEditError('');
    try {
      const payload = {
        registration: editReg.trim(),
        type: editType,
        capacity: editCapacity.trim(),
        currentLoad: Number(editLoad),
        status: editStatus,
        driver: editDriver !== 'Unassigned' ? editDriver : null,
        location: editLocation.trim(),
        maintenance: editMaintenance.trim(),
        route: editRoute.trim(),
      };
      const updated = await vehicleService.update(data.id, payload);
      setData(updated);
      notify(`Vehicle ${updated.vehicleId} updated successfully.`);
      setIsEditOpen(false);
    } catch (err) {
      setEditError(err.message || 'Failed to update vehicle.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickStatusChange = async (nextStatus) => {
    try {
      const updated = await vehicleService.updateStatus(data.id, { status: nextStatus });
      setData(updated);
      notify(`Vehicle status set to ${nextStatus}.`);
    } catch (err) {
      notify(err.message || 'Failed to update status.', 'danger');
    }
  };

  if (loading) return <LoadingState title="Loading vehicle detail" />;
  if (error || !data) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto' }}>
        <ErrorState
          title="Vehicle not found"
          message="The requested vehicle does not exist or does not belong to your organization."
        />
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Button variant="secondary" onClick={() => navigate('/fleet')}>
            <ArrowLeft size={16} /> Back to Fleet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={data.vehicleId}
        description={`${data.type} registered as ${data.registration}`}
        actions={
          <div style={{ display: 'flex', gap: 10 }}>
            <Link className="button secondary" to="/fleet">
              <ArrowLeft size={16} /> All Vehicles
            </Link>
            <Button variant="primary" onClick={openEditModal}>
              <Edit3 size={16} /> Edit Vehicle
            </Button>
          </div>
        }
      />

      <div className="grid cols-2" style={{ gap: 20 }}>
        {/* VEHICLE INFORMATION */}
        <Card
          title="Vehicle Information"
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Badge>{data.status}</Badge>
              <Select
                value={data.status}
                onChange={(e) => handleQuickStatusChange(e.target.value)}
                style={{ padding: '4px 8px', fontSize: 13, height: 'auto' }}
                aria-label="Change status"
              >
                {statusList.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </Select>
            </div>
          }
        >
          <div className="detail-list">
            <div className="detail-row"><span>Registration</span><strong>{data.registration}</strong></div>
            <div className="detail-row"><span>Vehicle Type</span><strong>{data.type}</strong></div>
            <div className="detail-row"><span>Rated Capacity</span><strong>{data.capacity}</strong></div>
            <div className="detail-row"><span>Current Load</span><strong>{data.currentLoad || 0}%</strong></div>
            <div className="detail-row"><span>Assigned Driver</span><strong>{data.driver || 'Unassigned'}</strong></div>
            <div className="detail-row"><span>Current Location</span><strong>{data.location || 'Central Depot'}</strong></div>
            <div className="detail-row"><span>Assigned Route</span><strong>{data.route || 'Unassigned'}</strong></div>
            <div className="detail-row"><span>Maintenance Readiness</span><strong>{data.maintenance || 'Clear'}</strong></div>
            {data.activeShipment && (
              <div className="detail-row">
                <span>Active Shipment</span>
                <strong>
                  <Link to={`/shipments/${data.activeShipment}`} style={{ color: 'var(--color-primary, #2563eb)', textDecoration: 'underline' }}>
                    {data.activeShipment} {data.activeOrder ? `(${data.activeOrder})` : ''}
                  </Link>
                </strong>
              </div>
            )}
            <div className="detail-row"><span>Last Telemetry Update</span><strong>{data.lastUpdated || 'Just now'}</strong></div>
          </div>
        </Card>

        {/* UTILIZATION STATISTICS */}
        <Card title="Utilization Statistics" subtitle="Live capacity and mechanical telemetry">
          <ProgressBars
            data={[
              { label: 'Current Assigned Load', value: data.currentLoad || 0 },
              { label: '30-Day Asset Utilization', value: data.utilization || Math.min(100, (data.currentLoad || 40) + 15) },
              { label: 'Mechanical Health Score', value: data.status === 'Maintenance' ? 55 : (data.status === 'Delayed' ? 78 : 95), color: data.status === 'Maintenance' ? '#dc2626' : '#0d9488' }
            ]}
          />
          <div style={{ marginTop: 24, padding: '14px', borderRadius: 8, background: 'var(--color-surface-hover, #f8fafc)', border: '1px solid var(--color-border, #e2e8f0)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: 'var(--color-text, #1e293b)' }}>
              <Gauge size={18} color="#2563eb" />
              <span>Asset Readiness Diagnostic</span>
            </div>
            <p style={{ marginTop: 6, fontSize: 13, color: '#64748b' }}>
              {data.status === 'Maintenance'
                ? `Operational hold active: ${data.maintenance}. Clear maintenance check before reassigning to active shipment pipeline.`
                : data.status === 'In Transit'
                ? `Active in transit on corridor ${data.route || 'assigned route'}. Telemetry streaming to live tracking command center.`
                : 'Asset verified and ready for assignment to logistics orders or freight dispatches.'}
            </p>
          </div>
        </Card>
      </div>

      {/* EDIT MODAL */}
      {isEditOpen && (
        <Modal
          title={`Edit Vehicle ${data.vehicleId}`}
          confirmLabel={isSaving ? "Saving..." : "Save Changes"}
          onClose={() => setIsEditOpen(false)}
          onConfirm={handleSaveEdit}
        >
          {editError && (
            <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>
              {editError}
            </div>
          )}

          <div className="grid cols-2" style={{ gap: 12 }}>
            <Field label="Registration Number">
              <Input
                value={editReg}
                onChange={(e) => setEditReg(e.target.value)}
              />
            </Field>

            <Field label="Vehicle Type">
              <Select value={editType} onChange={(e) => setEditType(e.target.value)}>
                {vehicleTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
          </div>

          <div className="grid cols-2" style={{ gap: 12, marginTop: 12 }}>
            <Field label="Capacity">
              <Input
                value={editCapacity}
                onChange={(e) => setEditCapacity(e.target.value)}
              />
            </Field>

            <Field label="Current Load (%)">
              <Input
                type="number"
                min="0"
                max="100"
                value={editLoad}
                onChange={(e) => setEditLoad(e.target.value)}
              />
            </Field>
          </div>

          <div className="grid cols-2" style={{ gap: 12, marginTop: 12 }}>
            <Field label="Status">
              <Select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                {statusList.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>

            <Field label="Assigned Driver">
              <Select value={editDriver} onChange={(e) => setEditDriver(e.target.value)}>
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
            <Field label="Location">
              <Input
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
              />
            </Field>

            <Field label="Maintenance Notes">
              <Input
                value={editMaintenance}
                onChange={(e) => setEditMaintenance(e.target.value)}
              />
            </Field>
          </div>
        </Modal>
      )}
    </>
  );
}
