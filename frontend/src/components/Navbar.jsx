import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, LogOut } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Profile', path: '/profile' },
    { name: 'Career Guidance', path: '/career-guidance' },
    { name: 'Skills', path: '/skills' },
    { name: 'Skill Gap', path: '/skill-gap' },
    { name: 'Roadmap', path: '/roadmap' },
    { name: 'Resume Analyzer', path: '/resume-analyzer' },
    { name: 'Resume Matcher', path: '/resume-matcher' },
    { name: 'Jobs', path: '/jobs' },
    { name: 'Internships', path: '/internships' },
    { name: 'Saved Opportunities', path: '/saved-opportunities' },
    { name: 'Learning Resources', path: '/learning-resources' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <nav className="app-navbar">
      <Link to="/dashboard" className="nav-brand" style={{ textDecoration: 'none' }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, var(--primary-500), var(--accent-cyan))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <Compass size={20} />
        </div>
        <span>Smart Career System</span>
      </Link>

      <ul className="nav-links">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `nav-link-item ${isActive ? 'active' : ''}`
              }
            >
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="nav-user-actions">
        <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="user-badge" style={{ cursor: 'pointer' }}>
            <div className="user-avatar">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <span style={{ fontWeight: 500 }}>{user?.fullName || user?.email || 'User'}</span>
          </div>
        </Link>

        <button onClick={handleLogout} className="btn-logout" title="Sign out of your account">
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};
