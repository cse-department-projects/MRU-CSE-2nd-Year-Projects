import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Shelter, Hospital, DisasterReport, SosAlert } from '../../types';

export interface EmergencyResourceMapProps {
  userLocation: { latitude: number; longitude: number } | null;
  shelters?: Shelter[];
  hospitals?: Hospital[];
  disasters?: DisasterReport[];
  sosAlerts?: SosAlert[];
  showShelters?: boolean;
  showHospitals?: boolean;
  showDisasters?: boolean;
  showSosAlerts?: boolean;
  selectedShelterId?: number | null;
  selectedHospitalId?: number | null;
  selectedDisasterId?: number | null;
  selectedSosId?: number | null;
  onSelectShelter?: (shelter: Shelter) => void;
  onSelectHospital?: (hospital: Hospital) => void;
  onSelectDisaster?: (disaster: DisasterReport) => void;
  onSelectSos?: (sos: SosAlert) => void;
  height?: string;
}

const getDisasterIconEmoji = (type?: string): string => {
  switch (type) {
    case 'FLOOD':
      return '🌊';
    case 'FIRE':
      return '🔥';
    case 'EARTHQUAKE':
      return '🏚️';
    case 'CYCLONE':
      return '🌀';
    case 'LANDSLIDE':
      return '⛰️';
    case 'TSUNAMI':
      return '🌊';
    case 'BUILDING_COLLAPSE':
      return '🏢';
    default:
      return '⚠️';
  }
};

const getDisasterSeverityBg = (severity?: string): string => {
  switch (severity) {
    case 'CRITICAL':
      return '#ef4444';
    case 'HIGH':
      return '#f97316';
    case 'MEDIUM':
      return '#eab308';
    case 'LOW':
      return '#10b981';
    default:
      return '#f97316';
  }
};

const getSosStatusStyle = (status?: string) => {
  switch (status) {
    case 'ACTIVE':
      return { bg: '#dc2626', glow: 'rgba(239, 68, 68, 0.75)', label: 'ACTIVE' };
    case 'ACKNOWLEDGED':
      return { bg: '#d97706', glow: 'rgba(245, 158, 11, 0.5)', label: 'ACKNOWLEDGED' };
    case 'ASSIGNED':
      return { bg: '#2563eb', glow: 'rgba(59, 130, 246, 0.5)', label: 'DISPATCHED' };
    case 'IN_RESCUE':
      return { bg: '#059669', glow: 'rgba(16, 185, 129, 0.5)', label: 'IN OPERATION' };
    case 'RESOLVED':
      return { bg: '#4b5563', glow: 'none', label: 'RESOLVED' };
    default:
      return { bg: '#dc2626', glow: 'none', label: status || 'UNKNOWN' };
  }
};

