import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Layout from './components/layout/Layout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminPatients from './pages/admin/AdminPatients';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminBills from './pages/admin/AdminBills';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

// Pharmacist Pages
import PharmacistDashboard from './pages/pharmacist/PharmacistDashboard';
import PharmacistAnalytics from './pages/pharmacist/PharmacistAnalytics';
import PharmacistMedicines from './pages/pharmacist/PharmacistMedicines';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAnalytics from './pages/doctor/DoctorAnalytics';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import DoctorMedicalRecords from './pages/doctor/DoctorMedicalRecords';
import DoctorProfile from './pages/doctor/DoctorProfile';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAnalytics from './pages/patient/PatientAnalytics';
import PatientBookAppointment from './pages/patient/PatientBookAppointment';
import PatientAppointments from './pages/patient/PatientAppointments';
import { PatientBills, PatientPrescriptions } from './pages/patient/PatientRecords';
import PatientMedicalRecords from './pages/patient/PatientMedicalRecords';
import PatientProfile from './pages/patient/PatientProfile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><Layout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="doctors" element={<AdminDoctors />} />
            <Route path="patients" element={<AdminPatients />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="bills" element={<AdminBills />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
          </Route>

          {/* Protected Pharmacist Routes */}
          <Route path="/pharmacist" element={<ProtectedRoute allowedRoles={['PHARMACIST']}><Layout /></ProtectedRoute>}>
            <Route index element={<PharmacistDashboard />} />
            <Route path="analytics" element={<PharmacistAnalytics />} />
            <Route path="medicines" element={<PharmacistMedicines />} />
          </Route>

          {/* Protected Doctor Routes */}
          <Route path="/doctor" element={<ProtectedRoute allowedRoles={['DOCTOR']}><Layout /></ProtectedRoute>}>
            <Route index element={<DoctorDashboard />} />
            <Route path="analytics" element={<DoctorAnalytics />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="prescriptions" element={<DoctorPrescriptions />} />
            <Route path="medical-records" element={<DoctorMedicalRecords />} />
            <Route path="profile" element={<DoctorProfile />} />
          </Route>

          {/* Protected Patient Routes */}
          <Route path="/patient" element={<ProtectedRoute allowedRoles={['PATIENT']}><Layout /></ProtectedRoute>}>
            <Route index element={<PatientDashboard />} />
            <Route path="analytics" element={<PatientAnalytics />} />
            <Route path="book-appointment" element={<PatientBookAppointment />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="bills" element={<PatientBills />} />
            <Route path="prescriptions" element={<PatientPrescriptions />} />
            <Route path="medical-records" element={<PatientMedicalRecords />} />
            <Route path="profile" element={<PatientProfile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
