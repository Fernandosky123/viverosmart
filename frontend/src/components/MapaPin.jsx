import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Arreglar el icono por defecto de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition, onLocationChange }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      if(onLocationChange) onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Ubicación del Vivero</Popup>
    </Marker>
  );
}

export default function MapaPin({ onLocationChange, currentLat, currentLng }) {
  const defaultCenter = { lat: -17.783, lng: -63.182 }; // Santa Cruz, Bolivia
  const center = (currentLat && currentLng) ? { lat: currentLat, lng: currentLng } : defaultCenter;
  const [position, setPosition] = useState(center);

  return (
    <div className="rounded-xl overflow-hidden border-4 border-emerald-700/30 shadow-inner" style={{ height: '300px', width: '100%' }}>
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} onLocationChange={onLocationChange} />
      </MapContainer>
    </div>
  );
}
