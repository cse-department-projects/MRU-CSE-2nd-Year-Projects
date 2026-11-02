import { Link } from 'react-router-dom';
import ErrorState from '../components/ui/ErrorState.jsx';

export default function ErrorPage() {
  return (
    <ErrorState
      title="Something went wrong"
      description="The operation could not be completed. Please return to the dashboard and try again."
      onRetry={() => window.location.reload()}
      action={<Link className="button secondary" to="/dashboard">Back to dashboard</Link>}
    />
  );
}
