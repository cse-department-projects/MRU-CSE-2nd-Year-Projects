export const kpis = [
  { label: 'Active Orders', value: '1,248', trend: '+12.5%', support: 'vs last week', key: 'orders' },
  { label: 'In Transit', value: '386', trend: '+8.1%', support: 'live shipments', key: 'transit' },
  { label: 'Delivered Today', value: '174', trend: '+5.4%', support: 'before SLA', key: 'delivered' },
  { label: 'Pending Dispatch', value: '64', trend: '-6.8%', support: 'queue reduced', trendDirection: 'up', key: 'pending' },
  { label: 'Fleet Utilization', value: '78%', trend: '+3.2%', support: 'capacity used', key: 'utilization' },
  { label: 'Available Vehicles', value: '42', trend: '-4', support: 'ready now', trendDirection: 'down', key: 'available' },
  { label: 'Warehouse Stock', value: '92%', trend: '+2.6%', support: 'healthy fill rate', key: 'stock' },
  { label: 'Delayed Shipments', value: '18', trend: '-9.5%', support: 'delay count', key: 'delayed' },
];

export const shipmentPerformance = [
  { day: 'Mon', delivered: 142, inTransit: 78, delayed: 14 },
  { day: 'Tue', delivered: 156, inTransit: 86, delayed: 12 },
  { day: 'Wed', delivered: 149, inTransit: 91, delayed: 17 },
  { day: 'Thu', delivered: 168, inTransit: 95, delayed: 13 },
  { day: 'Fri', delivered: 174, inTransit: 104, delayed: 18 },
  { day: 'Sat', delivered: 128, inTransit: 86, delayed: 10 },
];

export const fleetUtilization = [
  { label: 'TRK-204', value: 82 },
  { label: 'TRK-102', value: 67 },
  { label: 'REF-118', value: 91, color: '#d97706' },
  { label: 'LCV-062', value: 35, color: '#0d9488' },
  { label: 'TRK-188', value: 42 },
];

export const deliveryStatus = [
  { label: 'Delivered', value: 174, color: '#16a34a' },
  { label: 'In Transit', value: 386, color: '#2563eb' },
  { label: 'Pending', value: 64, color: '#d97706' },
  { label: 'Delayed', value: 18, color: '#dc2626' },
];
