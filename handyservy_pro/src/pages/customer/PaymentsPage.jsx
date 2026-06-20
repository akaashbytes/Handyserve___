import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, SectionHeader } from '../../components/common/UI';
import { useAuth } from '../../components/context/AuthContext';

export default function PaymentsPage() {
  const { 
    user, 
    updateBookingStatus, 
    validatePromo, 
    apiFetch,
    bookings,
    initiatePayment,
    verifyPayment
  } = useAuth();
  
  const [summary, setSummary] = useState({ totalPaid: 0, totalDue: 0, pendingCount: 0 });
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promo, setPromo] = useState('');
  const [discount, setDiscount] = useState(null);
  const [promoError, setPromoError] = useState('');
  
  // Local state to track newly paid invoices in this session
  const [paidInvoices, setPaidInvoices] = useState([]);
  const [activePaymentMethod, setActivePaymentMethod] = useState('UPI');
  const [isProcessing, setIsProcessing] = useState(null);
  
  // Payment Modal state
  const [paymentModal, setPaymentModal] = useState({ open: false, invoiceId: null, amount: 0 });

  const loadPaymentData = async () => {
    setLoading(true);
    try {
      const summaryRes = await apiFetch('/api/customer/payments/summary');
      const invoicesRes = await apiFetch('/api/customer/payments/invoices');
      if (summaryRes.ok && invoicesRes.ok) {
        const sData = await summaryRes.json();
        const iData = await invoicesRes.json();
        setSummary(sData);
        setInvoices(iData);
      }
    } catch (e) {
      console.error('Failed to load payment details', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentData();
  }, [apiFetch, paidInvoices, bookings]);

  const applyPromo = async () => {
    if (!promo) return;
    try {
      const res = await validatePromo(promo.toUpperCase());
      if (res) {
        setDiscount({
          code: res.code,
          discount: res.value,
          type: res.type ? res.type.toLowerCase() : 'percent',
          desc: res.label || `${res.value}% discount`
        });
        setPromoError('');
      } else {
        setPromoError('Invalid or expired code.');
        setDiscount(null);
      }
    } catch (e) {
      setPromoError('Invalid code. Try: SUMMER10, FIRST50');
      setDiscount(null);
    }
  };
  
  const invoicesWithDiscount = invoices.map(b => {
    let total = b.amount || 0;
    if (discount && !b.isPaid) {
      if (discount.type === 'percent') total = total - (total * discount.discount / 100);
      if (discount.type === 'flat') total = Math.max(0, total - discount.discount);
    }
    return {
      ...b,
      total,
      tax: Math.round(total * 0.05),
    };
  });

  const handlePay = (id, amount) => {
    setPaymentModal({ open: true, invoiceId: id, amount });
  };

  const confirmPayment = async (e) => {
    e.preventDefault();
    const id = paymentModal.invoiceId;
    setPaymentModal({ open: false, invoiceId: null, amount: 0 });
    setIsProcessing(id);
    
    try {
      // 1. Initiate Payment via Context
      await initiatePayment(id);
      
      // 2. Simulating gateway response with paymentId and signature
      const paymentId = `pay_${Math.random().toString(36).substring(2, 11)}`;
      const signature = `sig_${Math.random().toString(36).substring(2, 11)}`;
      
      // 3. Verify Payment via Context
      await verifyPayment(id, paymentId, signature, activePaymentMethod);
      
      setPaidInvoices(prev => [...prev, id]);
      setIsProcessing(null);
      setPromo('');
      setDiscount(null);
    } catch (err) {
      console.error('Payment processing failed:', err);
      setIsProcessing(null);
      alert('Payment processing failed. Please try again.');
    }
  };

  return (
    <div className="animate-fade-in-up" style={{ padding: '32px 36px', maxWidth: '860px' }}>
      <SectionHeader title="Payments & Billing" subtitle="Track invoices, apply promos, and manage payments" />

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <Card style={{ background: 'linear-gradient(135deg, #10B981, #047857)', border: 'none' }} padding="22px">
          <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Paid</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color: '#fff' }}>₹{Math.round(summary.totalPaid).toLocaleString()}</p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '6px' }}>All settled</p>
        </Card>
        <Card style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', border: 'none' }} padding="22px">
          <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount Due</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color: '#fff' }}>₹{Math.round(summary.totalDue).toLocaleString()}</p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginTop: '6px' }}>{summary.pendingCount} pending invoice{summary.pendingCount !== 1 ? 's' : ''}</p>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card padding="22px" style={{ marginBottom: '20px' }}>
        <p style={{ fontWeight: 700, marginBottom: '14px', fontSize: '15px', color: 'var(--text-primary)' }}>💳 Payment Methods</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[{ icon: '📱', label: 'UPI', sub: 'Instant transfer' }, { icon: '💳', label: 'Card', sub: 'Visa/Mastercard' }, { icon: '👛', label: 'Wallet', sub: 'Stored balance' }].map(m => (
            <div key={m.label} onClick={() => setActivePaymentMethod(m.label)}
              style={{ padding: '14px 20px', background: activePaymentMethod === m.label ? 'var(--brand-light)' : 'var(--bg-elevated)', border: `1.5px solid ${activePaymentMethod === m.label ? 'var(--brand)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', transition: 'var(--transition)', flex: 1, minWidth: '120px' }}>
              <span style={{ fontSize: '22px' }}>{m.icon}</span>
              <div>
                <p style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)' }}>{m.label}</p>
                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{m.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <p style={{ fontWeight: 700, marginBottom: '12px', fontSize: '16px', color: 'var(--text-primary)' }}>Invoice History</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'inline-block', width: 20, height: 20, border: '2px solid var(--border)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: 8 }}>Loading invoices...</p>
          </div>
        ) : invoicesWithDiscount.length > 0 ? invoicesWithDiscount.map(inv => (
          <Card key={inv.id} padding="18px 22px">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🧾</div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '14.5px', color: 'var(--text-primary)', marginBottom: '2px' }}>{inv.service} — {inv.id}</p>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>📅 {inv.date} · {inv.isPaid ? 'Paid via ' + activePaymentMethod : 'Pending'} · GST: ₹{inv.tax}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <p style={{ fontWeight: 800, fontSize: '17px', color: 'var(--brand)' }}>₹{Math.round(inv.total)}</p>
                <Badge color={inv.isPaid ? 'success' : 'warning'}>{inv.isPaid ? 'Paid' : 'Due'}</Badge>
                {!inv.isPaid && (
                  <Button size="sm" loading={isProcessing === inv.id} onClick={() => handlePay(inv.id, Math.round(inv.total))}>
                    Pay Now
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )) : (
          <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No invoices found.</p>
        )}
      </div>

      {/* Payment Modal */}
      {paymentModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', animation: 'fadeIn 0.2s ease' }}>
          <Card padding="32px" style={{ width: '100%', maxWidth: '440px', animation: 'fadeInUp 0.3s ease', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Pay ₹{discount 
                  ? (discount.type === 'percent' ? paymentModal.amount - (paymentModal.amount * discount.discount / 100) : Math.max(0, paymentModal.amount - discount.discount)) 
                  : paymentModal.amount}
              </h3>
              <button onClick={() => { setPaymentModal({ open: false }); setPromo(''); setDiscount(null); }} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>

            {/* Promo Code Inside Modal */}
            <div style={{ marginBottom: '24px', padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
              <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', marginBottom: '8px' }}>🎟️ Have a Promo Code?</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={promo} onChange={e => setPromo(e.target.value.toUpperCase())} placeholder="e.g. FIRST50"
                  style={{ flex: 1, padding: '8px 12px', background: 'var(--bg-input)', border: `1px solid ${promoError ? 'var(--danger)' : 'var(--border)'}`, borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
                <Button size="sm" onClick={applyPromo}>Apply</Button>
              </div>
              {promoError && <p style={{ fontSize: '11.5px', color: 'var(--danger)', marginTop: '6px' }}>{promoError}</p>}
              {discount && <div style={{ marginTop: '8px', padding: '8px', background: 'var(--success-light)', borderRadius: 'var(--radius-sm)', color: '#065F46', fontSize: '12px', fontWeight: 500 }}>✅ {discount.desc} applied!</div>}
            </div>

            <form onSubmit={confirmPayment}>
              {activePaymentMethod === 'UPI' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1.5px dashed var(--border)' }}>
                    <div style={{ width: 120, height: 120, background: '#fff', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                       <div style={{ width: '100%', height: '100%', background: 'repeating-linear-gradient(45deg, #000 0, #000 5px, transparent 5px, transparent 10px)', opacity: 0.5 }}></div>
                    </div>
                    <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>Scan QR code with any UPI app</p>
                  </div>
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>OR</div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Enter UPI ID</label>
                    <input type="text" required placeholder="username@upi" style={{ width: '100%', padding: '12px', background: 'var(--bg-input)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }} />
                  </div>
                </div>
              )}

              {activePaymentMethod === 'Card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Card Number</label>
                    <input type="text" required placeholder="0000 0000 0000 0000" maxLength="19" style={{ width: '100%', padding: '12px', background: 'var(--bg-input)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Expiry (MM/YY)</label>
                      <input type="text" required placeholder="12/25" maxLength="5" style={{ width: '100%', padding: '12px', background: 'var(--bg-input)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>CVV</label>
                      <input type="password" required placeholder="•••" maxLength="3" style={{ width: '100%', padding: '12px', background: 'var(--bg-input)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Name on Card</label>
                    <input type="text" required placeholder="John Doe" style={{ width: '100%', padding: '12px', background: 'var(--bg-input)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }} />
                  </div>
                </div>
              )}

              {activePaymentMethod === 'Wallet' && (
                <div style={{ padding: '24px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                   <div style={{ fontSize: '40px', marginBottom: '12px' }}>👛</div>
                   <p style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 600 }}>HandyServe Wallet</p>
                   <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>Available Balance: <b>₹1,500</b></p>
                   <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '16px' }}>₹{paymentModal.amount} will be deducted securely.</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                <Button variant="outline" type="button" fullWidth onClick={() => setPaymentModal({ open: false })}>Cancel</Button>
                <Button fullWidth type="submit">Pay Securely</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}