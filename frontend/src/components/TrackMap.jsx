import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function createTruckIcon() {
  return L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 12h4l3 3v3c0 .6-.4 1-1 1h-1"/><path d="M9 21a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"/><path d="M17 21a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"/><path d="M4 21a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"/><path d="M2 9h5"/></svg>`),
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function createDefaultIcon() {
  return new L.Icon.Default();
}

export default function TrackMap({ locations }) {
  const { t } = useLanguage();
  const validLocations = locations?.filter(l => l.latitude != null && l.longitude != null) || [];
  
  if (validLocations.length === 0) {
    return (
      <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
        {t('tracking.noLocationData') || 'Location data is currently unavailable.'}
      </div>
    );
  }

  const latest = validLocations[0];
  const center = [latest.latitude, latest.longitude];
  const path = validLocations.map(l => [l.latitude, l.longitude]);
  
  const truckIconRef = useRef(null);
  const defaultIconRef = useRef(null);
  
  if (!truckIconRef.current) {
    truckIconRef.current = createTruckIcon();
  }
  if (!defaultIconRef.current) {
    defaultIconRef.current = createDefaultIcon();
  }

  return (
    <MapContainer
      center={center}
      zoom={10}
      style={{ height: '400px', width: '100%', borderRadius: '16px' }}
      scrollWheelZoom={false}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {path.length > 1 && (
        <Polyline positions={path} pathOptions={{ color: '#16a34a', weight: 3 }} />
      )}
      {validLocations.map((loc, i) => (
        <Marker
          key={loc.id || i}
          position={[loc.latitude, loc.longitude]}
          icon={i === 0 ? truckIconRef.current : defaultIconRef.current}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{loc.current_location}</p>
              <p className="text-gray-600 capitalize">{loc.status?.replace('_', ' ')}</p>
              <p className="text-xs text-gray-500">{loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}