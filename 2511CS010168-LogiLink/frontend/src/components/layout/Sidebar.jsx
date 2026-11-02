import { NavLink } from 'react-router-dom';
import { ChevronsLeft, Network } from 'lucide-react';
import { useApp } from '../../contexts/AppContext.jsx';
import { navGroups } from './navConfig.js';

export default function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed, mobileMenuOpen, setMobileMenuOpen } = useApp();

  return (
    <>
      {mobileMenuOpen && <button className="mobile-drawer-backdrop" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-mark"><Network size={24} /></div>
          <div className="logo-text">
            <strong>LogiLink</strong>
            <span>Transport Ops</span>
          </div>
          <button className="sidebar-toggle" type="button" aria-label="Collapse sidebar" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <ChevronsLeft size={18} />
          </button>
        </div>
        <nav className="nav-groups" aria-label="Primary navigation">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <div className="nav-label">{group.label}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className="nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                  title={item.label}
                >
                  <item.icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
