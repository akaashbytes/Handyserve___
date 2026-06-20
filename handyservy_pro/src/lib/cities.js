/** Active service metros — customers & providers must match on the same city. */
export const ACTIVE_SERVICE_CITIES = [
  {
    id: 'chennai',
    label: 'Chennai',
    state: 'Tamil Nadu',
    center: [13.0827, 80.2707],
    aliases: ['chennai', 'madras', 'greater chennai'],
  },
  {
    id: 'madurai',
    label: 'Madurai',
    state: 'Tamil Nadu',
    center: [9.9252, 78.1198],
    aliases: ['madurai'],
  },
  {
    id: 'coimbatore',
    label: 'Coimbatore',
    state: 'Tamil Nadu',
    center: [11.0168, 76.9558],
    aliases: ['coimbatore', 'kovai'],
  },
];

export function normalizeCityText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function findActiveCityById(id) {
  const key = normalizeCityText(id);
  return ACTIVE_SERVICE_CITIES.find((c) => c.id === key || normalizeCityText(c.label) === key) || null;
}

/** Resolve whether text / Nominatim address belongs to an active metro. */
export function resolveActiveCity(text, geocodeAddress = null) {
  const parts = [
    text,
    geocodeAddress?.city,
    geocodeAddress?.town,
    geocodeAddress?.village,
    geocodeAddress?.municipality,
    geocodeAddress?.county,
    geocodeAddress?.state_district,
    geocodeAddress?.suburb,
  ];
  const hay = normalizeCityText(parts.filter(Boolean).join(' '));

  for (const city of ACTIVE_SERVICE_CITIES) {
    if (city.aliases.some((alias) => hay.includes(normalizeCityText(alias)))) {
      return { ...city, active: true };
    }
  }

  const detected =
    geocodeAddress?.city ||
    geocodeAddress?.town ||
    geocodeAddress?.village ||
    geocodeAddress?.municipality ||
    (typeof text === 'string' ? text.split(',')[0]?.trim() : '') ||
    'Unknown';

  return {
    id: null,
    label: detected,
    state: geocodeAddress?.state || '',
    center: null,
    aliases: [],
    active: false,
  };
}

export function isActiveServiceCity(cityName) {
  return resolveActiveCity(cityName).active === true;
}

export function sameServiceCity(cityA, cityB) {
  const a = resolveActiveCity(cityA);
  const b = resolveActiveCity(cityB);
  if (a.active && b.active) return a.id === b.id;
  return normalizeCityText(cityA) === normalizeCityText(cityB) && Boolean(normalizeCityText(cityA));
}

export function cityConfigByLabel(label) {
  const resolved = resolveActiveCity(label);
  if (resolved.active) return resolved;
  return findActiveCityById(label);
}