export const EmergencyResourceMap: React.FC<EmergencyResourceMapProps> = ({
  userLocation,
  shelters = [],
  hospitals = [],
  disasters = [],
  sosAlerts = [],
  showShelters = true,
  showHospitals = true,
  showDisasters = true,
  showSosAlerts = true,
  selectedShelterId,
  selectedHospitalId,
  selectedDisasterId,
  selectedSosId,
  onSelectShelter,
  onSelectHospital,
  onSelectDisaster,
  onSelectSos,
  height = '420px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center (Hyderabad/India or userLocation)
    const initialLat = userLocation?.latitude || 17.385;
    const initialLon = userLocation?.longitude || 78.4867;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: 12,
      attributionControl: false,
    });

    // Dark-themed OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers and View
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    const bounds = L.latLngBounds([]);

    const activeShelters = showShelters ? shelters : [];
    const activeHospitals = showHospitals ? hospitals : [];
    const activeDisasters = showDisasters ? disasters : [];
    const activeSosAlerts = showSosAlerts ? sosAlerts : [];

    // 1. User Location Marker
    if (
      userLocation &&
      typeof userLocation.latitude === 'number' &&
      typeof userLocation.longitude === 'number' &&
      !isNaN(userLocation.latitude) &&
      !isNaN(userLocation.longitude)
    ) {
      const userLatLng: [number, number] = [userLocation.latitude, userLocation.longitude];
      bounds.extend(userLatLng);

      const userIcon = L.divIcon({
        className: 'user-geo-marker',
        html: `
          <div style="
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: #3b82f6;
            border: 3px solid #ffffff;
            box-shadow: 0 0 14px rgba(59, 130, 246, 0.9);
            position: relative;
          ">
            <div style="
              position: absolute;
              top: -6px;
              left: -6px;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: rgba(59, 130, 246, 0.35);
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const userMarker = L.marker(userLatLng, { icon: userIcon }).bindPopup(`
        <div style="color: #111827; font-family: sans-serif; font-size: 13px;">
          <strong>Your Current Location</strong><br/>
          <span>Lat: ${userLocation.latitude.toFixed(4)}, Lon: ${userLocation.longitude.toFixed(4)}</span>
        </div>
      `);
      markersLayer.addLayer(userMarker);
    }

    // 2. Shelter Markers
    activeShelters.forEach((shelter) => {
      if (
        typeof shelter.latitude !== 'number' ||
        typeof shelter.longitude !== 'number' ||
        isNaN(shelter.latitude) ||
        isNaN(shelter.longitude)
      ) {
        return;
      }
      const latLng: [number, number] = [shelter.latitude, shelter.longitude];
      bounds.extend(latLng);

      const isSelected = selectedShelterId === shelter.id;
      const isFull =
        shelter.status === 'FULL' ||
        (shelter.availableCapacity !== undefined && shelter.availableCapacity <= 0);
      const isClosed = shelter.status === 'CLOSED';
      const bgColor = isClosed ? '#6b7280' : isFull ? '#ef4444' : '#10b981';

      const shelterIcon = L.divIcon({
        className: 'shelter-map-marker',
        html: `
          <div style="
            background: ${bgColor};
            color: #ffffff;
            padding: ${isSelected ? '6px 10px' : '4px 8px'};
            border-radius: 12px;
            font-size: 11px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 4px;
            border: 2px solid ${isSelected ? '#facc15' : '#ffffff'};
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
            transform: scale(${isSelected ? '1.15' : '1'});
            transition: all 0.2s ease;
            white-space: nowrap;
          ">
            <span>🏠 ${shelter.name}</span>
            <span style="background: rgba(0,0,0,0.25); padding: 1px 5px; border-radius: 6px; font-size: 10px;">
              ${shelter.availableCapacity ?? shelter.totalCapacity - shelter.currentOccupancy} beds
            </span>
          </div>
        `,
        iconAnchor: [40, 16],
      });

      const marker = L.marker(latLng, { icon: shelterIcon });
      marker.on('click', () => {
        if (onSelectShelter) onSelectShelter(shelter);
      });

      marker.bindPopup(`
        <div style="color: #111827; font-family: sans-serif; font-size: 13px; max-width: 240px; padding: 2px;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #0f172a;">${shelter.name}</h4>
          <p style="margin: 0 0 6px 0; color: #475569; font-size: 12px;">${shelter.address}</p>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 12px;">
            <span><strong>Available:</strong> ${shelter.availableCapacity ?? shelter.totalCapacity - shelter.currentOccupancy}/${shelter.totalCapacity}</span>
            <span><strong>Status:</strong> ${shelter.status}</span>
          </div>
          ${shelter.contactPhone ? `<div style="font-size: 11px; color: #0284c7; margin-bottom: 6px;">📞 ${shelter.contactPhone}</div>` : ''}
          <a href="https://www.google.com/maps/dir/?api=1&destination=${shelter.latitude},${shelter.longitude}" target="_blank" rel="noopener noreferrer" style="
            display: inline-block;
            background: #2563eb;
            color: #fff;
            padding: 4px 8px;
            border-radius: 4px;
            text-decoration: none;
            font-size: 11px;
            font-weight: 600;
          ">Get Directions →</a>
        </div>
      `);

      markersLayer.addLayer(marker);
    });

    // 3. Hospital Markers
    activeHospitals.forEach((hospital) => {
      if (
        typeof hospital.latitude !== 'number' ||
        typeof hospital.longitude !== 'number' ||
        isNaN(hospital.latitude) ||
        isNaN(hospital.longitude)
      ) {
        return;
      }
      const latLng: [number, number] = [hospital.latitude, hospital.longitude];
      bounds.extend(latLng);

      const isSelected = selectedHospitalId === hospital.id;
      const isFull =
        hospital.status === 'FULL' ||
        (hospital.availableGeneralBeds === 0 && hospital.availableIcuBeds === 0);
      const bgColor = hospital.status === 'CLOSED' ? '#6b7280' : isFull ? '#dc2626' : '#2563eb';

      const hospitalIcon = L.divIcon({
        className: 'hospital-map-marker',
        html: `
          <div style="
            background: ${bgColor};
            color: #ffffff;
            padding: ${isSelected ? '6px 10px' : '4px 8px'};
            border-radius: 12px;
            font-size: 11px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 4px;
            border: 2px solid ${isSelected ? '#facc15' : '#ffffff'};
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
            transform: scale(${isSelected ? '1.15' : '1'});
            transition: all 0.2s ease;
            white-space: nowrap;
          ">
            <span>🏥 ${hospital.name}</span>
            <span style="background: rgba(0,0,0,0.25); padding: 1px 5px; border-radius: 6px; font-size: 10px;">
              ICU: ${hospital.availableIcuBeds} | Gen: ${hospital.availableGeneralBeds}
            </span>
          </div>
        `,
        iconAnchor: [45, 16],
      });

      const marker = L.marker(latLng, { icon: hospitalIcon });
      marker.on('click', () => {
        if (onSelectHospital) onSelectHospital(hospital);
      });

      marker.bindPopup(`
        <div style="color: #111827; font-family: sans-serif; font-size: 13px; max-width: 250px; padding: 2px;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #0f172a;">${hospital.name}</h4>
          <p style="margin: 0 0 6px 0; color: #475569; font-size: 12px;">${hospital.address}</p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 6px; font-size: 11px;">
            <div>Gen Beds: <strong>${hospital.availableGeneralBeds}</strong></div>
            <div>ICU Beds: <strong style="color: #dc2626;">${hospital.availableIcuBeds}</strong></div>
            <div>Ventilators: <strong>${hospital.availableVentilators}</strong></div>
            <div>Trauma: <strong>${hospital.hasTraumaCenter ? 'Yes' : 'No'}</strong></div>
          </div>
          <div style="font-size: 11px; color: #0284c7; margin-bottom: 6px;">📞 Emergency: ${hospital.emergencyPhone}</div>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}" target="_blank" rel="noopener noreferrer" style="
            display: inline-block;
            background: #2563eb;
            color: #fff;
            padding: 4px 8px;
            border-radius: 4px;
            text-decoration: none;
            font-size: 11px;
            font-weight: 600;
          ">Get Directions →</a>
        </div>
      `);

      markersLayer.addLayer(marker);
    });

    // 4. Disaster Incident Markers
    activeDisasters.forEach((disaster) => {
      if (
        typeof disaster.latitude !== 'number' ||
        typeof disaster.longitude !== 'number' ||
        isNaN(disaster.latitude) ||
        isNaN(disaster.longitude)
      ) {
        return;
      }

      const latLng: [number, number] = [disaster.latitude, disaster.longitude];
      bounds.extend(latLng);

      const isSelected = selectedDisasterId === disaster.id;
      const bgColor = getDisasterSeverityBg(disaster.severity);
      const iconEmoji = getDisasterIconEmoji(disaster.disasterType);
      const truncatedTitle =
        disaster.title && disaster.title.length > 20
          ? `${disaster.title.substring(0, 18)}...`
          : disaster.title || 'Incident';

      const disasterIcon = L.divIcon({
        className: 'disaster-map-marker',
        html: `
          <div style="
            background: ${bgColor};
            color: #ffffff;
            padding: ${isSelected ? '6px 10px' : '4px 8px'};
            border-radius: 12px;
            font-size: 11px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 4px;
            border: 2px solid ${isSelected ? '#facc15' : '#ffffff'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            transform: scale(${isSelected ? '1.15' : '1'});
            transition: all 0.2s ease;
            white-space: nowrap;
          ">
            <span>${iconEmoji} ${truncatedTitle}</span>
            <span style="background: rgba(0,0,0,0.35); padding: 1px 5px; border-radius: 6px; font-size: 10px;">
              ${disaster.severity}
            </span>
          </div>
        `,
        iconAnchor: [45, 16],
      });

      const marker = L.marker(latLng, { icon: disasterIcon });
      marker.on('click', () => {
        if (onSelectDisaster) onSelectDisaster(disaster);
      });

      marker.bindPopup(`
        <div style="color: #111827; font-family: sans-serif; font-size: 13px; max-width: 260px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 4px;">
            <span style="font-size: 11px; font-weight: 700; background: ${bgColor}; color: #ffffff; padding: 2px 6px; border-radius: 4px;">
              ${disaster.severity}
            </span>
            <span style="font-size: 11px; font-weight: 600; color: #6b7280;">
              ${disaster.status || 'PENDING'}
            </span>
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #0f172a;">
            ${iconEmoji} ${disaster.title}
          </h4>
          <p style="margin: 0 0 6px 0; color: #64748b; font-size: 11px; text-transform: capitalize;">
            Category: <strong>${(disaster.disasterType || '').replace(/_/g, ' ')}</strong>
          </p>
          ${disaster.locationName ? `<p style="margin: 0 0 6px 0; color: #475569; font-size: 12px;">📍 ${disaster.locationName}</p>` : ''}
          ${
            typeof disaster.estimatedAffectedPeople === 'number' && disaster.estimatedAffectedPeople > 0
              ? `<div style="font-size: 12px; margin-bottom: 6px; color: #b91c1c;">⚠️ Est. Affected: <strong>${disaster.estimatedAffectedPeople}</strong> people</div>`
              : ''
          }
          ${
            disaster.description
              ? `<p style="margin: 0 0 6px 0; color: #334155; font-size: 12px; max-height: 60px; overflow-y: auto; line-height: 1.3;">"${disaster.description}"</p>`
              : ''
          }
          <a href="https://www.google.com/maps/dir/?api=1&destination=${disaster.latitude},${disaster.longitude}" target="_blank" rel="noopener noreferrer" style="
            display: inline-block;
            background: #2563eb;
            color: #fff;
            padding: 4px 8px;
            border-radius: 4px;
            text-decoration: none;
            font-size: 11px;
            font-weight: 600;
          ">Get Directions →</a>
        </div>
      `);

      markersLayer.addLayer(marker);
    });

    // 5. SOS Alert Markers
    activeSosAlerts.forEach((alert) => {
      if (
        typeof alert.latitude !== 'number' ||
        typeof alert.longitude !== 'number' ||
        isNaN(alert.latitude) ||
        isNaN(alert.longitude)
      ) {
        return;
      }

      const latLng: [number, number] = [alert.latitude, alert.longitude];
      bounds.extend(latLng);

      const isSelected = selectedSosId === alert.id;
      const statusStyle = getSosStatusStyle(alert.status);
      const isActive = alert.status === 'ACTIVE';

      const sosIcon = L.divIcon({
        className: 'sos-map-marker',
        html: `
          <div style="
            background: ${statusStyle.bg};
            color: #ffffff;
            padding: ${isSelected ? '6px 10px' : '4px 8px'};
            border-radius: 12px;
            font-size: 11px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 4px;
            border: 2px solid ${isSelected ? '#facc15' : '#ffffff'};
            box-shadow: 0 0 14px ${statusStyle.glow};
            transform: scale(${isSelected ? '1.15' : '1'});
            transition: all 0.2s ease;
            white-space: nowrap;
            position: relative;
          ">
            ${
              isActive
                ? '<span style="position: absolute; top: -3px; right: -3px; width: 8px; height: 8px; border-radius: 50%; background: #ffffff; box-shadow: 0 0 6px #fff;"></span>'
                : ''
            }
            <span>🚨 SOS #${alert.id}</span>
            <span style="background: rgba(0,0,0,0.3); padding: 1px 5px; border-radius: 6px; font-size: 10px;">
              ${statusStyle.label}
            </span>
          </div>
        `,
        iconAnchor: [45, 16],
      });

      const marker = L.marker(latLng, { icon: sosIcon });
      marker.on('click', () => {
        if (onSelectSos) onSelectSos(alert);
      });

      marker.bindPopup(`
        <div style="color: #111827; font-family: sans-serif; font-size: 13px; max-width: 270px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 4px;">
            <span style="font-size: 11px; font-weight: 800; background: ${statusStyle.bg}; color: #ffffff; padding: 2px 6px; border-radius: 4px;">
              🚨 SOS #${alert.id}
            </span>
            <span style="font-size: 11px; font-weight: 700; color: ${statusStyle.bg};">
              ${(alert.status || '').replace(/_/g, ' ')}
            </span>
          </div>
          ${alert.userName ? `<h4 style="margin: 0 0 2px 0; font-size: 14px; font-weight: bold; color: #0f172a;">${alert.userName}</h4>` : ''}
          <p style="margin: 0 0 4px 0; color: #64748b; font-size: 11px;">
            Type: <strong>${(alert.emergencyType || '').replace(/_/g, ' ')}</strong> ${typeof alert.triageScore === 'number' && !isNaN(alert.triageScore) ? `• Triage Score: <strong>${alert.triageScore}</strong> (${alert.priority || 'STANDARD'})` : alert.priority ? `• Priority: <strong>${alert.priority}</strong>` : ''}
          </p>
          ${alert.locationName ? `<p style="margin: 0 0 6px 0; color: #475569; font-size: 12px;">📍 ${alert.locationName}</p>` : ''}
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 6px; font-size: 11px;">
            ${typeof alert.trappedCount === 'number' ? `<div>Trapped: <strong>${alert.trappedCount} ${alert.trappedCount === 1 ? 'person' : 'people'}</strong></div>` : ''}
            ${alert.userBloodGroup && alert.userBloodGroup !== 'UNKNOWN' ? `<div>Blood: <strong>${alert.userBloodGroup.replace('_POS', '+').replace('_NEG', '-')}</strong></div>` : ''}
          </div>
          ${
            alert.medicalAttentionNeeded
              ? `
            <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 4px; padding: 3px 6px; font-size: 11px; color: #b91c1c; font-weight: bold; margin-bottom: 6px;">
              🚑 Critical: Paramedic / Medical Aid Needed
            </div>
          `
              : ''
          }
          ${alert.additionalNotes ? `<p style="margin: 0 0 6px 0; color: #475569; font-size: 11px; font-style: italic;">"${alert.additionalNotes}"</p>` : ''}
          ${alert.assignedTeamName ? `<div style="font-size: 11px; color: #2563eb; margin-bottom: 6px;">🚒 Squad: <strong>${alert.assignedTeamName}</strong> ${alert.assignedTeamType ? `<span style="color: #64748b;">(${(alert.assignedTeamType || '').replace(/_/g, ' ')})</span>` : ''}</div>` : ''}
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px;">
            ${
              alert.userPhone
                ? `
              <a href="tel:${alert.userPhone}" style="
                display: inline-flex;
                align-items: center;
                gap: 3px;
                background: #10b981;
                color: #fff;
                padding: 4px 8px;
                border-radius: 4px;
                text-decoration: none;
                font-size: 11px;
                font-weight: 600;
              ">📞 Call (${alert.userPhone})</a>
            `
                : ''
            }
            <a href="https://www.google.com/maps/dir/?api=1&destination=${alert.latitude},${alert.longitude}" target="_blank" rel="noopener noreferrer" style="
              display: inline-block;
              background: #2563eb;
              color: #fff;
              padding: 4px 8px;
              border-radius: 4px;
              text-decoration: none;
              font-size: 11px;
              font-weight: 600;
            ">Route →</a>
          </div>
        </div>
      `);

      markersLayer.addLayer(marker);
    });

    // Fit map bounds to show markers safely
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else if (
      userLocation &&
      typeof userLocation.latitude === 'number' &&
      typeof userLocation.longitude === 'number' &&
      !isNaN(userLocation.latitude) &&
      !isNaN(userLocation.longitude)
    ) {
      map.setView([userLocation.latitude, userLocation.longitude], 12);
    }
  }, [
    userLocation,
    shelters,
    hospitals,
    disasters,
    sosAlerts,
    showShelters,
    showHospitals,
    showDisasters,
    showSosAlerts,
    selectedShelterId,
    selectedHospitalId,
    selectedDisasterId,
    selectedSosId,
  ]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
      }}
    >
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

      {/* Dynamic Map Legend Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(11, 15, 25, 0.90)',
          backdropFilter: 'blur(10px)',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          zIndex: 10,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          maxWidth: 'calc(100% - 24px)',
        }}
      >
        {userLocation && (
          <div className="flex items-center gap-1">
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#3b82f6',
                display: 'inline-block',
              }}
            />
            <span>You</span>
          </div>
        )}
        {showDisasters && disasters.length > 0 && (
          <div className="flex items-center gap-1">
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ef4444',
                display: 'inline-block',
              }}
            />
            <span>Disaster Incidents</span>
          </div>
        )}
        {showSosAlerts && sosAlerts.length > 0 && (
          <div className="flex items-center gap-1">
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#dc2626',
                display: 'inline-block',
              }}
            />
            <span>Live SOS Beacons</span>
          </div>
        )}
        {showShelters && shelters.length > 0 && (
          <div className="flex items-center gap-1">
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10b981',
                display: 'inline-block',
              }}
            />
            <span>Shelter (Open)</span>
          </div>
        )}
        {showHospitals && hospitals.length > 0 && (
          <div className="flex items-center gap-1">
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#2563eb',
                display: 'inline-block',
              }}
            />
            <span>Hospital</span>
          </div>
        )}
        {((showShelters && shelters.length > 0) || (showHospitals && hospitals.length > 0)) && (
          <div className="flex items-center gap-1">
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ef4444',
                display: 'inline-block',
              }}
            />
            <span>Full Capacity</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const TacticalIncidentMap = EmergencyResourceMap;
export default EmergencyResourceMap;
