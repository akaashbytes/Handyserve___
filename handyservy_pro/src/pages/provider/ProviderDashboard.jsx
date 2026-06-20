import React, { useState } from 'react';
import { useAuth } from '../../components/context/AuthContext';
import { Card, StatCard, StatusBadge, Button, Badge, SectionHeader, Avatar } from '../../components/common/UI';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// JobCard moved to ProviderJobs.jsx

export default function ProviderDashboard() {
  const { user, bookings, leaveRequests, updateAvailability } = useAuth();
  const [activeStat, setActiveStat] = useState(null);

  const handleToggleAvailability = () => {
    if (user?.verified) {
      updateAvailability(user.id, !user.available);
    }
  };
  
  // Filter bookings for this provider role
  const providerBookings = bookings.filter(b => b.serviceProviderId === user?.id || (!b.serviceProviderId && b.providerName === user?.name));
  const completedBookings = providerBookings.filter(b => b.status === 'Completed');
  const cancelledBookings = providerBookings.filter(b => b.status === 'Cancelled');
  const totalFinished = completedBookings.length + cancelledBookings.length;
  const completionRate = totalFinished > 0 ? Math.round((completedBookings.length / totalFinished) * 100) : 0;

  const ratedBookings = completedBookings.filter(b => b.rating !== null && b.rating !== undefined);
  const avgRating = ratedBookings.length > 0 ? ratedBookings.reduce((sum, b) => sum + b.rating, 0) / ratedBookings.length : 0;
  
  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.amount || 0), 0);

  const pendingLeaveCount = (leaveRequests || []).filter(l => l.providerId === user.id && l.status === 'pending').length;
  const recentLeaves = (leaveRequests || []).filter(l => l.providerId === user.id && l.status !== 'pending').slice(0, 2);

  // Generate dynamic chart data based on completed bookings
  const monthlyRevenue = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthPrefix = d.toISOString().substring(0, 7);
    const monthLabel = d.toLocaleDateString('en-US', { month: 'short' });
    
    const revenue = completedBookings
      .filter(b => b.date && b.date.startsWith(monthPrefix))
      .reduce((sum, b) => sum + (b.amount || 0), 0);
      
    monthlyRevenue.push({ month: monthLabel, revenue });
  }

  return (
    <div className="animate-fade-in-up" style={{ padding: '32px 36px', maxWidth: '1100px' }}>
      
      {/* Verification Pending Banner */}
      {!user?.verified && (
        <div style={{ 
          marginBottom: '24px', 
          padding: '16px 20px', 
          background: 'var(--warning-light)', 
          border: '1px solid var(--warning)', 
          borderRadius: 'var(--radius-md)', 
          color: 'var(--warning)', 
          fontWeight: 600, 
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ fontSize: '20px' }}>⏳</span>
          <div>
            <h4 style={{ margin: 0, fontWeight: 700 }}>Verification Pending</h4>
            <p style={{ margin: '2px 0 0', fontWeight: 500, fontSize: '13px', opacity: 0.9 }}>Your uploaded documents (Aadhaar, Driving License, Bank Passbook) are currently under review by the administrator. You will be able to receive bookings once your account is approved.</p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '26px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Welcome back, <span style={{ color: 'var(--brand)' }}>{user?.name?.split(' ')[0]}</span> 🔧
          </h1>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
            {user?.verified ? (
              <Badge color="success">✓ Verified Provider</Badge>
            ) : (
              <Badge color="warning">⏳ Verification Pending</Badge>
            )}
            <Badge color="warning">⭐ {user?.averageRating ? user.averageRating.toFixed(1) : "0"} Rating</Badge>
            <Badge color="muted">{user?.serviceType || 'Handyman'}</Badge>
          </div>
        </div>

        {/* Availability Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-card)', padding: '10px 18px', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xs)' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Availability:
          </span>
          <button
            onClick={handleToggleAvailability}
            disabled={!user?.verified}
            style={{
              background: !user?.verified ? 'var(--bg-elevated)' : (user?.available ? 'var(--success)' : 'var(--danger)'),
              color: !user?.verified ? 'var(--text-muted)' : '#fff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: !user?.verified ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: user?.verified && user?.available ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none',
            }}
          >
            {!user?.verified ? 'Disabled' : (user?.available ? 'Available' : 'Unavailable')}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <StatCard label="Jobs Completed"  value={completedBookings.length.toString()}    icon="✅" change={completedBookings.length > 0 ? "+2 today" : ""} iconBg="#D1FAE5" color="var(--success)" onClick={() => setActiveStat('jobs')} />
        <StatCard label="Total Salary"    value={`₹${(totalEarnings / 1000).toFixed(1)}k`} icon="💰" change={totalEarnings > 0 ? "+₹8.2k this month" : ""} iconBg="#FEF3C7" color="#D97706" onClick={() => setActiveStat('salary')} />
        <StatCard label="Reliability"     value={`${user?.reliabilityScore ?? 0}%`}    icon="⭐" iconBg="#FEF3C7" color="#D97706" onClick={() => setActiveStat('reliability')} />
        <StatCard label="Pending Off Day" value={pendingLeaveCount.toString()}    icon="🏥" iconBg="#EDE9FE" color="var(--brand)" onClick={() => setActiveStat('leave')} />
      </div>

      {activeStat === 'reliability' && (
        <Card padding="24px" style={{ marginBottom: '28px', animation: 'fadeIn 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>📊 Reliability Breakdown</p>
            <Button variant="ghost" size="sm" onClick={() => setActiveStat(null)}>Close</Button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
              <svg width="90" height="90" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r="38" fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle cx="45" cy="45" r="38" fill="none" stroke="var(--brand)" strokeWidth="8"
                  strokeDasharray={`${((user?.reliabilityScore ?? 0) / 100) * 238.76} 238.76`}
                  strokeLinecap="round" transform="rotate(-90 45 45)" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: 'var(--brand)', lineHeight: 1 }}>{user?.reliabilityScore ?? 0}</p>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/ 100</p>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>Top Professional</p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                Based on job completion, punctuality, and customer ratings.
              </p>
              {[
                { label: 'Job Completion', score: completionRate },
                { label: 'Punctuality', score: completionRate },
                { label: 'Customer Ratings', score: Math.round(avgRating * 20) },
              ].map((s, i) => (
                <div key={i} style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{s.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand)' }}>{s.score}%</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--bg-elevated)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ width: `${s.score}%`, height: '100%', background: 'linear-gradient(90deg, var(--brand), #8B5CF6)', borderRadius: 10 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {activeStat === 'jobs' && (
        <Card padding="24px" style={{ marginBottom: '28px', animation: 'fadeIn 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>✅ Completed Jobs Summary</p>
            <Button variant="ghost" size="sm" onClick={() => setActiveStat(null)}>Close</Button>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>You have completed {completedBookings.length} jobs successfully. Keep up the great work!</p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
             {completedBookings.slice(0,3).map(b => (
               <Badge key={b.id} color="success">{b.service} - ₹{b.amount}</Badge>
             ))}
          </div>
        </Card>
      )}
      
      {activeStat === 'salary' && (
        <Card padding="24px" style={{ marginBottom: '28px', animation: 'fadeIn 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>💰 Salary Breakdown</p>
            <Button variant="ghost" size="sm" onClick={() => setActiveStat(null)}>Close</Button>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total earnings: ₹{totalEarnings.toLocaleString()}. Next payout is scheduled for the end of the month.</p>
        </Card>
      )}

      {activeStat === 'leave' && (
        <Card padding="24px" style={{ marginBottom: '28px', animation: 'fadeIn 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>🏥 Pending Off Days</p>
            <Button variant="ghost" size="sm" onClick={() => setActiveStat(null)}>Close</Button>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>You have {pendingLeaveCount} off day requests waiting for admin approval.</p>
        </Card>
      )}

      {(user?.reliabilityScore > 95) && (
        <div style={{ marginBottom: '20px', padding: '12px 20px', background: 'linear-gradient(90deg, var(--brand-glow), var(--bg-base))', border: '1px solid var(--brand)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🎁</span>
          <div>
            <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '15px' }}>Top Performer Incentive!</h4>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13.5px' }}>Your reliability score is above 95%. You receive an extra incentive on your first order of the day!</p>
          </div>
        </div>
      )}

      {recentLeaves.map(l => (
        <div key={l.id} style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', background: l.status === 'approved' ? 'var(--success-light)' : 'var(--danger-light)', border: `1px solid ${l.status === 'approved' ? 'var(--success)' : 'var(--danger)'}`, color: l.status === 'approved' ? 'var(--success)' : 'var(--danger)', fontSize: '13.5px', fontWeight: 600 }}>
          {l.status === 'approved' 
             ? `✅ Your slots on ${l.date} are now blocked for customers.` 
             : `❌ Your off day request for ${l.date} was rejected — you are still available.`}
        </div>
      ))}



      <Card padding="24px">
        <p style={{ fontWeight: 700, marginBottom: '20px', fontSize: '16px', color: 'var(--text-primary)' }}>Monthly Earnings</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={monthlyRevenue}>
            <defs>
              <linearGradient id="earningGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--brand)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--brand)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
            <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)' }} formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="var(--brand)" strokeWidth={2.5} fill="url(#earningGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}