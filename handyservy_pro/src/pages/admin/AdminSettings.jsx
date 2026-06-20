import React, { useState, useEffect } from 'react';
import { Card, Button, Input, SectionHeader, Toast } from '../../components/common/UI';
import { getIcon } from '../../components/common/Icons';
import { useAuth } from '../../components/context/AuthContext';




export default function AdminSettings() {
  const { fetchPromoCodes, createPromoCode, togglePromoCodeActive, deletePromoCode } = useAuth();
  const [toast, setToast]       = useState(null);
  const [maintenance, setMaintenance] = useState(false);
  const [fees, setFees] = useState({
    platformFee:   '10',
    gstRate:       '5',
    cancellationFee: '50',
  });
  const [platform, setPlatform] = useState({
    name:    'HandyServe Pro',
    email:   'ramaiahakaash51@gmail.com',
    phone:   '+91 99887 76655',
    address: 'Guindy, Chennai - 600032',
  });

  // Promo Codes State
  const [promoCodes, setPromoCodes] = useState([]);
  const [newPromo, setNewPromo] = useState({ code: '', label: '', type: 'percent', value: '', expiresAt: '' });

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    try {
      const data = await fetchPromoCodes();
      setPromoCodes(data || []);
    } catch (e) {
      console.error('Failed to fetch promo codes:', e);
    }
  };

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    if (!newPromo.code || !newPromo.value) {
      setToast({ message: 'Code and Value are required.', type: 'danger' });
      return;
    }
    try {
      await createPromoCode({
        code: newPromo.code.toUpperCase().trim(),
        label: newPromo.label.trim(),
        type: newPromo.type,
        value: parseFloat(newPromo.value),
        expiresAt: newPromo.expiresAt ? newPromo.expiresAt + 'T23:59:59' : null,
        active: true
      });
      setNewPromo({ code: '', label: '', type: 'percent', value: '', expiresAt: '' });
      setToast({ message: 'Promo code created successfully!', type: 'success' });
      loadPromoCodes();
    } catch (e) {
      setToast({ message: 'Failed to create promo code (possibly duplicate).', type: 'danger' });
    }
  };

  const handleTogglePromo = async (id, currentActive) => {
    try {
      await togglePromoCodeActive(id, !currentActive);
      setToast({ message: `Promo code ${!currentActive ? 'activated' : 'deactivated'} successfully!`, type: 'success' });
      loadPromoCodes();
    } catch (e) {
      setToast({ message: 'Failed to toggle promo code status.', type: 'danger' });
    }
  };

  const handleDeletePromo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promo code?')) return;
    try {
      await deletePromoCode(id);
      setToast({ message: 'Promo code deleted successfully!', type: 'success' });
      loadPromoCodes();
    } catch (e) {
      setToast({ message: 'Failed to delete promo code.', type: 'danger' });
    }
  };

  const save = () => setToast({ message: 'Settings saved successfully!', type: 'success' });

  return (
    <div className="animate-fade-in-up" style={{ padding: '32px 36px', maxWidth: '760px' }}>
      <SectionHeader title="Platform Settings" subtitle="Configure HandyServe Pro settings" />

      {/* Maintenance Mode */}
      <Card padding="20px 24px" style={{ marginBottom: '18px', background: maintenance ? 'var(--warning-light)' : 'var(--bg-card)', borderColor: maintenance ? 'var(--warning)' : 'var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ width: 46, height: 46, borderRadius: 'var(--radius-md)', background: 'var(--warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{getIcon('⚠️', { size: 20 })}</div>
            <div>
              <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>Maintenance Mode</p>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {maintenance ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>{getIcon('⚠️', { size: 14 })} <span>Platform is currently in maintenance mode</span></span> : 'Platform is live and accepting bookings'}
              </p>
            </div>
          </div>
          <div onClick={() => setMaintenance(m => !m)}
            style={{ width: 46, height: 26, borderRadius: 13, background: maintenance ? 'var(--warning)' : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'var(--transition)', flexShrink: 0 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: maintenance ? 23 : 3, transition: 'var(--transition)', boxShadow: 'var(--shadow-sm)' }} />
          </div>
        </div>
      </Card>

      {/* Platform Info */}
      <Card padding="24px" style={{ marginBottom: '18px' }}>
        <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '18px' }}>{getIcon('⊞', { size: 16 })} Platform Information</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Platform Name"  value={platform.name}    onChange={e => setPlatform(p => ({ ...p, name: e.target.value }))}    icon="🏷️" />
          <Input label="Support Email"  value={platform.email}   onChange={e => setPlatform(p => ({ ...p, email: e.target.value }))}   icon="✉️" />
          <Input label="Support Phone"  value={platform.phone}   onChange={e => setPlatform(p => ({ ...p, phone: e.target.value }))}   icon="📱" />
          <Input label="Office Address" value={platform.address} onChange={e => setPlatform(p => ({ ...p, address: e.target.value }))} icon="📍" />
        </div>
      </Card>

      {/* Fee Settings */}
      <Card padding="24px" style={{ marginBottom: '18px' }}>
        <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '18px' }}>{getIcon('💰', { size: 16 })} Fee Configuration</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: '5px' }}>Platform Fee (%)</label>
            <input type="number" value={fees.platformFee} onChange={e => setFees(f => ({ ...f, platformFee: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: '5px' }}>GST Rate (%)</label>
            <input type="number" value={fees.gstRate} onChange={e => setFees(f => ({ ...f, gstRate: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: '5px' }}>Cancellation Fee (₹)</label>
            <input type="number" value={fees.cancellationFee} onChange={e => setFees(f => ({ ...f, cancellationFee: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-input)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }} />
          </div>
        </div>
      </Card>

      {/* Promo Codes Management */}
      <Card padding="24px" style={{ marginBottom: '18px' }}>
        <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '18px' }}>{getIcon('💰', { size: 16 })} Promo Code Management</p>
        
        {/* Create Form */}
        <form onSubmit={handleCreatePromo} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)' }}>
          <p style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)' }}>Create New Promo Code</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Promo Code" placeholder="SUMMER20" value={newPromo.code} onChange={e => setNewPromo(p => ({ ...p, code: e.target.value }))} />
            <Input label="Label / Description" placeholder="Summer 20% Off" value={newPromo.label} onChange={e => setNewPromo(p => ({ ...p, label: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Discount Type</label>
              <select value={newPromo.type} onChange={e => setNewPromo(p => ({ ...p, type: e.target.value }))}
                style={{ width: '100%', padding: '10px', background: 'var(--bg-input)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}>
                <option value="percent">Percent (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <Input label="Discount Value" type="number" placeholder="20" value={newPromo.value} onChange={e => setNewPromo(p => ({ ...p, value: e.target.value }))} />
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Expires At (Optional)</label>
              <input type="date" value={newPromo.expiresAt} onChange={e => setNewPromo(p => ({ ...p, expiresAt: e.target.value }))}
                style={{ width: '100%', padding: '8.5px 12px', background: 'var(--bg-input)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }} />
            </div>
          </div>
          <Button type="submit" size="sm" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>Add Promo Code</Button>
        </form>

        {/* List of Promos */}
        <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '12px' }}>Active Promo Codes</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
          {promoCodes.length > 0 ? promoCodes.map(promo => (
            <div key={promo.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{promo.code}</span>
                  <span style={{ fontSize: '11px', fontWeight: 500, padding: '2px 6px', borderRadius: '10px', background: 'var(--bg-base)', color: 'var(--text-secondary)' }}>
                    {promo.type === 'percent' ? `${promo.value}%` : `₹${promo.value}`}
                  </span>
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{promo.label}</p>
                {promo.expiresAt && <p style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '4px' }}>Expires: {new Date(promo.expiresAt).toLocaleDateString()}</p>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* Active Toggle */}
                <div onClick={() => handleTogglePromo(promo.id, promo.active)}
                  style={{ width: 38, height: 20, borderRadius: 10, background: promo.active ? 'var(--brand)' : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'var(--transition)' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: promo.active ? 21 : 3, transition: 'var(--transition)' }} />
                </div>
                {/* Delete Button */}
                <button onClick={() => handleDeletePromo(promo.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '14px', padding: '4px' }}>
                  🗑️
                </button>
              </div>
            </div>
          )) : (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12.5px', padding: '16px 0' }}>No promo codes available.</p>
          )}
        </div>
      </Card>

      <Button fullWidth size="lg" onClick={save}>Save All Settings</Button>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
