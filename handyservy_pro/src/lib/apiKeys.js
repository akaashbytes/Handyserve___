/**
 * HandyServe Pro — API Key Registry
 * ──────────────────────────────────
 * Every single API call in the application must use the matching key
 * from this file as the `X-Api-Key` request header.
 *
 * These values exactly match what is seeded into the backend's HS_API_KEYS table.
 * Use these same values in Postman → Headers → X-Api-Key
 */

// ── AUTH ──────────────────────────────────────────────────────────
export const KEYS = {
  AUTH_STATS:        'hsp-auth-stats-aK9mX2bNqR',   // GET  /api/auth/public-stats
  AUTH_REGISTER:     'hsp-auth-reg-bQ8wY3cOpS',    // POST /api/auth/register
  AUTH_LOGIN:        'hsp-auth-lgn-cR7vZ4dPtT',    // POST /api/auth/login
  AUTH_LOGOUT:       'hsp-auth-lgt-dS6uA5eQuU',    // POST /api/auth/logout
  AUTH_ME:           'hsp-auth-me0-eT5tB6fRvV',    // GET  /api/auth/me
  AUTH_ROLE:         'hsp-auth-rol-fU4sC7gSwW',    // POST /api/auth/select-role
  AUTH_PROFILE:      'hsp-auth-prf-gV3rD8hTxX',   // PATCH /api/auth/profile
  AUTH_REFRESH:      'hsp-auth-rfr-hW2qE9iUyY',   // POST /api/auth/refresh

  // ── BOOKINGS ──────────────────────────────────────────────────
  BOOK_CREATE:       'hsp-book-crt-iX1pF0jVzZ',   // POST  /api/bookings
  BOOK_LIST:         'hsp-book-lst-jY0oG1kWaA',   // GET   /api/bookings
  BOOK_GET:          'hsp-book-get-kZ9nH2lXbB',   // GET   /api/bookings/{id}
  BOOK_STATUS:       'hsp-book-sts-lA8mI3mYcC',   // PATCH /api/bookings/{id}/status
  BOOK_PATCH:        'hsp-book-ptc-mB7lJ4nZdD',   // PATCH /api/bookings/{id}
  BOOK_RATE:         'hsp-book-rat-nC6kK5oAeE',   // POST  /api/bookings/{id}/rating

  // ── PROVIDERS ─────────────────────────────────────────────────
  PROV_LIST:         'hsp-prov-lst-oD5jL6pBfF',   // GET   /api/providers
  PROV_GET:          'hsp-prov-get-pE4iM7qCgG',   // GET   /api/providers/{id}
  PROV_NEARBY:       'hsp-prov-nrb-qF3hN8rDhH',  // GET   /api/providers/nearby
  PROV_BLOCK:        'hsp-prov-blk-rG2gO9sEiI',  // PATCH /api/providers/{id}/block
  PROV_VERIFY:       'hsp-prov-vfy-tJ2gK9sFkL',  // PATCH /api/providers/{id}/verify
  PROV_DELETE:       'hsp-prov-del-uK3gL8tMvN',  // DELETE /api/providers/{id}
  PROV_AVAIL:        'hsp-prov-avl-sH1fP0tFjJ',  // PATCH /api/providers/{id}/availability

  // ── PAYMENTS ──────────────────────────────────────────────────
  PAY_PROMO:         'hsp-pay-prm-tI0eQ1uGkK',   // GET  /api/payments/promo/{code}
  PAY_INITIATE:      'hsp-pay-ini-uJ9dR2vHlL',   // POST /api/payments/initiate
  PAY_VERIFY:        'hsp-pay-vfy-vK8cS3wImM',   // POST /api/payments/verify

  // ── DISPUTES ──────────────────────────────────────────────────
  DISP_CREATE:       'hsp-disp-crt-wL7bT4xJnN',  // POST  /api/disputes
  DISP_LIST:         'hsp-disp-lst-xM6aU5yKoO',  // GET   /api/disputes
  DISP_GET:          'hsp-disp-get-yN5zV6zLpP',  // GET   /api/disputes/{id}
  DISP_STATUS:       'hsp-disp-sts-zA4yW7aMqQ',  // PATCH /api/disputes/{id}/status
  DISP_UPDATE:       'hsp-disp-upd-aB3xX8bNrR',  // POST  /api/disputes/{id}/updates

  // ── LEAVE REQUESTS ────────────────────────────────────────────
  LEAV_CREATE:       'hsp-leav-crt-bC2wY9cOsS',  // POST  /api/leave
  LEAV_LIST:         'hsp-leav-lst-cD1vZ0dPtT',  // GET   /api/leave
  LEAV_STATUS:       'hsp-leav-sts-dE0uA1eQuU',  // PATCH /api/leave/{id}/status

  // ── NOTIFICATIONS ─────────────────────────────────────────────
  NOTIF_LIST:        'hsp-ntf-lst-eF9tB2fRvV',   // GET   /api/notifications
  NOTIF_READ:        'hsp-ntf-rd1-fG8sC3gSwW',   // PATCH /api/notifications/{id}/read
  NOTIF_READALL:     'hsp-ntf-rda-gH7rD4hTxX',  // PATCH /api/notifications/read-all

  // ── ANALYTICS ─────────────────────────────────────────────────
  ANLY_GET:          'hsp-anly-get-hI6qE5iUyY',  // GET /api/analytics

  // ── CONTACT ───────────────────────────────────────────────────
  CONT_CREATE:       'hsp-cont-crt-iJ5pF6jVzZ',  // POST  /api/contact
  CONT_LIST:         'hsp-cont-lst-jK4oG7kWaA',  // GET   /api/contact
  CONT_STATUS:       'hsp-cont-sts-kL3nH8lXbB',  // PATCH /api/contact/{id}/status

  // ── GEOCODING ─────────────────────────────────────────────────
  GEO_REVERSE:       'hsp-geo-rev-lM2mI9mYcC',   // GET /api/nominatim/reverse

  // ── WEBSOCKET ─────────────────────────────────────────────────
  WS_LOCATION:       'hsp-ws-loc-mN1lJ0nZdD',    // WS /ws/**

  // ── PAYMENTS PROMO CRUD (ADMIN) ──────────────────────────────
  PAY_PROMO_LIST:    'hsp-pay-prm-lst-a1b2c3d4e5', // GET  /api/payments/promo
  PAY_PROMO_CREATE:  'hsp-pay-prm-crt-f6g7h8i9j0', // POST /api/payments/promo
  PAY_PROMO_TOGGLE:  'hsp-pay-prm-tgl-k1l2m3n4o5', // PATCH /api/payments/promo/{id}/active
  PAY_PROMO_DELETE:  'hsp-pay-prm-del-p6q7r8s9t0', // DELETE /api/payments/promo/{id}

  // ── CHAT ─────────────────────────────────────────────────────
  CHAT_GET:          'hsp-chat-get-xP2qR9sTuV',    // GET  /api/bookings/{id}/chat
  CHAT_POST:         'hsp-chat-pst-yQ3sS0tUvW',    // POST /api/bookings/{id}/chat

  // ── CUSTOMER ARCHITECTURE ───────────────────────────────────
  CUST_AUTH_VAL:     'hsp-cst-val-aK9mX2bNqR',    // GET   /api/customer/auth/validate-session
  CUST_AUTH_RFR:     'hsp-cst-rfr-bQ8wY3cOpS',    // POST  /api/customer/auth/refresh
  CUST_AUTH_LGT:     'hsp-cst-lgt-cR7vZ4dPtT',    // POST  /api/customer/auth/logout
  CUST_DASH_STATS:   'hsp-cst-dsh-dS6uA5eQuU',    // GET   /api/customer/dashboard/stats
  CUST_DISC_PROV:    'hsp-cst-dsc-eT5tB6fRvV',    // GET   /api/customer/discover/providers
  CUST_BOOK_CREATE:  'hsp-cst-bcr-fU4sC7gSwW',    // POST  /api/customer/bookings
  CUST_BOOK_LIST:    'hsp-cst-bls-gV3rD8hTxX',    // GET   /api/customer/bookings
  CUST_BOOK_GET:     'hsp-cst-bgt-hW2qE9iUyY',    // GET   /api/customer/bookings/{id}
  CUST_BOOK_STATUS:  'hsp-cst-bst-iX1pF0jVzZ',    // PATCH /api/customer/bookings/{id}/status
  CUST_BOOK_RATE:    'hsp-cst-brt-jY0oG1kWaA',    // POST  /api/customer/bookings/{id}/rating
  CUST_TRACKING:     'hsp-cst-trk-tracking05',    // GET   /api/customer/tracking/{bookingId}
  CUST_PAY_SUMMARY:  'hsp-cst-pys-summary01',    // GET   /api/customer/payments/summary
  CUST_PAY_INVOICES: 'hsp-cst-pyi-invoices02',   // GET   /api/customer/payments/invoices
  CUST_PAY_INITIATE: 'hsp-cst-pyt-initiate03',   // POST  /api/customer/payments/initiate
  CUST_PAY_VERIFY:   'hsp-cst-pyv-verify04',     // POST  /api/customer/payments/verify
  CUST_PROFILE:      'hsp-cst-prf-oD5jL6pBfF',    // PATCH /api/customer/profile
};

