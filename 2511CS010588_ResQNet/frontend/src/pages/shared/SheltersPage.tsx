import React, { useState, useEffect } from 'react';
import type { Shelter, ShelterStatus } from '../../types';
import shelterService from '../../services/shelter.service';
import { ShelterCard } from '../../components/shelter/ShelterCard';
import { UpdateOccupancyModal } from '../../components/shelter/UpdateOccupancyModal';
import { CreateShelterModal } from '../../components/shelter/CreateShelterModal';
import { EmergencyResourceMap } from '../../components/common/EmergencyResourceMap';
import useGeolocation from '../../hooks/useGeolocation';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  Compass, 
  AlertCircle,
  Map as MapIcon,
  List
} from 'lucide-react';


export const SheltersPage: React.FC = () => {
  const { user } = useAuth();
  const isAuthorized = user && ['RESCUE_TEAM', 'ADMIN', 'VOLUNTEER'].includes(user.role);

  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [filterFood, setFilterFood] = useState<boolean>(false);
  const [filterMedical, setFilterMedical] = useState<boolean>(false);
  const [filterPet, setFilterPet] = useState<boolean>(false);
  const [filterPower, setFilterPower] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'both' | 'map' | 'list'>('both');

  // Geolocation
  const { latitude, longitude, error: geoError, isLoading: isLocating, getLocation } = useGeolocation();
  const [isNearbyActive, setIsNearbyActive] = useState<boolean>(false);

  // Modals & Selection
  const [selectedShelterForOccupancy, setSelectedShelterForOccupancy] = useState<Shelter | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [focusedShelterId, setFocusedShelterId] = useState<number | null>(null);

  const fetchShelters = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data: Shelter[];
      if (isNearbyActive && latitude && longitude) {
        data = await shelterService.getNearby(latitude, longitude, radiusKm);
      } else {
        const statusParam = statusFilter !== 'ALL' ? (statusFilter as ShelterStatus) : undefined;
        data = await shelterService.getAll(statusParam);
      }
      setShelters(data);
    } catch (err) {
      console.error('Failed to fetch shelters:', err);
      setError('Unable to load shelter data from server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShelters();
  }, [statusFilter, isNearbyActive, radiusKm]);

  const handleNearbySearch = () => {
    getLocation((coords) => {
      setIsNearbyActive(true);
      shelterService.getNearby(coords.latitude, coords.longitude, radiusKm)
        .then((data) => setShelters(data))
        .catch((err) => console.error(err));
    });
  };

  const handleResetFilters = () => {
    setIsNearbyActive(false);
    setStatusFilter('ALL');
    setSearchQuery('');
    setFilterFood(false);
    setFilterMedical(false);
    setFilterPet(false);
    setFilterPower(false);
  };

  const handleShelterUpdated = (updated: Shelter) => {
    setShelters((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleShelterCreated = (newShelter: Shelter) => {
    setShelters((prev) => [newShelter, ...prev]);
  };

  // Filter items in memory based on amenities and search query
  const filteredShelters = shelters.filter((s) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchAddr = s.address.toLowerCase().includes(q);
      const matchType = s.type.toLowerCase().includes(q);
      if (!matchName && !matchAddr && !matchType) return false;
    }
    if (filterFood && !s.foodAvailable) return false;
    if (filterMedical && !s.medicalSupportAvailable) return false;
    if (filterPet && !s.petFriendly) return false;
    if (filterPower && !s.powerBackup) return false;
    return true;
  });

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      {/* Page Header */}
      <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="flex items-center gap-4">
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            padding: '14px',
            borderRadius: '14px',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
          }}>
            <Building2 size={28} color="#fff" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>
                Safe Shelters & Evacuation Radar
              </h1>
              <span className="badge badge-success">Live Capacity</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Real-time shelter capacity tracking, supply statuses, and nearest emergency relief hubs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthorized && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-primary"
              style={{ background: '#10b981' }}
            >
              <Plus size={18} /> Register Shelter
            </button>
          )}

          <button
            onClick={fetchShelters}
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
              placeholder="Search by shelter name, type, or address..."
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
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open (Available)</option>
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

        {/* Amenities Toggles Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Filter Amenities:</span>
          <button
            onClick={() => setFilterFood(!filterFood)}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid var(--border-color)',
              background: filterFood ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
              color: filterFood ? '#34d399' : 'var(--text-secondary)'
            }}
          >
            🍲 Food & Water
          </button>
          <button
            onClick={() => setFilterMedical(!filterMedical)}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid var(--border-color)',
              background: filterMedical ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
              color: filterMedical ? '#60a5fa' : 'var(--text-secondary)'
            }}
          >
            🩺 Medical Support
          </button>
          <button
            onClick={() => setFilterPet(!filterPet)}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid var(--border-color)',
              background: filterPet ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
              color: filterPet ? '#fbbf24' : 'var(--text-secondary)'
            }}
          >
            🐕 Pet Friendly
          </button>
          <button
            onClick={() => setFilterPower(!filterPower)}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: '1px solid var(--border-color)',
              background: filterPower ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
              color: filterPower ? '#c084fc' : 'var(--text-secondary)'
            }}
          >
            ⚡ Generator
          </button>

          {(isNearbyActive || statusFilter !== 'ALL' || searchQuery || filterFood || filterMedical || filterPet || filterPower) && (
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
              Interactive Spatial Shelter Radar ({filteredShelters.length} Facilities)
            </h2>
            {isNearbyActive && latitude && longitude && (
              <span className="badge badge-info">
                GPS: {latitude.toFixed(4)}, {longitude.toFixed(4)} • Radius: {radiusKm}km
              </span>
            )}
          </div>
          <EmergencyResourceMap
            userLocation={latitude && longitude ? { latitude, longitude } : null}
            shelters={filteredShelters}
            selectedShelterId={focusedShelterId}
            onSelectShelter={(shelter) => setFocusedShelterId(shelter.id)}
            height={viewMode === 'map' ? '600px' : '380px'}
          />
        </div>
      )}

      {/* Shelter Cards Grid Section (if 'both' or 'list') */}
      {(viewMode === 'both' || viewMode === 'list') && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                Shelter Facilities Directory ({filteredShelters.length})
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {isNearbyActive ? `Showing verified shelters sorted by distance to your current GPS position` : `Browse verified emergency evacuation centers and live bed capacity loads`}
              </p>
            </div>
          </div>

          {filteredShelters.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
              <Building2 size={40} color="#6b7280" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Shelters Matching Filter Criteria</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '460px', margin: '0 auto 1.5rem auto' }}>
                Try clearing active filters, adjusting search keywords, or widening your nearby search radius.
              </p>
              <button onClick={handleResetFilters} className="btn btn-outline">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {filteredShelters.map((shelter) => (
                <ShelterCard
                  key={shelter.id}
                  shelter={shelter}
                  onUpdateOccupancy={(s) => setSelectedShelterForOccupancy(s)}
                  onSelectOnMap={(s) => {
                    setFocusedShelterId(s.id);
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
      <UpdateOccupancyModal
        isOpen={Boolean(selectedShelterForOccupancy)}
        shelter={selectedShelterForOccupancy}
        onClose={() => setSelectedShelterForOccupancy(null)}
        onUpdated={handleShelterUpdated}
      />

      <CreateShelterModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleShelterCreated}
      />
    </div>
  );
};
