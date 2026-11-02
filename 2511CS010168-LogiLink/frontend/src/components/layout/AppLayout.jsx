import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext.jsx';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import Toast from '../ui/Toast.jsx';
import { getToken } from '../../services/apiClient.js';

export default function AppLayout() {
  const { sidebarCollapsed } = useApp();
  if (!getToken()) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <Sidebar />
      <div className={`main-area ${sidebarCollapsed ? 'expanded' : ''}`}>
        <Topbar />
        <main className="content">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  );
}
