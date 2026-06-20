import { useEffect, useMemo } from 'react';
import { CircleMarker, MapContainer, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';

function FitJobBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !map.getContainer()) return;
    const valid = points.filter((p) => typeof p[0] === 'number' && typeof p[1] === 'number');
    if (valid.length === 0) return;
    if (valid.length === 1) {
      map.setView(valid[0], 14, { animate: false });
      return;
    }
    map.fitBounds(L.latLngBounds(valid), { padding: [16, 16], maxZoom: 14, animate: false });
  }, [map, points]);
  return null;
}

export default function JobRouteMiniMap({
  customerLatitude,
  customerLongitude,
  providerLatitude,
  providerLongitude,
  height = 200,
}) {
  const customer = useMemo(() => {
    if (typeof customerLatitude !== 'number' || typeof customerLongitude !== 'number') return null;
    return [customerLatitude, customerLongitude];
  }, [customerLatitude, customerLongitude]);

  const provider = useMemo(() => {
    if (typeof providerLatitude !== 'number' || typeof providerLongitude !== 'number') return null;
    return [providerLatitude, providerLongitude];
  }, [providerLatitude, providerLongitude]);

  const center = customer || provider || [13.0827, 80.2707];
  const points = useMemo(() => [customer, provider].filter(Boolean), [customer, provider]);

  if (!customer) {
    return (
      <div style={{ height, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
        Customer location not available
      </div>
    );
  }

  return (
    <div style={{ height, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} zoomAnimation={false} style={{ width: '100%', height: '100%' }}>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitJobBounds points={points} />
        {customer && provider && (
          <Polyline positions={[provider, customer]} pathOptions={{ color: 'var(--brand)', weight: 4, opacity: 0.75 }} />
        )}
        {provider && (
          <CircleMarker center={provider} radius={8} pathOptions={{ color: '#0EA5E9', fillColor: '#0EA5E9', fillOpacity: 0.85 }} />
        )}
        <CircleMarker center={customer} radius={8} pathOptions={{ color: 'var(--brand)', fillColor: 'var(--brand)', fillOpacity: 0.85 }} />
      </MapContainer>
    </div>
  );
}
