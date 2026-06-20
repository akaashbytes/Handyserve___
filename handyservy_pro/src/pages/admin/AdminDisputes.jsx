import React, { useState } from 'react';
import { Card, Badge, Button, SectionHeader, Avatar } from '../../components/common/UI';
import { getIcon } from '../../components/common/Icons';
import { useAuth } from '../../components/context/AuthContext';

export default function AdminDisputes() {
  const { disputes, updateDisputeStatus, addDisputeUpdate } = useAuth();
  const [filter, setFilter]     = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = filter === 'all'
    ? disputes
    : disputes.filter(d => d.status === filter);

  const applyAction = (ticket, nextStatus, note) => {
    updateDisputeStatus(ticket.id, nextStatus);
    addDisputeUpdate(ticket.id, {
      actor: 'Admin Team',
      actorRole: 'admin',
      note,
    });
    if (selected?.id === ticket.id) {
      setSelected({
        ...selected,
        status: nextStatus,
        updates: [
          {
            id: `tmp-${Date.now()}`,
            actor: 'Admin Team',
            actorRole: 'admin',
            note,
            at: new Date().toLocaleString('en-IN'),
          },
          ...(selected.updates || []),
        ],
      });
    }
  };

  const openReplyMail = (ticket) => {
    if (!ticket.customerEmail) return;
    const subject = encodeURIComponent(`Reply on dispute ${ticket.id} for booking ${ticket.bookingId}`);
    const body = encodeURIComponent(
      `Hi ${ticket.customer || 'Customer'},\n\n` +
      `We are reviewing your dispute (${ticket.id}).\n` +
      `Current status: ${ticket.status}\n\n` +
      `Regards,\nHandyServe Admin`
    );
    window.location.href = `mailto:${ticket.customerEmail}?subject=${subject}&body=${body}`;
  };

  const statusColor = {
    Open: 'danger',
    Pending: 'warning',
    Resolved: 'success',
    'Pending Provider Reply': 'info',
    'Refund Approved': 'brand',
    'Rejected': 'danger',
  };

  return (
    <div className="animate-fade-in-up" style={{ padding: '32px 36px', maxWidth: '1000px' }}>
      <SectionHeader title="Dispute Resolution" subtitle="Web-raised customer tickets arrive here for admin action" />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Open Disputes',     count: disputes.filter(d => d.status === 'Open').length,     color: 'var(--danger)',  icon: '⚠️' },
          { label: 'Need Provider Reply', count: disputes.filter(d => d.status === 'Pending Provider Reply').length, color: 'var(--brand)', icon: '📩' },
          { label: 'Resolved',          count: disputes.filter(d => d.status === 'Resolved' || d.status === 'Refund Approved').length,  color: 'var(--success)', icon: '✅' },
        ].map(s => (
          <Card key={s.label} padding="20px">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: 46, height: 46, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{getIcon(s.icon, { size: 20 })}</div>
              <div>
                <p style={{ fontSize: '24px', fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{s.count}</p>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '3px' }}>{s.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
        {['all', 'Open', 'Pending Provider Reply', 'Pending', 'Refund Approved', 'Resolved', 'Rejected'].map(s => {
          const active = filter === s;
          return (
            <button key={s} onClick={() => setFilter(s)}
              style={{ padding: '7px 18px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontFamily: 'var(--font-body)', fontWeight: active ? 600 : 400, background: active ? 'var(--brand)' : 'var(--bg-card)', border: `1.5px solid ${active ? 'var(--brand)' : 'var(--border)'}`, color: active ? '#fff' : 'var(--text-secondary)', transition: 'var(--transition)' }}>
              {s === 'all' ? 'All' : s}
            </button>
          );
        })}
      </div>

      {/* Dispute Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filtered.map(d => (
          <Card key={d.id} padding="22px">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '14px', flex: 1 }}>
                <div style={{ width: 46, height: 46, borderRadius: 'var(--radius-md)', background: 'var(--danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{getIcon('⚠️', { size: 20 })}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px', flexWrap: 'wrap' }}>
                    <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>Dispute #{d.id}</p>
                    <Badge color={statusColor[d.status]}>{d.status}</Badge>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Booking #{d.bookingId}</p>
                    <Badge color="muted">{d.source || 'web'}</Badge>
                    <Badge color={d.priority === 'High' ? 'danger' : d.priority === 'Low' ? 'muted' : 'warning'}>{d.priority || 'Medium'} Priority</Badge>
                  </div>
                  <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', marginBottom: '6px', fontWeight: 500 }}>"{d.issue}"</p>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{getIcon('👤', { size: 14 })} Customer: <strong>{d.customer}</strong></p>
                    {d.customerEmail && <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{getIcon('📧', { size: 14 })} {d.customerEmail}</p>}
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{getIcon('🔧', { size: 14 })} Provider: <strong>{d.provider}</strong></p>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{getIcon('📅', { size: 14 })} {d.date}</p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                <p style={{ fontWeight: 800, color: 'var(--brand)', fontSize: '18px' }}>₹{d.amount}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button size="sm" variant="soft" onClick={() => setSelected(d)}>View Details</Button>
                  {d.customerEmail && (
                    <Button size="sm" variant="outline" onClick={() => openReplyMail(d)}>Reply via Mail</Button>
                  )}
                  {(d.status === 'Open' || d.status === 'Pending' || d.status === 'Pending Provider Reply') && (
                    <>
                      <Button size="sm" onClick={() => applyAction(d, 'Pending Provider Reply', 'Asked provider for clarification via ticket workflow.')}>Ask Provider</Button>
                      <Button size="sm" variant="danger" onClick={() => applyAction(d, 'Refund Approved', 'Refund approved and marked for processing.')}>Approve Refund</Button>
                      <Button size="sm" variant="soft" onClick={() => applyAction(d, 'Resolved', 'Resolved after admin review and communication with both parties.')}>Resolve ✓</Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <Card padding="32px" style={{ width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Dispute #{selected.id}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>
            <div style={{ padding: '16px', background: 'var(--danger-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger)', marginBottom: '20px' }}>
              <p style={{ fontSize: '14px', color: 'var(--danger)', fontWeight: 600 }}>Issue Reported:</p>
              <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', marginTop: '4px' }}>{selected.issue}</p>
            </div>
            {[
              { label: 'Customer',    value: selected.customer },
              { label: 'Provider',    value: selected.provider },
              { label: 'Booking ID',  value: `#${selected.bookingId}` },
              { label: 'Amount',      value: `₹${selected.amount}` },
              { label: 'Date Filed',  value: selected.date },
              { label: 'Source',      value: selected.source || 'web' },
              { label: 'Priority',    value: selected.priority || 'Medium' },
              { label: 'Status',      value: selected.status },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{row.label}</p>
                <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: 600 }}>{row.value}</p>
              </div>
            ))}
            {(selected.updates || []).length > 0 && (
              <div style={{ marginTop: '14px', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>Ticket Timeline</p>
                {(selected.updates || []).slice(0, 4).map(u => (
                  <div key={u.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-primary)' }}><strong>{u.actor}</strong>: {u.note}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{u.at}</p>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <Button variant="outline" fullWidth onClick={() => setSelected(null)}>Close</Button>
              {selected.customerEmail && <Button variant="soft" fullWidth onClick={() => openReplyMail(selected)}>Reply via Mail</Button>}
              {(selected.status === 'Open' || selected.status === 'Pending' || selected.status === 'Pending Provider Reply') && (
                <>
                  <Button fullWidth onClick={() => applyAction(selected, 'Resolved', 'Resolved after admin review and response shared over mail.')}>Resolve ✓</Button>
                  <Button variant="danger" fullWidth onClick={() => applyAction(selected, 'Refund Approved', 'Refund approved and customer informed.')}>Approve Refund</Button>
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
