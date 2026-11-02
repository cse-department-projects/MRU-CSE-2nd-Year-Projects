export function statusVariant(status = '') {
  const key = status.toLowerCase();
  if (['delivered', 'available', 'active', 'in stock', 'completed', 'confirmed'].includes(key)) return 'success';
  if (['in transit', 'dispatched', 'on trip', 'picked up', 'out for delivery'].includes(key)) return 'info';
  if (['pending', 'idle', 'maintenance', 'low stock', 'delayed'].includes(key)) return 'warning';
  if (['cancelled', 'offline', 'out of stock', 'suspended'].includes(key)) return 'danger';
  return 'neutral';
}

export function priorityVariant(priority = '') {
  const key = priority.toLowerCase();
  if (key === 'high' || key === 'critical') return 'danger';
  if (key === 'express') return 'warning';
  if (key === 'standard') return 'info';
  return 'neutral';
}
