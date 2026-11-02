import {
  BarChart3,
  Bell,
  Boxes,
  ClipboardList,
  Gauge,
  History,
  LayoutDashboard,
  Map,
  MapPinned,
  PackageCheck,
  Route,
  Settings,
  Truck,
  Users,
  Warehouse,
} from 'lucide-react';

export const navGroups = [
  {
    label: 'Operations',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Orders', path: '/orders', icon: ClipboardList },
      { label: 'Shipments', path: '/shipments', icon: PackageCheck },
    ],
  },
  {
    label: 'Fleet',
    items: [
      { label: 'Fleet', path: '/fleet', icon: Truck },
      { label: 'Vehicles', path: '/vehicles', icon: Gauge },
      { label: 'Drivers', path: '/drivers', icon: Users },
      { label: 'Routes', path: '/routes', icon: Route },
      { label: 'Live Tracking', path: '/tracking', icon: MapPinned },
    ],
  },
  {
    label: 'Warehouse',
    items: [
      { label: 'Warehouse', path: '/warehouse', icon: Warehouse },
      { label: 'Inventory', path: '/inventory', icon: Boxes },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Analytics', path: '/analytics', icon: BarChart3 },
      { label: 'Reports', path: '/reports', icon: Map },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Notifications', path: '/notifications', icon: Bell },
      { label: 'Activity Logs', path: '/activity-logs', icon: History },
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];
