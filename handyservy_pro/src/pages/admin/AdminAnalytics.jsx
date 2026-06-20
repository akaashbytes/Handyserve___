import React, { useState, useEffect } from 'react';
import { Card, SectionHeader, Button } from '../../components/common/UI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../components/context/AuthContext';

export default function AdminAnalytics() {
  const { apiFetch } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiFetch('/api/analytics');
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch (e) {
        console.error('Failed to fetch analytics in AdminAnalytics:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [apiFetch]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '16px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>Loading analytics engine...</p>
      </div>
    );
  }

  const overview = analytics?.overview || {};
  const monthlyRevenueData = analytics?.monthlyRevenue || [];

  const avgBookingValue = overview.totalBookings > 0 
    ? Math.round((overview.totalRevenue || 0) / overview.totalBookings) 
    : 0;

  const customerRetention = overview.customerRetention ?? 0;
  const providerRejectionRate = overview.providerRejectionRate ?? 0;
  const refundRate = overview.refundRate ?? 0;

  const handleExport = () => {
    const content = `
HandyServe Pro — Analytics Report
Generated: ${new Date().toLocaleDateString()}
================================
Avg Booking Value:      ₹${avgBookingValue}
Total Revenue:          ₹${(overview.totalRevenue || 0).toLocaleString()}
Total Bookings Count:   ${overview.totalBookings || 0}
Active Providers:       ${overview.activeProviders || 0}
Active Customers:       ${overview.activeCustomers || 0}
Completion Rate:        ${overview.completionRate || 0}%
--------------------------------
Customer Retention:     ${customerRetention}%
Provider Rejection Rate: ${providerRejectionRate}%
Dispute Rate:           ${overview.totalBookings > 0 ? ((overview.openDisputes || 0) / overview.totalBookings * 100).toFixed(1) : '0.0'}%
Refund Rate:            ${refundRate}%
================================
Monthly Revenue (Aggregated):
${monthlyRevenueData.map(m => `${m.month}: ₹${m.revenue.toLocaleString()} (${m.bookings} bookings)`).join('\n')}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'HandyServe_Analytics_Report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in-up" style={{ padding: '32px 36px', maxWidth: '1000px' }}>
      <SectionHeader title="Analytics & Insights" subtitle="Deep-dive into platform performance"
        action={<Button variant="outline" size="sm" onClick={handleExport}>📥 Export Report</Button>} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <Card padding="24px">
          <p style={{ fontWeight: 700, marginBottom: '20px', fontSize: '15px', color: 'var(--text-primary)' }}>Booking Trends</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)' }} />
              <Bar dataKey="bookings" fill="var(--brand)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card padding="24px">
          <p style={{ fontWeight: 700, marginBottom: '16px', fontSize: '15px', color: 'var(--text-primary)' }}>Key Metrics</p>
          {[
            { label: 'Avg Booking Value',      value: `₹${avgBookingValue}`,  color: 'var(--brand)' },
            { label: 'Customer Retention',      value: `${customerRetention}%`,   color: 'var(--success)' },
            { label: 'Provider Rejection Rate', value: `${providerRejectionRate}%`,  color: 'var(--warning)' },
            { label: 'Dispute Rate',            value: overview.totalBookings > 0 ? ((overview.openDisputes || 0) / overview.totalBookings * 100).toFixed(1) + '%' : '0.0%',  color: 'var(--danger)' },
            { label: 'Refund Rate',             value: `${refundRate}%`,  color: 'var(--text-secondary)' },
          ].map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>{m.label}</p>
              <p style={{ fontWeight: 700, color: m.color, fontSize: '14.5px' }}>{m.value}</p>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}