import React, { useState, useEffect } from 'react';
import type { Hospital, HospitalStatus } from '../../types';
import hospitalService from '../../services/hospital.service';
import { HospitalCard } from '../../components/hospital/HospitalCard';
import { UpdateBedsModal } from '../../components/hospital/UpdateBedsModal';
import { CreateHospitalModal } from '../../components/hospital/CreateHospitalModal';
import { EmergencyResourceMap } from '../../components/common/EmergencyResourceMap';
import useGeolocation from '../../hooks/useGeolocation';
import { useAuth } from '../../context/AuthContext';
import { 
  HeartPulse, 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  Compass, 
  AlertCircle,
  Map as MapIcon,
  List
} from 'lucide-react';


export const HospitalsPage: React.FC = () => {
  const { user } = useAuth();
  const isAuthorized = user && ['RESCUE_TEAM', 'ADMIN'].includes(user.role);

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [filterIcuOnly, setFilterIcuOnly] = useState<boolean>(false);
  const [filterVentilatorOnly, setFilterVentilatorOnly] = useState<boolean>(false);
  const [filterTraumaCenter, setFilterTraumaCenter] = useState<boolean>(false);
  const [filterBloodBank, setFilterBloodBank] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'both' | 'map' | 'list'>('both');

  // Geolocation
  const { latitude, longitude, error: geoError, isLoading: isLocating, getLocation } = useGeolocation();
  const [isNearbyActive, setIsNearbyActive] = useState<boolean>(false);

  // Modals & Selection
  const [selectedHospitalForBeds, setSelectedHospitalForBeds] = useState<Hospital | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [focusedHospitalId, setFocusedHospitalId] = useState<number | null>(null);

  const fetchHospitals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data: Hospital[];
      if (isNearbyActive && latitude && longitude) {
        data = await hospitalService.getNearby(latitude, longitude, radiusKm);
      } else {
        const statusParam = statusFilter !== 'ALL' ? (statusFilter as HospitalStatus) : undefined;
        data = await hospitalService.getAll(statusParam);
      }
      setHospitals(data);
    } catch (err) {
      console.error('Failed to fetch hospitals:', err);
      setError('Unable to load hospital data from server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [statusFilter, isNearbyActive, radiusKm]);

  const handleNearbySearch = () => {
    getLocation((coords) => {
      setIsNearbyActive(true);
      hospitalService.getNearby(coords.latitude, coords.longitude, radiusKm)
        .then((data) => setHospitals(data))
        .catch((err) => console.error(err));
    });
  };

  const handleResetFilters = () => {
    setIsNearbyActive(false);
    setStatusFilter('ALL');
    setSearchQuery('');
    setFilterIcuOnly(false);
    setFilterVentilatorOnly(false);
    setFilterTraumaCenter(false);
    setFilterBloodBank(false);
  };

  const handleHospitalUpdated = (updated: Hospital) => {
    setHospitals((prev) => prev.map((h) => (h.id === updated.id ? updated : h)));
  };

  const handleHospitalCreated = (newHospital: Hospital) => {
    setHospitals((prev) => [newHospital, ...prev]);
  };

  // Filter items in memory based on amenities and search query
  const filteredHospitals = hospitals.filter((h) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = h.name.toLowerCase().includes(q);
      const matchAddr = h.address.toLowerCase().includes(q);
      if (!matchName && !matchAddr) return false;
    }
    if (filterIcuOnly && h.availableIcuBeds <= 0) return false;
    if (filterVentilatorOnly && h.availableVentilators <= 0) return false;
    if (filterTraumaCenter && !h.hasTraumaCenter) return false;
    if (filterBloodBank && !h.hasBloodBank) return false;
    return true;
  });

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      {/* Page Header */}
      <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="flex items-center gap-4">
          <div style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
            padding: '14px',
            borderRadius: '14px',
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
          }}>
            <HeartPulse size={28} color="#fff" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                Hospital Bed Availability & Trauma Radar
              </h1>
              <span className="badge badge-critical">Live Emergency Radar</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Real-time ICU beds, ventilators, blood bank supplies, and 24/7 Level-1 trauma centers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthorized && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-primary"
              style={{ background: '#dc2626' }}
            >
              <Plus size={18} /> Register Medical Facility
            </button>
          )}

          <button
            onClick={fetchHospitals}
            className="btn btn-outline"
            style={{ padding: '8px 16px' }}
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Control Bar: Search, Geolocation, Filters */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search size={18} color="#6b7280" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by hospital name or city/address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.6rem 1rem 0.6rem 2.5rem',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            />
          </div>

          {/* Nearby GPS Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleNearbySearch}
              className={`btn ${isNearbyActive ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.6rem 1.25rem' }}
            >
              <Compass size={18} className={isLocating ? 'animate-spin' : ''} />
              {isLocating ? 'Locating...' : isNearbyActive ? 'Nearby Active' : 'Find Near Me'}
            </button>

            {isNearbyActive && (
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                style={{
                  background: '#111827',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.6rem 0.75rem',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              >
                <option value={5}>Within 5 km</option>
                <option value={10}>Within 10 km</option>
                <option value={25}>Within 25 km</option>
                <option value={50}>Within 50 km</option>
                <option value={100}>Within 100 km</option>
              </select>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} color="#9ca3af" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                background: '#111827',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.6rem 1rem',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            >
              <option value="ALL">All Operational Statuses</option>
              <option value="OPERATIONAL">Operational (Accepting)</option>
              <option value="EMERGENCY_ONLY">Emergency Only</option>
              <option value="FULL">Full Capacity</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '8px' }}>
            <button
              onClick={() => setViewMode('both')}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'both' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: viewMode === 'both' ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode('map')}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'map' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: viewMode === 'map' ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <MapIcon size={14} /> Map
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'list' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: viewMode === 'list' ? '#fff' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <List size={14} /> Cards
            </button>
          </div>
        </div>

        {/* Critical Capabilities Toggles Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filter Capabilities:</span>
          <button
            onClick={() => setFilterIcuOnly(!filterIcuOnly)}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid var(--border-color)',
              background: filterIcuOnly ? 'rgba(239, 68, 68, 0.25)' : 'transparent',
              color: filterIcuOnly ? '#f87171' : 'var(--text-secondary)'
            }}
          >
            🚨 ICU Available (&gt; 0)
          </button>
          <button
            onClick={() => setFilterVentilatorOnly(!filterVentilatorOnly)}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid var(--border-color)',
              background: filterVentilatorOnly ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
              color: filterVentilatorOnly ? '#34d399' : 'var(--text-secondary)'
            }}
          >
            🫁 Ventilators Available (&gt; 0)
          </button>
          <button
            onClick={() => setFilterTraumaCenter(!filterTraumaCenter)}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid var(--border-color)',
              background: filterTraumaCenter ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
              color: filterTraumaCenter ? '#60a5fa' : 'var(--text-secondary)'
            }}
          >
            🛡️ Level 1 Trauma Center
          </button>
          <button
            onClick={() => setFilterBloodBank(!filterBloodBank)}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid var(--border-color)',
              background: filterBloodBank ? 'rgba(220, 38, 38, 0.25)' : 'transparent',
              color: filterBloodBank ? '#fca5a5' : 'var(--text-secondary)'
            }}
          >
            🩸 Blood Bank Available
          </button>

          {(isNearbyActive || statusFilter !== 'ALL' || searchQuery || filterIcuOnly || filterVentilatorOnly || filterTraumaCenter || filterBloodBank) && (
            <button
              onClick={handleResetFilters}
              style={{
                marginLeft: 'auto',
                background: 'transparent',
                border: 'none',
                color: '#f87171',
                fontSize: '0.75rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {geoError && (
        <div className="badge badge-warning" style={{ width: '100%', padding: '0.75rem 1rem', marginBottom: '1.5rem', borderRadius: '10px' }}>
          <AlertCircle size={16} /> {geoError}
        </div>
      )}

      {error && (
        <div className="badge badge-critical" style={{ width: '100%', padding: '0.75rem 1rem', marginBottom: '1.5rem', borderRadius: '10px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Map Section (if 'both' or 'map') */}
      {(viewMode === 'both' || viewMode === 'map') && (
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
              Interactive Medical Trauma Radar ({filteredHospitals.length} Hospitals)
            </h2>
            {isNearbyActive && latitude && longitude && (
              <span className="badge badge-info">
                GPS: {latitude.toFixed(4)}, {longitude.toFixed(4)} • Radius: {radiusKm}km
              </span>
            )}
          </div>
          <EmergencyResourceMap
            userLocation={latitude && longitude ? { latitude, longitude } : null}
            hospitals={filteredHospitals}
            selectedHospitalId={focusedHospitalId}
            onSelectHospital={(hospital) => setFocusedHospitalId(hospital.id)}
            height={viewMode === 'map' ? '600px' : '380px'}
          />
        </div>
      )}

      {/* Hospital Cards Grid Section (if 'both' or 'list') */}
      {(viewMode === 'both' || viewMode === 'list') && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                Hospitals Directory & Bed Status ({filteredHospitals.length})
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {isNearbyActive ? `Showing nearby medical facilities sorted by proximity to your coordinates` : `Live availability of ICU beds, ventilators, and emergency trauma facilities`}
              </p>
            </div>
          </div>

          {filteredHospitals.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
              <HeartPulse size={40} color="#6b7280" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Hospitals Matching Filter Criteria</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '460px', margin: '0 auto 1.5rem auto' }}>
                Try clearing active filters, adjusting keywords, or expanding your nearby search radius.
              </p>
              <button onClick={handleResetFilters} className="btn btn-outline">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {filteredHospitals.map((hospital) => (
                <HospitalCard
                  key={hospital.id}
                  hospital={hospital}
                  onUpdateBeds={(h) => setSelectedHospitalForBeds(h)}
                  onSelectOnMap={(h) => {
                    setFocusedHospitalId(h.id);
                    if (viewMode === 'list') setViewMode('both');
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                  }}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Modals */}
      <UpdateBedsModal
        isOpen={Boolean(selectedHospitalForBeds)}
        hospital={selectedHospitalForBeds}
        onClose={() => setSelectedHospitalForBeds(null)}
        onUpdated={handleHospitalUpdated}
      />

      <CreateHospitalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleHospitalCreated}
      />
    </div>
  );
};
