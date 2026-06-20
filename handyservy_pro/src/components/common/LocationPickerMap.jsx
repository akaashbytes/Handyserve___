import { useEffect } from 'react';
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';

const DEFAULT_CENTER = [13.0827, 80.2707];

function MapClickHandler({ onPick }) {
  useMapEvents({
    click(event) {
      onPick([event.latlng.lat, event.latlng.lng]);
    },
  });
  return null;
}

function RecenterMap({ center, zoom = 14 }) {
  const map = useMap();
  useEffect(() => {
    if (map && map.getContainer()) {
      map.setView(center, zoom, { animate: false });
    }
  }, [center, map, zoom]);
  return null;
}

export default function LocationPickerMap({ selectedPosition, onPick, height = 240, defaultCenter }) {
  const center = selectedPosition || defaultCenter || DEFAULT_CENTER;

  return (
    <div style={{ width: '100%', height, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <MapContainer center={center} zoom={13} scrollWheelZoom zoomAnimation={false} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onPick={onPick} />
        <RecenterMap center={center} zoom={selectedPosition ? 15 : 13} />
        {selectedPosition && (
          <CircleMarker center={selectedPosition} radius={11} pathOptions={{ color: '#18181B', fillColor: '#18181B', fillOpacity: 0.9, weight: 3 }}>
            <Tooltip direction="top" offset={[0, -10]} permanent>
              {selectedPosition[0].toFixed(4)}, {selectedPosition[1].toFixed(4)}
            </Tooltip>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
}
