import React, { useState, useMemo, useEffect } from 'react';
import { Card, Button, Input, Avatar } from '../../components/common/UI';
import { SERVICE_CATEGORIES } from '../../data/mockData';
import { useAuth } from '../../components/context/AuthContext';
import { haversineDistanceKm, googleMapsDirectionsUrl, googleMapsSearchUrl } from '../../lib/geo';
import { matchesServiceCategory } from '../../lib/serviceCategory';
import { sameServiceCity, isActiveServiceCity } from '../../lib/cities';

const RADIUS_KM = 50;
const EXPANDED_RADIUS = 100;

const CHIP_CATEGORIES = [
  { id: 'all', label: 'All', icon: '✦' },
  ...['plumbing', 'electrical', 'cleaning', 'painting', 'carpentry'].map((id) =>
    SERVICE_CATEGORIES.find((c) => c.id === id)
  ).filter(Boolean),
];

const BG = ['#EDE9FE', '#D1FAE5', '#DBEAFE', '#FEF3C7', '#FFE4E6', '#E0F2FE'];

export default function DiscoverPage() {
  const { user, createBooking, updateBookingStatus, leaveRequests, setLocationModalOpen, apiFetch, bookings } = useAuth();
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [exploreExpanded, setExploreExpanded] = useState(false);
  const [selected, setSelected] = useState(null);
  const [booked, setBooked] = useState(false);
  const [requestTime, setRequestTime] = useState(180);
  const [isRequesting, setIsRequesting] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState(null);
  const [cleaningOptions, setCleaningOptions] = useState([]);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [apiProviders, setApiProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);

  const userHasCoords =
    typeof user?.latitude === 'number' && typeof user?.longitude === 'number';

  const customerMetro = user?.serviceCity || user?.city || '';
  const cityActive =
    user?.serviceCityActive !== false && isActiveServiceCity(customerMetro);

  const areaLabel =
    user?.location ||
    user?.displayAddress?.split(',')[0]?.trim() ||
    customerMetro ||
    'Your area';

  const serviceLocationLine =
    user?.displayAddress ||
    [user?.location, customerMetro, user?.state].filter(Boolean).join(', ') ||
    areaLabel;

  useEffect(() => {
    if (!userHasCoords || !cityActive) return;
    const fetchFilteredProviders = async () => {
      setLoadingProviders(true);
      try {
        const queryParams = new URLSearchParams({
          category: selectedCat,
          search: search,
          priceRange: priceRange,
          rating: ratingFilter,
          available: availableOnly ? 'true' : 'false',
        });
        const res = await apiFetch(`/api/customer/discover/providers?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setApiProviders(data);
        }
      } catch (e) {
        console.error('Failed to fetch discover providers', e);
      } finally {
        setLoadingProviders(false);
      }
    };

    const timer = setTimeout(() => {
      fetchFilteredProviders();
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedCat, search, priceRange, ratingFilter, availableOnly, userHasCoords, cityActive, apiFetch]);

  const displayProviders = apiProviders;

  const nearbyMinKm =
    apiProviders.length > 0
      ? Math.round(Math.min(...apiProviders.filter(p => p.distanceKm != null && p.distanceKm !== Infinity).map((p) => p.distanceKm)))
      : 0;

  const handleBookClick = (p) => {
    if (!userHasCoords || !cityActive) {
      setLocationModalOpen(true);
      return;
    }
    setSelected(p);
    setBookingStep(1);
    setSelectedDate('');
    setSelectedSlot('');
    setCleaningOptions([]);
    setBooked(false);
    setIsRequesting(false);
  };

  const getBlockedSlots = (providerId, date) => {
    if (!date) return [];
    return leaveRequests
      .filter((l) => l.providerId === providerId && l.date === date && l.status === 'approved')
      .flatMap((l) => l.timeSlots);
  };

  useEffect(() => {
    if (!userHasCoords || !user?.serviceCity) {
      setLocationModalOpen(true);
    }
  }, [userHasCoords, user?.serviceCity, setLocationModalOpen]);

  useEffect(() => {
    setExploreExpanded(false);
  }, [selectedCat, search, priceRange, ratingFilter, availableOnly, user?.latitude, user?.longitude]);

  const TIME_SLOTS = [
    '8 AM', '9 AM', '10 AM', '11 AM', '12 PM',
    '1 PM', '2 PM', '3 PM', '4 PM', '5 PM',
  ];

  const toggleOption = (opt) => {
    setCleaningOptions((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );
  };

  // Timer: counts down while a booking request is in-flight.
  useEffect(() => {
    if (!isRequesting) return;
    const timer = setInterval(() => {
      setRequestTime((t) => {
        if (t <= 1) {
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRequesting]);

  // Watch the real booking status from global context (updated via WebSocket)
  useEffect(() => {
    if (!isRequesting || !activeBookingId) return;
    const liveBooking = bookings.find(b => String(b.id) === String(activeBookingId));
    if (liveBooking) {
      const s = liveBooking.status;
      if (s === 'Accepted' || s === 'On the way' || s === 'Destination' || s === 'Reached') {
        setBooked(true);
        setIsRequesting(false);
      } else if (s === 'Rejected' || s === 'Cancelled') {
        setIsRequesting(false);
        alert('Your booking request was declined by the provider. Please try another.');
      }
    }
  }, [bookings, activeBookingId, isRequesting]);

  // Timeout: cancel if provider hasn't accepted within 3 minutes
  useEffect(() => {
    if (!isRequesting) return;
    if (requestTime === 0) {
      setIsRequesting(false);
      alert('No response from provider. Your request has expired.');
    }
  }, [requestTime, isRequesting]);

  const confirmBook = async () => {
    const lat = user.latitude;
    const lon = user.longitude;
    const addr =
      user.displayAddress ||
      [user.location, user.city, user.state].filter(Boolean).join(', ');
    try {
      const booking = await createBooking({
        service: selected.service,
        serviceProviderId: selected.id,
        providerName: selected.name,
        customerId: user?.id,
        customerName: user?.name || 'New Customer',
        amount: selected.price,
        location: user?.location || areaLabel,
        customerCity: customerMetro,
        providerCity: selected.serviceCity || selected.city,
        date: selectedDate,
        time: selectedSlot,
        status: 'Requested',
        options: cleaningOptions,
        customerLatitude: lat,
        customerLongitude: lon,
        customerAddress: addr,
        customerDirectionsUrl: googleMapsSearchUrl(lat, lon),
        navigationToCustomerUrl: googleMapsDirectionsUrl([lat, lon]),
        providerLatitude: selected.latitude,
        providerLongitude: selected.longitude,
      });
      setActiveBookingId(booking.id);
      setIsRequesting(true);
      setRequestTime(180);
      setBookingStep(1);
    } catch (e) {
      console.error('Failed to book provider:', e);
      alert('Failed to book provider. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleNotifyMe = () => {
    alert(`We'll notify you when services are available near ${areaLabel}.`);
  };

  const activeFilterCount = [
    priceRange !== 'all',
    ratingFilter !== 'all',
    availableOnly,
  ].filter(Boolean).length;

  const renderProviderCard = (p, idx) => (
    <div
      key={p.id}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '18px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {p.image ? (
          <img
            src={p.image}
            alt={p.name}
            style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <Avatar initials={p.avatar} size={48} bg={BG[idx % BG.length]} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            {p.name}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>{p.service}</p>
        </div>
        <p style={{ fontWeight: 800, color: 'var(--brand)', fontSize: '16px', margin: 0, flexShrink: 0 }}>
          ₹{p.price}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '13px' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          <span style={{ color: '#F59E0B' }}>★</span> {p.rating}
        </span>
        {Number.isFinite(p.distanceKm) && p.distanceKm !== Infinity && (
          <>
            <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: 'var(--brand)' }}>◎</span>
              {p.distanceKm < 1 ? '<1' : p.distanceKm.toFixed(1)} km
            </span>
            <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span>🕐</span>
              ~{p.etaMins} min
            </span>
          </>
        )}
      </div>
      <button
        type="button"
        disabled={!p.available}
        onClick={() => handleBookClick(p)}
        style={{
          width: '100%',
          padding: '11px 16px',
          borderRadius: '10px',
          border: 'none',
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          fontSize: '14px',
          cursor: p.available ? 'pointer' : 'not-allowed',
          background: p.available ? 'var(--brand)' : 'var(--bg-elevated)',
          color: p.available ? '#fff' : 'var(--text-muted)',
          boxShadow: p.available ? '0 4px 12px var(--brand-glow)' : 'none',
        }}
      >
        {p.available ? 'Book' : 'Unavailable'}
      </button>
    </div>
  );

  return (
    <>
      <style>{`
        .hs-discover-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 1100px) {
          .hs-discover-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .hs-discover-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    <div style={{ padding: '28px 40px 48px', width: '100%', boxSizing: 'border-box' }}>
      {/* Service location card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '24px',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 6px' }}>
            Service location
          </p>
          <p style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#EF4444', fontSize: 18 }}>📍</span>
            {serviceLocationLine}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setLocationModalOpen(true)}
          style={{
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            flexShrink: 0,
          }}
        >
          Change location
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', pointerEvents: 'none', opacity: 0.5 }}>🔍</span>
          <input
            type="search"
            placeholder="Search services or providers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 48px 14px 44px',
              background: 'var(--bg-input)',
              border: '1.5px solid var(--border)',
              borderRadius: '12px',
              color: 'var(--text-primary)',
              fontSize: '15px',
              outline: 'none',
              fontFamily: 'var(--font-body)',
              boxSizing: 'border-box',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
            }}
          />
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            title="Filters"
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 32,
              height: 32,
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: '#6B7280',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ⚙
          </button>
        </div>
      </div>



      {/* Provider list */}
      {displayProviders.length > 0 ? (
        <div className="hs-discover-grid">
          {displayProviders.map((p, idx) => renderProviderCard(p, idx))}
        </div>
      ) : !cityActive && userHasCoords ? (
        <div
          style={{
            textAlign: 'center',
            padding: '56px 32px',
            background: 'var(--bg-card)',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ fontSize: '52px', marginBottom: '20px' }}>🚀</div>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
            {user?.detectedCityLabel || customerMetro || 'Your city'}
          </p>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            We are launching services in this city soon
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.65, margin: '0 auto 8px', maxWidth: '400px' }}>
            No services available in this location yet.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.55, margin: '0 auto 32px', maxWidth: '420px' }}>
            We currently serve <strong>Chennai</strong>, <strong>Madurai</strong>, and <strong>Coimbatore</strong>. Pick one of these cities to book today.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '320px', margin: '0 auto' }}>
            <button
              type="button"
              onClick={() => setLocationModalOpen(true)}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--brand)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '15px',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              Change to an active city
            </button>
            <button type="button" onClick={handleNotifyMe} style={{ width: '100%', padding: '13px 20px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Notify me when we launch
            </button>
          </div>
        </div>
      ) : displayProviders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg-card)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
          <div style={{ fontSize: '44px', marginBottom: '16px' }}>📍</div>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            {customerMetro} · {areaLabel}
          </p>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
            No services available in {customerMetro} right now
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, margin: '0 auto 28px', maxWidth: '320px' }}>
            Try another category or check back soon — we&apos;re onboarding more providers in your city.
          </p>
          <button type="button" onClick={handleNotifyMe} style={{ padding: '13px 24px', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'var(--bg-card)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            Notify Me
          </button>
        </div>
      ) : null}

      {/* Filter dialog */}
      {filtersOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17,24,39,0.48)',
            backdropFilter: 'blur(10px)',
            zIndex: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 40px',
          }}
          onClick={() => setFiltersOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '480px',
              background: 'var(--bg-card)',
              borderRadius: '18px',
              padding: '28px 32px 32px',
              border: '1px solid var(--border)',
              boxShadow: '0 24px 64px rgba(15, 17, 23, 0.14)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Filters
              </h3>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '22px',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                  }}
                >
                  Price
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'var(--bg-input)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                >
                  <option value="all">Any price</option>
                  <option value="low">Under ₹500</option>
                  <option value="mid">₹500–₹1000</option>
                  <option value="high">₹1000+</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                  }}
                >
                  Rating
                </label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'var(--bg-input)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                >
                  <option value="all">Any rating</option>
                  <option value="4.5">4.5+ ★</option>
                  <option value="4">4.0+ ★</option>
                </select>
              </div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                }}
              >
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  style={{ accentColor: 'var(--brand)', width: 18, height: 18 }}
                />
                Available now only
              </label>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'var(--brand)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  marginTop: '4px',
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking modal */}
      {selected && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17,24,39,0.72)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '32px 40px',
          }}
        >
          <Card
            padding="32px 36px"
            style={{
              width: '100%',
              maxWidth: '520px',
              borderRadius: '18px',
              boxShadow: '0 24px 64px rgba(15, 17, 23, 0.14)',
              border: '1px solid var(--border)',
            }}
          >
            {booked ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'var(--success-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '36px',
                    margin: '0 auto 18px',
                  }}
                >
                  ✅
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '22px',
                    fontWeight: 700,
                    marginBottom: '10px',
                    color: 'var(--text-primary)',
                  }}
                >
                  Booking Confirmed!
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                  {selected.name} has accepted your request. They will arrive at your location shortly.
                </p>
                <Button
                  style={{ marginTop: '22px' }}
                  fullWidth
                  onClick={() => {
                    setSelected(null);
                    setBooked(false);
                  }}
                >
                  Go to Dashboard
                </Button>
              </div>
            ) : isRequesting ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ position: 'relative', width: 96, height: 96, margin: '0 auto 20px' }}>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      border: '4px solid var(--brand-light)',
                      borderTopColor: 'var(--brand)',
                      animation: 'spin 1.5s linear infinite',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '17px',
                      fontWeight: 800,
                      color: 'var(--brand)',
                    }}
                  >
                    {formatTime(requestTime)}
                  </div>
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px',
                    fontWeight: 700,
                    marginBottom: '10px',
                    color: 'var(--text-primary)',
                  }}
                >
                  Waiting for Provider
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '6px' }}>
                  Sending request to <b>{selected.name}</b>...
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>
                  If not accepted within 3 minutes, the request will expire.
                </p>
                <Button variant="outline" style={{ marginTop: '20px' }} onClick={() => setIsRequesting(false)}>
                  Cancel Request
                </Button>
              </div>
            ) : (
              <>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px',
                    fontWeight: 700,
                    marginBottom: '18px',
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Book {selected.name}
                </h3>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px',
                    background: 'linear-gradient(135deg, var(--brand-light) 0%, var(--bg-elevated) 100%)',
                    borderRadius: '16px',
                    marginBottom: '20px',
                    border: '1px solid var(--brand-glow)',
                  }}
                >
                  {selected.image ? (
                    <img
                      src={selected.image}
                      alt=""
                      style={{ width: 48, height: 48, borderRadius: '12px', objectFit: 'cover' }}
                    />
                  ) : (
                    <Avatar initials={selected.avatar} size={48} />
                  )}
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px', margin: 0 }}>
                      {selected.name}
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                      {selected.service} · ₹{selected.price}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', marginBottom: '22px' }}>
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      style={{
                        flex: 1,
                        height: '4px',
                        borderRadius: '4px',
                        background: bookingStep >= s ? 'var(--brand)' : 'var(--border)',
                        transition: 'background 0.2s',
                      }}
                    />
                  ))}
                </div>

                {bookingStep === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '8px' }}>
                    <div>
                      <label
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                          display: 'block',
                          marginBottom: '8px',
                        }}
                      >
                        Select date
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setSelectedSlot('');
                        }}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'var(--bg-input)',
                          border: '1.5px solid var(--border)',
                          borderRadius: '12px',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    {selectedDate && (
                      <div>
                        <label
                          style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'var(--text-secondary)',
                            display: 'block',
                            marginBottom: '10px',
                          }}
                        >
                          Select time slot
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                          {TIME_SLOTS.map((slot) => {
                            const isBlocked = getBlockedSlots(selected.id, selectedDate).includes(slot);
                            const isActive = selectedSlot === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={isBlocked}
                                onClick={() => setSelectedSlot(slot)}
                                style={{
                                  padding: '10px 4px',
                                  borderRadius: '10px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  border: '1px solid var(--border)',
                                  cursor: isBlocked ? 'not-allowed' : 'pointer',
                                  background: isActive ? 'var(--brand)' : isBlocked ? 'var(--bg-elevated)' : 'var(--bg-card)',
                                  color: isActive ? '#fff' : isBlocked ? 'var(--text-muted)' : 'var(--text-secondary)',
                                  opacity: isBlocked ? 0.6 : 1,
                                  textDecoration: isBlocked ? 'line-through' : 'none',
                                }}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                        {getBlockedSlots(selected.id, selectedDate).length === TIME_SLOTS.length && (
                          <p
                            style={{
                              marginTop: '12px',
                              color: 'var(--danger)',
                              fontSize: '12px',
                              textAlign: 'center',
                              fontWeight: 600,
                            }}
                          >
                            Provider is fully on leave this day.
                          </p>
                        )}
                      </div>
                    )}
                    <Button fullWidth disabled={!selectedDate || !selectedSlot} onClick={() => setBookingStep(2)}>
                      Next: Service details
                    </Button>
                  </div>
                )}

                {bookingStep === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '8px' }}>
                    <div
                      style={{
                        padding: '12px 14px',
                        background: 'var(--bg-elevated)',
                        borderRadius: '12px',
                        fontSize: '14px',
                        color: 'var(--text-primary)',
                      }}
                    >
                      📍 {user?.displayAddress || areaLabel}
                    </div>
                    {selected.service.toLowerCase().includes('clean') && (
                      <div
                        style={{
                          padding: '12px',
                          background: 'var(--bg-elevated)',
                          borderRadius: '12px',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <p
                          style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'var(--text-secondary)',
                            marginBottom: '10px',
                          }}
                        >
                          Additional services
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {['Deep Clean', 'Sofa Wash', 'Bathroom', 'Kitchen'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => toggleOption(opt)}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '999px',
                                fontSize: '12.5px',
                                cursor: 'pointer',
                                background: cleaningOptions.includes(opt) ? 'var(--brand)' : 'var(--bg-card)',
                                color: cleaningOptions.includes(opt) ? '#fff' : 'var(--text-secondary)',
                                border: '1px solid var(--border)',
                                fontWeight: 500,
                              }}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <Input label="Problem description" placeholder="Briefly describe the issue..." icon="📝" />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Button variant="outline" fullWidth onClick={() => setBookingStep(1)}>
                        Back
                      </Button>
                      <Button fullWidth onClick={() => setBookingStep(3)}>
                        Next: Confirm
                      </Button>
                    </div>
                  </div>
                )}

                {bookingStep === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '8px' }}>
                    <div
                      style={{
                        background: 'var(--brand-glow)',
                        border: '1.5px dashed var(--brand)',
                        padding: '16px',
                        borderRadius: '14px',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: 'var(--brand)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          marginBottom: '12px',
                        }}
                      >
                        Booking summary
                      </p>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>
                          📅 <b>Date:</b> {selectedDate}
                        </p>
                        <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>
                          ⏰ <b>Time:</b> {selectedSlot}
                        </p>
                        <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>
                          🔧 <b>Service:</b> {selected.service}
                        </p>
                        <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0 }}>
                          💰 <b>Total:</b> ₹{selected.price}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Button variant="outline" fullWidth onClick={() => setBookingStep(2)}>
                        Back
                      </Button>
                      <Button fullWidth onClick={confirmBook}>
                        Confirm booking →
                      </Button>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  style={{
                    marginTop: '14px',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
    </>
  );
}
