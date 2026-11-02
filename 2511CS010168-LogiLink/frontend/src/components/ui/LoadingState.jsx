import { LoaderCircle } from 'lucide-react';

export default function LoadingState({ title = 'Loading operational data' }) {
  return (
    <div className="loading-state">
      <div>
        <div className="state-icon">
          <LoaderCircle size={24} />
        </div>
        <h3>{title}</h3>
        <p>Preparing the latest operational records.</p>
      </div>
    </div>
  );
}
