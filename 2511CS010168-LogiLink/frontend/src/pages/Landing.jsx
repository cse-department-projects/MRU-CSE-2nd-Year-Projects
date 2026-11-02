import {
  ArrowRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Gauge,
  MapPinned,
  Navigation,
  Network,
  PackageCheck,
  RadioTower,
  Route,
  Truck,
  Warehouse,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { deliveryStatus, kpis, shipmentPerformance } from '../data/dashboard.js';
import { trackedVehicles } from '../data/tracking.js';

const features = [
  {
    icon: ClipboardList,
    title: 'Order Management',
    description: 'Create, assign, and monitor customer orders through each dispatch stage.',
  },
  {
    icon: Truck,
    title: 'Fleet Management',
    description: 'Track vehicle availability, capacity, maintenance, and current load status.',
  },
  {
    icon: Route,
    title: 'Route Optimization',
    description: 'Compare route plans and identify cleaner distribution paths before dispatch.',
  },
  {
    icon: MapPinned,
    title: 'Live Tracking',
    description: 'Monitor active shipments, ETAs, vehicle locations, and route progress.',
  },
  {
    icon: Warehouse,
    title: 'Warehouse & Inventory',
    description: 'Connect stock visibility with incoming, outgoing, and reserved inventory.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reporting',
    description: 'Understand delivery health, route efficiency, warehouse stock, and delay risk.',
  },
];

const workflow = [
  'Create Order',
  'Assign Fleet',
  'Optimize Route',
  'Track Shipment',
  'Complete Delivery',
];

const values = [
  { icon: RadioTower, title: 'Real-time visibility' },
  { icon: Navigation, title: 'Smart dispatch' },
  { icon: Gauge, title: 'Fleet optimization' },
  { icon: Boxes, title: 'Connected inventory' },
];

const reasons = [
  'Real-time visibility across orders, fleet, and deliveries',
  'Reduced operational delays through clearer dispatch control',
  'Optimized fleet utilization with vehicle capacity context',
  'Efficient route planning for connected distribution workflows',
  'Centralized logistics control from warehouse to delivery',
  'Better operational decisions through focused analytics',
];

function MiniLineChart() {
  const width = 380;
  const height = 138;
  const padding = 18;
  const max = Math.max(...shipmentPerformance.flatMap((item) => [item.delivered, item.inTransit, item.delayed]));
  const xStep = (width - padding * 2) / (shipmentPerformance.length - 1);
  const point = (value, index) => `${padding + index * xStep},${height - padding - (value / max) * (height - padding * 2)}`;
  const path = (key) => shipmentPerformance.map((item, index) => `${index === 0 ? 'M' : 'L'} ${point(item[key], index)}`).join(' ');

  return (
    <svg className="landing-mini-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Shipment performance preview">
      {[0, 1, 2].map((line) => (
        <line key={line} x1={padding} x2={width - padding} y1={padding + line * 38} y2={padding + line * 38} />
      ))}
      <path d={path('delivered')} className="chart-delivered" />
      <path d={path('inTransit')} className="chart-transit" />
      <path d={path('delayed')} className="chart-delayed" />
    </svg>
  );
}

function ProductPreview() {
  return (
    <div className="landing-product-preview" aria-label="LogiLink dashboard preview">
      <div className="preview-topbar">
        <div>
          <span className="preview-eyebrow">Logistics Command Center</span>
          <strong>Operations overview</strong>
        </div>
        <span className="preview-live"><span /> Live</span>
      </div>
      <div className="preview-kpis">
        {kpis.slice(0, 4).map((item) => (
          <div className="preview-kpi" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.trend} {item.support}</small>
          </div>
        ))}
      </div>
      <div className="preview-grid">
        <div className="preview-panel preview-chart">
          <div className="preview-panel-header">
            <span>Shipment Performance</span>
            <small>Weekly trend</small>
          </div>
          <MiniLineChart />
          <div className="preview-legend">
            <span><i className="legend-delivered" /> Delivered</span>
            <span><i className="legend-transit" /> In Transit</span>
            <span><i className="legend-delayed" /> Delayed</span>
          </div>
        </div>
        <div className="preview-panel">
          <div className="preview-panel-header">
            <span>Fleet Utilization</span>
            <small>Capacity</small>
          </div>
          {['TRK-204', 'TRK-102', 'REF-118'].map((vehicle, index) => (
            <div className="preview-bar-row" key={vehicle}>
              <span>{vehicle}</span>
              <div><span style={{ width: `${[82, 67, 91][index]}%` }} /></div>
              <strong>{[82, 67, 91][index]}%</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LogisticsNetwork() {
  return (
    <div className="landing-network-card" aria-label="Connected logistics route visualization">
      <div className="network-grid" aria-hidden="true" />
      <div className="network-route route-a" />
      <div className="network-route route-b" />
      <div className="network-route route-c" />
      <div className="network-node node-origin">
        <span>Origin</span>
        <strong>Hyderabad</strong>
      </div>
      <div className="network-node node-hub">
        <span>Hub</span>
        <strong>Warehouse</strong>
      </div>
      <div className="network-node node-vehicle">
        <Truck size={18} />
        <strong>TRK-204</strong>
        <span>In Transit</span>
      </div>
      <div className="network-node node-destination">
        <span>Destination</span>
        <strong>Vijayawada</strong>
      </div>
      <div className="network-insight">
        <Clock3 size={16} />
        <div>
          <span>ETA</span>
          <strong>14:35</strong>
        </div>
      </div>
      <div className="network-chip">
        <PackageCheck size={15} />
        82% capacity
      </div>
    </div>
  );
}

export default function Landing() {
  const trackedVehicle = trackedVehicles[0];

  return (
    <main className="landing-page">
      <nav className="landing-nav" aria-label="Public navigation">
        <a className="landing-logo" href="#top" aria-label="LogiLink home">
          <div className="logo-mark"><Network size={23} /></div>
          <div className="logo-text">
            <strong>LogiLink</strong>
            <span>Transportation &amp; Logistics</span>
          </div>
        </a>
        <div className="landing-nav-links" aria-label="Landing page sections">
          <a href="#platform">Platform</a>
          <a href="#features">Features</a>
          <a href="#solutions">Solutions</a>
          <a href="#about">About</a>
        </div>
        <div className="landing-nav-actions">
          <Link className="landing-link-button" to="/login">Sign In</Link>
          <Link className="landing-button landing-button-primary" to="/register">Get Started <ArrowRight size={16} /></Link>
        </div>
      </nav>

      <section className="landing-hero" id="top">
        <div className="landing-hero-copy">
          <p className="landing-kicker"><RadioTower size={15} /> Transportation &amp; Logistics Management Platform</p>
          <h1>Move smarter. Deliver better.</h1>
          <p className="landing-hero-text">Plan, dispatch, track and optimize your transportation operations from one connected workspace.</p>
          <div className="landing-hero-actions">
            <Link className="landing-button landing-button-primary landing-button-large" to="/register">Get Started <ArrowRight size={17} /></Link>
            <a className="landing-button landing-button-secondary landing-button-large" href="#platform">Explore Platform</a>
          </div>
          <div className="landing-hero-proof" aria-label="Platform scope">
            <span>Orders</span>
            <span>Shipments</span>
            <span>Fleet</span>
            <span>Routes</span>
            <span>Inventory</span>
          </div>
        </div>
        <LogisticsNetwork />
      </section>

      <section className="landing-value-strip" aria-label="Operational value">
        {values.map((item) => (
          <div className="value-item" key={item.title}>
            <item.icon size={18} />
            <span>{item.title}</span>
          </div>
        ))}
      </section>

      <section className="landing-section" id="platform">
        <div className="landing-section-header">
          <span className="landing-section-label">Platform</span>
          <h2>Everything your logistics operation needs.</h2>
          <p>Manage orders, fleet, routes, inventory and deliveries from one connected platform.</p>
        </div>
        <div className="landing-feature-grid" id="features">
          {features.map((feature) => (
            <article className="landing-feature-card" key={feature.title}>
              <div className="feature-icon"><feature.icon size={20} /></div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-showcase" aria-labelledby="product-showcase-title">
        <div className="landing-showcase-copy">
          <span className="landing-section-label">Product Showcase</span>
          <h2 id="product-showcase-title">A command center built for active logistics teams.</h2>
          <p>LogiLink brings dispatch queues, vehicle capacity, delivery health, warehouse stock, and shipment risk into one operational view.</p>
          <div className="showcase-points">
            <span><CheckCircle2 size={16} /> Active orders and dispatch status</span>
            <span><CheckCircle2 size={16} /> Fleet utilization and vehicle availability</span>
            <span><CheckCircle2 size={16} /> Shipment performance and delivery risks</span>
          </div>
        </div>
        <ProductPreview />
      </section>

      <section className="landing-section landing-workflow" id="solutions">
        <div className="landing-section-header compact">
          <span className="landing-section-label">Workflow</span>
          <h2>From order to delivery, every step stays connected.</h2>
        </div>
        <div className="workflow-track">
          {workflow.map((step, index) => (
            <article className="workflow-step" key={step}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{step}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-tracking-section" aria-labelledby="tracking-title">
        <div className="tracking-copy">
          <span className="landing-section-label dark">Live Tracking</span>
          <h2 id="tracking-title">Know where every shipment is.</h2>
          <p>Monitor active deliveries, routes and vehicle locations from one centralized operational view.</p>
        </div>
        <div className="tracking-showcase">
          <div className="tracking-map-preview">
            <div className="tracking-map-grid" aria-hidden="true" />
            <span className="tracking-path" />
            <span className="tracking-pin tracking-origin">Origin</span>
            <span className="tracking-pin tracking-destination">Destination</span>
            <span className="tracking-vehicle-marker"><Truck size={17} /></span>
          </div>
          <div className="tracking-card-preview">
            <span className="preview-live"><span /> {trackedVehicle.status}</span>
            <h3>{trackedVehicle.id}</h3>
            <p>{trackedVehicle.origin} to {trackedVehicle.destination}</p>
            <div className="tracking-meta-grid">
              <span>Driver<strong>{trackedVehicle.driver}</strong></span>
              <span>Speed<strong>{trackedVehicle.speed}</strong></span>
              <span>ETA<strong>{trackedVehicle.eta}</strong></span>
              <span>Cargo<strong>{trackedVehicle.cargo}</strong></span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-analytics" aria-labelledby="analytics-title">
        <div>
          <span className="landing-section-label">Operations Intelligence</span>
          <h2 id="analytics-title">Understand what is moving, delayed, available, and ready.</h2>
          <p>LogiLink helps operators review delivery health, route efficiency, fleet utilization, and warehouse movement without switching contexts.</p>
        </div>
        <div className="analytics-panel">
          <div className="analytics-header">
            <span>Delivery Status</span>
            <strong>Operational split</strong>
          </div>
          <div className="analytics-bars">
            {deliveryStatus.map((item) => (
              <div className="analytics-row" key={item.label}>
                <span>{item.label}</span>
                <div><span style={{ width: `${Math.min(item.value / 4, 100)}%`, background: item.color }} /></div>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section landing-why" id="about">
        <div className="landing-section-header">
          <span className="landing-section-label">Why LogiLink</span>
          <h2>Designed for calm, precise logistics control.</h2>
          <p>Bring the operational flow of orders, warehouse, dispatch, fleet, routes, tracking, and analytics into a single product experience.</p>
        </div>
        <div className="why-grid">
          {reasons.map((reason) => (
            <div className="why-item" key={reason}>
              <CheckCircle2 size={17} />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-final-cta">
        <span className="landing-section-label dark">LogiLink</span>
        <h2>Ready to simplify your logistics operations?</h2>
        <p>Bring orders, fleet, routes, tracking and inventory together with LogiLink.</p>
        <Link className="landing-button landing-button-primary landing-button-large" to="/register">Get Started <ArrowRight size={17} /></Link>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <div className="logo-mark"><Network size={22} /></div>
          <div className="logo-text">
            <strong>LogiLink</strong>
            <span>Transportation &amp; Logistics</span>
          </div>
        </div>
        <div className="landing-footer-links">
          <a href="#platform">Platform</a>
          <a href="#features">Features</a>
          <a href="#solutions">Solutions</a>
          <a href="#about">About</a>
          <Link to="/login">Sign In</Link>
          <Link to="/register">Create Account</Link>
        </div>
      </footer>
    </main>
  );
}
