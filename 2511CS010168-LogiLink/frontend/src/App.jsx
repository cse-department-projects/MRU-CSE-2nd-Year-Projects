import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Orders from './pages/Orders.jsx';
import OrderForm from './pages/OrderForm.jsx';
import Shipments from './pages/Shipments.jsx';
import ShipmentDetail from './pages/ShipmentDetail.jsx';
import Fleet from './pages/Fleet.jsx';
import Vehicles from './pages/Vehicles.jsx';
import VehicleDetail from './pages/VehicleDetail.jsx';
import Drivers from './pages/Drivers.jsx';
import DriverDetail from './pages/DriverDetail.jsx';
import RoutesPage from './pages/RoutesPage.jsx';
import LiveTracking from './pages/LiveTracking.jsx';
import Warehouse from './pages/Warehouse.jsx';
import WarehouseDetail from './pages/WarehouseDetail.jsx';
import Inventory from './pages/Inventory.jsx';
import Analytics from './pages/Analytics.jsx';
import Reports from './pages/Reports.jsx';
import ActivityLogs from './pages/ActivityLogs.jsx';
import Notifications from './pages/Notifications.jsx';
import Settings from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';
import ErrorPage from './pages/ErrorPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<AppLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/new" element={<OrderForm />} />
        <Route path="orders/:orderId" element={<OrderForm mode="edit" />} />
        <Route path="shipments" element={<Shipments />} />
        <Route path="shipments/:shipmentId" element={<ShipmentDetail />} />
        <Route path="fleet" element={<Fleet />} />
        <Route path="fleet/:vehicleId" element={<VehicleDetail />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="vehicles/:vehicleId" element={<VehicleDetail />} />
        <Route path="drivers" element={<Drivers />} />
        <Route path="drivers/:driverId" element={<DriverDetail />} />
        <Route path="routes" element={<RoutesPage />} />
        <Route path="tracking" element={<LiveTracking />} />
        <Route path="live-tracking" element={<Navigate to="/tracking" replace />} />
        <Route path="warehouse" element={<Warehouse />} />
        <Route path="warehouse/:warehouseId" element={<WarehouseDetail />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="reports" element={<Reports />} />
        <Route path="activity-logs" element={<ActivityLogs />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="error" element={<ErrorPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
