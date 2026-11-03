import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, Calendar, Pill, FileText,
  Receipt, LogOut, Menu, X, Activity, ClipboardList, Stethoscope,
  ChevronRight, Heart, BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const navConfig = {
  ADMIN: [
    { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
    { label: 'Doctors', to: '/admin/doctors', icon: UserCheck },
    { label: 'Patients', to: '/admin/patients', icon: Users },
    { label: 'Appointments', to: '/admin/appointments', icon: Calendar },
    { label: 'Bills', to: '/admin/bills', icon: Receipt },
    { label: 'Audit Logs', to: '/admin/audit-logs', icon: ClipboardList },
  ],
  PHARMACIST: [
    { label: 'Dashboard', to: '/pharmacist', icon: LayoutDashboard, end: true },
    { label: 'Analytics', to: '/pharmacist/analytics', icon: BarChart3 },
    { label: 'Medicines', to: '/pharmacist/medicines', icon: Pill },
  ],
  DOCTOR: [
    { label: 'Dashboard', to: '/doctor', icon: LayoutDashboard, end: true },
    { label: 'My Analytics', to: '/doctor/analytics', icon: BarChart3 },
    { label: 'My Appointments', to: '/doctor/appointments', icon: Calendar },
    { label: 'Prescriptions', to: '/doctor/prescriptions', icon: FileText },
    { label: 'Medical Records', to: '/doctor/medical-records', icon: ClipboardList },
    { label: 'My Profile', to: '/doctor/profile', icon: Stethoscope },
  ],
  PATIENT: [
    { label: 'Dashboard', to: '/patient', icon: LayoutDashboard, end: true },
    { label: 'My Analytics', to: '/patient/analytics', icon: BarChart3 },
    { label: 'Book Appointment', to: '/patient/book-appointment', icon: Calendar },
    { label: 'My Appointments', to: '/patient/appointments', icon: Activity },
    { label: 'My Bills', to: '/patient/bills', icon: Receipt },
    { label: 'My Prescriptions', to: '/patient/prescriptions', icon: Pill },
    { label: 'Medical Records', to: '/patient/medical-records', icon: ClipboardList },
    { label: 'My Profile', to: '/patient/profile', icon: Users },
  ],
};

const roleColors = {
  ADMIN: 'text-blue-600',
  DOCTOR: 'text-emerald-600',
  PATIENT: 'text-violet-600',
  PHARMACIST: 'text-amber-600',
};

const roleBadgeColors = {
  ADMIN: 'bg-blue-50 text-blue-700 border border-blue-100',
  DOCTOR: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  PATIENT: 'bg-violet-50 text-violet-700 border border-violet-100',
  PHARMACIST: 'bg-amber-50 text-amber-700 border border-amber-100',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = navConfig[user?.role] || [];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch {
      navigate('/login');
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Heart size={18} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-gray-900 text-base">HMS</span>
            <p className="text-xs text-gray-400">Hospital System</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full h-9 w-9 flex items-center justify-center text-sm font-semibold shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleBadgeColors[user?.role]}`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pb-4 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 px-2 mb-2 uppercase tracking-wider">Menu</p>
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-md border border-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile */}
      <aside className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 z-40 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </aside>
    </>
  );
}
