import React, { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { useAuth } from '../../components/context/AuthContext';
import { Card, Button, EmptyState } from '../../components/common/UI';
import { getIcon } from '../../components/common/Icons';
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { haversineDistanceKm } from '../../lib/geo';

const DEFAULT_CENTER = [13.0827, 80.2707];

function FitTrackingBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !map.getContainer()) return;
    const valid = positions.filter((p) => p && typeof p[0] === 'number');
    if (valid.length === 0) return;
    if (valid.length === 1) {
      map.setView(valid[0], 14, { animate: false });
      return;
    }
    map.fitBounds(L.latLngBounds(valid), { padding: [28, 28], maxZoom: 15, animate: false });
  }, [map, positions]);
  return null;
}

export default function TrackingPage() {
  const { bookings, user, updateBookingStatus, apiFetch } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [optimisticStatus, setOptimisticStatus] = useState(null);
  const [liveData, setLiveData] = useState(null);

  const activeBooking = bookings.find(b => ['Requested', 'Accepted', 'On the way', 'Destination', 'Reached', 'Reached Confirmed', 'Pending Payment'].includes(b.status));

  useEffect(() => {
    if (!activeBooking) return;
    const fetchTracking = async () => {
      try {
        const res = await apiFetch(`/api/customer/tracking/${activeBooking.id}`);
        if (res.ok) {
          const data = await res.json();
          setLiveData(data);
        }
      } catch (e) {
        console.error('Failed to fetch tracking data', e);
      }
    };
    fetchTracking();
    const interval = setInterval(fetchTracking, 5000);
    return () => clearInterval(interval);
  }, [activeBooking?.id, apiFetch]);

  // The displayed status — uses optimistic value instantly while API is in-flight
  const displayStatus = optimisticStatus || (activeBooking ? activeBooking.status : null);

  const handleConfirmArrival = async (bookingId) => {
    setConfirming(true);
    setOptimisticStatus('Reached Confirmed'); // ← immediate visual update
    try {
      await updateBookingStatus(bookingId, 'Reached_Confirmed');
      setOptimisticStatus(null); // real status from server now matches — clear optimistic
    } catch (e) {
      setOptimisticStatus(null); // rollback on error
      window.alert('Failed to confirm provider arrival. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  const customerPosition = useMemo(() => {
    if (liveData && typeof liveData.customerLatitude === 'number' && typeof liveData.customerLongitude === 'number') {
      return [liveData.customerLatitude, liveData.customerLongitude];
    }
    if (activeBooking && typeof activeBooking.customerLatitude === 'number' && typeof activeBooking.customerLongitude === 'number') {
      return [activeBooking.customerLatitude, activeBooking.customerLongitude];
    }
    if (typeof user?.latitude === 'number' && typeof user?.longitude === 'number') {
      return [user.latitude, user.longitude];
    }
    return DEFAULT_CENTER;
  }, [liveData, activeBooking, user?.latitude, user?.longitude]);

  const providerLive = useMemo(() => {
    if (liveData && typeof liveData.providerLatitude === 'number' && typeof liveData.providerLongitude === 'number') {
      return [liveData.providerLatitude, liveData.providerLongitude];
    }
    if (activeBooking && typeof activeBooking.providerLatitude === 'number' && typeof activeBooking.providerLongitude === 'number') {
      return [activeBooking.providerLatitude, activeBooking.providerLongitude];
    }
    return null;
  }, [liveData, activeBooking]);

  const showProviderOnMap = Boolean(activeBooking && ['Accepted', 'On the way', 'Destination', 'Reached', 'Reached Confirmed'].includes(activeBooking.status) && providerLive);
  
  const providerDistanceKm = useMemo(() => {
    if (liveData && liveData.distanceKm != null) return liveData.distanceKm;
    if (!showProviderOnMap || !providerLive) return null;
    return haversineDistanceKm(customerPosition, providerLive);
  }, [liveData, customerPosition, providerLive, showProviderOnMap]);

  const providerEtaMins = useMemo(() => {
    if (liveData && liveData.etaMins != null) return liveData.etaMins;
    return providerDistanceKm != null ? Math.max(3, Math.round(providerDistanceKm * 6)) : null;
  }, [liveData, providerDistanceKm]);

  const mapPositions = useMemo(() => (showProviderOnMap && providerLive ? [customerPosition, providerLive] : [customerPosition]), [customerPosition, providerLive, showProviderOnMap]);

  if (!activeBooking) {
    return (
      <div style={{ padding: '32px 36px' }}>
        <EmptyState icon="📍" title="No Active Tracking" desc="You don't have any bookings currently in progress. Book a service to see live tracking." />
      </div>
    );
  }

  const steps = [
    { label: 'Booked',      icon: '📋', done: true, active: displayStatus === 'Requested' || displayStatus === 'Booked' },
    { label: 'Accepted',    icon: '✅', done: ['Accepted', 'On the way', 'Destination', 'Reached', 'Reached Confirmed', 'Pending Payment', 'Completed'].includes(displayStatus), active: displayStatus === 'Accepted' },
    { label: 'On the way',  icon: '🚗', done: ['On the way', 'Destination', 'Reached', 'Reached Confirmed', 'Pending Payment', 'Completed'].includes(displayStatus), active: displayStatus === 'On the way' },
    { label: 'Destination', icon: '📍', done: ['Destination', 'Reached', 'Reached Confirmed', 'Pending Payment', 'Completed'].includes(displayStatus), active: displayStatus === 'Destination' },
    { label: 'Reached',     icon: '🔧', done: ['Reached', 'Reached Confirmed', 'Pending Payment', 'Completed'].includes(displayStatus), active: displayStatus === 'Reached' },
    { label: 'Confirmed ✓', icon: '🤝', done: ['Reached Confirmed', 'Pending Payment', 'Completed'].includes(displayStatus), active: displayStatus === 'Reached Confirmed' },
    { label: 'Completed',   icon: '🎉', done: displayStatus === 'Completed' },
  ];

  return (
    <div className="animate-fade-in-up" style={{ padding: '32px 36px', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Live Job Tracking</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Booking #{activeBooking.id} · {activeBooking.service} · {activeBooking.providerName}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Status Steps */}
        <Card padding="22px">
          <p style={{ fontWeight: 700, marginBottom: '22px', fontSize: '15px', color: 'var(--text-primary)' }}>Job Status</p>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {steps.map((s, i) => (
              <React.Fragment key={s.label}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', background: s.active ? 'var(--brand-light)' : s.done ? 'var(--success-light)' : 'var(--bg-elevated)', border: `2.5px solid ${s.active ? 'var(--brand)' : s.done ? 'var(--success)' : 'var(--border)'}`, marginBottom: '8px', animation: s.active ? 'pulse 2s infinite' : 'none' }}>{getIcon(s.icon, { size: 18 })}</div>
                  <p style={{ fontSize: '10.5px', color: s.active ? 'var(--brand)' : s.done ? 'var(--success)' : 'var(--text-muted)', fontWeight: s.active ? 700 : 400, textAlign: 'center', whiteSpace: 'nowrap' }}>{s.label}</p>
                </div>
                {i < steps.length - 1 && <div style={{ flex: 1, height: 2.5, background: steps[i+1].done || s.done ? 'var(--success)' : 'var(--border)', margin: '0 4px', marginTop: '-20px', borderRadius: 2 }} />}
              </React.Fragment>
            ))}
          </div>
        </Card>

        {displayStatus === 'Reached' && (
          <Card padding="20px 24px" style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', borderColor: '#BFDBFE', animation: 'pulse 2s infinite' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontWeight: 800, fontSize: '15px', color: '#1E40AF', marginBottom: '4px' }}>Confirm Service Completion</p>
                <p style={{ fontSize: '13px', color: '#1E3A8A', margin: 0 }}>
                  {activeBooking.providerName} has marked the job status as Reached. Please confirm if the provider has reached and completed the service.
                </p>
              </div>
              <Button size="sm" onClick={() => handleConfirmArrival(activeBooking.id)} disabled={confirming} style={{ background: '#2563EB', color: '#fff', boxShadow: '0 2px 8px rgba(37,99,235,0.3)', minWidth: 140 }}>
                {confirming ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                    Confirming...
                  </span>
                ) : 'Confirm Arrival ✓'}
              </Button>
            </div>
          </Card>
        )}

        {displayStatus === 'Reached Confirmed' && (
          <Card padding="16px 20px" style={{ background: 'var(--success-light)', borderColor: '#A7F3D0', animation: 'animate-fade-in-up 0.3s ease' }}>
            <p style={{ fontSize: '13.5px', color: 'var(--success)', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✅</span> You have confirmed the provider's arrival and completion. Waiting for {activeBooking.providerName} to request payment.
            </p>
          </Card>
        )}

        <Card padding="0" style={{ overflow: 'hidden', height: 400, borderRadius: 20 }}>
          <div style={{ height: '100%', position: 'relative' }}>
            <MapContainer center={customerPosition} zoom={13} scrollWheelZoom zoomAnimation={false} style={{ width: '100%', height: '100%' }}>
              <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <FitTrackingBounds positions={mapPositions} />
              {showProviderOnMap && providerLive && (
                <Polyline positions={[providerLive, customerPosition]} pathOptions={{ color: 'var(--brand)', weight: 4, opacity: 0.65 }} />
              )}
              {showProviderOnMap && providerLive && (
                <CircleMarker center={providerLive} radius={10} pathOptions={{ color: '#0EA5E9', fillColor: '#0EA5E9', fillOpacity: 0.85 }}>
                  <Tooltip permanent direction="top" offset={[0, -8]}>Provider (live)</Tooltip>
                </CircleMarker>
              )}
              <CircleMarker center={customerPosition} radius={10} pathOptions={{ color: 'var(--brand)', fillColor: 'var(--brand)', fillOpacity: 0.85 }}>
                <Tooltip permanent direction="top" offset={[0, -8]}>You</Tooltip>
              </CircleMarker>
            </MapContainer>
            <div style={{ position: 'absolute', right: 12, top: 12, maxWidth: 200, background: 'var(--bg-card)', padding: '10px 12px', borderRadius: 12, boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', zIndex: 1000 }}>
              {!showProviderOnMap && <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Live provider location appears after they accept.</p>}
              {showProviderOnMap && providerDistanceKm != null && (
                <>
                  <p style={{ fontWeight: 700, color: 'var(--brand)', fontSize: 13, margin: 0 }}>{providerDistanceKm.toFixed(1)} km away</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>ETA ~{providerEtaMins} min</p>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Safety */}
        <Card padding="18px 20px" style={{ background: 'var(--brand-light)', borderColor: '#DDD6FE' }}>
          <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: '10px', color: 'var(--brand)', fontSize: '14px' }}>{getIcon('🛡️', { size: 16 })}Safety Guidelines</p>
          {['Verify provider ID before allowing entry', 'Keep valuables secured during service', 'Do not make advance payments in cash', 'Rate your experience after completion'].map((tip, i) => (
            <p key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '5px', display: 'flex', gap: '7px' }}>
              <span style={{ color: 'var(--brand)', fontWeight: 700 }}>·</span>{tip}
            </p>
          ))}
        </Card>
      </div>
    </div>
  );
}