import React, { useState } from 'react';
import { useAuth } from '../../components/context/AuthContext';
import { Card, SectionHeader, Button, Badge, Toast } from '../../components/common/UI';

const PROVIDER_ACTIONS = [
  { id: 'clarification', label: 'Submit Clarification', nextStatus: 'Pending', note: 'Provider submitted service clarification and completion proof.' },
  { id: 'partial_refund', label: 'Offer Partial Refund', nextStatus: 'Pending', note: 'Provider suggested a partial refund as a goodwill resolution.' },
  { id: 'request_evidence', label: 'Request More Evidence', nextStatus: 'Pending Provider Reply', note: 'Provider requested additional evidence from customer/admin.' },
  { id: 'accept_fault', label: 'Accept Issue & Close', nextStatus: 'Resolved', note: 'Provider accepted the issue and requested closure after corrective action.' },
];

export default function ProviderDisputes() {
  const { user, disputes, updateDisputeStatus, addDisputeUpdate } = useAuth();
  const [selectedAction, setSelectedAction] = useState({});
  const [notes, setNotes] = useState({});
  const [toast, setToast] = useState(null);

  const providerTickets = (disputes || []).filter(d =>
    d.providerId === user?.id || d.provider === user?.name
  );

  const openReplyMail = (ticket) => {
    if (!ticket.customerEmail) {
      setToast({ message: 'Customer email is not available for this ticket.', type: 'error' });
      return;
    }
    const subject = encodeURIComponent(`Provider reply on dispute ${ticket.id}`);
    const body = encodeURIComponent(
      `Hi ${ticket.customer || 'Customer'},\n\n` +
      `This is ${user?.name || 'Provider'} regarding your dispute (${ticket.id}).\n` +
      `Please find my response below:\n\n${notes[ticket.id] || ''}\n\nRegards,\n${user?.name || 'Provider'}`
    );
    window.location.href = `mailto:${ticket.customerEmail}?subject=${subject}&body=${body}`;
  };

  const submitAction = (ticket) => {
    const actionId = selectedAction[ticket.id];
    const action = PROVIDER_ACTIONS.find(a => a.id === actionId);
    if (!action) {
      setToast({ message: 'Please choose a dispute action first.', type: 'error' });
      return;
    }
    const providerNote = (notes[ticket.id] || '').trim();
    const finalNote = providerNote ? `${action.note} Provider note: ${providerNote}` : action.note;
    updateDisputeStatus(ticket.id, action.nextStatus);
    addDisputeUpdate(ticket.id, {
      actor: user?.name || 'Provider',
      actorRole: 'provider',
      note: finalNote,
    });
    setToast({ message: `Ticket ${ticket.id} updated successfully.`, type: 'success' });
  };

  return (
    <div className="animate-fade-in-up" style={{ padding: '32px 36px', maxWidth: '1040px' }}>
      <SectionHeader title="Dispute Tickets" subtitle="Respond to customer tickets with detailed provider actions" />

      {providerTickets.length === 0 ? (
        <Card padding="40px" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>✅</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>No Disputes Assigned</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You do not have any active customer tickets right now.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {providerTickets.map(ticket => (
            <Card key={ticket.id} padding="22px">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Badge color="danger">#{ticket.id}</Badge>
                  <Badge color={ticket.priority === 'High' ? 'danger' : ticket.priority === 'Low' ? 'muted' : 'warning'}>{ticket.priority || 'Medium'} Priority</Badge>
                  <Badge color="info">{ticket.status}</Badge>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Booking #{ticket.bookingId}</p>
              </div>

              <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 600 }}>{ticket.issueCategory || 'General issue'}</p>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '12px' }}>{ticket.issue}</p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>👤 {ticket.customer}</p>
                {ticket.customerEmail && <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>✉️ {ticket.customerEmail}</p>}
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>💰 ₹{ticket.amount}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr auto', gap: '10px', alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Choose Action</label>
                  <select
                    value={selectedAction[ticket.id] || ''}
                    onChange={(e) => setSelectedAction(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                  >
                    <option value="">Select...</option>
                    {PROVIDER_ACTIONS.map(action => <option key={action.id} value={action.id}>{action.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Action Note</label>
                  <input
                    value={notes[ticket.id] || ''}
                    onChange={(e) => setNotes(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                    placeholder="Add details for admin/customer..."
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                  />
                </div>
                <Button onClick={() => submitAction(ticket)}>Update Ticket</Button>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <Button variant="outline" size="sm" onClick={() => openReplyMail(ticket)}>Reply by Mail</Button>
                <Button
                  variant="soft"
                  size="sm"
                  onClick={() => {
                    addDisputeUpdate(ticket.id, {
                      actor: user?.name || 'Provider',
                      actorRole: 'provider',
                      note: 'Provider requested admin callback for quick resolution.',
                    });
                    setToast({ message: `Escalated ${ticket.id} to admin team.`, type: 'info' });
                  }}
                >
                  Escalate to Admin
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