/**
 * URL → API Key resolver.
 * Automatically picks the right key based on HTTP method + URL path.
 * Used by the smart apiFetch() wrapper in AuthContext.
 *
 * @param {string} method  HTTP method (GET, POST, PATCH, etc.)
 * @param {string} url     The request URL path e.g. '/api/bookings'
 * @returns {string}       The matching API key value
 */
export function resolveApiKey(method, url) {
  const m = method.toUpperCase();
  const u = url.split('?')[0]; // strip query params

  // AUTH
  if (m === 'GET'   && u === '/api/auth/public-stats')  return KEYS.AUTH_STATS;
  if (m === 'POST'  && u === '/api/auth/register')      return KEYS.AUTH_REGISTER;
  if (m === 'POST'  && u === '/api/auth/login')         return KEYS.AUTH_LOGIN;
  if (m === 'POST'  && u === '/api/auth/logout')        return KEYS.AUTH_LOGOUT;
  if (m === 'GET'   && u === '/api/auth/me')            return KEYS.AUTH_ME;
  if (m === 'POST'  && u === '/api/auth/select-role')   return KEYS.AUTH_ROLE;
  if (m === 'PATCH' && u === '/api/auth/profile')       return KEYS.AUTH_PROFILE;
  if (m === 'POST'  && u === '/api/auth/refresh')       return KEYS.AUTH_REFRESH;

  // BOOKINGS
  if (m === 'POST'  && u === '/api/bookings')                           return KEYS.BOOK_CREATE;
  if (m === 'GET'   && u === '/api/bookings')                           return KEYS.BOOK_LIST;
  if (m === 'GET'   && /^\/api\/bookings\/\d+$/.test(u))               return KEYS.BOOK_GET;
  if (m === 'PATCH' && /^\/api\/bookings\/\d+\/status$/.test(u))       return KEYS.BOOK_STATUS;
  if (m === 'PATCH' && /^\/api\/bookings\/\d+$/.test(u))               return KEYS.BOOK_PATCH;
  if (m === 'POST'  && /^\/api\/bookings\/\d+\/rating$/.test(u))       return KEYS.BOOK_RATE;

  // PROVIDERS
  if (m === 'GET'   && u === '/api/providers')                          return KEYS.PROV_LIST;
  if (m === 'GET'   && u === '/api/providers/nearby')                  return KEYS.PROV_NEARBY;
  if (m === 'GET'   && /^\/api\/providers\/\d+$/.test(u))              return KEYS.PROV_GET;
  if (m === 'PATCH' && /^\/api\/providers\/\d+\/block$/.test(u))       return KEYS.PROV_BLOCK;
  if (m === 'PATCH' && /^\/api\/providers\/\d+\/verify$/.test(u))      return KEYS.PROV_VERIFY;
  if (m === 'DELETE' && /^\/api\/providers\/\d+$/.test(u))             return KEYS.PROV_DELETE;
  if (m === 'PATCH' && /^\/api\/providers\/\d+\/availability$/.test(u)) return KEYS.PROV_AVAIL;

  // PAYMENTS
  if (m === 'GET'    && u === '/api/payments/promo')                   return KEYS.PAY_PROMO_LIST;
  if (m === 'POST'   && u === '/api/payments/promo')                   return KEYS.PAY_PROMO_CREATE;
  if (m === 'PATCH'  && /^\/api\/payments\/promo\/\d+\/active$/.test(u)) return KEYS.PAY_PROMO_TOGGLE;
  if (m === 'DELETE' && /^\/api\/payments\/promo\/\d+$/.test(u))       return KEYS.PAY_PROMO_DELETE;
  if (m === 'GET'   && u.startsWith('/api/payments/promo/'))           return KEYS.PAY_PROMO;
  if (m === 'POST'  && u === '/api/payments/initiate')                 return KEYS.PAY_INITIATE;
  if (m === 'POST'  && u === '/api/payments/verify')                   return KEYS.PAY_VERIFY;

  // CHAT
  if (m === 'GET'   && /^\/api\/bookings\/\d+\/chat$/.test(u))         return KEYS.CHAT_GET;
  if (m === 'POST'  && /^\/api\/bookings\/\d+\/chat$/.test(u))         return KEYS.CHAT_POST;

  // DISPUTES
  if (m === 'POST'  && u === '/api/disputes')                          return KEYS.DISP_CREATE;
  if (m === 'GET'   && u === '/api/disputes')                          return KEYS.DISP_LIST;
  if (m === 'GET'   && /^\/api\/disputes\/.+$/.test(u))               return KEYS.DISP_GET;
  if (m === 'PATCH' && /^\/api\/disputes\/.+\/status$/.test(u))       return KEYS.DISP_STATUS;
  if (m === 'POST'  && /^\/api\/disputes\/.+\/updates$/.test(u))      return KEYS.DISP_UPDATE;

  // LEAVE
  if (m === 'POST'  && u === '/api/leave')                             return KEYS.LEAV_CREATE;
  if (m === 'GET'   && u === '/api/leave')                             return KEYS.LEAV_LIST;
  if (m === 'PATCH' && /^\/api\/leave\/\d+\/status$/.test(u))         return KEYS.LEAV_STATUS;

  // NOTIFICATIONS
  if (m === 'GET'   && u === '/api/notifications')                     return KEYS.NOTIF_LIST;
  if (m === 'PATCH' && u === '/api/notifications/read-all')            return KEYS.NOTIF_READALL;
  if (m === 'PATCH' && /^\/api\/notifications\/.+\/read$/.test(u))    return KEYS.NOTIF_READ;

  // ANALYTICS
  if (m === 'GET'   && u === '/api/analytics')                         return KEYS.ANLY_GET;

  // CONTACT
  if (m === 'POST'  && u === '/api/contact')                           return KEYS.CONT_CREATE;
  if (m === 'GET'   && u === '/api/contact')                           return KEYS.CONT_LIST;
  if (m === 'PATCH' && /^\/api\/contact\/.+\/status$/.test(u))        return KEYS.CONT_STATUS;

  // GEOCODING
  if (u.startsWith('/api/nominatim'))                                  return KEYS.GEO_REVERSE;

  // CUSTOMER ARCHITECTURE
  if (m === 'GET'   && u === '/api/customer/auth/validate-session')    return KEYS.CUST_AUTH_VAL;
  if (m === 'POST'  && u === '/api/customer/auth/refresh')             return KEYS.CUST_AUTH_RFR;
  if (m === 'POST'  && u === '/api/customer/auth/logout')              return KEYS.CUST_AUTH_LGT;
  if (m === 'GET'   && u === '/api/customer/dashboard/stats')          return KEYS.CUST_DASH_STATS;
  if (m === 'GET'   && u === '/api/customer/discover/providers')        return KEYS.CUST_DISC_PROV;
  if (m === 'POST'  && u === '/api/customer/bookings')                  return KEYS.CUST_BOOK_CREATE;
  if (m === 'GET'   && u === '/api/customer/bookings')                  return KEYS.CUST_BOOK_LIST;
  if (m === 'GET'   && /^\/api\/customer\/bookings\/\d+$/.test(u))       return KEYS.CUST_BOOK_GET;
  if (m === 'PATCH' && /^\/api\/customer\/bookings\/\d+\/status$/.test(u)) return KEYS.CUST_BOOK_STATUS;
  if (m === 'POST'  && /^\/api\/customer\/bookings\/\d+\/rating$/.test(u)) return KEYS.CUST_BOOK_RATE;
  if (m === 'GET'   && /^\/api\/customer\/tracking\/\d+$/.test(u))       return KEYS.CUST_TRACKING;
  if (m === 'GET'   && u === '/api/customer/payments/summary')          return KEYS.CUST_PAY_SUMMARY;
  if (m === 'GET'   && u === '/api/customer/payments/invoices')         return KEYS.CUST_PAY_INVOICES;
  if (m === 'POST'  && u === '/api/customer/payments/initiate')         return KEYS.CUST_PAY_INITIATE;
  if (m === 'POST'  && u === '/api/customer/payments/verify')           return KEYS.CUST_PAY_VERIFY;
  if (m === 'PATCH' && u === '/api/customer/profile')                   return KEYS.CUST_PROFILE;

  // Fallback: no key needed (public)
  return null;
}
