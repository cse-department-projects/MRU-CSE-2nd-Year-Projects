import { AlertTriangle } from 'lucide-react';
import Button from './Button.jsx';

export default function ErrorState({ title = 'Unable to load this view', description, message, onRetry, action }) {
  return (
    <div className="error-state">
      <div>
        <div className="state-icon">
          <AlertTriangle size={24} />
        </div>
        <h3>{title}</h3>
        <p>{description || message || 'The API connection can surface network and server errors here.'}</p>
        {onRetry && <Button onClick={onRetry}>Retry</Button>}
        {action}
      </div>
    </div>
  );
}
