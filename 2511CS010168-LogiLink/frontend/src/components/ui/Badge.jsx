import { priorityVariant, statusVariant } from '../../utils/status.js';

function BadgeDot() {
  return <span className="badge-dot" aria-hidden="true" />;
}

export function StatusBadge({ children, variant, status }) {
  const label = status || children;
  const resolved = variant || statusVariant(label);
  return <span className={`badge status-badge ${resolved}`}>{<BadgeDot />}{children}</span>;
}

export function PriorityBadge({ children, priority }) {
  const label = priority || children;
  const resolved = priorityVariant(label);
  const key = String(label).toLowerCase().replaceAll(' ', '-');
  return <span className={`badge priority-badge priority-${key} ${resolved}`}><span className="priority-mark" aria-hidden="true" />{children}</span>;
}

export default function Badge({ children, variant, status, type = 'status', priority }) {
  if (type === 'priority' || priority) return <PriorityBadge priority={priority || status}>{children}</PriorityBadge>;
  return <StatusBadge variant={variant} status={status}>{children}</StatusBadge>;
}
