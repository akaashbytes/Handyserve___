import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FeedbackPanel from '../../components/common/FeedbackPanel';
import ChatDrawer from '../../components/common/ChatDrawer';
import { Card, StatusBadge, Button, SectionHeader, EmptyState, Avatar } from '../../components/common/UI';
import { useAuth } from '../../components/context/AuthContext';
import { SERVICE_CATEGORIES } from '../../data/mockData';

export default function BookingsPage() {
  const { user, apiFetch, bookings } = useAuth();
  const [filter, setFilter] = useState('all');
  const [apiBookings, setApiBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const statuses = ['all', 'Pending', 'Accepted', 'Ongoing', 'Completed', 'Cancelled', 'Paid', 'Unpaid'];
  
  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/customer/bookings?filter=${filter}`);
        if (res.ok) {
          const data = await res.json();
          const normalized = data.map(b => ({
            ...b,
            status: b.status === 'On_the_Way' ? 'On the way' :
                    b.status === 'Reached_Confirmed' ? 'Reached Confirmed' :
                    b.status === 'Pending_Payment' ? 'Pending Payment' : b.status
          }));
          setApiBookings(normalized);
        }
      } catch (e) {
        console.error('Failed to load customer bookings', e);
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, [filter, apiFetch, bookings]);

  const [feedbackBooking, setFeedbackBooking] = useState(null);

  // Chat panel state
  const [chatOpen, setChatOpen] = useState(false);
  const [activeChatBooking, setActiveChatBooking] = useState(null);

  return (
    <div className="animate-fade-in-up" style={{ padding: '32px 36px', maxWidth: '940px', margin: '0 auto' }}>
      <SectionHeader title="My Bookings" subtitle="Track and manage all your service requests" />
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
        {statuses.map(s => {
          const active = filter === s;
          return (
            <button 
              key={s} 
              onClick={() => setFilter(s)}
              style={{ 
                padding: '8px 18px', 
                borderRadius: '24px', 
                cursor: 'pointer', 
                fontSize: '13px', 
                fontFamily: 'var(--font-body)', 
                fontWeight: active ? 600 : 500, 
                background: active ? 'var(--brand)' : 'var(--bg-card)', 
                border: `1.5px solid ${active ? 'var(--brand)' : 'var(--border)'}`, 
                color: active ? '#fff' : 'var(--text-secondary)', 
                boxShadow: active ? '0 4px 12px var(--brand-glow)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {s === 'all' ? `All` : s}
            </button>
          );
        })}
      </div>
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: 12, fontSize: 14 }}>Loading bookings...</p>
        </div>
      ) : apiBookings.length === 0 ? (
        <EmptyState icon="📋" title="No bookings found" desc="Try a different filter or book a new service." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {apiBookings.map(b => (
            <Card 
              key={b.id} 
              padding="22px 28px" 
              style={{
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: 280 }}>
                  <div style={{ width: 52, height: 52, borderRadius: '14px', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0 }}>
                    {SERVICE_CATEGORIES.find(c => c.label === b.service)?.icon || '🔧'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <p style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', margin: 0 }}>{b.service}</p>
                      <StatusBadge status={b.status} />
                    </div>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🧑‍🔧</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.providerName}</span>
                      <span style={{ color: 'var(--text-muted)' }}>·</span>
                      <span>📅 {b.date} · ⏰ {b.time}</span>
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>📍 {b.address || 'Address not specified'} · Booking #{b.id}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', minWidth: 160 }}>
                  {b.amount > 0 && <p style={{ fontWeight: 800, fontSize: '19px', color: 'var(--brand)', margin: 0 }}>₹{b.amount}</p>}
                  {b.rating && <p style={{ fontSize: '12.5px', color: '#F59E0B', margin: 0 }}>{'★'.repeat(b.rating)} You rated {b.rating}★</p>}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: 4 }}>
                    {['Accepted', 'On the way', 'Destination', 'Reached', 'Reached Confirmed', 'Pending Payment', 'Completed'].includes(b.status) && (
                      <Button size="sm" variant="soft" onClick={() => { setActiveChatBooking(b); setChatOpen(true); }}>
                        Chat 💬
                      </Button>
                    )}
                    {['Accepted', 'On the way', 'Destination', 'Reached', 'Reached Confirmed'].includes(b.status) && <Button size="sm" onClick={() => navigate('/customer/tracking')}>Track</Button>}
                    {b.status === 'Pending Payment' && <Button size="sm" onClick={() => navigate('/customer/payments')}>Pay Now</Button>}
                    {b.status === 'Completed' && !b.rating && (<Button size="sm" variant="soft" onClick={() => setFeedbackBooking(b)}> Rate Service</Button>)}
                  </div>
                  {feedbackBooking && (<FeedbackPanel booking={feedbackBooking} onClose={() => setFeedbackBooking(null)} />)}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ChatDrawer
        isOpen={chatOpen}
        onClose={() => { setChatOpen(false); setActiveChatBooking(null); }}
        booking={activeChatBooking}
      />
    </div>
  );
}