import React from 'react';
import { Card, StatCard, Badge, SectionHeader } from '../../components/common/UI';
import { useAuth } from '../../components/context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function EarningsPage() {
  const { user, bookings } = useAuth();
  
  const providerBookings = bookings.filter(b => b.serviceProviderId === user?.id || (!b.serviceProviderId && b.providerName === user?.name));
  const completed = providerBookings.filter(b => b.status === 'Completed');
  const pending = providerBookings.filter(b => b.status === 'Pending Payment');

  const totalLifetime = completed.reduce((sum, b) => sum + (b.amount || 0), 0);
  const pendingPayout = pending.reduce((sum, b) => sum + (b.amount || 0), 0);
  
  // Calculate this month's earnings
  const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
  const thisMonthEarnings = completed
    .filter(b => b.date && b.date.startsWith(currentMonthStr))
    .reduce((sum, b) => sum + (b.amount || 0), 0);
    
  // Generate chart data (last 6 months)
  const chartData = [];
  const payouts = [];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthPrefix = d.toISOString().substring(0, 7);
    const monthLabel = d.toLocaleDateString('en-US', { month: 'short' });
    
    const monthBookings = completed.filter(b => b.date && b.date.startsWith(monthPrefix));
    const revenue = monthBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    
    chartData.push({ month: monthLabel, revenue });
    
    if (revenue > 0) {
      payouts.unshift({
        date: `${d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
        amount: revenue,
        jobs: monthBookings.length,
        status: 'Paid'
      });
    }
  }

  return (
    <div className="animate-fade-in-up" style={{ padding: '32px 36px', maxWidth: '860px' }}>
      <SectionHeader title="Earnings" subtitle="Track your income and payouts" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="This Month"     value={`₹${(thisMonthEarnings/1000).toFixed(1)}k`} icon="📈" change="current period" iconBg="#EDE9FE" color="var(--brand)" />
        <StatCard label="Pending Payout" value={`₹${(pendingPayout/1000).toFixed(1)}k`}  icon="⏳" iconBg="#FEF3C7" color="#D97706" />
        <StatCard label="Total Lifetime" value={`₹${(totalLifetime/1000).toFixed(1)}k`} icon="💰" iconBg="#D1FAE5" color="var(--success)" />
      </div>

      <Card padding="24px" style={{ marginBottom: '24px' }}>
        <p style={{ fontWeight: 700, marginBottom: '20px', fontSize: '15px', color: 'var(--text-primary)' }}>Revenue Trend</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="provGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
            <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)' }} />
            <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2.5} fill="url(#provGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <p style={{ fontWeight: 700, marginBottom: '14px', fontSize: '15px', color: 'var(--text-primary)' }}>Recent Payouts</p>
      {payouts.length > 0 ? payouts.map((p, i) => (
        <Card key={i} padding="16px 22px" style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>💸</div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '14.5px', color: 'var(--text-primary)', marginBottom: '2px' }}>Monthly Payout — {p.date}</p>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{p.jobs} jobs · Auto transfer</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <p style={{ fontWeight: 800, color: 'var(--success)', fontSize: '18px' }}>₹{p.amount.toLocaleString()}</p>
              <Badge color="success">{p.status}</Badge>
            </div>
          </div>
        </Card>
      )) : (
        <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No payout history yet.</p>
      )}
    </div>
  );
}