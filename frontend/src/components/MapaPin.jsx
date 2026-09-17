import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    // Forzar actualización del tamaño del mapa al cargar por si está en gris
    setTimeout(() => { map.invalidateSize(); }, 500);
  }, [map]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Ubicación del Vivero</Popup>
    </Marker>
  );
}

export default function MapaPin({ onLocationChange, currentLat, currentLng }) {
  const isValidLocation = currentLat && currentLng && currentLat !== 0;
  const initialCenter = isValidLocation ? { lat: currentLat, lng: currentLng } : { lat: -17.783, lng: -63.182 };
  const [position, setPosition] = useState(initialCenter);

  return (
    <div className="rounded-xl overflow-hidden border-4 border-emerald-700/30 shadow-inner cursor-crosshair" style={{ height: '300px', width: '100%', position: 'relative', zIndex: 0 }}>
      <MapContainer center={initialCenter} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='Tiles &copy; Esri'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
        <LocationMarker position={position} setPosition={setPosition} onLocationChange={onLocationChange} />
      </MapContainer>
    </div>
  );
}
