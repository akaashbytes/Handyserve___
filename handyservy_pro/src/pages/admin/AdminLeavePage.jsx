import React, { useState } from 'react';
import { useAuth } from '../../components/context/AuthContext';
import { Card, Button, SectionHeader, StatusBadge, Badge } from '../../components/common/UI';
import { getIcon } from '../../components/common/Icons';

export default function AdminLeavePage() {
  const { leaveRequests, updateLeaveStatus } = useAuth();
  const [error, setError] = useState('');

  const pending = leaveRequests.filter(l => l.status === 'pending');
  const history = leaveRequests.filter(l => l.status !== 'pending');

  const handleAction = async (id, status) => {
    try {
      await updateLeaveStatus(id, status);
      setError('');
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 4000);
    }
  };

  return (
    <div className="animate-fade-in-up" style={{ padding: '32px 36px', maxWidth: '1000px' }}>
      <SectionHeader title="Staff Off Day Requests" subtitle="Review and approve/reject provider off day applications" />
      
      {error && (
        <div style={{ padding: '12px 16px', background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: '10px', marginBottom: '20px', color: 'var(--danger)', fontSize: '14px', fontWeight: 600 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>{getIcon('⚠️', { size: 16 })} {error}</span>
          </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Pending Requests <Badge color="brand">{pending.length}</Badge>
        </h3>
        
        {pending.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No pending off day requests.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {pending.map(l => (
              <Card key={l.id} padding="24px" hover>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{l.providerName}</p>
                    <p style={{ fontSize: '12px', color: 'var(--brand)', fontWeight: 600 }}>{l.skill}</p>
                  </div>
                  <Badge color="muted">{l.date}</Badge>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Slots to Block:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {l.timeSlots.map(s => <span key={s} style={{ fontSize: '11px', padding: '3px 8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-secondary)' }}>{s}</span>)}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-base)', padding: '10px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
                   <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Reason:</p>
                   <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', fontStyle: 'italic' }}>"{l.reason}"</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button fullWidth onClick={() => handleAction(l.id, 'approved')}>Approve</Button>
                  <Button variant="outline" fullWidth onClick={() => handleAction(l.id, 'rejected')}>Reject</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Processed History</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {history.map(l => (
            <Card key={l.id} padding="16px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>{getIcon('🔧', { size: 16 })}</div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{l.providerName} · {l.date}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{l.timeSlots.length} slots · {l.reason.substring(0, 30)}...</p>
                  </div>
                </div>
                <StatusBadge status={l.status} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
