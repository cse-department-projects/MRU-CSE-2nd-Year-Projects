import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'Nothing here yet', description, action }) {
  return (
    <div className="empty-state">
      <div>
        <div className="state-icon">
          <Inbox size={24} />
        </div>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
        {action}
      </div>
    </div>
  );
}
