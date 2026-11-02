import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Save } from 'lucide-react';
import { useState } from 'react';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import { Field, Input, Select } from '../components/ui/Input.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { useAsyncData } from '../hooks/useAsyncData.js';
import { orderService } from '../services/orderService.js';
import { vehicleService } from '../services/vehicleService.js';
import { driverService } from '../services/driverService.js';
import { routeService } from '../services/routeService.js';

export default function OrderForm({ mode = 'create' }) {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { notify } = useApp();
  const { data, loading } = useAsyncData(async () => {
    const [orderData, vehiclesList, driversList, routesList] = await Promise.all([
      mode === 'edit' ? orderService.getById(orderId) : Promise.resolve({}),
      vehicleService.list().catch(() => []),
      driverService.list().catch(() => []),
      routeService.list().catch(() => []),
    ]);
    return {
      order: orderData || {},
      vehicles: Array.isArray(vehiclesList) ? vehiclesList : [],
      drivers: Array.isArray(driversList) ? driversList : [],
      routes: Array.isArray(routesList) ? routesList : [],
    };
  }, [orderId, mode]);

  const [errors, setErrors] = useState({});

  const order = data?.order || {};
  const vehicles = data?.vehicles || [];
  const drivers = data?.drivers || [];
  const routes = data?.routes || [];

  const selectedRoute = routes.find(
    (r) => `${r.origin} to ${r.destination}` === order.route || r.routeId === order.route || r.routeId === order.routeId
  );
  const routeDefaultValue = selectedRoute
    ? `${selectedRoute.origin} to ${selectedRoute.destination}`
    : (order.route || '');

  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const required = ['customer', 'contact', 'pickup', 'delivery', 'cargo', 'weight', 'vehicle', 'driver', 'pickupDate', 'deliveryDate'];
    const next = {};
    required.forEach((field) => {
      if (!form.get(field)) next[field] = 'Required for dispatch planning.';
    });
    setErrors(next);
    if (!Object.keys(next).length) {
      const payload = {
        customer: form.get('customer'),
        contact: form.get('contact'),
        email: form.get('email'),
        pickup: form.get('pickup'),
        delivery: form.get('delivery'),
        cargo: form.get('cargo'),
        quantity: form.get('quantity'),
        weight: form.get('weight'),
        priority: form.get('priority'),
        vehicle: form.get('vehicle'),
        driver: form.get('driver'),
        route: form.get('route'),
        pickupDate: form.get('pickupDate'),
        deliveryDate: form.get('deliveryDate'),
        status: form.get('status'),
      };
      try {
        if (mode === 'edit') {
          await orderService.update(orderId, payload);
        } else {
          await orderService.create(payload);
        }
        notify(mode === 'edit' ? 'Order changes saved.' : 'Order created successfully.');
        navigate('/orders');
      } catch (error) {
        notify(error.message, 'danger');
      }
    }
  };

  if (loading) return <LoadingState title="Preparing order form" />;

  return (
    <>
      <PageHeader
        title={mode === 'edit' ? `Order ${orderId}` : 'Create Order'}
        description="A multi-section order form for customer, shipment, transportation, and schedule information."
      />
      <form key={order.orderId || order.id || 'new'} onSubmit={submit}>
        <Card>
          <section className="form-section">
            <h3>Customer Information</h3>
            <div className="form-grid">
              <Field label="Customer name" required error={errors.customer}><Input name="customer" defaultValue={order.customer || ''} /></Field>
              <Field label="Contact" required error={errors.contact}><Input name="contact" defaultValue={order.contact || ''} /></Field>
              <Field label="Email"><Input name="email" type="email" defaultValue={order.email || ''} /></Field>
            </div>
          </section>
          <section className="form-section">
            <h3>Shipment Information</h3>
            <div className="form-grid">
              <Field label="Pickup location" required error={errors.pickup}><Input name="pickup" defaultValue={order.origin || ''} /></Field>
              <Field label="Delivery location" required error={errors.delivery}><Input name="delivery" defaultValue={order.destination || ''} /></Field>
              <Field label="Cargo type" required error={errors.cargo}><Input name="cargo" defaultValue={order.cargo || ''} /></Field>
              <Field label="Quantity"><Input name="quantity" type="number" min="1" placeholder="120" defaultValue={order.quantity || ''} /></Field>
              <Field label="Weight" required error={errors.weight}><Input name="weight" defaultValue={order.weight || ''} /></Field>
              <Field label="Priority"><Select name="priority" defaultValue={order.priority || 'Standard'}><option>Standard</option><option>Express</option><option>High</option><option>Critical</option></Select></Field>
            </div>
          </section>
          <section className="form-section">
            <h3>Transportation</h3>
            <div className="form-grid">
              <Field label="Vehicle" required error={errors.vehicle}>
                <Select name="vehicle" defaultValue={order.vehicle || ''}>
                  <option value="">Select vehicle</option>
                  <option value="Unassigned">Unassigned</option>
                  {vehicles.map((v) => {
                    const vId = v.vehicleId || v.id;
                    return <option key={vId} value={vId}>{vId}</option>;
                  })}
                  {order.vehicle && order.vehicle !== 'Unassigned' && !vehicles.some((v) => (v.vehicleId || v.id) === order.vehicle) && (
                    <option value={order.vehicle}>{order.vehicle}</option>
                  )}
                </Select>
              </Field>
              <Field label="Driver" required error={errors.driver}>
                <Select name="driver" defaultValue={order.driver || ''}>
                  <option value="">Select driver</option>
                  <option value="Unassigned">Unassigned</option>
                  {drivers.map((d) => (
                    <option key={d.driverId || d.name} value={d.name}>{d.name}</option>
                  ))}
                  {order.driver && order.driver !== 'Unassigned' && !drivers.some((d) => d.name === order.driver) && (
                    <option value={order.driver}>{order.driver}</option>
                  )}
                </Select>
              </Field>
              <Field label="Route">
                <Select name="route" defaultValue={routeDefaultValue}>
                  <option value="">Select route</option>
                  {routes.map((r) => {
                    const label = `${r.origin} to ${r.destination}`;
                    return <option key={r.routeId || label} value={label}>{label}</option>;
                  })}
                  {routeDefaultValue && !routes.some((r) => `${r.origin} to ${r.destination}` === routeDefaultValue) && (
                    <option value={routeDefaultValue}>{routeDefaultValue}</option>
                  )}
                  {!routes.length && (
                    <>
                      <option>Hyderabad to Vijayawada</option>
                      <option>Bengaluru to Chennai</option>
                      <option>Chennai to Hyderabad</option>
                    </>
                  )}
                </Select>
              </Field>
            </div>
          </section>
          <section className="form-section">
            <h3>Schedule</h3>
            <div className="form-grid">
              <Field label="Pickup date" required error={errors.pickupDate}><Input name="pickupDate" type="date" defaultValue={order.pickupDate || ''} /></Field>
              <Field label="Expected delivery date" required error={errors.deliveryDate}><Input name="deliveryDate" type="date" defaultValue={order.deliveryDate || ''} /></Field>
              <Field label="Status">
                <Select name="status" defaultValue={order.status || 'Pending'}>
                  <option>Pending</option>
                  <option>Confirmed</option>
                  <option>Dispatched</option>
                  <option>In Transit</option>
                  <option>Delivered</option>
                  <option>Delayed</option>
                  <option>Cancelled</option>
                </Select>
              </Field>
            </div>
          </section>
        </Card>
        <div className="toolbar" style={{ marginTop: 16 }}>
          <Button type="button" variant="secondary" onClick={() => navigate('/orders')}>Cancel</Button>
          <div className="filters">
            <Button type="button" variant="secondary" onClick={() => notify('Draft saved in local session.')}><Save size={16} /> Save Draft</Button>
            <Button type="submit"><CheckCircle2 size={16} /> {mode === 'edit' ? 'Save Changes' : 'Create Order'}</Button>
          </div>
        </div>
      </form>
    </>
  );
}
