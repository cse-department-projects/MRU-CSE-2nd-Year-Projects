export const routes = [
  { id: 'RTE-9021', origin: 'Hyderabad', destination: 'Vijayawada', stops: 'Suryapet, Nandigama', vehicle: 'TRK-204', distance: '276 km', time: '5h 05m', fuel: '74 L', status: 'Active' },
  { id: 'RTE-9022', origin: 'Bengaluru', destination: 'Chennai', stops: 'Krishnagiri, Vellore', vehicle: 'REF-118', distance: '348 km', time: '6h 40m', fuel: '96 L', status: 'Delayed' },
  { id: 'RTE-9023', origin: 'Chennai', destination: 'Hyderabad', stops: 'Nellore, Ongole, Vijayawada', vehicle: 'TRK-102', distance: '626 km', time: '11h 25m', fuel: '168 L', status: 'Planned' },
];

export const optimization = {
  original: { distance: '420 km', time: '7h 20m', fuel: '116 L' },
  optimized: { distance: '365 km', time: '6h 05m', fuel: '98 L' },
  savings: { distance: '55 km', time: '1h 15m', fuel: '18 L' },
};
