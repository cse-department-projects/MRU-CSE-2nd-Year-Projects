export const shipments = [
  { id: 'SHP-78321', shipmentId: 'SHP-78321', orderId: 'LG-10482', origin: 'Hyderabad', destination: 'Vijayawada', currentLocation: 'Suryapet Bypass', status: 'In Transit', eta: 'Today 14:35', vehicle: 'TRK-204', driver: 'Ahmed Khan', stage: 'In Transit' },
  { id: 'SHP-78322', shipmentId: 'SHP-78322', orderId: 'LG-10483', origin: 'Bengaluru', destination: 'Chennai', currentLocation: 'Krishnagiri checkpoint', status: 'Delayed', eta: 'Today 18:10', vehicle: 'REF-118', driver: 'Meera Iyer', stage: 'Picked Up' },
  { id: 'SHP-78323', shipmentId: 'SHP-78323', orderId: 'LG-10485', origin: 'Warangal', destination: 'Hyderabad', currentLocation: 'Hyderabad Central', status: 'Delivered', eta: 'Delivered 10:15', vehicle: 'LCV-062', driver: 'Ravi Teja', stage: 'Delivered' },
  { id: 'SHP-78324', shipmentId: 'SHP-78324', orderId: 'LG-10486', origin: 'Chennai', destination: 'Hyderabad', currentLocation: 'Nellore corridor', status: 'Dispatched', eta: 'Tomorrow 16:20', vehicle: 'TRK-102', driver: 'Sana Shaikh', stage: 'Dispatched' },
  { id: 'SHP-78325', shipmentId: 'SHP-78325', orderId: 'LG-10487', origin: 'Delhi', destination: 'Jaipur', currentLocation: 'Delhi North Hub', status: 'Confirmed', eta: 'Tomorrow 12:00', vehicle: 'TRK-188', driver: 'Vikram Singh', stage: 'Confirmed' },
];

export const shipmentStages = ['Order Created', 'Confirmed', 'Dispatched', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'];
