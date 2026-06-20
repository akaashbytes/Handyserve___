import React, { useState } from 'react';
import { Card, Badge, Button, SectionHeader, StatusBadge, Avatar } from '../../components/common/UI';
import { SERVICE_CATEGORIES } from '../../data/mockData';
import { useAuth } from '../../components/context/AuthContext';

export default function AdminBookings() {
  const { bookings, updateBookingStatus } = useAuth();
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');
  const [selected, setSelected] = useState(null);

  const STATUSES = ['all', 'Requested', 'Accepted', 'On the way', 'Destination', 'Reached', 'Pending Payment', 'Completed', 'Cancelled', 'Rejected'];

  const filtered = bookings.filter(b => {
    const matchFilter = filter === 'all' || b.status === filter;
    const matchSearch = !search ||
      String(b.id).toLowerCase().includes(search.toLowerCase()) ||
      (b.service || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.providerName || '').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="animate-fade-in-up" style={{ padding: '32px 36px', maxWidth: '1100px' }}>
      <SectionHeader
        title="Booking Management"
        subtitle="View and manage all platform bookings"
        action={
          <Button variant="outline" size="sm"
            onClick={() => {
              const csv = ['ID,Service,Status,Provider,Date,Amount',
                ...bookings.map(b => `${b.id},${b.service},${b.status},${b.providerName || ''},${b.date},₹${b.amount || 0}`)
              ].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url  = URL.createObjectURL(blob);
              const a    = document.createElement('a');
              a.href = url; a.download = 'bookings.csv'; a.click();
            }}>
            📥 Export CSV
          </Button>
        }
      />

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total',       count: bookings.length,                                   color: 'var(--brand)' },
          { label: 'Requested',   count: bookings.filter(b => b.status === 'Requested').length,   color: 'var(--warning)' },
          { label: 'In Progress', count: bookings.filter(b => ['On the way', 'Destination', 'Reached'].includes(b.status)).length, color: 'var(--info)' },
          { label: 'Completed',   count: bookings.filter(b => b.status === 'Completed').length,   color: 'var(--success)' },
          { label: 'Cancelled',   count: bookings.filter(b => b.status === 'Cancelled').length,   color: 'var(--danger)' },
        ].map(s => (
          <Card key={s.label} padding="14px 18px"
            style={{ cursor: 'pointer', borderColor: filter === s.label.toLowerCase() ? s.color : 'var(--border)' }}
            onClick={() => setFilter(s.label === 'Total' ? 'all' : s.label)}>
            <p style={{ fontSize: '22px', fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)' }}>{s.count}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Search booking ID, service, provider..."
          style={{ flex: 1, minWidth: '260px', padding: '10px 16px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxShadow: 'var(--shadow-xs)' }} />
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ padding: '10px 14px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}>
          {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>)}
        </select>
      </div>

      {/* Table */}
      <Card padding="0" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                {['Booking ID', 'Service', 'Provider', 'Customer', 'Date & Time', 'Amount', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => (
                <tr key={b.id}
                  style={{ borderBottom: '1px solid var(--border-light)', background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-base)', transition: 'var(--transition)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-light)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-base)'; }}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <p style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--brand)' }}>#{b.id}</p>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>{SERVICE_CATEGORIES.find(c => c.label === b.service)?.icon || '🔧'}</span>
                      <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: 500 }}>{b.service}</p>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>{b.providerName || 'N/A'}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>{b.customerName || 'N/A'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{b.date}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.time}</p>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--brand)', fontSize: '14px' }}>
                    {b.amount > 0 ? `₹${b.amount}` : '—'}
                  </td>
                  <td style={{ padding: '14px 16px' }}><StatusBadge status={b.status} /></td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <Button size="sm" variant="soft" onClick={() => setSelected(b)}>View</Button>
                      {b.status !== 'Completed' && b.status !== 'Cancelled' && (
                        <Button size="sm" variant="danger" onClick={() => updateBookingStatus(b.id, 'Cancelled')}>Cancel</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <Card padding="32px" style={{ width: '100%', maxWidth: '480px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Booking #{selected.id}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>
            {[
              { label: 'Service',  value: selected.service },
              { label: 'Provider', value: selected.providerName || 'N/A' },
              { label: 'Customer', value: selected.customerName || 'N/A' },
              { label: 'Date',     value: selected.date },
              { label: 'Time',     value: selected.time },
              { label: 'Address',  value: selected.address },
              { label: 'Amount',   value: selected.amount > 0 ? `₹${selected.amount}` : 'N/A' },
              { label: 'Status',   value: selected.status },
              { label: 'Invoice',  value: selected.invoiceId || 'Not generated' },
              { label: 'Rating',   value: selected.rating ? `${selected.rating}★` : 'Not rated' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{row.label}</p>
                <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: 600 }}>{row.value}</p>
              </div>
            ))}
            <Button fullWidth onClick={() => setSelected(null)} style={{ marginTop: '20px' }}>Close</Button>
          </Card>
        </div>
      )}
    </div>
  );
}
