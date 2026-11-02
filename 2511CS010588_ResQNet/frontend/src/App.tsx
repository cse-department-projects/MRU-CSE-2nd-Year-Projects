import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { RoleGuard } from './components/layout/RoleGuard';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { CitizenDashboard } from './pages/citizen/CitizenDashboard';
import { VolunteerDashboard } from './pages/volunteer/VolunteerDashboard';
import { RescueDashboard } from './pages/rescue/RescueDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { DisasterFeedPage } from './pages/shared/DisasterFeedPage';
import { SheltersPage } from './pages/shared/SheltersPage';
import { HospitalsPage } from './pages/shared/HospitalsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="disasters" element={<DisasterFeedPage />} />
            <Route path="shelters" element={<SheltersPage />} />
            <Route path="hospitals" element={<HospitalsPage />} />


            {/* Protected Role Sectors */}
            <Route
              path="citizen"
              element={
                <RoleGuard allowedRoles={['CITIZEN', 'ADMIN']}>
                  <CitizenDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="volunteer"
              element={
                <RoleGuard allowedRoles={['VOLUNTEER', 'ADMIN']}>
                  <VolunteerDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="volunteer/tasks"
              element={
                <RoleGuard allowedRoles={['VOLUNTEER', 'ADMIN']}>
                  <VolunteerDashboard initialTab="MY_TASKS" />
                </RoleGuard>
              }
            />
            <Route
              path="volunteer/rewards"
              element={
                <RoleGuard allowedRoles={['VOLUNTEER', 'ADMIN']}>
                  <VolunteerDashboard initialTab="LEADERBOARD" />
                </RoleGuard>
              }
            />
            <Route
              path="volunteer/profile"
              element={
                <RoleGuard allowedRoles={['VOLUNTEER', 'ADMIN']}>
                  <VolunteerDashboard openProfile={true} />
                </RoleGuard>
              }
            />
            <Route
              path="rescue"
              element={
                <RoleGuard allowedRoles={['RESCUE_TEAM', 'ADMIN']}>
                  <RescueDashboard />
                </RoleGuard>
              }
            />
            <Route
              path="admin"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </RoleGuard>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
