import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/context/AuthContext';
import { Card, StatCard, StatusBadge, Button, SectionHeader } from '../../components/common/UI';
import { SERVICE_CATEGORIES } from '../../data/mockData';

export default function CustomerDashboard() {
  const { user, bookings, setLocationModalOpen, apiFetch } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = React.useState(null);
  const [customerProfile, setCustomerProfile] = React.useState(null);

  React.useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await apiFetch('/api/customer/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error('Failed to load dashboard stats', e);
      }
    };
    loadStats();
  }, [apiFetch, bookings]);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiFetch('/api/customer/auth/validate-session');
        if (res.ok) {
          const data = await res.json();
          setCustomerProfile(data);
        }
      } catch (e) {
        console.error('Failed to fetch customer profile', e);
      }
    };
    fetchProfile();
  }, [apiFetch]);
  
  const handleAction = (path = '/customer/discover') => {
    if (
      typeof user?.latitude !== 'number' ||
      typeof user?.longitude !== 'number' ||
      !user?.serviceCity ||
      user?.serviceCityActive === false
    ) {
      setLocationModalOpen(true);
      return;
    }
    navigate(path);
  };
  
  const customerBookings = bookings.filter(b => b.customerId === user?.id || !b.customerId);
  const completed = customerBookings.filter(b => b.status === 'Completed');
  const recentBookings = customerBookings.slice(0, 3);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="animate-fade-in-up" style={{ padding: '32px 36px', maxWidth: '1140px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
          {greeting}, <span style={{ color: 'var(--brand)' }}>{(customerProfile?.name || user?.name)?.split(' ')[0]}</span> 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>What home service do you need today?</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '28px' }}>
        <StatCard 
          label="Total Bookings"   
          value={stats ? stats.totalBookings.toString() : customerBookings.length.toString()}    
          icon="📋" 
          change={stats ? stats.totalBookingsGrowth : ""}  
          iconBg="var(--brand-light)" 
          color="var(--brand)" 
        />
        <StatCard 
          label="Completed"        
          value={stats ? stats.completedBookings.toString() : completed.length.toString()}     
          icon="✅" 
          change={stats ? stats.completedBookingsGrowth : ""}   
          iconBg="var(--success-light)" 
          color="var(--success)" 
        />
        <StatCard 
          label="Avg Rating Given" 
          value={stats && stats.averageRating ? stats.averageRating.toFixed(1) : (user?.averageRating ? user.averageRating.toFixed(1) : "0")}   
          icon="⭐" 
          iconBg="var(--warning-light)"        
          color="#D97706" 
        />
      </div>

      {/* Hero Banner */}
      <div style={{ background: 'linear-gradient(120deg, var(--brand-dark) 0%, #3F3F46 100%)', borderRadius: 'var(--radius-xl)', padding: '28px 36px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', boxShadow: '0 6px 28px var(--brand-glow)' }}>
        <div style={{ position: 'absolute', right: -20, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>Book a service</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
            {stats ? `${stats.nearbyProvidersCount} professionals near you` : 'Professionals near you'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13.5px' }}>Fast booking · Verified experts · Fixed prices</p>
        </div>
        <Button onClick={() => handleAction()} size="lg" style={{ background: '#fff', color: '#000', flexShrink: 0, position: 'relative', zIndex: 1 }}>Book Now →</Button>
      </div>

      {/* Recent Bookings */}
      <SectionHeader title="Recent Bookings" action={<Button variant="ghost" size="sm" onClick={() => navigate('/customer/bookings')} style={{ color: 'var(--brand)', fontWeight: 600 }}>View all →</Button>} />
      <div style={{ display: 'grid', gap: '12px', marginBottom: '32px' }}>
        {recentBookings.map(b => (
          <Card key={b.id} padding="18px 22px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: 46, height: 46, borderRadius: 'var(--radius-md)', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                  🔧
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '14.5px', marginBottom: '3px', color: 'var(--text-primary)' }}>{b.service}</p>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{b.providerName} · {b.date} · {b.time}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexShrink: 0 }}>
                {b.amount > 0 && <p style={{ fontWeight: 700, color: 'var(--brand)', fontSize: '16px' }}>₹{b.amount}</p>}
                <StatusBadge status={b.status} />
                {['Accepted', 'On the way', 'Destination', 'Reached'].includes(b.status) && <Button size="sm" onClick={() => navigate('/customer/tracking')}>Track</Button>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}