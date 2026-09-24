import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { icon } from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';

const locationIcon = icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function LocationMarker({ lat, lng, onLocationChange, disabled }) {
  const map = useMapEvents({
    click(event) {
      if (!disabled) onLocationChange?.(event.latlng.lat, event.latlng.lng);
    },
  });

  useEffect(() => {
    // Sigue la ubicación confirmada por el padre; un guardado fallido no mueve el pin.
    map.setView([lat, lng], map.getZoom(), { animate: false });
  }, [map, lat, lng]);

  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  return (
    <Marker position={[lat, lng]} icon={locationIcon}>
      <Popup>Ubicación del invernadero</Popup>
    </Marker>
  );
}

export default function MapaPin({ onLocationChange, currentLat, currentLng, disabled = false }) {
  const [tileError, setTileError] = useState(false);
  const validLocation = Number.isFinite(currentLat) && Number.isFinite(currentLng)
    && Math.abs(currentLat) <= 90 && Math.abs(currentLng) <= 180;
  const lat = validLocation ? currentLat : -17.783;
  const lng = validLocation ? currentLng : -63.182;

  return (
    <div className="location-map" aria-label="Mapa de ubicación del invernadero" aria-busy={disabled}>
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', cursor: disabled ? 'default' : 'crosshair' }}
      >
        <TileLayer
          attribution="Tiles &copy; Esri"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          eventHandlers={{ tileerror: () => setTileError(true), tileload: () => setTileError(false) }}
        />
        <LocationMarker lat={lat} lng={lng} onLocationChange={onLocationChange} disabled={disabled} />
      </MapContainer>
      {tileError && <p className="map-tile-error" role="status">No se pudo cargar el fondo del mapa. Comprueba tu conexión a internet.</p>}
    </div>
  );
}
