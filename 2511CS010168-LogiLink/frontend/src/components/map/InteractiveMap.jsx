import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom sleek SVG DivIcons for Leaflet
function createMarkerIcon(type, label = '', number = null) {
  let bg = '#2563eb';
  let border = '#1d4ed8';
  let iconSvg = '';

  if (type === 'origin') {
    bg = '#10b981'; // emerald green
    border = '#059669';
    iconSvg = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="8"></circle>
        <circle cx="12" cy="12" r="3" fill="white"></circle>
      </svg>
    `;
  } else if (type === 'destination') {
    bg = '#ef4444'; // red
    border = '#dc2626';
    iconSvg = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 21s-6-5.333-6-10a6 6 0 0 1 12 0c0 4.667-6 10-6 10z"></path>
        <circle cx="12" cy="11" r="2.5" fill="white"></circle>
      </svg>
    `;
  } else if (type === 'stop') {
    bg = '#f59e0b'; // amber
    border = '#d97706';
    iconSvg = `<span style="font-weight: 700; font-size: 11px; color: white;">${number ?? '•'}</span>`;
  } else if (type === 'vehicle') {
    bg = '#3b82f6'; // blue
    border = '#1d4ed8';
    iconSvg = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </svg>
    `;
  }

  const html = `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: ${bg};
      border: 2px solid #ffffff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.25), 0 1px 3px rgba(0,0,0,0.12);
      border-radius: 50%;
      cursor: pointer;
      transform: translate(-14px, -14px);
      transition: transform 0.15s ease;
    " class="logilink-map-marker marker-${type}">
      ${iconSvg}
      ${label ? `<div style="
        position: absolute;
        bottom: -22px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(15, 23, 42, 0.88);
        color: white;
        font-family: inherit;
        font-size: 10px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 4px;
        white-space: nowrap;
        pointer-events: none;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">${label}</div>` : ''}
    </div>
  `;

  return L.divIcon({
    className: 'logilink-custom-div-icon',
    html,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16]
  });
}

export default function InteractiveMap({
  center = [17.3850, 78.4867],
  zoom = 6,
  origin = null,
  destination = null,
  stops = [],
  routeGeometry = null,
  vehicles = [],
  selectedVehicleId = null,
  onVehicleSelect = null,
  height = '100%',
  className = ''
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routeLayerRef = useRef(null);

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCenter = origin?.lat && origin?.lng ? [origin.lat, origin.lng] : center;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom,
      zoomControl: false,
      attributionControl: true
    });

    // Add sleek Light TileLayer from OpenStreetMap with proper attribution
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Zoom control at top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Layers for markers and polyline
    routeLayerRef.current = L.featureGroup().addTo(map);
    markersLayerRef.current = L.featureGroup().addTo(map);

    mapInstanceRef.current = map;

    // Handle container resize gracefully
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Route Geometry & Markers when props change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const markersGroup = markersLayerRef.current;
    const routeGroup = routeLayerRef.current;
    if (!markersGroup || !routeGroup) return;

    markersGroup.clearLayers();
    routeGroup.clearLayers();

    const allPoints = [];

    // 1. Origin Marker
    if (origin && origin.lat != null && origin.lng != null) {
      const pos = [Number(origin.lat), Number(origin.lng)];
      allPoints.push(pos);
      const icon = createMarkerIcon('origin', origin.name || 'Origin');
      const marker = L.marker(pos, { icon });
      marker.bindPopup(`
        <div style="font-size: 12px; line-height: 1.4;">
          <strong style="color: #059669;">Origin:</strong> ${origin.name || 'Origin Hub'}<br/>
          <span style="color: #64748b; font-size: 11px;">Coord: ${pos[0].toFixed(4)}, ${pos[1].toFixed(4)}</span>
        </div>
      `);
      markersGroup.addLayer(marker);
    }

    // 2. Intermediate Stops
    if (Array.isArray(stops) && stops.length > 0) {
      stops.forEach((stop, index) => {
        if (stop && stop.lat != null && stop.lng != null) {
          const pos = [Number(stop.lat), Number(stop.lng)];
          allPoints.push(pos);
          const icon = createMarkerIcon('stop', stop.name || `Stop ${index + 1}`, index + 1);
          const marker = L.marker(pos, { icon });
          marker.bindPopup(`
            <div style="font-size: 12px; line-height: 1.4;">
              <strong style="color: #d97706;">Waypoint ${index + 1}:</strong> ${stop.name || 'Intermediate Hub'}<br/>
              <span style="color: #64748b; font-size: 11px;">Coord: ${pos[0].toFixed(4)}, ${pos[1].toFixed(4)}</span>
            </div>
          `);
          markersGroup.addLayer(marker);
        }
      });
    }

    // 3. Destination Marker
    if (destination && destination.lat != null && destination.lng != null) {
      const pos = [Number(destination.lat), Number(destination.lng)];
      allPoints.push(pos);
      const icon = createMarkerIcon('destination', destination.name || 'Destination');
      const marker = L.marker(pos, { icon });
      marker.bindPopup(`
        <div style="font-size: 12px; line-height: 1.4;">
          <strong style="color: #dc2626;">Destination:</strong> ${destination.name || 'Destination Hub'}<br/>
          <span style="color: #64748b; font-size: 11px;">Coord: ${pos[0].toFixed(4)}, ${pos[1].toFixed(4)}</span>
        </div>
      `);
      markersGroup.addLayer(marker);
    }

    // 4. Route Polyline
    if (routeGeometry) {
      try {
        let latLngs = [];
        if (Array.isArray(routeGeometry)) {
          latLngs = routeGeometry.map(p => Array.isArray(p) ? [p[0], p[1]] : [p.lat, p.lng]);
        } else if (typeof routeGeometry === 'string' && routeGeometry.startsWith('[')) {
          const parsed = JSON.parse(routeGeometry);
          if (Array.isArray(parsed)) {
            latLngs = parsed.map(p => Array.isArray(p) ? [p[0], p[1]] : [p.lat, p.lng]);
          }
        }

        if (latLngs.length > 1) {
          // Draw subtle shadow line underneath
          const shadowPolyline = L.polyline(latLngs, {
            color: '#1e3a8a',
            weight: 7,
            opacity: 0.25,
            lineCap: 'round',
            lineJoin: 'round'
          });
          routeGroup.addLayer(shadowPolyline);

          // Draw main road polyline
          const polyline = L.polyline(latLngs, {
            color: '#2563eb',
            weight: 4,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
            dashArray: null
          });
          routeGroup.addLayer(polyline);

          latLngs.forEach(pt => allPoints.push(pt));
        }
      } catch (err) {
        console.warn('Failed to parse routeGeometry for polyline', err);
      }
    }

    // 5. Vehicles Layer
    if (Array.isArray(vehicles) && vehicles.length > 0) {
      vehicles.forEach(v => {
        if (v && v.latitude != null && v.longitude != null) {
          const pos = [Number(v.latitude), Number(v.longitude)];
          allPoints.push(pos);
          const isSelected = selectedVehicleId && (selectedVehicleId === v.id || selectedVehicleId === v.vehicleId);
          const icon = createMarkerIcon('vehicle', v.vehicleId || v.registration);
          const marker = L.marker(pos, { icon, zIndexOffset: isSelected ? 1000 : 100 });

          marker.bindPopup(`
            <div style="font-size: 12px; line-height: 1.45; min-width: 170px;">
              <div style="font-weight: 700; color: #1e293b; font-size: 13px; margin-bottom: 4px;">
                ${v.vehicleId || 'Vehicle'} <span style="font-size: 11px; font-weight: normal; color: #64748b;">(${v.registration || ''})</span>
              </div>
              <div><strong>Status:</strong> <span style="color: ${v.status === 'Delayed' ? '#ef4444' : v.status === 'In Transit' ? '#2563eb' : '#10b981'}; font-weight: 600;">${v.status || 'Active'}</span></div>
              <div><strong>Driver:</strong> ${v.driver || 'Unassigned'}</div>
              <div><strong>Speed:</strong> ${v.speed || '0 km/h'}</div>
              <div><strong>Location:</strong> ${v.location || 'En route'}</div>
              ${v.activeShipment ? `<div><strong>Shipment:</strong> ${v.activeShipment}</div>` : ''}
              <div style="margin-top: 4px; font-size: 10px; color: #94a3b8;">Coord: ${pos[0].toFixed(4)}, ${pos[1].toFixed(4)}</div>
            </div>
          `);

          marker.on('click', () => {
            if (onVehicleSelect) onVehicleSelect(v);
          });

          if (isSelected) {
            setTimeout(() => marker.openPopup(), 100);
          }

          markersGroup.addLayer(marker);
        }
      });
    }

    // Fit map bounds to show all points
    if (allPoints.length > 1) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else if (allPoints.length === 1) {
      map.setView(allPoints[0], 11);
    }
  }, [origin, destination, stops, routeGeometry, vehicles, selectedVehicleId]);

  return (
    <div
      ref={mapContainerRef}
      className={`logilink-interactive-map ${className}`}
      style={{
        width: '100%',
        height,
        minHeight: '380px',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
        border: '1px solid #e2e8f0',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
      }}
    />
  );
}
