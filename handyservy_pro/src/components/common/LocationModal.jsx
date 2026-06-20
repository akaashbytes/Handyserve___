import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CityLocationPicker from './CityLocationPicker';
import { resolveActiveCity } from '../../lib/cities';

const RECENTS_KEY = 'hs_recent_locations';
const MAX_RECENTS = 5;
const DIRECTIONS_MAX = 120;

function loadRecents() {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveRecent(entry) {
  try {
    const prev = loadRecents();
    const deduped = prev.filter(
      (e) =>
        !(
          typeof e.lat === 'number' &&
          typeof entry.lat === 'number' &&
          Math.abs(e.lat - entry.lat) < 0.0002 &&
          Math.abs((e.lng ?? e.lon) - (entry.lng ?? entry.lon)) < 0.0002
        )
    );
    localStorage.setItem(RECENTS_KEY, JSON.stringify([{ ...entry, savedAt: Date.now() }, ...deduped].slice(0, MAX_RECENTS)));
  } catch { /* ignore */ }
}

const fieldStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1px solid var(--border)',
  background: 'var(--bg-input)',
  fontSize: '14px',
  color: 'var(--text-primary)',
  outline: 'none',
  fontFamily: 'var(--font-body)',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: '8px',
};

const FOOTER_FEATURES = [
  { icon: '🎯', title: 'Accurate matching', desc: 'Find nearby providers' },
  { icon: '⏱️', title: 'Faster response', desc: 'Save time' },
  { icon: '✨', title: 'Better experience', desc: 'On-time service' },
];

function userToDraft(user) {
  return {
    serviceCity: user?.serviceCity || user?.city || '',
    state: user?.state || 'Tamil Nadu',
    location: user?.location || '',
    latitude: user?.latitude ?? null,
    longitude: user?.longitude ?? null,
    displayAddress: user?.displayAddress || '',
    addressQuery: user?.displayAddress || [user?.location, user?.serviceCity || user?.city].filter(Boolean).join(', ') || '',
    serviceCityActive: user?.serviceCityActive !== false && resolveActiveCity(user?.serviceCity || user?.city).active,
    detectedCityLabel: user?.detectedCityLabel || user?.serviceCity || user?.city || '',
  };
}

