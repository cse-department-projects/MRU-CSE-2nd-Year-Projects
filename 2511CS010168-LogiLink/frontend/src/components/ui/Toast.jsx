import { useApp } from '../../contexts/AppContext.jsx';

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return <div className={`toast ${toast.variant}`} role="status" aria-live="polite">{toast.message}</div>;
}
