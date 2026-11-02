import { useParams, Link, useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, Edit3, MapPin, Truck, User, Calendar, Navigation, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import Modal from '../components/ui/Modal.jsx';
import { Field, Input, Select } from '../components/ui/Input.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { shipmentService } from '../services/shipmentService.js';
import { vehicleService } from '../services/vehicleService.js';
import { driverService } from '../services/driverService.js';

const statusOptions = ['Pending', 'Confirmed', 'Dispatched', 'In Transit', 'Delivered', 'Delayed', 'Cancelled'];

export default function ShipmentDetail() {
  const { shipmentId } = useParams();
  const navigate = useNavigate();
  const { notify } = useApp();

  const shipment = useAsyncData(() => shipmentService.getById(shipmentId), [shipmentId]);
  const stages = useAsyncData(() => shipmentService.stages(), []);
  const trackingEvents = useAsyncData(() => shipmentService.tracking(shipmentId).catch(() => []), [shipmentId]);

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editStatus, setEditStatus] = useState('');
  const [editStage, setEditStage] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editEta, setEditEta] = useState('');
  const [editVehicle, setEditVehicle] = useState('');
  const [editDriver, setEditDriver] = useState('');
  const [vehiclesList, setVehiclesList] = useState([]);
  const [driversList, setDriversList] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState('');

  if (shipment.loading || stages.loading) return <LoadingState title="Loading shipment detail" />;
  if (shipment.error || !shipment.data) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto' }}>
        <ErrorState
          title="Shipment not found"
          message="The requested shipment does not exist or does not belong to your organization."
        />
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Button variant="secondary" onClick={() => navigate('/shipments')}>
            <ArrowLeft size={16} /> Back to Shipments
          </Button>
        </div>
      </div>
    );
  }

  const allStages = stages.data || ['Order Created', 'Confirmed', 'Dispatched', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'];
  const currentIndex = allStages.indexOf(shipment.data.stage);

  const openEditModal = () => {
    setEditStatus(shipment.data.status || 'In Transit');
    setEditStage(shipment.data.stage || 'In Transit');
    setEditLocation(shipment.data.currentLocation || '');
    setEditEta(shipment.data.eta || '');
    setEditVehicle(shipment.data.vehicle || 'Unassigned');
    setEditDriver(shipment.data.driver || 'Unassigned');
    setEditError('');
    setIsEditOpen(true);

    Promise.all([
      vehicleService.list().catch(() => []),
      driverService.list().catch(() => []),
    ]).then(([vehRes, drvRes]) => {
      setVehiclesList(vehRes || []);
      setDriversList(drvRes || []);
    });
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    setEditError('');
    try {
      const payload = {
        status: editStatus,
        stage: editStage,
        currentLocation: editLocation,
        eta: editEta,
        vehicle: editVehicle !== 'Unassigned' ? editVehicle : null,
        driver: editDriver !== 'Unassigned' ? editDriver : null,
      };
      const updated = await shipmentService.update(shipment.data.id, payload);
      shipment.setData(updated);
      notify(`Shipment ${updated.shipmentId} updated successfully.`);
      setIsEditOpen(false);
    } catch (err) {
      setEditError(err.message || 'Failed to update shipment.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickStatusChange = async (nextStatus) => {
    try {
      const updated = await shipmentService.updateStatus(shipment.data.id, nextStatus);
      shipment.setData(updated);
      notify(`Status updated to ${nextStatus}.`);
    } catch (err) {
      notify(err.message || 'Failed to update status.', 'danger');
    }
  };

  const handleStageClick = async (targetStage) => {
    try {
      let inferredStatus = shipment.data.status;
      if (targetStage === 'Delivered') inferredStatus = 'Delivered';
      else if (targetStage === 'In Transit' || targetStage === 'Out for Delivery') inferredStatus = 'In Transit';
      else if (targetStage === 'Dispatched') inferredStatus = 'Dispatched';

      const updated = await shipmentService.updateStatus(shipment.data.id, {
        stage: targetStage,
        status: inferredStatus,
      });
      shipment.setData(updated);
      notify(`Timeline advanced to "${targetStage}".`);
    } catch (err) {
      notify(err.message || 'Failed to update stage.', 'danger');
    }
  };

  return (
    <>
      <PageHeader
        title={shipment.data.shipmentId}
        description={`${shipment.data.origin || 'Origin'} → ${shipment.data.destination || 'Destination'}`}
        actions={
          <div style={{ display: 'flex', gap: 10 }}>
            <Link className="button secondary" to="/shipments">
              <ArrowLeft size={16} /> All Shipments
            </Link>
            <Button variant="primary" onClick={openEditModal}>
              <Edit3 size={16} /> Edit Shipment
            </Button>
          </div>
        }
      />

      <div className="grid cols-2" style={{ gap: 20 }}>
        {/* SHIPMENT SUMMARY */}
        <Card
          title="Shipment Summary"
          subtitle={`Created: ${shipment.data.createdDate || 'Recently'}`}
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Badge>{shipment.data.status}</Badge>
              <Select
                value={shipment.data.status}
                onChange={(e) => handleQuickStatusChange(e.target.value)}
                style={{ padding: '4px 8px', fontSize: 13, height: 'auto' }}
                aria-label="Change status"
              >
                {statusOptions.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </Select>
            </div>
          }
        >
          <div className="detail-list">
            <div className="detail-row">
              <span>Associated Order</span>
              <strong>
                {shipment.data.orderId ? (
                  <Link to={`/orders/${shipment.data.orderId}`} style={{ color: 'var(--color-primary, #2563eb)', textDecoration: 'underline' }}>
                    {shipment.data.orderId}
                  </Link>
                ) : 'None'}
              </strong>
            </div>
            {shipment.data.customer && (
              <div className="detail-row">
                <span>Customer</span>
                <strong>{shipment.data.customer}</strong>
              </div>
            )}
            {shipment.data.cargo && (
              <div className="detail-row">
                <span>Cargo / Load</span>
                <strong>{shipment.data.cargo} {shipment.data.weight ? `(${shipment.data.weight})` : ''}</strong>
              </div>
            )}
            <div className="detail-row">
              <span>Route Corridor</span>
              <strong>{shipment.data.origin} → {shipment.data.destination}</strong>
            </div>
            <div className="detail-row">
              <span>Current Checkpoint</span>
              <strong>{shipment.data.currentLocation || 'Not logged'}</strong>
            </div>
            <div className="detail-row">
              <span>Assigned Vehicle</span>
              <strong>{shipment.data.vehicle}</strong>
            </div>
            <div className="detail-row">
              <span>Assigned Driver</span>
              <strong>{shipment.data.driver}</strong>
            </div>
            <div className="detail-row">
              <span>Estimated Arrival (ETA)</span>
              <strong>{shipment.data.eta || 'Pending'}</strong>
            </div>
          </div>
        </Card>

        {/* DELIVERY TIMELINE */}
        <Card title="Delivery Timeline" subtitle="Click any stage below to advance or log checkpoint state">
          <div className="timeline">
            {allStages.map((stage, index) => {
              const isPast = index < currentIndex;
              const isCurrent = index === currentIndex;
              return (
                <div
                  key={stage}
                  className={`timeline-item ${isPast ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleStageClick(stage)}
                  title={`Click to set stage to ${stage}`}
                >
                  <div className="timeline-dot">
                    {isPast ? <Check size={16} /> : index + 1}
                  </div>
                  <div>
                    <strong style={{ color: isCurrent ? 'var(--color-primary, #2563eb)' : 'inherit' }}>
                      {stage} {isCurrent && '(Active Stage)'}
                    </strong>
                    <p className="card-subtitle">
                      {isPast ? 'Completed in shipment pipeline' : isCurrent ? 'Active operational checkpoint' : 'Awaiting dispatch advancement'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* TRACKING EVENTS BREADCRUMBS */}
      {trackingEvents.data && trackingEvents.data.length > 0 && (
        <Card title="Live Tracking Breadcrumbs" subtitle="Automated telemetry and checkpoint events for this shipment" style={{ marginTop: 20 }}>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Status</th>
                  <th>Speed</th>
                  <th>ETA</th>
                  <th>Vehicle</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {trackingEvents.data.map((evt) => (
                  <tr key={evt.id}>
                    <td>#{evt.id}</td>
                    <td><Badge>{evt.status}</Badge></td>
                    <td>{evt.speed || 'N/A'}</td>
                    <td>{evt.eta || 'N/A'}</td>
                    <td>{evt.vehicleId || 'Assigned vehicle'}</td>
                    <td>{evt.timestamp ? new Date(evt.timestamp).toLocaleString() : 'Recent'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* EDIT SHIPMENT MODAL */}
      {isEditOpen && (
        <Modal
          title={`Edit Shipment ${shipment.data.shipmentId}`}
          confirmLabel={isSaving ? "Saving..." : "Save Changes"}
          onClose={() => setIsEditOpen(false)}
          onConfirm={handleSaveEdit}
        >
          {editError && (
            <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={18} />
              <span>{editError}</span>
            </div>
          )}

          <div className="grid cols-2" style={{ gap: 12 }}>
            <Field label="Status">
              <Select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                {statusOptions.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </Select>
            </Field>

            <Field label="Stage">
              <Select value={editStage} onChange={(e) => setEditStage(e.target.value)}>
                {allStages.map((stg) => (
                  <option key={stg} value={stg}>{stg}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid cols-2" style={{ gap: 12, marginTop: 12 }}>
            <Field label="Vehicle">
              <Select value={editVehicle} onChange={(e) => setEditVehicle(e.target.value)}>
                <option value="Unassigned">Unassigned</option>
                {vehiclesList.map((v) => (
                  <option key={v.vehicleId || v.id} value={v.vehicleId || v.id}>
                    {v.vehicleId} ({v.type || 'Truck'})
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Driver">
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
            <Field label="Current Location">
              <Input
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="Current city or checkpoint"
              />
            </Field>

            <Field label="ETA">
              <Input
                value={editEta}
                onChange={(e) => setEditEta(e.target.value)}
                placeholder="Estimated Arrival"
              />
            </Field>
          </div>
        </Modal>
      )}
    </>
  );
}