export default function LocationModal({ isOpen, onClose }) {
  const { user, updateUser } = useAuth();
  const [locationDraft, setLocationDraft] = useState(() => userToDraft(user));
  const [houseFlat, setHouseFlat] = useState('');
  const [landmark, setLandmark] = useState('');
  const [directionsNote, setDirectionsNote] = useState('');

  // Re-sync draft from latest user data every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setLocationDraft(userToDraft(user));
      setHouseFlat('');
      setLandmark('');
      setDirectionsNote('');
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps


  const hasCoords = typeof locationDraft.latitude === 'number' && typeof locationDraft.longitude === 'number';
  const canDismissBackdrop = typeof user?.latitude === 'number' && typeof user?.longitude === 'number';

  const handleSave = () => {
    if (!hasCoords) {
      alert('Select your city and pick an area on the map or from search.');
      return;
    }
    if (!locationDraft.serviceCity) {
      alert('Please select Chennai, Madurai, or Coimbatore.');
      return;
    }

    const extras = [houseFlat, landmark, directionsNote].filter(Boolean);
    const displayAddress =
      extras.length > 0
        ? `${locationDraft.displayAddress || ''}${locationDraft.displayAddress ? ' — ' : ''}${extras.join(' · ')}`.trim()
        : locationDraft.displayAddress || [locationDraft.location, locationDraft.serviceCity, locationDraft.state].filter(Boolean).join(', ');

    const serviceCityActive = locationDraft.serviceCityActive !== false;
    const areaLabel =
      locationDraft.location?.trim() ||
      locationDraft.displayAddress?.split(',')[0]?.trim() ||
      'Saved location';

    updateUser({
      ...user,
      state: locationDraft.state || 'Tamil Nadu',
      city: locationDraft.serviceCity,
      serviceCity: locationDraft.serviceCity,
      serviceCityActive,
      detectedCityLabel: locationDraft.detectedCityLabel || locationDraft.serviceCity,
      location: areaLabel,
      latitude: locationDraft.latitude,
      longitude: locationDraft.longitude,
      displayAddress,
      addressQuery: locationDraft.displayAddress || displayAddress,
    });
    saveRecent({
      lat: locationDraft.latitude,
      lng: locationDraft.longitude,
      displayAddress,
      location: areaLabel,
      city: locationDraft.serviceCity,
      state: locationDraft.state,
      serviceCityActive,
    });
    onClose();
  };

  if (!isOpen) return null;

  const addressLine = locationDraft.displayAddress || (hasCoords ? 'Selected on map' : 'Select city and area');
  const launchSoon = hasCoords && locationDraft.serviceCityActive === false;

  return (
    <>
      <style>{`
        @keyframes hsLocFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hs-loc-modal-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 36px;
          align-items: start;
        }
        @media (max-width: 960px) {
          .hs-loc-modal-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 48px',
          background: 'rgba(17, 24, 39, 0.45)',
          backdropFilter: 'blur(10px)',
        }}
        onClick={() => { if (canDismissBackdrop) onClose(); }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          style={{
            width: '100%',
            maxWidth: '1100px',
            background: 'var(--bg-surface)',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 80px)',
            animation: 'hsLocFadeIn 0.24s ease',
          }}
        >
          <div
            style={{
              padding: '28px 36px 22px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 24,
              borderBottom: '1px solid var(--border-light)',
            }}
          >
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brand)', margin: '0 0 8px' }}>
                Service location
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 8px', color: 'var(--text-primary)' }}>
                Your service location
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55, maxWidth: 560 }}>
                Choose Chennai, Madurai, or Coimbatore, then search any real area within that city.
              </p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" style={{ width: 36, height: 36, border: 'none', background: 'transparent', color: '#9CA3AF', fontSize: 24, cursor: 'pointer' }}>
              ×
            </button>
          </div>

          <div style={{ padding: '28px 36px', overflowY: 'auto', flex: 1 }}>
            <div className="hs-loc-modal-grid">
              <CityLocationPicker value={locationDraft} onChange={setLocationDraft} mapHeight={320} allowFreeSearch />

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>Confirm your location</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 18px', lineHeight: 1.5 }}>
                  Add optional details for your provider. Matching is by city — any area within {locationDraft.serviceCity || 'your city'} works.
                </p>

                <div style={{ padding: '16px 18px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-elevated)', marginBottom: 20 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 8px' }}>
                    {locationDraft.serviceCity || 'City'} · {launchSoon ? 'Coming soon' : 'Active'}
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1.4 }}>{addressLine}</p>
                  {hasCoords && (
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, fontFamily: 'monospace' }}>
                      Lat {locationDraft.latitude.toFixed(4)}, Lng {locationDraft.longitude.toFixed(4)}
                    </p>
                  )}
                </div>

                {launchSoon && (
                  <div style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--warning-light)', border: '1px solid rgba(245, 158, 11, 0.2)', marginBottom: 18, fontSize: 13, color: 'var(--warning)', lineHeight: 1.5 }}>
                    We are launching services in <strong>{locationDraft.detectedCityLabel || 'this city'}</strong> soon 🚀. You can save this address, but providers will not appear until we launch there.
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>House / Flat / Door No. (Optional)</label>
                  <input value={houseFlat} onChange={(e) => setHouseFlat(e.target.value)} placeholder="e.g. 45-5A, 2nd Floor" style={fieldStyle} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Landmark (Optional)</label>
                  <input value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="e.g. Near Hope College" style={fieldStyle} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Directions for provider (Optional)</label>
                  <div style={{ position: 'relative' }}>
                    <textarea
                      value={directionsNote}
                      onChange={(e) => setDirectionsNote(e.target.value.slice(0, DIRECTIONS_MAX))}
                      placeholder="e.g. Blue gate house, call when arrived"
                      rows={3}
                      style={{ ...fieldStyle, resize: 'vertical', minHeight: 80, paddingBottom: 28 }}
                    />
                    <span style={{ position: 'absolute', right: 12, bottom: 10, fontSize: 11, color: '#9CA3AF' }}>
                      {directionsNote.length}/{DIRECTIONS_MAX}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 10, background: 'var(--brand-light)', border: '1px solid rgba(124, 58, 237, 0.15)', marginBottom: 22, fontSize: 13, color: 'var(--brand)' }}>
                  <span style={{ fontWeight: 700 }}>i</span>
                  <span>Providers in the same city see your pin — KK Nagar and Anna Nagar in Madurai both match.</span>
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'var(--brand)',
                    color: 'var(--bg-surface)',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    boxShadow: 'var(--shadow-md)',
                    marginBottom: 12,
                  }}
                >
                  Confirm Location
                </button>
                <button type="button" onClick={onClose} style={{ width: '100%', padding: 8, border: 'none', background: 'transparent', color: 'var(--text-secondary)', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <div style={{ padding: '18px 36px 22px', borderTop: '1px solid var(--border-light)', background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
            {FOOTER_FEATURES.map((f) => (
              <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{f.icon}</span>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{f.title}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
