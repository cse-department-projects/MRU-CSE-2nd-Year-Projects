import { clsx } from 'clsx';

const variants = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
};

const statusMap = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  NO_SHOW: 'default',
  PAID: 'success',
  PARTIAL: 'warning',
  REFUNDED: 'purple',
  ACTIVE: 'success',
  INACTIVE: 'danger',
};

export default function Badge({ children, variant, status, className = '' }) {
  const resolvedVariant = variant || statusMap[status] || 'default';
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      variants[resolvedVariant],
      className
    )}>
      {children}
    </span>
  );
}
