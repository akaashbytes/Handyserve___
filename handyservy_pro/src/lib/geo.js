/** Haversine distance in km between two [lat, lon] points. */
export function haversineDistanceKm([lat1, lon1], [lat2, lon2]) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatAddressFromNominatim(addr) {
  if (!addr) return '';
  const parts = [
    addr.house_number,
    addr.road,
    addr.neighbourhood || addr.suburb,
    addr.city || addr.town || addr.village || addr.municipality,
    addr.state,
    addr.postcode,
    addr.country,
  ].filter(Boolean);
  return [...new Set(parts)].join(', ');
}

export async function geocodeSearch(query, options = {}) {
  const trimmed = (query || '').trim();
  if (!trimmed) return { results: [], error: 'Enter an area or address.' };

  const cityHint = options.cityHint?.trim();
  const q = encodeURIComponent(
    cityHint ? `${trimmed}, ${cityHint}, Tamil Nadu, India` : `${trimmed}, India`
  );
  const params = `q=${q}&format=json&limit=6&addressdetails=1&countrycodes=in`;

  const url = `/api/nominatim/search?${params}`;

  // Abort after 15 seconds to avoid hanging UI
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'X-Api-Key': 'hsp-geo-rev-lM2mI9mYcC' },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      try {
        const errorData = await res.json();
        if (errorData && errorData.error) {
          return { results: [], error: errorData.error };
        }
      } catch (e) {
        // Fallback if response is not JSON
      }
      return { results: [], error: `Geocoding failed (${res.status}). Check your internet connection.` };
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return { results: [], error: 'No matches found. Try a different area name.' };
    }

    const results = data.map((item) => ({
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      displayName: item.display_name,
      shortLabel: item.name || item.display_name?.split(',')[0]?.trim() || trimmed,
      address: formatAddressFromNominatim(item.address),
      raw: item,
    }));

    return { results, error: '' };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return { results: [], error: 'Geocoding timed out. Check internet connection on the server machine and try again.' };
    }
    // Network-level failure — backend may be down
    return { results: [], error: 'Geocoding service unreachable. Please ensure the booking-service and api-gateway are running.' };
  }
}

export function googleMapsSearchUrl(lat, lon) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lon}`)}`;
}

export function googleMapsDirectionsUrl(destination, origin) {
  const dest = `${destination[0]},${destination[1]}`;
  if (origin && typeof origin[0] === 'number' && typeof origin[1] === 'number') {
    const orig = `${origin[0]},${origin[1]}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${orig}&destination=${dest}&travelmode=driving`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
}
