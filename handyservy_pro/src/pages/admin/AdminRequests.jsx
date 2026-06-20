import React from 'react';
import { useAuth } from '../../components/context/AuthContext';
import { Card, SectionHeader, Button, Badge } from '../../components/common/UI';
import { getIcon } from '../../components/common/Icons';

export default function AdminRequests() {
  const { contactRequests, updateContactRequestStatus } = useAuth();

  return (
    <div className="animate-fade-in-up" style={{ padding: '32px 36px', maxWidth: '1000px' }}>
      <SectionHeader title="Customer Requests" subtitle="Manage inquiries submitted from the landing page" />
      
      {(!contactRequests || contactRequests.length === 0) ? (
        <Card padding="40px" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>{getIcon('📩', { size: 40 })}</div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>No Requests Yet</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You're all caught up! There are no new customer inquiries.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {contactRequests.map(req => (
            <Card key={req.id} padding="24px" style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: req.status === 'pending' ? '4px solid var(--brand)' : '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{req.name}</h3>
                    <Badge color={req.status === 'pending' ? 'warning' : 'success'}>
                      {req.status === 'pending' ? 'Pending' : 'Resolved'}
                    </Badge>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{getIcon('📧', { size: 14 })} {req.email} • {getIcon('📅', { size: 14 })} {req.date}</p>
                </div>
                {req.status === 'pending' && (
                  <Button size="sm" variant="soft" onClick={() => updateContactRequestStatus(req.id, 'resolved')}>
                    Mark as Resolved ✓
                  </Button>
                )}
              </div>
              
              <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                  {req.message}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
