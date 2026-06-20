import React, { useState } from 'react';
import { Card, Button, Avatar, Toast } from './UI';
import { useAuth } from '../context/AuthContext';

export default function FeedbackPanel({ booking, onClose }) {
  const { user, createDispute, rateBooking } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [issue, setIssue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState('rate');

  const ISSUES = [
    'Provider arrived late',
    'Work quality was poor',
    'Charged more than quoted',
    'Provider was unprofessional',
    'Job left incomplete',
    'Other',
  ];

  const handleSubmit = () => {
    if (tab === 'rate') {
      if (rating === 0) {
        setToast({ message: 'Please select a rating first!', type: 'error' });
        return;
      }
      rateBooking(booking?.id, rating).catch(err => console.error(err));
    } else {
      if (!issue) {
        setToast({ message: 'Please select an issue to report.', type: 'error' });
        return;
      }
      createDispute({
        bookingId: booking?.id || 'Unknown',
        customerId: user?.id,
        customer: user?.name || 'Customer',
        customerEmail: user?.email || '',
        providerId: booking?.serviceProviderId || '',
        provider: booking?.providerName || 'Unknown',
        providerEmail: booking?.providerEmail || '',
        source: 'web',
        issueCategory: issue,
        priority: issue === 'Charged more than quoted' || issue === 'Job left incomplete' ? 'High' : 'Medium',
        issue: `${issue}${review ? ` - ${review}` : ''}`,
        amount: booking?.amount || 0,
      });
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
        <Card padding="40px" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 20px' }}>⭐</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Thank you!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Your feedback helps us improve HandyServe Pro.</p>
          <Button fullWidth onClick={onClose}>Close</Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', animation: 'fadeIn 0.2s ease' }}>
      <Card padding="32px" style={{ width: '100%', maxWidth: '480px', animation: 'fadeInUp 0.3s ease' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Rate Your Experience
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
        </div>

        {/* Provider info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
          <Avatar initials={booking?.providerName?.substring(0, 2).toUpperCase() || 'PR'} size={44} />
          <div>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{booking?.providerName || 'Service Provider'}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{booking?.service || 'Service'} · {booking?.date || 'Recent'}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '4px', marginBottom: '24px' }}>
          {[{ val: 'rate', label: '⭐ Rate Service' }, { val: 'issue', label: '⚠️ Report Issue' }].map(t => (
            <button key={t.val} onClick={() => setTab(t.val)}
              style={{ flex: 1, padding: '9px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: tab === t.val ? 'var(--bg-card)' : 'transparent', color: tab === t.val ? 'var(--brand)' : 'var(--text-secondary)', fontWeight: tab === t.val ? 700 : 400, fontSize: '13.5px', transition: 'var(--transition)', fontFamily: 'var(--font-body)', boxShadow: tab === t.val ? 'var(--shadow-sm)' : 'none' }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'rate' ? (
          <>
            {/* Star Rating */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '14px', fontWeight: 500 }}>How was the service?</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    style={{ background: 'none', border: 'none', fontSize: '40px', cursor: 'pointer', transition: 'transform 0.15s ease', transform: (hover || rating) >= star ? 'scale(1.15)' : 'scale(1)', color: (hover || rating) >= star ? '#F59E0B' : 'var(--border)' }}>
                    ★
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--brand)', fontWeight: 600, minHeight: '20px' }}>
                {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : rating === 5 ? 'Excellent!' : ''}
              </p>
            </div>

            {/* Review Text */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Write a review (optional)</label>
              <textarea value={review} onChange={e => setReview(e.target.value)} placeholder="Share your experience..."
                style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', resize: 'vertical', minHeight: '90px', fontFamily: 'var(--font-body)' }}
                onFocus={e => { e.target.style.borderColor = 'var(--brand)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
              />
            </div>
          </>
        ) : (
          <>
            {/* Issue Report */}
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '14px', fontWeight: 500 }}>What went wrong?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {ISSUES.map(i => (
                <button key={i} onClick={() => setIssue(i)}
                  style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${issue === i ? 'var(--danger)' : 'var(--border)'}`, background: issue === i ? 'var(--danger-light)' : 'var(--bg-input)', color: issue === i ? 'var(--danger)' : 'var(--text-secondary)', fontSize: '13.5px', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', fontWeight: issue === i ? 600 : 400, transition: 'var(--transition)' }}>
                  {issue === i ? '● ' : '○ '}{i}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Additional details</label>
              <textarea value={review} onChange={e => setReview(e.target.value)} placeholder="Describe the issue in detail..."
                style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', resize: 'vertical', minHeight: '80px', fontFamily: 'var(--font-body)' }}
                onFocus={e => { e.target.style.borderColor = 'var(--brand)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
              />
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="outline" fullWidth onClick={onClose}>Cancel</Button>
          <Button fullWidth onClick={handleSubmit}>
            {tab === 'rate' ? 'Submit Rating' : 'Report Issue'}
          </Button>
        </div>
      </Card>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}