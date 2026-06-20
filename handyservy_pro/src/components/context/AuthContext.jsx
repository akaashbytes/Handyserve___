import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { categoryIdFromServiceType } from '../../lib/serviceCategory';
import { googleMapsDirectionsUrl, googleMapsSearchUrl } from '../../lib/geo';
import { resolveActiveCity } from '../../lib/cities';
import { resolveApiKey } from '../../lib/apiKeys';

const AuthContext = createContext(null);
const PROFILE_STORE_KEY = 'hs_saved_profiles';
const BACKEND_URL = `http://${window.location.hostname}:8081`;
const WS_BACKEND_URL = `ws://${window.location.hostname}:8081`;

function getRoleFromToken(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const payload = JSON.parse(jsonPayload);
    return (payload.role || '').toLowerCase();
  } catch (e) {
    return null;
  }
}

function loadProfileStore() {
  try {
    const raw = localStorage.getItem(PROFILE_STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveProfileToStore(profile) {
  if (!profile?.id) return;
  try {
    const store = loadProfileStore();
    const { password: _pw, ...rest } = profile;
    store[profile.id] = {
      ...store[profile.id],
      ...rest,
      updatedAt: Date.now(),
    };
    localStorage.setItem(PROFILE_STORE_KEY, JSON.stringify(store));
  } catch { /* ignore */ }
}

/** Merge persisted location/profile fields onto account from demo or custom list. */
function applySavedProfile(baseUser) {
  if (!baseUser?.id) return baseUser;
  const store = loadProfileStore();
  const saved = store[baseUser.id];
  if (!saved) return baseUser;
  return {
    ...baseUser,
    ...saved,
    password: baseUser.password,
    email: baseUser.email,
    id: baseUser.id,
    role: baseUser.role,
  };
}

const CITY_ROWS = [
  { keys: ['chennai'], coords: [13.0827, 80.2707] },
  { keys: ['madurai'], coords: [9.9252, 78.1198] },
  { keys: ['coimbatore'], coords: [11.0168, 76.9558] },
  { keys: ['bangalore', 'bengaluru'], coords: [12.9716, 77.5946] },
  { keys: ['mumbai'], coords: [19.076, 72.8777] },
  { keys: ['pune'], coords: [18.5204, 73.8567] },
];

function inferCityCenterCoords(cityName) {
  const city = (cityName || '').toLowerCase();
  for (const row of CITY_ROWS) {
    if (row.keys.some((k) => city.includes(k))) return row.coords;
  }
  return [22.9734, 78.6569];
}

function stableOffsetFromId(id) {
  let h = 0;
  for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return [((h % 2000) - 1000) / 95000, (((h >> 3) % 2000) - 1000) / 95000];
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token') || null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const [isLocationModalOpen, setLocationModalOpen] = useState(false);

  const [providers, setProviders] = useState([]);
  
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [contactRequests, setContactRequests] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const apiFetch = useCallback(async (url, options = {}) => {
    const method = (options.method || 'GET').toUpperCase();
    const apiKey = resolveApiKey(method, url);
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }
    const targetUrl = url.startsWith('/api') ? `${BACKEND_URL}${url}` : url;
    let res = await fetch(targetUrl, { ...options, headers, credentials: 'include' });
    if (res.status === 401 && url !== '/api/auth/refresh' && url !== '/api/customer/auth/refresh' && url !== '/api/auth/login') {
      try {
        const role = getRoleFromToken(token);
        const isCustomer = role === 'customer';
        const refreshUrl = isCustomer ? '/api/customer/auth/refresh' : '/api/auth/refresh';

        const refreshRes = await fetch(`${BACKEND_URL}${refreshUrl}`, {
          method: 'POST',
          headers: { 'X-Api-Key': resolveApiKey('POST', refreshUrl) },
          credentials: 'include',
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setToken(data.token);
          setUser(data.user);
          headers['Authorization'] = `Bearer ${data.token}`;
          res = await fetch(targetUrl, { ...options, headers });
        } else {
          setToken(null);
          setUser(null);
        }
      } catch {
        setToken(null);
        setUser(null);
      }
    }
    return res;
  }, [token]);

  const fetchProviders = useCallback(async () => {
    try {
      const res = await apiFetch('/api/providers');
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map(p => {
          const catId = categoryIdFromServiceType(p.serviceType);
          return {
            ...p,
            id: p.id,
            name: p.name,
            service: p.serviceType || 'Handyman',
            category: catId === 'other' ? (p.serviceType || 'other').toLowerCase() : catId,
            rating: p.averageRating ?? 0.0,
            reviews: p.reviews ?? 0,
            price: p.pricing === 'Hourly' ? 400 : 800,
            experience: `${p.experience || 2} Years`,
            city: p.serviceCity,
            serviceCity: p.serviceCity,
            serviceCityActive: p.serviceCityActive !== false,
            location: p.location,
            latitude: p.latitude,
            longitude: p.longitude,
            reliabilityScore: p.reliabilityScore ?? 0,
            lowScoreDays: p.lowScoreDays || 0,
            radius: `${p.radius || 10}km`,
            workingHours: p.timing || '9 AM - 6 PM',
            available: p.available,
            verified: p.verified,
            avatar: p.avatar || 'P',
            tags: [p.serviceType || 'Service', 'Verified', 'Top Rated'].filter(Boolean),
            image: p.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name || p.id}`,
            blocked: p.blocked,
          };
        });
        setProviders(mapped);
      }
    } catch (e) {
      console.error('Failed to fetch providers:', e);
    }
  }, [apiFetch]);
 
  const mapBooking = useCallback((b) => {
    if (!b) return b;
    let parsedOptions = [];
    if (b.options) {
      try {
        parsedOptions = typeof b.options === 'string' ? JSON.parse(b.options) : b.options;
        if (!Array.isArray(parsedOptions)) {
          parsedOptions = [parsedOptions];
        }
      } catch (e) {
        parsedOptions = b.options.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    return {
      ...b,
      status: b.status === 'On_the_Way' ? 'On the way' :
              b.status === 'Destination' ? 'Destination' :
              b.status === 'Reached' ? 'Reached' :
              b.status === 'Reached_Confirmed' ? 'Reached Confirmed' :
              b.status === 'Pending_Payment' ? 'Pending Payment' : b.status,
      options: parsedOptions,
    };
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const role = getRoleFromToken(token);
      const endpoint = role === 'customer' ? '/api/customer/bookings' : '/api/bookings';
      const res = await apiFetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map(mapBooking);
        setBookings(mapped);
      }
    } catch (e) {
      console.error('Failed to fetch bookings:', e);
    }
  }, [apiFetch, mapBooking]);

  const fetchDisputes = useCallback(async () => {
    try {
      const res = await apiFetch('/api/disputes');
      if (res.ok) {
        const data = await res.json();
        setDisputes(data);
      }
    } catch (e) {
      console.error('Failed to fetch disputes:', e);
    }
  }, [apiFetch]);

  const fetchLeaveRequests = useCallback(async () => {
    try {
      const res = await apiFetch('/api/leave');
      if (res.ok) {
        const data = await res.json();
        setLeaveRequests(data);
      }
    } catch (e) {
      console.error('Failed to fetch leave requests:', e);
    }
  }, [apiFetch]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await apiFetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error('Failed to fetch notifications:', e);
    }
  }, [apiFetch]);

  const fetchContactRequests = useCallback(async () => {
    try {
      const res = await apiFetch('/api/contact');
      if (res.ok) {
        const data = await res.json();
        setContactRequests(data);
      }
    } catch (e) {
      console.error('Failed to fetch contact requests:', e);
    }
  }, [apiFetch]);

  const markNotificationRead = async (id) => {
    try {
      const res = await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (e) {
      console.error('Failed to mark notification read:', e);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const res = await apiFetch('/api/notifications/read-all', { method: 'PATCH' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (e) {
      console.error('Failed to mark all notifications read:', e);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  useEffect(() => {
    if (token) {
      fetchBookings();
      fetchDisputes();
      fetchLeaveRequests();
      fetchNotifications();
      if (user?.role === 'admin') {
        fetchContactRequests();
      }

      // Use current protocol and host to build websocket URL
      const wsUrl = `${WS_BACKEND_URL}/ws?token=${token}`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          console.log('Received WebSocket message:', msg);
          if (msg.type === 'booking:status') {
            const mappedStatus = msg.status === 'On_the_Way' ? 'On the way' :
                                 msg.status === 'Destination' ? 'Destination' :
                                 msg.status === 'Reached' ? 'Reached' :
                                 msg.status === 'Reached_Confirmed' ? 'Reached Confirmed' :
                                 msg.status === 'Pending_Payment' ? 'Pending Payment' : msg.status;
            setBookings(prev => prev.map(b => b.id === Number(msg.id) || b.id === String(msg.id) ? { ...b, status: mappedStatus } : b));
            fetchNotifications();
          } else if (msg.type === 'provider:location') {
            setBookings(prev => prev.map(b => b.id === Number(msg.id) || b.id === String(msg.id) ? { ...b, providerLatitude: msg.providerLatitude, providerLongitude: msg.providerLongitude } : b));
          } else if (msg.type === 'chat:message') {
            const customEvent = new CustomEvent('ws:chat:message', { detail: msg });
            window.dispatchEvent(customEvent);
          } else if (msg.type === 'notification:push') {
            fetchNotifications();
            const customEvent = new CustomEvent('ws:notification:push', { detail: msg });
            window.dispatchEvent(customEvent);
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      window.hsWebSocket = ws;

      return () => {
        ws.close();
        delete window.hsWebSocket;
      };
    } else {
      setBookings([]);
      setDisputes([]);
      setLeaveRequests([]);
      setNotifications([]);
      setContactRequests([]);
    }
  }, [token, user, fetchBookings, fetchDisputes, fetchLeaveRequests, fetchNotifications, fetchContactRequests]);

  // Silent refresh/init on startup
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
          setToken(null);
          setUser(null);
          setLoading(false);
          return;
        }

        const role = getRoleFromToken(storedToken);
        const isCustomer = role === 'customer';

        // Always validate token directly via /me endpoint first (works on refresh without cookie)
        const meUrl = isCustomer ? '/api/customer/auth/validate-session' : '/api/auth/me';
        const meHeaders = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedToken}`,
        };
        const meApiKey = resolveApiKey('GET', meUrl);
        if (meApiKey) meHeaders['X-Api-Key'] = meApiKey;

        let meRes;
        try {
          meRes = await fetch(`${BACKEND_URL}${meUrl}`, { headers: meHeaders, credentials: 'include' });
        } catch (networkErr) {
          // Network/server down — keep existing session state, don't log out
          console.warn('Session validation network error, keeping existing token:', networkErr);
          setToken(storedToken);
          // Try to restore user from localStorage if available
          const savedUser = localStorage.getItem('hs_current_user');
          if (savedUser) {
            try { setUser(JSON.parse(savedUser)); } catch (_) { /* ignore */ }
          }
          setLoading(false);
          return;
        }

        if (meRes.ok) {
          const data = await meRes.json();
          setToken(storedToken);
          setUser(data);
          // Cache user for offline resilience
          try { localStorage.setItem('hs_current_user', JSON.stringify(data)); } catch (_) { /* ignore */ }
        } else if (meRes.status === 401) {
          // Token is definitively invalid — try refresh cookie as last resort
          const refreshUrl = isCustomer ? '/api/customer/auth/refresh' : '/api/auth/refresh';
          try {
            const refreshRes = await fetch(`${BACKEND_URL}${refreshUrl}`, {
              method: 'POST',
              headers: { 'X-Api-Key': resolveApiKey('POST', refreshUrl) },
              credentials: 'include',
            });
            if (refreshRes.ok) {
              const data = await refreshRes.json();
              setToken(data.token);
              setUser(data.user);
              localStorage.setItem('token', data.token);
              try { localStorage.setItem('hs_current_user', JSON.stringify(data.user)); } catch (_) { /* ignore */ }
            } else {
              // Both token and refresh cookie invalid — clear session
              localStorage.removeItem('token');
              localStorage.removeItem('hs_current_user');
              setToken(null);
              setUser(null);
            }
          } catch (_) {
            // Refresh also failed due to network — keep token to avoid spurious logout
            console.warn('Refresh also failed, keeping stale token to avoid spurious logout');
            setToken(storedToken);
          }
        } else {
          // Server error (5xx etc.) — keep existing session, don't log out
          console.warn('Session validation returned', meRes.status, '— keeping existing token');
          setToken(storedToken);
        }
      } catch (e) {
        console.error('Silent refresh failed on startup:', e);
        // On unexpected errors, keep whatever token was loaded — don't clear session
        const storedToken = localStorage.getItem('token');
        if (storedToken) setToken(storedToken);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': resolveApiKey('POST', '/api/auth/login'),
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Invalid email or password.');
    }
    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    try { localStorage.setItem('hs_current_user', JSON.stringify(data.user)); } catch (_) { /* ignore */ }
    return data.user;
  };

  const register = async (userData) => {
    const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': resolveApiKey('POST', '/api/auth/register'),
      },
      body: JSON.stringify(userData),
      credentials: 'include',
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      if (errData.errors && typeof errData.errors === 'object') {
        const details = Object.entries(errData.errors)
          .map(([_, msg]) => msg)
          .join(' | ');
        throw new Error(details || errData.message || 'Registration failed.');
      }
      throw new Error(errData.message || 'Registration failed.');
    }
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
    } else {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
    }
    return data.user;
  };

  const selectRole = async (role) => {
    const res = await apiFetch(`/api/auth/select-role?role=${role}`, { method: 'POST' });
    if (!res.ok) {
      throw new Error('Failed to select role.');
    }
    const data = await res.json();
    setUser(data);
    return data;
  };

  const logout = async () => {
    try {
      const role = getRoleFromToken(token);
      const isCustomer = role === 'customer';
      const logoutUrl = isCustomer ? '/api/customer/auth/logout' : '/api/auth/logout';
      await apiFetch(logoutUrl, { method: 'POST' });
    } catch (e) {
      console.error('Logout API call failed:', e);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('hs_current_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = async (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
    try {
      const targetEndpoint = user?.role === 'customer' ? '/api/customer/profile' : '/api/auth/profile';
      const res = await apiFetch(targetEndpoint, {
        method: 'PATCH',
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) {
        throw new Error('Failed to update profile.');
      }
      const data = await res.json();
      setUser((prev) => ({ ...prev, ...updatedData, ...data }));
      return data;
    } catch (e) {
      throw e;
    }
  };

  const blockProvider = async (id) => {
    try {
      const provider = providers.find(p => p.id === id);
      const isBlocked = provider?.blocked ?? false;
      const res = await apiFetch(`/api/providers/${id}/block?blocked=${!isBlocked}`, {
        method: 'PATCH',
      });
      if (res.ok) {
        fetchProviders();
      }
    } catch (e) {
      console.error('Failed to toggle provider block state:', e);
    }
  };

  const verifyProvider = async (id, verified) => {
    try {
      const res = await apiFetch(`/api/providers/${id}/verify?verified=${verified}`, {
        method: 'PATCH',
      });
      if (res.ok) {
        fetchProviders();
      }
    } catch (e) {
      console.error('Failed to verify provider:', e);
    }
  };

  const deleteProvider = async (id) => {
    try {
      const res = await apiFetch(`/api/providers/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchProviders();
      }
    } catch (e) {
      console.error('Failed to delete provider:', e);
    }
  };

  const updateAvailability = async (id, available) => {
    try {
      const res = await apiFetch(`/api/providers/${id}/availability?available=${available}`, {
        method: 'PATCH',
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => {
          if (prev && prev.id === id) {
            return { ...prev, available: data.available };
          }
          return prev;
        });
        setProviders(prev => prev.map(p => p.id === id ? { ...p, available: data.available } : p));
        return data;
      }
    } catch (e) {
      console.error('Failed to update provider availability:', e);
    }
  };

  const submitContactRequest = async (formData) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': resolveApiKey('POST', '/api/contact'),
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to submit contact request');
      }
      const data = await res.json();
      setContactRequests(prev => [data, ...prev]);
      return data;
    } catch (e) {
      console.error('Failed to submit contact request:', e);
      throw e;
    }
  };

  const updateContactRequestStatus = async (id, status) => {
    try {
      const res = await apiFetch(`/api/contact/${id}/status?status=${status}`, {
        method: 'PATCH',
      });
      if (res.ok) {
        const data = await res.json();
        setContactRequests(prev => prev.map(cr => cr.id === id ? data : cr));
      }
    } catch (e) {
      console.error('Failed to update contact request status:', e);
    }
  };

  const validatePromo = async (code) => {
    const res = await apiFetch(`/api/payments/promo/${code}`);
    if (!res.ok) {
      throw new Error('Invalid or expired promo code');
    }
    return await res.json();
  };

  const fetchPromoCodes = async () => {
    const res = await apiFetch('/api/payments/promo');
    if (!res.ok) {
      throw new Error('Failed to fetch promo codes');
    }
    return await res.json();
  };

  const createPromoCode = async (promoData) => {
    const res = await apiFetch('/api/payments/promo', {
      method: 'POST',
      body: JSON.stringify(promoData),
    });
    if (!res.ok) {
      throw new Error('Failed to create promo code');
    }
    return await res.json();
  };

  const togglePromoCodeActive = async (id, active) => {
    const res = await apiFetch(`/api/payments/promo/${id}/active?active=${active}`, {
      method: 'PATCH',
    });
    if (!res.ok) {
      throw new Error('Failed to update promo code status');
    }
    return await res.json();
  };

  const deletePromoCode = async (id) => {
    const res = await apiFetch(`/api/payments/promo/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error('Failed to delete promo code');
    }
    return true;
  };

  const fetchChatMessages = async (bookingId) => {
    const res = await apiFetch(`/api/bookings/${bookingId}/chat`);
    if (!res.ok) {
      throw new Error('Failed to fetch chat messages');
    }
    return await res.json();
  };

  const sendChatMessage = async (bookingId, text) => {
    const res = await apiFetch(`/api/bookings/${bookingId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      throw new Error('Failed to send chat message');
    }
    return await res.json();
  };

  const initiatePayment = async (bookingId) => {
    const role = getRoleFromToken(token);
    const endpoint = role === 'customer' ? '/api/customer/payments/initiate' : '/api/payments/initiate';
    const res = await apiFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    });
    if (!res.ok) {
      throw new Error('Failed to initiate payment');
    }
    return await res.json();
  };

  const verifyPayment = async (bookingId, paymentId, signature, paymentMethod = 'UPI') => {
    const role = getRoleFromToken(token);
    const endpoint = role === 'customer' ? '/api/customer/payments/verify' : '/api/payments/verify';
    const res = await apiFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({ bookingId, paymentId, signature, paymentMethod }),
    });
    if (!res.ok) {
      throw new Error('Failed to verify payment');
    }
    const data = await res.json();
    fetchBookings();
    fetchNotifications();
    return data;
  };

  const createDispute = async (disputeData) => {
    try {
      const payload = {
        bookingId: Number(disputeData.bookingId),
        issue: disputeData.issue,
        issueCategory: disputeData.issueCategory,
        priority: disputeData.priority,
        source: disputeData.source || 'web',
      };
      const res = await apiFetch('/api/disputes', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setDisputes(prev => [data, ...prev]);
        return data;
      }
    } catch (e) {
      console.error('Failed to create dispute:', e);
    }
  };

  const updateDisputeStatus = async (id, status) => {
    try {
      const res = await apiFetch(`/api/disputes/${id}/status?status=${status}`, {
        method: 'PATCH',
      });
      if (res.ok) {
        const data = await res.json();
        setDisputes(prev => prev.map(d => d.id === id ? data : d));
        return data;
      } else {
        setDisputes(prev => prev.map(d => d.id === id ? { ...d, status } : d));
      }
    } catch (e) {
      console.error('Failed to update dispute status:', e);
      setDisputes(prev => prev.map(d => d.id === id ? { ...d, status } : d));
    }
  };

  const addDisputeUpdate = async (id, updateData) => {
    try {
      const payload = {
        note: updateData.note || '',
      };
      const res = await apiFetch(`/api/disputes/${id}/updates`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setDisputes(prev => prev.map(d => d.id === id ? data : d));
        return data;
      }
    } catch (e) {
      console.error('Failed to add dispute update:', e);
    }
  };

  const createBooking = async (bookingData) => {
    try {
      const payload = {
        service: bookingData.service,
        serviceProviderId: bookingData.serviceProviderId,
        date: bookingData.date || new Date().toISOString().split('T')[0],
        time: bookingData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        amount: bookingData.amount,
        options: bookingData.options ? JSON.stringify(bookingData.options) : null,
      };
      const role = getRoleFromToken(token);
      const endpoint = role === 'customer' ? '/api/customer/bookings' : '/api/bookings';
      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let errMsg = 'Failed to create booking';
        try {
          const errData = await res.json();
          errMsg = errData.message || errData.error || errMsg;
        } catch (_) { /* ignore parse error */ }
        console.error('[createBooking] Backend error:', res.status, errMsg);
        throw new Error(errMsg);
      }
      const data = await res.json();
      const mapped = mapBooking(data);
      setBookings(prev => [mapped, ...prev]);
      return mapped;
    } catch (e) {
      console.error('Failed to create booking:', e);
      throw e;
    }
  };

  const patchBooking = useCallback(async (id, partial) => {
    try {
      const payload = { ...partial };
      if (payload.status) {
        payload.status = payload.status.replace(' ', '_');
      }
      const res = await apiFetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = mapBooking(data);
        setBookings(prev => prev.map(b => b.id === id ? mapped : b));
        return mapped;
      }
    } catch (e) {
      console.error('Failed to patch booking:', e);
    }
  }, [apiFetch, mapBooking]);

  const updateBookingStatus = async (id, status) => {
    try {
      const statusUnderscores = status.replace(' ', '_');
      const role = getRoleFromToken(token);
      const endpoint = role === 'customer'
        ? `/api/customer/bookings/${id}/status?status=${statusUnderscores}`
        : `/api/bookings/${id}/status?status=${statusUnderscores}`;
      const res = await apiFetch(endpoint, {
        method: 'PATCH',
      });
      if (!res.ok) {
        throw new Error('Failed to update booking status');
      }
      const data = await res.json();
      const mapped = mapBooking(data);
      setBookings(prev => prev.map(b => b.id === id ? mapped : b));
      return mapped;
    } catch (e) {
      console.error('Failed to update booking status:', e);
      throw e;
    }
  };

  const rateBooking = async (id, rating) => {
    try {
      const role = getRoleFromToken(token);
      const endpoint = role === 'customer'
        ? `/api/customer/bookings/${id}/rating?rating=${rating}`
        : `/api/bookings/${id}/rating?rating=${rating}`;
      const res = await apiFetch(endpoint, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error('Failed to rate booking');
      }
      const data = await res.json();
      const mapped = mapBooking(data);
      setBookings(prev => prev.map(b => b.id === id ? mapped : b));

      // Re-fetch providers so admin panel gets updated averageRating immediately
      fetchProviders();

      // Re-fetch the current user profile to update provider's own averageRating badge
      try {
        const meUrl = role === 'customer' ? '/api/customer/auth/validate-session' : '/api/auth/me';
        const meRes = await apiFetch(meUrl);
        if (meRes.ok) {
          const meData = await meRes.json();
          setUser(meData);
          try { localStorage.setItem('hs_current_user', JSON.stringify(meData)); } catch (_) { /* ignore */ }
        }
      } catch (_) { /* non-critical */ }

      return mapped;
    } catch (e) {
      console.error('Failed to rate booking:', e);
      throw e;
    }
  };

  const createLeaveRequest = async (leaveData) => {
    try {
      const payload = {
        date: leaveData.date,
        timeSlots: leaveData.timeSlots,
        reason: leaveData.reason,
      };
      const res = await apiFetch('/api/leave', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Failed to submit leave request');
      }
      const data = await res.json();
      setLeaveRequests(prev => [data, ...prev]);
      return data;
    } catch (e) {
      console.error('Failed to create leave request:', e);
      throw e;
    }
  };

  const updateLeaveStatus = async (id, status) => {
    try {
      const res = await apiFetch(`/api/leave/${id}/status?status=${status}`, {
        method: 'PATCH',
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update leave status');
      }
      const data = await res.json();
      setLeaveRequests(prev => prev.map(l => l.id === id ? data : l));
      return data;
    } catch (e) {
      console.error('Failed to update leave status:', e);
      throw e;
    }
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        pendingUser,
        isAuthenticated: Boolean(user),
        isPending,
        loading,
        login,
        register,
        selectRole,
        logout,
        providers,
        updateUser,
        bookings,
        createBooking,
        updateBookingStatus,
        patchBooking,
        rateBooking,
        leaveRequests,
        createLeaveRequest,
        updateLeaveStatus,
        isLocationModalOpen,
        setLocationModalOpen,
        disputes,
        createDispute,
        updateDisputeStatus,
        addDisputeUpdate,
        blockProvider,
        verifyProvider,
        deleteProvider,
        updateAvailability,
        contactRequests,
        submitContactRequest,
        updateContactRequestStatus,
        notifications,
        fetchNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        validatePromo,
        fetchPromoCodes,
        createPromoCode,
        togglePromoCodeActive,
        initiatePayment,
        verifyPayment,
        fetchChatMessages,
        sendChatMessage,
        apiFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};