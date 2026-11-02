import React from 'react';
import { ShieldAlert, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      backgroundColor: '#070a11',
      marginTop: 'auto',
      padding: '3rem 0 2rem 0'
    }}>
      <div className="container">
        <div className="grid grid-cols-4 gap-8" style={{ marginBottom: '2.5rem' }}>
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
              <ShieldAlert size={22} color="#ef4444" />
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>ResQNet</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>
              Real-time multi-role disaster emergency coordination & rescue dispatch network. Saving lives through instant citizen-responder synchronization.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#ffffff' }}>Emergency Contacts</h4>
            <ul style={{ listStyle: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>National Emergency: <strong>112</strong></li>
              <li>Disaster Helpline: <strong>1070 / 1078</strong></li>
              <li>Fire Service: <strong>101</strong></li>
              <li>Ambulance: <strong>102 / 108</strong></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#ffffff' }}>Platforms & Roles</h4>
            <ul style={{ listStyle: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Citizen SOS & Reporting</li>
              <li>Volunteer Task Board</li>
              <li>Rescue Team Radar</li>
              <li>Admin Analytics Portal</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#ffffff' }}>System Status</h4>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 600 }}>Operational • ResQNet_Final_DB</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              GPS Geolocation, Leaflet/Google Maps, and STOMP Event Engine active.
            </p>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <span>© 2026 ResQNet Platform. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Built with <Heart size={14} color="#ef4444" /> for Disaster Resilience
          </span>
        </div>
      </div>
    </footer>
  );
};
