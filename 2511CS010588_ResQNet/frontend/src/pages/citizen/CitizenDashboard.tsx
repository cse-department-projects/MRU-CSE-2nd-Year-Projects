import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Zap, 
  AlertTriangle, 
  Building2, 
  HeartPulse, 
  User, 
  Plus, 
  FileText, 
  RefreshCw, 
  CheckCircle2,
  X
} from 'lucide-react';
import { OneTouchSOSModal } from '../../components/sos/OneTouchSOSModal';
import { ActiveSosTracker } from '../../components/sos/ActiveSosTracker';
import { DisasterReportModal } from '../../components/disaster/DisasterReportModal';
import { DisasterCard } from '../../components/disaster/DisasterCard';
import sosService from '../../services/sos.service';
import disasterService from '../../services/disaster.service';
import type { DisasterReport, SosAlert } from '../../types';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  const [activeSos, setActiveSos] = useState<SosAlert | null>(null);
  const [myReports, setMyReports] = useState<DisasterReport[]>([]);
  const [sosSuccessBanner, setSosSuccessBanner] = useState<string | null>(null);

  // Handle opening SOS modal from navigation (e.g. from Home Page ?openSos=true)
  useEffect(() => {
    if (searchParams.get('openSos') === 'true') {
      setIsSosModalOpen(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('openSos');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const fetchCitizenData = async () => {
    try {
      const [currentSos, reports] = await Promise.all([
        sosService.getMyActiveSos(),
        disasterService.getMyReports(),
      ]);
      setActiveSos(currentSos);
      setMyReports(reports);
    } catch (err) {
      console.error('Error fetching citizen dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchCitizenData();
    // Poll every 10 seconds for SOS updates while on dashboard
    const interval = setInterval(fetchCitizenData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (sosSuccessBanner) {
      const timer = setTimeout(() => setSosSuccessBanner(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [sosSuccessBanner]);

  const handleSosDispatched = (sos: SosAlert) => {
    setActiveSos(sos);
    setSosSuccessBanner('Emergency SOS distress beacon successfully registered and broadcast to rescue responders.');
  };

  const handleCancelSos = async (id: number) => {
    try {
      await sosService.cancel(id);
      setActiveSos(null);
    } catch (err) {
      console.error('Failed to cancel SOS:', err);
    }
  };

  const handleReportCreated = (report: DisasterReport) => {
    setMyReports((prev) => [report, ...prev]);
  };

  return (
    <div className="container">
      {/* Header Profile & Quick SOS Trigger Bar */}
      <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="flex items-center gap-4">
          <div style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            padding: '14px',
            borderRadius: '14px',
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
          }}>
            <User size={28} color="#fff" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Welcome, {user?.fullName}</h1>
              <span className="badge badge-critical">Citizen Safety Portal</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Email: <strong>{user?.email}</strong> • Blood Group: <strong>{user?.bloodGroup || 'UNKNOWN'}</strong> • Emergency Contact: <strong>{user?.emergencyContactPhone || 'Not set'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="btn btn-outline"
            style={{ padding: '0.75rem 1.25rem' }}
          >
            <Plus size={18} /> Report Incident
          </button>

          {!activeSos ? (
            <button
              onClick={() => setIsSosModalOpen(true)}
              className="btn btn-sos"
              style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
            >
              <Zap size={20} /> ONE-TOUCH SOS
            </button>
          ) : (
            <button
              onClick={fetchCitizenData}
              className="btn btn-outline"
              style={{ borderColor: '#ef4444', color: '#fca5a5' }}
            >
              <RefreshCw size={16} /> Sync SOS Status
            </button>
          )}
        </div>
      </div>

      {/* SOS Success Confirmation Banner */}
      {sosSuccessBanner && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 size={22} color="#10b981" />
            <span style={{ color: '#d1fae5', fontSize: '0.925rem', fontWeight: 600 }}>
              {sosSuccessBanner}
            </span>
          </div>
          <button
            onClick={() => setSosSuccessBanner(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Dismiss"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Active Live SOS Tracker Banner if ongoing emergency */}
      {activeSos && (
        <ActiveSosTracker
          alert={activeSos}
          onCancel={handleCancelSos}
          onRefresh={fetchCitizenData}
        />
      )}

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-3 gap-6" style={{ marginBottom: '2.5rem' }}>
        <div 
          onClick={() => setIsReportModalOpen(true)}
          className="glass-card" 
          style={{ cursor: 'pointer', borderColor: 'rgba(239, 68, 68, 0.3)' }}
        >
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '12px', width: 'fit-content', marginBottom: '1rem' }}>
            <AlertTriangle size={24} color="#ef4444" />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Report Disaster</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Submit a real-time geo-tagged incident report with photographs to alert responders.
          </p>
          <span className="badge badge-critical">Active • Click to Report</span>
        </div>

        <Link 
          to="/shelters"
          className="glass-card" 
          style={{ textDecoration: 'none', color: 'inherit', display: 'block', borderColor: 'rgba(16, 185, 129, 0.3)' }}
        >
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px', width: 'fit-content', marginBottom: '1rem' }}>
            <Building2 size={24} color="#10b981" />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Find Safe Shelters</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Locate nearby disaster relief evacuation shelters with verified bed capacity and supplies.
          </p>
          <span className="badge badge-success">Live Capacity Radar →</span>
        </Link>

        <Link 
          to="/hospitals"
          className="glass-card" 
          style={{ textDecoration: 'none', color: 'inherit', display: 'block', borderColor: 'rgba(59, 130, 246, 0.3)' }}
        >
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '12px', width: 'fit-content', marginBottom: '1rem' }}>
            <HeartPulse size={24} color="#3b82f6" />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Hospital Bed Radar</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Check real-time ICU beds, ventilators, and emergency trauma center availability.
          </p>
          <span className="badge badge-info">Emergency Facilities →</span>
        </Link>
      </div>


      {/* My Submitted Disaster Reports Section */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
              My Disaster Incident Reports ({myReports.length})
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Track verification and operational response to your submitted field reports
            </p>
          </div>
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.875rem' }}
          >
            <Plus size={16} /> New Incident Report
          </button>
        </div>

        {myReports.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <FileText size={36} color="#6b7280" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Reports Submitted Yet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
              If you witness flash floods, collapsed structures, roadblock hazards, or life threats, report them here to alert responders.
            </p>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="btn btn-primary"
            >
              <Plus size={16} /> Submit First Report
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {myReports.map((report) => (
              <DisasterCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      <OneTouchSOSModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        onSosDispatched={handleSosDispatched}
      />

      <DisasterReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReportCreated={handleReportCreated}
      />
    </div>
  );
};
