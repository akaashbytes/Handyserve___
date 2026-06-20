export function categoryIdFromServiceType(serviceType) {
  const s = String(serviceType || '').toLowerCase();
  if (s.includes('plumb')) return 'plumbing';
  if (s.includes('elect')) return 'electrical';
  if (s.includes('clean')) return 'cleaning';
  if (s.includes('appliance') || s.includes('fridge') || s.includes('washing')) return 'appliance';
  if (s.includes('pest')) return 'pest';
  if (s.includes('paint')) return 'painting';
  if (s.includes('carpent')) return 'carpentry';
  if (s.includes('hvac') || s.includes('duct')) return 'hvac';
  return 'other';
}

export function matchesServiceCategory(selectedCatId, provider) {
  if (!selectedCatId || selectedCatId === 'all') return true;

  const id = String(selectedCatId).toLowerCase();
  const svc = String(provider?.service || '').toLowerCase();
  const cat = String(provider?.category || svc).toLowerCase();
  const tags = (provider?.tags || []).map((t) => String(t).toLowerCase()).join(' ');
  const blob = `${svc} ${cat} ${tags}`;

  const synonyms = {
    plumbing: ['plumb', 'pipe', 'leak', 'tap', 'drain'],
    electrical: ['electri', 'wiring', 'wire', 'fan install', 'short circuit'],
    cleaning: ['clean', 'sofa', 'carpet', 'deep clean'],
    appliance: ['appliance', 'ac ', 'fridge', 'washing machine', 'repair'],
    pest: ['pest', 'termite', 'cockroach', 'rodent'],
    painting: ['paint', 'texture', 'interior', 'exterior'],
    carpentry: ['carpent', 'furniture', 'door', 'cabinet', 'wood'],
    hvac: ['hvac', 'duct', 'cooling', 'ac service'],
  };

  const needles = synonyms[id] || [id.replace(/-/g, ' ')];
  return needles.some((n) => blob.includes(n));
}
