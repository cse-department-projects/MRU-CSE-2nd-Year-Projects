import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Plus, 
  RefreshCw, 
  Search,
  LayoutGrid,
  Map as MapIcon,
  Columns
} from 'lucide-react';
import disasterService from '../../services/disaster.service';
import { DisasterCard } from '../../components/disaster/DisasterCard';
import { DisasterReportModal } from '../../components/disaster/DisasterReportModal';
import { EmergencyResourceMap } from '../../components/common/EmergencyResourceMap';
import { useAuth } from '../../context/AuthContext';
import type { DisasterReport, DisasterType, Severity } from '../../types';

type ViewMode = 'grid' | 'map' | 'split';

export const DisasterFeedPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [reports, setReports] = useState<DisasterReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // View Mode: 'grid' (Cards only), 'map' (Interactive map only), 'split' (Map & Cards together)
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedDisasterId, setSelectedDisasterId] = useState<number | null>(null);

  // Filters
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const userLocation =
    user?.currentLatitude && user?.currentLongitude
      ? { latitude: user.currentLatitude, longitude: user.currentLongitude }
      : null;

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const data = await disasterService.getAll({
        type: (selectedType || undefined) as DisasterType | undefined,
        severity: (selectedSeverity || undefined) as Severity | undefined,
      });
      setReports(data);
    } catch (err) {
      console.error('Error fetching disaster reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedType, selectedSeverity]);

  const handleReportCreated = (newReport: DisasterReport) => {
    setReports((prev) => [newReport, ...prev]);
  };

  const handleResetFilters = () => {
    setSelectedType('');
    setSelectedSeverity('');
    setSearchQuery('');
    setSelectedDisasterId(null);
  };

  const filteredReports = reports.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      (r.locationName && r.locationName.toLowerCase().includes(q))
    );
  });

  const selectedDisaster = selectedDisasterId
    ? filteredReports.find((r) => r.id === selectedDisasterId)
    : null;

  return (
    <div className="container">
      {/* Scoped CSS for Responsive Split Layout */}
      <style>{`
        .disaster-split-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        @media (min-width: 1024px) {
          .disaster-split-layout {
            grid-template-columns: minmax(420px, 1.15fr) minmax(360px, 0.85fr);
            align-items: start;
          }
        }
        .disaster-split-cards-scroll {
          max-height: 600px;
          overflow-y: auto;
          padding-right: 6px;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
      `}</style>

      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                padding: '8px',
                borderRadius: '10px',
              }}
            >
              <AlertTriangle size={24} color="#ef4444" />
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff' }}>
              Live Disaster Incident Feed
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Real-time verified emergency intelligence, flash flood alerts, and structural hazard reports
          </p>
        </div>

        <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
          <button
            onClick={fetchReports}
            className="btn btn-outline"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            title="Refresh incidents from server"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Refresh Feed
          </button>
          {isAuthenticated ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.875rem' }}
            >
              <Plus size={16} /> Report Incident
            </button>
          ) : (
            <Link
              to="/login?redirect=/disasters"
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Report Incident
            </Link>
          )}
        </div>
      </div>

      {/* Filter & View Mode Bar */}
      <div
        className="glass-card"
        style={{
          marginBottom: '2rem',
          padding: '1.25rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Search & Filter Dropdowns */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: 1, minWidth: '280px' }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: '200px', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} color="#6b7280" style={{ position: 'absolute', left: '12px' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, location or keywords..."
              style={{
                width: '100%',
                padding: '0.65rem 0.65rem 0.65rem 2.4rem',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.875rem',
              }}
            />
          </div>

          {/* Category Filter */}
          <div style={{ minWidth: '170px' }}>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.875rem',
              }}
            >
              <option value="">All Categories</option>
              <option value="FLOOD">🌊 Flood</option>
              <option value="FIRE">🔥 Fire</option>
              <option value="EARTHQUAKE">🏚️ Earthquake</option>
              <option value="CYCLONE">🌀 Cyclone</option>
              <option value="LANDSLIDE">⛰️ Landslide</option>
              <option value="TSUNAMI">🌊 Tsunami</option>
              <option value="BUILDING_COLLAPSE">🏢 Building Collapse</option>
              <option value="OTHER">⚠️ Other</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div style={{ minWidth: '150px' }}>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.875rem',
              }}
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">🔴 Critical</option>
              <option value="HIGH">🟠 High</option>
              <option value="MEDIUM">🟡 Medium</option>
              <option value="LOW">🟢 Low</option>
            </select>
          </div>

          {/* Reset Filters button if any filter is active */}
          {(selectedType || selectedSeverity || searchQuery) && (
            <button
              onClick={handleResetFilters}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f87171',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '0 8px',
                alignSelf: 'center',
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Right: View Mode Toggle Selector */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '3px',
            gap: '3px',
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              border: 'none',
              background: viewMode === 'grid' ? 'rgba(239, 68, 68, 0.25)' : 'transparent',
              color: viewMode === 'grid' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: viewMode === 'grid' ? 700 : 500,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: viewMode === 'grid' ? '0 0 10px rgba(239, 68, 68, 0.3)' : 'none',
            }}
            title="Card Grid (Incident cards only)"
          >
            <LayoutGrid size={15} color={viewMode === 'grid' ? '#ef4444' : '#9ca3af'} />
            <span>Card Grid</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('map')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              border: 'none',
              background: viewMode === 'map' ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
              color: viewMode === 'map' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: viewMode === 'map' ? 700 : 500,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: viewMode === 'map' ? '0 0 10px rgba(59, 130, 246, 0.3)' : 'none',
            }}
            title="Map View (Interactive geospatial hazard map)"
          >
            <MapIcon size={15} color={viewMode === 'map' ? '#3b82f6' : '#9ca3af'} />
            <span>Map View</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('split')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '7px',
              border: 'none',
              background: viewMode === 'split' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
              color: viewMode === 'split' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: viewMode === 'split' ? 700 : 500,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: viewMode === 'split' ? '0 0 10px rgba(16, 185, 129, 0.3)' : 'none',
            }}
            title="Split View (Interactive map and cards together)"
          >
            <Columns size={15} color={viewMode === 'split' ? '#10b981' : '#9ca3af'} />
            <span>Split View</span>
          </button>
        </div>
      </div>

      {/* Active Selection Banner (if an incident is highlighted from map or card) */}
      {selectedDisaster && (
        <div
          style={{
            background: 'rgba(250, 204, 21, 0.12)',
            border: '1px solid rgba(250, 204, 21, 0.4)',
            borderRadius: '10px',
            padding: '0.65rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.85rem',
            color: '#fef08a',
          }}
        >
          <div className="flex items-center gap-2">
            <span>Focused Incident:</span>
            <strong style={{ color: '#ffffff' }}>{selectedDisaster.title}</strong>
            <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
              {selectedDisaster.severity}
            </span>
            {selectedDisaster.locationName && (
              <span style={{ color: 'var(--text-secondary)' }}>• 📍 {selectedDisaster.locationName}</span>
            )}
          </div>
          <button
            onClick={() => setSelectedDisasterId(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fef08a',
              cursor: 'pointer',
              fontSize: '0.75rem',
              textDecoration: 'underline',
            }}
          >
            Deselect
          </button>
        </div>
      )}

      {/* MODE 1: Card Grid View */}
      {viewMode === 'grid' && (
        <div>
          {filteredReports.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
              <AlertTriangle size={40} color="#6b7280" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                No Incidents Match Selected Filters
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '440px', margin: '0 auto 1.5rem auto' }}>
                Try broadening your search query or reset the category/severity filters.
              </p>
              <button onClick={handleResetFilters} className="btn btn-outline">
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6" style={{ marginBottom: '3rem' }}>
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedDisasterId(report.id)}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '16px',
                    border: selectedDisasterId === report.id ? '2px solid #facc15' : '2px solid transparent',
                    boxShadow: selectedDisasterId === report.id ? '0 0 16px rgba(250, 204, 21, 0.35)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <DisasterCard report={report} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODE 2: Map View */}
      {viewMode === 'map' && (
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
              Interactive Geospatial Hazard Map ({filteredReports.length} {filteredReports.length === 1 ? 'Incident' : 'Incidents'} Visualized)
            </h2>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              Click any incident marker to inspect details and get navigation directions
            </span>
          </div>

          <EmergencyResourceMap
            userLocation={userLocation}
            disasters={filteredReports}
            selectedDisasterId={selectedDisasterId}
            onSelectDisaster={(disaster) => setSelectedDisasterId(disaster.id)}
            height="620px"
          />

          {filteredReports.length === 0 && (
            <div className="glass-card" style={{ marginTop: '1rem', textAlign: 'center', padding: '1.5rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                No active disaster incidents match your current search/category filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="btn btn-outline"
                style={{ marginTop: '0.75rem', padding: '6px 14px', fontSize: '0.8rem' }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: Split View (Interactive Map + Incident Cards List) */}
      {viewMode === 'split' && (
        <div className="disaster-split-layout">
          {/* Left Column: Interactive Map */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                Incident Radar ({filteredReports.length})
              </h2>
              {selectedDisaster && (
                <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                  Pinned: #{selectedDisaster.id}
                </span>
              )}
            </div>
            <EmergencyResourceMap
              userLocation={userLocation}
              disasters={filteredReports}
              selectedDisasterId={selectedDisasterId}
              onSelectDisaster={(disaster) => setSelectedDisasterId(disaster.id)}
              height="580px"
            />
          </div>

          {/* Right Column: Incident Cards Scrollable List */}
          <div className="disaster-split-cards-scroll">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                Incident List ({filteredReports.length})
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Click a card to highlight its pin
              </span>
            </div>

            {filteredReports.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <AlertTriangle size={32} color="#6b7280" style={{ margin: '0 auto 0.75rem auto' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  No disaster reports found matching filter criteria.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="btn btn-outline"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedDisasterId(report.id)}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '16px',
                    border: selectedDisasterId === report.id ? '2px solid #facc15' : '2px solid transparent',
                    boxShadow: selectedDisasterId === report.id ? '0 0 16px rgba(250, 204, 21, 0.35)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <DisasterCard report={report} />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Disaster Report Modal */}
      <DisasterReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReportCreated={handleReportCreated}
      />
    </div>
  );
};

export default DisasterFeedPage;
