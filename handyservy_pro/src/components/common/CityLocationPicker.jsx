import React, { useState, useEffect, useRef, useCallback } from 'react';
import LocationPickerMap from './LocationPickerMap';
import { getIcon } from './Icons';
import { geocodeSearch } from '../../lib/geo';
import { ACTIVE_SERVICE_CITIES, resolveActiveCity } from '../../lib/cities';

const SEARCH_DEBOUNCE_MS = 450;

function splitSuggestionLabel(displayName) {
  if (!displayName) return { bold: '', rest: '' };
  const parts = displayName.split(',').map((s) => s.trim());
  return { bold: parts[0] || displayName, rest: parts.slice(1).join(', ') };
}

const PinIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="var(--brand)" />
    <circle cx="12" cy="9" r="2.5" fill="#fff" />
  </svg>
);

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

/**
 * Shared city + map location picker for registration and modals.
 * value: { serviceCity, state, location, latitude, longitude, displayAddress, serviceCityActive }
 */
export default function CityLocationPicker({
  value = {},
  onChange,
  mapHeight = 280,
  showCityDropdown = true,
  allowFreeSearch = true,
}) {
  const [serviceCity, setServiceCity] = useState(value.serviceCity || '');
  const [addressQuery, setAddressQuery] = useState(value.displayAddress || value.addressQuery || '');
  const [latitude, setLatitude] = useState(value.latitude ?? null);
  const [longitude, setLongitude] = useState(value.longitude ?? null);
  const [displayAddress, setDisplayAddress] = useState(value.displayAddress || '');
  const [area, setArea] = useState(value.location || '');
  const [state, setState] = useState(value.state || 'Tamil Nadu');
  const [serviceCityActive, setServiceCityActive] = useState(value.serviceCityActive !== false);
  const [detectedCityLabel, setDetectedCityLabel] = useState(value.detectedCityLabel || '');

  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [geocodeResults, setGeocodeResults] = useState([]);
  const [isLocating, setIsLocating] = useState(false);

  const searchDebounceRef = useRef(null);
  const geocodeSeq = useRef(0);

  const emit = useCallback(
    (patch) => {
      const next = {
        serviceCity,
        state,
        location: area,
        latitude,
        longitude,
        displayAddress,
        addressQuery,
        serviceCityActive,
        detectedCityLabel,
        ...patch,
      };
      onChange?.(next);
    },
    [serviceCity, state, area, latitude, longitude, displayAddress, addressQuery, serviceCityActive, detectedCityLabel, onChange]
  );

  const applyCoords = useCallback(
    (lat, lon, display, shortLabel, rawAddress) => {
      let resolved = resolveActiveCity(display, rawAddress);
      if (!resolved.active && serviceCity && !rawAddress) {
        const fromDropdown = resolveActiveCity(serviceCity);
        if (fromDropdown.active) resolved = fromDropdown;
      }
      const nextActive = resolved.active;
      const nextCity = resolved.label;
      const nextState = resolved.active ? resolved.state : rawAddress?.state || state;
      const nextServiceCity = resolved.active ? resolved.label : serviceCity;

      setLatitude(lat);
      setLongitude(lon);
      setDisplayAddress(display);
      setArea(shortLabel || display?.split(',')[0]?.trim() || area);
      setServiceCityActive(nextActive);
      setDetectedCityLabel(nextCity);
      if (resolved.active) setServiceCity(resolved.label);
      setState(nextState);
      setGeocodeResults([]);
      emit({
        latitude: lat,
        longitude: lon,
        displayAddress: display,
        location: shortLabel || display?.split(',')[0]?.trim(),
        serviceCity: nextServiceCity,
        state: nextState,
        serviceCityActive: nextActive,
        detectedCityLabel: nextCity,
      });
    },
    [area, emit, serviceCity, state]
  );

  useEffect(() => {
    if (!addressQuery?.trim() || addressQuery.length < 2) {
      setGeocodeResults([]);
      return undefined;
    }
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(async () => {
      const seq = ++geocodeSeq.current;
      setIsGeocoding(true);
      setGeoError('');
      try {
        const { results, error } = await geocodeSearch(addressQuery, {
          cityHint: showCityDropdown && serviceCity ? serviceCity : undefined,
        });
        if (seq !== geocodeSeq.current) return;
        setGeocodeResults(results || []);
        setGeoError(results?.length ? '' : error || '');
      } catch {
        if (seq === geocodeSeq.current) setGeoError('Could not reach geocoding. Try again shortly.');
      } finally {
        if (seq === geocodeSeq.current) setIsGeocoding(false);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [addressQuery, serviceCity, showCityDropdown]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported in this browser.');
      return;
    }
    setIsLocating(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        applyCoords(
          position.coords.latitude,
          position.coords.longitude,
          displayAddress || 'Current GPS location',
          area || 'Live location',
          null
        );
        setIsLocating(false);
      },
      () => {
        setGeoError('Unable to fetch your current location. Please allow location access.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number';
  const selectedPosition = hasCoords ? [latitude, longitude] : null;
  const mapCenter =
    selectedPosition ||
    (serviceCity ? ACTIVE_SERVICE_CITIES.find((c) => c.label === serviceCity)?.center : null) ||
    [11.0168, 76.9558];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {showCityDropdown && (
        <div>
          <label style={labelStyle}>Service city *</label>
          <select
            value={serviceCity}
            onChange={(e) => {
              const label = e.target.value;
              const cfg = ACTIVE_SERVICE_CITIES.find((c) => c.label === label);
              setServiceCity(label);
              setState(cfg?.state || 'Tamil Nadu');
              setServiceCityActive(true);
              setDetectedCityLabel(label);
              emit({ serviceCity: label, state: cfg?.state || 'Tamil Nadu', serviceCityActive: true, detectedCityLabel: label });
            }}
            style={fieldStyle}
          >
            <option value="">Select city — Chennai, Madurai, or Coimbatore</option>
            {ACTIVE_SERVICE_CITIES.map((c) => (
              <option key={c.id} value={c.label}>
                {c.label}
              </option>
            ))}
          </select>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.45 }}>
            Pick your city first, then search any area or landmark within it on the map.
          </p>
        </div>
      )}

      <div>
        <label style={labelStyle}>Area / street / landmark</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.45 }}>{getIcon('🔍', { size: 16 })}</span>
          <input
            value={addressQuery}
            onChange={(e) => {
              setAddressQuery(e.target.value);
              emit({ addressQuery: e.target.value });
            }}
            disabled={showCityDropdown && !serviceCity && !allowFreeSearch}
            placeholder={
              serviceCity
                ? `Search any area in ${serviceCity}…`
                : 'Select a service city first'
            }
            style={{ ...fieldStyle, paddingLeft: 42, border: '2px solid var(--brand)' }}
          />
          {isGeocoding && (
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--brand)', fontWeight: 600 }}>
              …
            </span>
          )}
        </div>
      </div>

      {geocodeResults.length > 0 && (
        <div style={{ borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden', background: 'var(--bg-surface)', maxHeight: 200, overflowY: 'auto' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {geocodeResults.slice(0, 6).map((r, i) => {
              const { bold, rest } = splitSuggestionLabel(r.displayName);
              return (
                <li key={`${r.lat}-${r.lon}-${i}`}>
                  <button
                    type="button"
                    onClick={() => applyCoords(r.lat, r.lon, r.address || r.displayName, r.shortLabel, r.raw?.address)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 14px',
                      border: 'none',
                      borderBottom: '1px solid var(--border-light)',
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: 10,
                    }}
                  >
                    <PinIcon />
                    <span>
                      <span style={{ display: 'block', fontWeight: 700, fontSize: 14 }}>{bold}</span>
                      {rest && <span style={{ display: 'block', fontSize: 12, color: '#9CA3AF' }}>{rest}</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {geoError && !geocodeResults.length && <p style={{ fontSize: 13, color: 'var(--danger)', margin: 0 }}>{geoError}</p>}

      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
        <LocationPickerMap
          selectedPosition={selectedPosition}
          defaultCenter={mapCenter}
          onPick={(coords) => {
            applyCoords(coords[0], coords[1], displayAddress || 'Map pin location', area, null);
          }}
          height={mapHeight}
        />
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          style={{
            position: 'absolute',
            left: 12,
            bottom: 12,
            zIndex: 500,
            padding: '9px 14px',
            borderRadius: 10,
            border: '1.5px solid var(--brand)',
            background: 'var(--bg-surface)',
            color: 'var(--brand)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
          }}
        >
          {isLocating ? 'Locating…' : '◎ Use current location'}
        </button>
      </div>

      {hasCoords && !serviceCityActive && (
        <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--warning-light)', border: '1px solid rgba(245, 158, 11, 0.2)', fontSize: 13, color: 'var(--warning)' }}>
          We are launching in <strong>{detectedCityLabel || 'this city'}</strong> soon. Services are only available in Chennai, Madurai, and Coimbatore for now.
        </div>
      )}

      {hasCoords && serviceCityActive && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          {getIcon('📍', { size: 14 })}
          <span>{displayAddress || area} · {serviceCity}</span>
        </p>
      )}
    </div>
  );
}
