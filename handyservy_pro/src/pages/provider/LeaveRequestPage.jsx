import React, { useState } from 'react';
import { useAuth } from '../../components/context/AuthContext';
import { Card, Button, Input, SectionHeader, Badge, StatusBadge } from '../../components/common/UI';

const TIME_SLOTS = [
  '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', 
  '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'
];

export default function LeaveRequestPage() {
  const { user, leaveRequests, createLeaveRequest } = useAuth();
  const [date, setDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const myLeaves = leaveRequests.filter(l => l.providerId === user.id);

  const toggleSlot = (slot) => {
    setSelectedSlots(prev => 
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || selectedSlots.length === 0 || !reason) {
      setError('Please fill all fields and select at least one time slot.');
      return;
    }

    // Validation: Cannot submit for same date if already pending or approved
    const existing = myLeaves.find(l => l.date === date && (l.status === 'pending' || l.status === 'approved'));
    if (existing) {
      setError(`You already have a ${existing.status} request for this date.`);
      return;
    }

    setLoading(true);
    try {
      await createLeaveRequest({
        providerId: user.id,
        providerName: user.name,
        skill: user.serviceType || 'Handyman',
        date,
        timeSlots: selectedSlots,
        reason
      });
      setSuccess('Off day request submitted successfully!');
      setDate('');
      setSelectedSlots([]);
      setReason('');
      setError('');
    } catch {
      setError('Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up" style={{ padding: '32px 36px', maxWidth: '800px' }}>
      <SectionHeader title="Apply for Off Day" subtitle="Manage your off-time and blocked slots" />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Form */}
        <Card padding="28px">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && <Badge color="danger">{error}</Badge>}
            {success && <Badge color="success">{success}</Badge>}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Off Day Date *</label>
              <input type="date" value={date} min={new Date().toISOString().split('T')[0]} onChange={e => setDate(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Select Time Slots to Block *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {TIME_SLOTS.map(slot => (
                  <button key={slot} type="button" onClick={() => toggleSlot(slot)}
                    style={{ padding: '6px 12px', borderRadius: '15px', fontSize: '12px', cursor: 'pointer', background: selectedSlots.includes(slot) ? 'var(--brand)' : 'var(--bg-card)', color: selectedSlots.includes(slot) ? '#fff' : 'var(--text-secondary)', border: '1px solid var(--border)', transition: 'all 0.2s', fontWeight: 500 }}>
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Reason for Off Day *</label>
              <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Emergency, Personal work, etc."
                style={{ width: '100%', minHeight: '80px', padding: '10px 14px', background: 'var(--bg-input)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', resize: 'vertical' }} />
            </div>

            <Button type="submit" fullWidth disabled={loading}>{loading ? 'Submitting...' : 'Submit Request'}</Button>
          </form>
        </Card>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card padding="20px" style={{ background: 'var(--brand-glow)', borderColor: 'var(--brand)' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brand)', marginBottom: '8px' }}>Pro Tip 🛡️</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Applying for an off day blocks customers from booking those specific slots. Ensure you apply at least 24 hours in advance for approval.
            </p>
          </Card>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
             <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>My Off Day History</p>
             {myLeaves.length === 0 ? (
               <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No previous off day requests.</p>
             ) : (
               myLeaves.map(l => (
                 <Card key={l.id} padding="14px">
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                     <div>
                       <p style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)' }}>{l.date}</p>
                       <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{l.timeSlots.length} slots: {l.timeSlots.join(', ')}</p>
                     </div>
                     <StatusBadge status={l.status} />
                   </div>
                 </Card>
               ))
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
