import React, { useState } from 'react';
import { useAuth } from '../../components/context/AuthContext';
import { Card, Badge, Button, SectionHeader, Avatar } from '../../components/common/UI';
import { getIcon } from '../../components/common/Icons';

export default function AdminProviders() {
  const { providers, blockProvider, verifyProvider, deleteProvider } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);

  const handleDeleteClick = (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete the provider account for "${name}"? This action cannot be undone.`)) {
      deleteProvider(id);
    }
  };

  const filtered = providers.filter(p => 
    !search || 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.service?.toLowerCase().includes(search.toLowerCase())
  );

  const renderDocPreview = (docDataUrl, label) => {
    if (!docDataUrl) {
      return (
        <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '12px', border: '1px dashed var(--border)', borderRadius: '8px', textAlign: 'center' }}>
          No document uploaded
        </div>
      );
    }

    const isPdf = docDataUrl.startsWith('data:application/pdf');
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</p>
        <div style={{ border: '1.5px solid var(--border)', borderRadius: '8px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', overflow: 'hidden', position: 'relative' }}>
          {isPdf ? (
            <iframe 
              src={docDataUrl} 
              title={label} 
              style={{ width: '100%', height: '100%', border: 'none' }} 
            />
          ) : (
            <img 
              src={docDataUrl} 
              alt={label} 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
          )}
        </div>
        <a 
          href={docDataUrl} 
          download={`${label.replace(/\s+/g, '_')}_${selectedProvider?.name}.pdf`} 
          style={{ fontSize: '12.5px', color: 'var(--brand)', textDecoration: 'none', fontWeight: 500, alignSelf: 'flex-start' }}
        >
          Download Document
        </a>
      </div>
    );
  };

  return (
    <div style={{ padding: '32px 36px', maxWidth: '1100px' }}>
      <SectionHeader title="Provider Management" subtitle="Verify, approve, and manage service providers" />
      <div style={{ marginBottom: '20px' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search providers..."
          style={{ width: '100%', maxWidth: '400px', padding: '10px 16px', background: 'var(--bg-card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxShadow: 'var(--shadow-xs)' }} />
      </div>

      <Card padding="0" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                {['Provider', 'Service', 'Rating', 'Reviews', 'Location', 'Verification', 'Status', 'Reliability', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-base)', transition: 'var(--transition)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-light)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-base)'; }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar initials={p.avatar} size={36} />
                      <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{p.name}</p>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>{p.service}</td>
                  <td style={{ padding: '14px 18px', fontSize: '13.5px', color: '#D97706', fontWeight: 600 }}>{getIcon('⭐', { size: 14 })} {p.rating}</td>
                  <td style={{ padding: '14px 18px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>{p.reviews}</td>
                  <td style={{ padding: '14px 18px', fontSize: '13.5px', color: 'var(--text-secondary)' }}>{p.location}</td>
                  
                  {/* Verification Badge Column */}
                  <td style={{ padding: '14px 18px' }}>
                    {p.verified ? (
                      <Badge color="success">✓ Verified</Badge>
                    ) : (
                      <Badge color="warning">⏳ Pending</Badge>
                    )}
                  </td>

                  <td style={{ padding: '14px 18px' }}>
                    {p.blocked ? (
                      <Badge color="danger">Blocked</Badge>
                    ) : (
                      <Badge color="success">{getIcon('✅', { size: 14 })} Active</Badge>
                    )}
                  </td>

                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: 60, height: 5, background: 'var(--bg-elevated)', borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ width: `${p.reliabilityScore ?? 0}%`, height: '100%', background: (p.reliabilityScore ?? 0) < 55 ? 'var(--danger)' : 'var(--success)', borderRadius: 10 }} />
                      </div>
                      <span style={{ fontSize: '12px', color: (p.reliabilityScore ?? 0) < 55 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>{p.reliabilityScore ?? 0}%</span>
                    </div>
                  </td>

                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!p.verified && (
                        <Button size="sm" variant="primary" onClick={() => setSelectedProvider(p)}>
                          Review Docs
                        </Button>
                      )}
                      {p.blocked ? (
                        <Button size="sm" variant="soft" onClick={() => blockProvider(p.id)}>
                          Unblock
                        </Button>
                      ) : ((p.reliabilityScore ?? 0) < 55 && (p.lowScoreDays || 0) >= 3) ? (
                        <Button size="sm" variant="danger" onClick={() => blockProvider(p.id)}>
                          Block Provider
                        </Button>
                      ) : null}
                      <Button size="sm" variant="outline" style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }} onClick={() => handleDeleteClick(p.id, p.name)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Verification Modal */}
      {selectedProvider && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(17,24,39,0.72)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '32px 40px',
        }} onClick={() => setSelectedProvider(null)}>
          <div style={{
            width: '95%',
            maxWidth: '1000px',
            maxHeight: '90vh',
            background: 'var(--bg-card)',
            borderRadius: '18px',
            border: '1px solid var(--border)',
            boxShadow: '0 24px 64px rgba(15, 17, 23, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }} onClick={e => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Review Verification Documents
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  For provider: <strong>{selectedProvider.name}</strong> · {selectedProvider.service}
                </p>
              </div>
              <button onClick={() => setSelectedProvider(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'grid', gridTemplateColumns: '320px 1fr', gap: '28px' }}>
              
              {/* Left Column: Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderRight: '1px solid var(--border)', paddingRight: '28px' }}>
                
                {/* Personal Details */}
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '10px' }}>Personal Info</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Full Name:</span><span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedProvider.name}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Email:</span><span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedProvider.email}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Phone:</span><span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedProvider.phone || 'N/A'}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>City:</span><span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedProvider.serviceCity || selectedProvider.city}</span></div>
                  </div>
                </div>

                {/* Identity Details */}
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '10px' }}>Identity Verification</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Aadhaar Number:</span><span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedProvider.aadhaarNumber || 'N/A'}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Driving License:</span><span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedProvider.drivingLicenseNumber || 'N/A'}</span></div>
                  </div>
                </div>

                {/* Bank Details */}
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '10px' }}>Bank Settlement Details</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Bank Name:</span><span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedProvider.bankName || 'N/A'}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Holder Name:</span><span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedProvider.accountHolder || 'N/A'}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Account No:</span><span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedProvider.bankAccountNumber || 'N/A'}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>IFSC Code:</span><span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedProvider.bankIfscCode || 'N/A'}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>UPI ID:</span><span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedProvider.upi || 'N/A'}</span></div>
                  </div>
                </div>
              </div>

              {/* Right Column: Scrollable Document Previews */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {renderDocPreview(selectedProvider.aadhaarDoc, 'Aadhaar Card')}
                  {renderDocPreview(selectedProvider.drivingLicenseDoc, 'Driving License')}
                </div>
                <div>
                  {renderDocPreview(selectedProvider.bankPassbookDoc, 'Bank Passbook / Cancelled Cheque')}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button variant="outline" onClick={() => setSelectedProvider(null)}>Close</Button>
              <Button variant="danger" onClick={() => { verifyProvider(selectedProvider.id, false); setSelectedProvider(null); }}>Reject & Decline</Button>
              <Button variant="primary" onClick={() => { verifyProvider(selectedProvider.id, true); setSelectedProvider(null); }}>Approve & Verify Account</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}