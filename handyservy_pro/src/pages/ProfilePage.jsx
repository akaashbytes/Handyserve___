import React, { useState } from 'react';
import { useAuth } from "../components/context/AuthContext";
import { Card, Button, Input, Avatar, Badge, SectionHeader, Toast } from '../components/common/UI';

export default function ProfilePage() {
  const { user, updateUser, bookings } = useAuth();

  // Calculate dynamic breakdowns
  let completionRate = 0;
  let avgRating = 0;
  if (user?.role === 'provider') {
    const providerBookings = bookings.filter(b => b.serviceProviderId === user?.id || (!b.serviceProviderId && b.providerName === user?.name));
    const completed = providerBookings.filter(b => b.status === 'Completed');
    const cancelled = providerBookings.filter(b => b.status === 'Cancelled');
    const totalFinished = completed.length + cancelled.length;
    completionRate = totalFinished > 0 ? Math.round((completed.length / totalFinished) * 100) : 0;
    const rated = completed.filter(b => b.rating !== null && b.rating !== undefined);
    avgRating = rated.length > 0 ? rated.reduce((sum, b) => sum + b.rating, 0) / rated.length : 0;
  } else if (user?.role === 'customer') {
    const customerBookings = bookings.filter(b => b.customerId === user?.id || !b.customerId);
    const completed = customerBookings.filter(b => b.status === 'Completed');
    const cancelled = customerBookings.filter(b => b.status === 'Cancelled');
    const totalFinished = completed.length + cancelled.length;
    completionRate = totalFinished > 0 ? Math.round((completed.length / totalFinished) * 100) : 0;
    const rated = completed.filter(b => b.rating !== null && b.rating !== undefined);
    avgRating = rated.length > 0 ? rated.reduce((sum, b) => sum + b.rating, 0) / rated.length : 0;
  }
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(user?.name    || '');
  const [phone, setPhone]     = useState(user?.phone   || '');
  const [address, setAddress] = useState(
    user?.displayAddress ||
    [user?.location, user?.city, user?.state].filter(Boolean).join(', ') ||
    ''
  );
  const [emergencyName, setEmergencyName] = useState(user?.emergencyContactName || '');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergencyContactPhone || '');
  const [emergencyRelationship, setEmergencyRelationship] = useState(user?.emergencyContactRelationship || '');
  const [saving, setSaving]   = useState(false);
  const [toast,  setToast]    = useState(null);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        setSaving(true);
        try {
          await updateUser({ profilePhoto: dataUrl });
          setToast({ message: 'Profile photo updated successfully!', type: 'success' });
        } catch (err) {
          setToast({ message: err.message || 'Failed to update profile photo.', type: 'error' });
        } finally {
          setSaving(false);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateUser({
        name:    name.trim(),
        phone:   phone.trim(),
        address: address.trim(),
        displayAddress: address.trim() || undefined,
        emergencyContactName: emergencyName.trim(),
        emergencyContactPhone: emergencyPhone.trim(),
        emergencyContactRelationship: emergencyRelationship.trim(),
      });
      setEditing(false);
      setToast({ message: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in-up" style={{ padding: '32px 36px', maxWidth: '700px' }}>
      <SectionHeader title="My Profile" />

      <Card padding="24px 28px" style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ position: 'relative' }}>
          <Avatar initials={user?.avatar} size={72} src={user?.profilePhoto} />
          <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} id="profile-photo-upload-input" />
          <label htmlFor="profile-photo-upload-input" style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, background: 'var(--brand)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', border: '2px solid var(--bg-card)', cursor: 'pointer' }}>✏️</label>
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{user?.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginBottom: '10px' }}>{user?.email}</p>
          <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
            <Badge color="brand" style={{ textTransform: 'capitalize' }}>{user?.role}</Badge>
            {user?.verified && <Badge color="success">✓ Verified</Badge>}
          </div>
        </div>
        <Button variant={editing ? 'outline' : 'soft'} size="sm" onClick={() => setEditing(e => !e)}>
          {editing ? 'Cancel' : '✏️ Edit Profile'}
        </Button>
      </Card>

      <Card padding="24px" style={{ marginBottom: '18px' }}>
        <p style={{ fontWeight: 700, marginBottom: '18px', fontSize: '15px', color: 'var(--text-primary)' }}>
          {user?.role === 'provider' ? 'Service Details' : 'Personal Information'}
        </p>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input label="Full Name"     value={name}    onChange={e => setName(e.target.value)}    icon="👤" />
            <Input label="Phone Number"  value={phone}   onChange={e => setPhone(e.target.value)}   icon="📱" />
            <Input label="Address"       value={address} onChange={e => setAddress(e.target.value)} icon="🏠" />
            
            {user?.role === 'provider' && (
              <>
                <Input label="Service Locations (comma separated)" defaultValue="Anna Nagar, Shenoy Nagar" icon="📍" />
                <Input label="Service Radius (km)" defaultValue="10" icon="🌐" type="number" />
                <Input label="Working Hours" defaultValue="9:00 AM - 6:00 PM" icon="🕒" />
              </>
            )}

            {user?.role === 'customer' && (
              <>
                <Input label="Emergency Contact Name" value={emergencyName} onChange={e => setEmergencyName(e.target.value)} icon="👤" />
                <Input label="Emergency Contact Phone" value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} icon="📱" />
                <Input label="Emergency Contact Relationship" value={emergencyRelationship} onChange={e => setEmergencyRelationship(e.target.value)} icon="💞" />
              </>
            )}
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { icon: '📧', label: 'Email',   value: user?.email },
              { icon: '📱', label: 'Phone',   value: user?.phone   || 'Not set' },
              { icon: '🏠', label: 'Address', value:
                  user?.displayAddress ||
                  [user?.location, user?.city, user?.state].filter(Boolean).join(', ') ||
                  'Not set'
              },
              ...(user?.role === 'provider' ? [
                { icon: '📍', label: 'Service City',   value: user?.serviceCity || user?.city || 'Not set' },
                { icon: '🌐', label: 'Service Radius', value: user?.radius ? `${user.radius} km` : '10 km' },
                { icon: '🕒', label: 'Working Hours',  value: user?.timing || '9:00 AM – 6:00 PM' },
                { icon: '🔧', label: 'Service Type',   value: user?.serviceType || 'General Handyman' },
              ] : [])
            ].map((f, i, arr) => (
              <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>{f.icon}</div>
                <div>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '2px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</p>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>{f.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>



      {/* Reliability Score */}
      {user?.role === 'provider' && (
        <Card padding="24px" style={{ marginBottom: '18px' }}>
          <p style={{ fontWeight: 700, marginBottom: '18px', fontSize: '15px', color: 'var(--text-primary)' }}>
            📊 Reliability Score
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative', width: 90, height: 90, flexShrink: 0 }}>
              <svg width="90" height="90" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r="38" fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle cx="45" cy="45" r="38" fill="none" stroke="var(--brand)" strokeWidth="8"
                  strokeDasharray={`${((user?.reliabilityScore ?? 0) / 100) * 238.76} 238.76`}
                  strokeLinecap="round" transform="rotate(-90 45 45)" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: 'var(--brand)', lineHeight: 1 }}>
                  {user?.reliabilityScore ?? 0}
                </p>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/ 100</p>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {user?.role === 'provider' ? 'Top Professional' : 'Excellent Customer'}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                {user?.role === 'provider' 
                  ? 'Based on job completion, punctuality, and customer ratings.'
                  : 'Based on payment history, cancellations, and reviews.'}
              </p>
              {(user?.role === 'provider' ? [
                { label: 'Job Completion', score: completionRate },
                { label: 'Punctuality', score: completionRate },
                { label: 'Customer Ratings', score: Math.round(avgRating * 20) },
              ] : [
                { label: 'On-time Payments', score: completionRate },
                { label: 'Low Cancellations', score: completionRate },
                { label: 'Quality Reviews', score: Math.round(avgRating * 20) },
              ]).map((s, i) => (
                <div key={i} style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{s.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand)' }}>{s.score}%</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--bg-elevated)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ width: `${s.score}%`, height: '100%', background: 'linear-gradient(90deg, var(--brand), #8B5CF6)', borderRadius: 10 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Emergency Contact */}
      <Card padding="24px" style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>🆘 Emergency Contact</p>
          <Button size="sm" variant="soft" onClick={() => setEditing(true)}>Edit</Button>
        </div>
        {[
          { icon: '👤', label: 'Name',         value: user?.emergencyContactName         || 'Not set' },
          { icon: '📱', label: 'Phone',        value: user?.emergencyContactPhone        || 'Not set' },
          { icon: '💞', label: 'Relationship', value: user?.emergencyContactRelationship || 'Not set' },
        ].map((f, i, arr) => (
          <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
            <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: 'var(--danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{f.icon}</div>
            <div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '2px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</p>
              <p style={{ fontSize: '14px', fontWeight: 500, color: f.value === 'Not set' ? 'var(--text-muted)' : 'var(--text-primary)', fontStyle: f.value === 'Not set' ? 'italic' : 'normal' }}>{f.value}</p>
            </div>
          </div>
        ))}
      </Card>



      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}