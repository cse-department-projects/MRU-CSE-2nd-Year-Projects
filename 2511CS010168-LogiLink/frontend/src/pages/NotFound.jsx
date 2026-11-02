import { Link } from 'react-router-dom';
import { Network } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="login-page" style={{ gridTemplateColumns: '1fr' }}>
      <section className="empty-state">
        <div>
          <div className="state-icon"><Network size={26} /></div>
          <h1>404 · Route not found</h1>
          <p>The requested LogiLink page does not exist or has not been connected yet.</p>
          <Link className="button primary" to="/dashboard">Return to dashboard</Link>
        </div>
      </section>
    </main>
  );
}
