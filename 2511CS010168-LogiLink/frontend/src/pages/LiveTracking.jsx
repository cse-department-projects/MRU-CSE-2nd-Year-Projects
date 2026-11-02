import { Link } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  Truck,
  Search,
  Plus,
  Clock,
  Radio,
  ExternalLink,
  RotateCw,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { Field, Input, Select } from '../components/ui/Input.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import Modal from '../components/ui/Modal.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { trackingService } from '../services/trackingService.js';
import InteractiveMap from '../components/map/InteractiveMap.jsx';

const filters = ['All', 'In Transit', 'Available', 'Delayed', 'Offline', 'Maintenance'];
const vehicleKey = (vehicle) => vehicle?.vehicleId ?? vehicle?.id;

export default function LiveTracking() {
  const { notify } = useApp();
  const { data, loading, reload, setData } = useAsyncData(() => trackingService.list(), []);

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date());

  // Selected vehicle tracking timeline
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // Telemetry Ping Modal (Real GPS Checkpoint)
  const [isPingModalOpen, setIsPingModalOpen] = useState(false);
  const [pingStatus, setPingStatus] = useState('In Transit');
  const [pingSpeed, setPingSpeed] = useState('62 km/h');
  const [pingLocation, setPingLocation] = useState('Suryapet Bypass');
  const [pingLat, setPingLat] = useState(17.2600);
  const [pingLng, setPingLng] = useState(79.3400);
  const [pingEta, setPingEta] = useState('Today, 6:00 PM');
  const [isPinging, setIsPinging] = useState(false);
  const [pingError, setPingError] = useState('');

  // Auto-refresh polling every 20 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      reload();
      setLastRefreshedAt(new Date());
    }, 20000);
    return () => clearInterval(timer);
  }, [reload]);

  // Auto-select first vehicle if selectedId is not set
  useEffect(() => {
    if (data && data.length > 0 && !selectedId) {
      setSelectedId(vehicleKey(data[0]));
    }
  }, [data, selectedId]);

  // Filter vehicles
  const vehicles = useMemo(() => {
    let list = data || [];
    if (filter !== 'All') {
      list = list.filter((v) => (v.status || '').toLowerCase() === filter.toLowerCase());
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          (v.id || '').toLowerCase().includes(q) ||
          (v.vehicleId || '').toLowerCase().includes(q) ||
          (v.driver || '').toLowerCase().includes(q) ||
          (v.origin || '').toLowerCase().includes(q) ||
          (v.destination || '').toLowerCase().includes(q) ||
          (v.location || '').toLowerCase().includes(q) ||
          (v.activeShipment || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, filter, search]);

  const selected = useMemo(() => {
    const found = (data || []).find((vehicle) => vehicleKey(vehicle) === selectedId);
    return found || vehicles[0] || null;
  }, [data, selectedId, vehicles]);

  // Load telemetry timeline whenever selected vehicle changes
  useEffect(() => {
    const selectedVehicleId = vehicleKey(selected);
    if (selectedVehicleId) {
      setTimelineLoading(true);
      trackingService
        .getByVehicle(selectedVehicleId)
        .then((events) => {
          setTimelineEvents(events || []);
        })
        .catch(() => {
          setTimelineEvents([]);
        })
        .finally(() => {
          setTimelineLoading(false);
        });
    } else {
      setTimelineEvents([]);
    }
  }, [selected]);

  const handleOpenPingModal = () => {
    if (!selected) return;
    setPingStatus(selected.status || 'In Transit');
    setPingSpeed(selected.speed !== 'Offline' ? selected.speed : '55 km/h');
    setPingLocation(selected.location || 'Corridor Checkpoint');
    setPingLat(selected.latitude != null ? Number(selected.latitude) : 17.3850);
    setPingLng(selected.longitude != null ? Number(selected.longitude) : 78.4867);
    setPingEta(selected.eta || 'On schedule');
    setPingError('');
    setIsPingModalOpen(true);
  };

  const handleSendPing = async () => {
    if (!selected) return;
    setIsPinging(true);
    setPingError('');
    try {
      const latVal = Number(pingLat);
      const lngVal = Number(pingLng);
      const payload = {
        vehicleId: vehicleKey(selected),
        shipmentId: selected.activeShipment || undefined,
        status: pingStatus,
        speed: pingSpeed.trim() || '60 km/h',
        location: pingLocation.trim() || 'Checkpoint',
        latitude: !isNaN(latVal) ? latVal : 17.3850,
        longitude: !isNaN(lngVal) ? lngVal : 78.4867,
        eta: pingEta.trim() || 'On schedule',
      };

      const newEvent = await trackingService.createEvent(payload);
      notify(`Telemetry checkpoint recorded at ${payload.location} for ${vehicleKey(selected)}.`);
      setIsPingModalOpen(false);

      // Refresh to update real map position
      reload();
      setLastRefreshedAt(new Date());
      setTimelineEvents((prev) => [newEvent, ...(prev || [])]);
    } catch (err) {
      setPingError(err.message || 'Failed to record tracking event.');
    } finally {
      setIsPinging(false);
    }
  };

  if (loading) return <LoadingState title="Loading live fleet tracking" />;

  const getStatusBadgeVariant = (st) => {
    const s = (st || '').toLowerCase();
    if (s === 'in transit' || s === 'dispatched') return 'info';
    if (s === 'available' || s === 'delivered') return 'success';
    if (s === 'delayed') return 'error';
    if (s === 'maintenance') return 'warning';
    return 'neutral';
  };

  return (
    <>
      <PageHeader
        title="Live Fleet & Shipment Tracking"
        description="Real-time operations canvas showing fleet GPS position, corridor status, driver telemetry, and delivery checkpoints."
        actions={
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Button variant="secondary" icon={RotateCw} onClick={reload} title="Refresh live telemetry">
              Refresh
            </Button>
            {selected && (
              <Button icon={Radio} onClick={handleOpenPingModal}>
                Log Checkpoint
              </Button>
            )}
          </div>
        }
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ minWidth: '280px', flex: '1 1 300px' }}>
          <Input
            icon={Search}
            placeholder="Search by vehicle ID, driver, corridor, or shipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Tabs tabs={filters} active={filter} onChange={setFilter} />
      </div>

      {(data || []).length === 0 ? (
        <EmptyState
          title="No fleet vehicles available to track"
          description="Register vehicles in the Fleet module to view real-time location telemetry."
          action={
            <Link className="button" to="/fleet">
              Go to Fleet Management
            </Link>
          }
        />
      ) : (
        <div className="tracking-layout">
          {/* Real Leaflet Interactive Map Section */}
          <section
            aria-label="Fleet tracking map"
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '520px',
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          >
            <InteractiveMap
              vehicles={vehicles}
              selectedVehicleId={vehicleKey(selected)}
              onVehicleSelect={(v) => setSelectedId(vehicleKey(v))}
              origin={selected?.routeOriginLat ? { name: selected.origin, lat: selected.routeOriginLat, lng: selected.routeOriginLng } : null}
              destination={selected?.routeDestLat ? { name: selected.destination, lat: selected.routeDestLat, lng: selected.routeDestLng } : null}
              routeGeometry={selected?.routeGeometry || null}
              height="560px"
            />

            {/* Map Overlay Badge */}
            <div style={{ position: 'absolute', top: '14px', left: '16px', zIndex: 1000, background: 'rgba(15,23,42,0.85)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem', pointerEvents: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Live Telemetry Feed • <strong>{vehicles.length}</strong> active tracked units • Auto-refresh 20s
            </div>
          </section>

          {/* Sidebar Section */}
          <aside className="grid" style={{ gap: '1.25rem' }}>
            {/* Active Vehicles List */}
            <Card title="Tracked Fleet Units" subtitle={`${vehicles.length} vehicles matching view`}>
              <div className="vehicle-list" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {vehicles.length === 0 ? (
                  <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    No vehicles match the selected filter.
                  </div>
                ) : (
                  vehicles.map((vehicle) => (
                    <button
                      key={vehicleKey(vehicle)}
                      className={`vehicle-item ${vehicleKey(selected) === vehicleKey(vehicle) ? 'active' : ''}`}
                      onClick={() => setSelectedId(vehicleKey(vehicle))}
                      style={{ textAlign: 'left', width: '100%', cursor: 'pointer' }}
                    >
                      <strong style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{vehicleKey(vehicle)}</span>
                        <Badge variant={getStatusBadgeVariant(vehicle.status)}>{vehicle.status}</Badge>
                      </strong>
                      <p className="card-subtitle">
                        Driver: {vehicle.driver} • ETA: {vehicle.eta}
                      </p>
                      <p className="card-subtitle">
                        Speed: {vehicle.speed} • Cargo: {vehicle.cargo}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </Card>

            {/* Selected Vehicle Details */}
            {selected && (
              <Card
                title={vehicleKey(selected)}
                subtitle={`${selected.origin || 'Origin'} → ${selected.destination || 'Destination'}`}
                action={
                  <Link to={`/fleet/${vehicleKey(selected)}`} title="View fleet vehicle details" style={{ color: 'var(--primary)' }}>
                    <ExternalLink size={18} />
                  </Link>
                }
              >
                <div className="detail-list">
                  <div className="detail-row">
                    <span>Operational Status</span>
                    <strong>
                      <Badge variant={getStatusBadgeVariant(selected.status)}>{selected.status}</Badge>
                    </strong>
                  </div>
                  <div className="detail-row">
                    <span>Assigned Driver</span>
                    <strong>
                      {selected.driverId ? (
                        <Link to={`/drivers/${selected.driverId}`} style={{ color: 'inherit' }}>
                          {selected.driver}
                        </Link>
                      ) : (
                        selected.driver
                      )}
                    </strong>
                  </div>
                  <div className="detail-row">
                    <span>Current Speed</span>
                    <strong>{selected.speed}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Estimated Arrival</span>
                    <strong>{selected.eta}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Cargo & Capacity</span>
                    <strong>{selected.cargo}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Reported Location</span>
                    <strong>{selected.location || 'En route'}</strong>
                  </div>
                  {selected.activeShipment && (
                    <div className="detail-row">
                      <span>Active Shipment</span>
                      <strong>
                        <Link to={`/shipments/${selected.activeShipment}`} style={{ color: 'var(--primary)' }}>
                          {selected.activeShipment}
                        </Link>
                      </strong>
                    </div>
                  )}
                  {selected.activeOrder && (
                    <div className="detail-row">
                      <span>Order Reference</span>
                      <strong>
                        <Link to={`/orders/${selected.activeOrder}`} style={{ color: 'var(--primary)' }}>
                          {selected.activeOrder}
                        </Link>
                      </strong>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Live Telemetry History / Timeline */}
            {selected && (
              <Card title="Telemetry Checkpoints" subtitle={`Recorded checkpoints for ${vehicleKey(selected)}`}>
                {timelineLoading ? (
                  <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading checkpoint history...</div>
                ) : timelineEvents.length === 0 ? (
                  <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                    No checkpoint pings logged yet. Click &quot;Log Checkpoint&quot; to register live telemetry.
                  </div>
                ) : (
                  <div className="timeline" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    {timelineEvents.map((evt, idx) => (
                      <div key={evt.id || idx} className={`timeline-item ${idx === 0 ? 'current' : 'done'}`}>
                        <div className="timeline-dot">
                          <Activity size={12} />
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.85rem' }}>
                            {evt.status || 'In Transit'} • {evt.location || 'Checkpoint'}
                          </strong>
                          <p className="card-subtitle" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                            Speed: {evt.speed || '0 km/h'} • ETA: {evt.eta || 'N/A'} • {new Date(evt.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </aside>
        </div>
      )}

      {/* Telemetry Ping Modal */}
      <Modal open={isPingModalOpen} onClose={() => setIsPingModalOpen(false)} title={`Log Checkpoint Ping: ${vehicleKey(selected) || ''}`}>
        {pingError && (
          <div style={{ padding: '0.75rem', marginBottom: '1rem', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.875rem' }}>
            {pingError}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Status">
              <Select value={pingStatus} onChange={(e) => setPingStatus(e.target.value)}>
                {['In Transit', 'Dispatched', 'Delayed', 'Available', 'Offline'].map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </Select>
            </Field>
            <Field label="Speed">
              <Input value={pingSpeed} onChange={(e) => setPingSpeed(e.target.value)} placeholder="e.g. 58 km/h" />
            </Field>
          </div>
          <Field label="Checkpoint Location">
            <Input value={pingLocation} onChange={(e) => setPingLocation(e.target.value)} placeholder="e.g. Toll Plaza 4, Highway NH-44" />
          </Field>
          <Field label="Estimated Arrival (ETA)">
            <Input value={pingEta} onChange={(e) => setPingEta(e.target.value)} placeholder="e.g. Today, 7:15 PM" />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Latitude (°N)">
              <Input
                type="number"
                step="0.0001"
                value={pingLat}
                onChange={(e) => setPingLat(e.target.value)}
                placeholder="e.g. 17.2600"
              />
            </Field>
            <Field label="Longitude (°E)">
              <Input
                type="number"
                step="0.0001"
                value={pingLng}
                onChange={(e) => setPingLng(e.target.value)}
                placeholder="e.g. 79.3400"
              />
            </Field>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsPingModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendPing} disabled={isPinging}>
              {isPinging ? 'Logging...' : 'Save Checkpoint'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
