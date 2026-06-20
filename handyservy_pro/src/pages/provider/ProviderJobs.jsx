import React, { useMemo, useState } from 'react';
import { useAuth } from '../../components/context/AuthContext';
import { Card, StatusBadge, Button, Badge, SectionHeader } from '../../components/common/UI';
import JobRouteMiniMap from '../../components/common/JobRouteMiniMap';
import ChatDrawer from '../../components/common/ChatDrawer';
import { haversineDistanceKm, googleMapsDirectionsUrl, googleMapsSearchUrl } from '../../lib/geo';

function JobCard({ job, onUpdate, providerCoords, onChatOpen }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const actions = {
    Requested: [{ label: 'Accept ✓', variant: 'primary', next: 'Accepted' }, { label: 'Decline', variant: 'danger', next: 'Rejected' }],
    Accepted: [{ label: 'Start Journey 🚗', variant: 'primary', next: 'On_the_Way' }],
    'On the way': [{ label: 'Arrived at Destination 📍', variant: 'primary', next: 'Destination' }],
    'Destination': [{ label: 'Reached Customer 🤝', variant: 'primary', next: 'Reached' }],
    'Reached': [],
    'Reached Confirmed': [{ label: 'Request Payment 💳', variant: 'soft', next: 'Pending_Payment' }],
  };
  const btns = actions[job.status] || [];

  const custLat = job.customerLatitude;
  const custLon = job.customerLongitude;
  const hasCustomerGps = typeof custLat === 'number' && typeof custLon === 'number';
  const provLat = job.providerLatitude ?? providerCoords?.[0];
  const provLon = job.providerLongitude ?? providerCoords?.[1];
  const hasProviderGps = typeof provLat === 'number' && typeof provLon === 'number';
  const dest = hasCustomerGps ? [custLat, custLon] : null;
  const origin = hasProviderGps ? [provLat, provLon] : null;
  const navigateUrl = dest ? googleMapsDirectionsUrl(dest, origin) : job.navigationToCustomerUrl;

  const distanceKm = useMemo(() => {
    if (!hasCustomerGps || !hasProviderGps) return null;
    return haversineDistanceKm([provLat, provLon], [custLat, custLon]);
  }, [custLat, custLon, provLat, provLon, hasCustomerGps, hasProviderGps]);

  const etaMins = distanceKm != null ? Math.max(3, Math.round(distanceKm * 6)) : null;
  const showNav = ['Accepted', 'On the way', 'Destination', 'Reached'].includes(job.status) && hasCustomerGps;

  return (
    <Card
      padding="0"
      style={{
        overflow: 'hidden',
        borderRadius: 20,
        border: job.status === 'Requested' ? '2px solid var(--brand)' : '1px solid var(--border)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ padding: '18px 20px', background: job.status === 'Requested' ? 'linear-gradient(135deg, var(--brand-glow) 0%, var(--bg-card) 100%)' : 'var(--bg-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: 17, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>{job.customerName || 'Customer'}</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{job.service} · ₹{job.amount}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>📅 {job.date} · ⏰ {job.time}</p>
          </div>
          <StatusBadge status={job.status} />
        </div>

        {showNav && (
          <div
            style={{
              marginTop: 16,
              padding: 16,
              borderRadius: 16,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>Customer location</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1.45 }}>{job.customerAddress || job.location}</p>
            {distanceKm != null && (
              <p style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 600, margin: '8px 0 14px' }}>
                {distanceKm.toFixed(1)} km away · ~{etaMins} min ETA
              </p>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {navigateUrl && (
                <a href={navigateUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', flex: '1 1 140px' }}>
                  <span style={{ display: 'block', textAlign: 'center', padding: '12px 14px', borderRadius: 12, background: 'var(--brand)', color: '#fff', fontWeight: 700, fontSize: 14 }}>Open navigation</span>
                </a>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); window.alert('Calling customer (demo)'); }}
                style={{ flex: '1 1 100px', padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-card)', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
              >
                📞 Call
              </button>
              {job.status === 'Accepted' && (
                <Button
                  size="sm"
                  variant="soft"
                  onClick={(e) => { e.stopPropagation(); onUpdate(job.id, 'On_the_Way'); }}
                  style={{ flex: '1 1 120px' }}
                >
                  Start Journey
                </Button>
              )}
              {job.status === 'On the way' && (
                <Button
                  size="sm"
                  variant="soft"
                  onClick={(e) => { e.stopPropagation(); onUpdate(job.id, 'Destination'); }}
                  style={{ flex: '1 1 120px' }}
                >
                  Arrived
                </Button>
              )}
              {job.status === 'Destination' && (
                <Button
                  size="sm"
                  variant="soft"
                  onClick={(e) => { e.stopPropagation(); onUpdate(job.id, 'Reached'); }}
                  style={{ flex: '1 1 120px' }}
                >
                  Reached Customer
                </Button>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
          {btns.map((b) => (
            <Button key={b.label} variant={b.variant} size="sm" onClick={() => onUpdate(job.id, b.next)}>{b.label}</Button>
          ))}
          {job.status === 'Reached' && (
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, fontStyle: 'italic' }}>
              Awaiting customer arrival confirmation...
            </span>
          )}
          {['Accepted', 'On the way', 'Destination', 'Reached', 'Reached Confirmed', 'Pending Payment', 'Completed'].includes(job.status) && (
            <Button size="sm" variant="soft" onClick={() => onChatOpen(job)}>Chat 💬</Button>
          )}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--brand)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
          >
            {isExpanded ? 'Hide details' : 'Details & map'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div style={{ padding: '16px 20px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg-base)' }} onClick={(e) => e.stopPropagation()}>
          {hasCustomerGps && (
            <>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Route preview</p>
              <JobRouteMiniMap customerLatitude={custLat} customerLongitude={custLon} providerLatitude={provLat} providerLongitude={provLon} height={180} />
              <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                <a href={job.customerDirectionsUrl || googleMapsSearchUrl(custLat, custLon)} target="_blank" rel="noreferrer" style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand)' }}>View pin on map</a>
                {navigateUrl && <a href={navigateUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand)' }}>Driving directions</a>}
              </div>
            </>
          )}
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', margin: '14px 0 8px' }}>Requested items</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(job.options || ['Standard Service']).map((o) => (
              <Badge key={o} color="muted">{o}</Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export default function ProviderJobs() {
  const { bookings, updateBookingStatus, user } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const [activeChatJob, setActiveChatJob] = useState(null);

  const providerCoords = useMemo(() => {
    if (typeof user?.latitude === 'number' && typeof user?.longitude === 'number') {
      return [user.latitude, user.longitude];
    }
    return null;
  }, [user?.latitude, user?.longitude]);

  const providerBookings = bookings.filter(
    (b) =>
      (b.serviceProviderId === user?.id || (!b.serviceProviderId && b.providerName === user?.name)) &&
      ['Requested', 'Accepted', 'On the way', 'Destination', 'Reached', 'Reached Confirmed', 'Pending Payment'].includes(b.status)
  );
  const pastBookings = bookings.filter(
    (b) =>
      (b.serviceProviderId === user?.id || (!b.serviceProviderId && b.providerName === user?.name)) &&
      ['Completed', 'Rejected', 'Cancelled'].includes(b.status)
  );

  const handleChatOpen = (job) => {
    setActiveChatJob(job);
    setChatOpen(true);
  };

  return (
    <div className="animate-fade-in-up" style={{ padding: '24px 16px', maxWidth: 720, margin: '0 auto' }}>
      <SectionHeader title="Active jobs" subtitle="Uber-style navigation to your customer" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
        {providerBookings.length > 0 ? (
          providerBookings.map((job) => <JobCard key={job.id} job={job} onUpdate={updateBookingStatus} providerCoords={providerCoords} onChatOpen={handleChatOpen} />)
        ) : (
          <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 16, border: '1.5px dashed var(--border)' }}>
            No active job requests right now.
          </p>
        )}
      </div>
      <SectionHeader title="Job history" subtitle="Completed or cancelled" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {pastBookings.length > 0 ? (
          pastBookings.map((job) => <JobCard key={job.id} job={job} onUpdate={updateBookingStatus} providerCoords={providerCoords} onChatOpen={handleChatOpen} />)
        ) : (
          <p style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No history yet.</p>
        )}
      </div>

      <ChatDrawer
        isOpen={chatOpen}
        onClose={() => { setChatOpen(false); setActiveChatJob(null); }}
        booking={activeChatJob}
      />
    </div>
  );
}
