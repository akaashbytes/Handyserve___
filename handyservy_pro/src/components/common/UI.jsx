import React from 'react';
import { getIcon } from './Icons';

export function Button({ children, variant = 'primary', size = 'md', disabled, loading, onClick, style, type = 'button', fullWidth }) {
  const sizes = { sm: { padding: '6px 14px', fontSize: '12.5px' }, md: { padding: '10px 20px', fontSize: '14px' }, lg: { padding: '13px 28px', fontSize: '15px' } };
  const variants = {
    primary: { background: 'var(--brand)', color: '#fff', border: 'none', boxShadow: '0 2px 8px var(--brand-glow)' },
    outline: { background: 'transparent', color: 'var(--brand)', border: '1.5px solid var(--brand)' },
    ghost:   { background: 'transparent', color: 'var(--text-secondary)', border: 'none' },
    danger:  { background: 'var(--danger)', color: '#fff', border: 'none' },
    soft:    { background: 'var(--brand-light)', color: 'var(--brand)', border: 'none' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', fontFamily: 'var(--font-body)', fontWeight: 600, borderRadius: 'var(--radius-md)', cursor: disabled || loading ? 'not-allowed' : 'pointer', transition: 'var(--transition)', whiteSpace: 'nowrap', width: fullWidth ? '100%' : undefined, opacity: disabled || loading ? 0.55 : 1, letterSpacing: '0.01em', ...sizes[size], ...variants[variant], ...style }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.opacity = '0.88'; }}
      onMouseLeave={e => { if (!disabled && !loading) e.currentTarget.style.opacity = '1'; }}
    >
      {loading ? <Spinner size={14} color={variant === 'primary' ? '#fff' : 'var(--brand)'} /> : children}
    </button>
  );
}

export function Card({ children, style, onClick, hover = false, padding = '20px' }) {
  return (
    <div onClick={onClick}
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding, boxShadow: 'var(--shadow-xs)', transition: 'var(--transition)', cursor: onClick ? 'pointer' : undefined, ...style }}
      onMouseEnter={e => { if (hover || onClick) { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
      onMouseLeave={e => { if (hover || onClick) { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
    >{children}</div>
  );
}

export function Input({ label, type = 'text', name, value, onChange, placeholder, icon, error, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{label}{required && <span style={{ color: 'var(--danger)' }}> *</span>}</label>}
      <div style={{ position: 'relative' }}>
        {icon && <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '15px' }}>{getIcon(icon, { size: 16 })}</span>}
        <input 
          type={type} 
          name={name}
          value={value} 
          onChange={onChange} 
          placeholder={placeholder}
          {...(required ? { required: true } : {})}
          style={{ width: '100%', padding: icon ? '10px 12px 10px 38px' : '10px 14px', background: 'var(--bg-input)', border: `1.5px solid ${error ? 'var(--danger)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', transition: 'var(--transition)' }}
          onFocus={e => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px var(--brand-glow)'; }}
          onBlur={e => { e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)'; e.target.style.boxShadow = 'none'; }}
        />
      </div>
      {error && <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{error}</span>}
    </div>
  );
}

export function Badge({ children, color = 'brand' }) {
  const colors = {
    brand:   { bg: 'var(--brand-light)',   text: 'var(--brand)',   border: 'var(--brand-glow)' },
    success: { bg: 'var(--success-light)', text: 'var(--success)', border: 'rgba(16, 185, 129, 0.2)' },
    danger:  { bg: 'var(--danger-light)',  text: 'var(--danger)',  border: 'rgba(239, 68, 68, 0.2)' },
    warning: { bg: 'var(--warning-light)', text: 'var(--warning)', border: 'rgba(245, 158, 11, 0.2)' },
    muted:   { bg: 'var(--bg-elevated)',   text: 'var(--text-secondary)', border: 'var(--border)' },
    info:    { bg: 'var(--info-light)',    text: 'var(--info)',    border: 'rgba(59, 130, 246, 0.2)' },
  };
  const c = colors[color] || colors.brand;
  return <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: c.bg, color: c.text, border: `1px solid ${c.border}`, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>{children}</span>;
}

export function StatusBadge({ status }) {
  const map = { 
    'Requested': 'warning', 
    'Booked': 'warning', 
    'Accepted': 'info', 
    'On the way': 'info', 
    'Destination': 'info', 
    'Reached': 'brand', 
    'Reached Confirmed': 'success', 
    'Pending Payment': 'brand', 
    'Completed': 'success', 
    'Cancelled': 'danger', 
    'Rejected': 'danger' 
  };
  return <Badge color={map[status] || 'muted'}>{status === 'Requested' ? 'Booked' : status}</Badge>;
}

export function Avatar({ initials, size = 40, bg = 'var(--brand-light)', color = 'var(--brand)', src }) {
  if (src) {
    return (
      <img 
        src={src} 
        alt="avatar" 
        style={{ 
          width: size, 
          height: size, 
          borderRadius: '50%', 
          objectFit: 'cover', 
          flexShrink: 0, 
          border: '2px solid var(--border)' 
        }} 
      />
    );
  }
  return <div style={{ width: size, height: size, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size * 0.33, color, flexShrink: 0, border: '2px solid var(--border)' }}>{initials}</div>;
}

export function Spinner({ size = 20, color = 'var(--brand)' }) {
  return <div style={{ width: size, height: size, border: `2.5px solid var(--border)`, borderTop: `2.5px solid ${color}`, borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />;
}

export function StatCard({ label, value, icon, change, iconBg, color = 'var(--brand)', onClick }) {
  const isPositive = change && !change.startsWith('-');
  return (
    <Card onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
          <p style={{ fontSize: '26px', fontFamily: 'var(--font-display)', fontWeight: 700, color, lineHeight: 1.1 }}>{value}</p>
          {change && <p style={{ fontSize: '12px', color: isPositive ? 'var(--success)' : 'var(--danger)', marginTop: '6px', fontWeight: 500 }}>{isPositive ? '↑' : '↓'} {change}</p>}
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: iconBg || 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{getIcon(icon, { size: 20 })}</div>
      </div>
    </Card>
  );
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '18px' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
        {subtitle && <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '3px' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, desc }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px' }}>{getIcon(icon, { size: 32 })}</div>
      <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', fontSize: '15px' }}>{title}</p>
      {desc && <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>{desc}</p>}
    </div>
  );
}

export function Toast({ message, type = 'success', onClose }) {
  const configs = { success: { border: 'var(--success)', icon: '✅' }, error: { border: 'var(--danger)', icon: '❌' }, info: { border: 'var(--brand)', icon: 'ℹ️' } };
  const c = configs[type] || configs.success;
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, background: 'var(--bg-card)', border: `1px solid var(--border)`, borderLeft: `4px solid ${c.border}`, borderRadius: 'var(--radius-md)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: 'var(--shadow-lg)', maxWidth: '360px' }}>
      <span style={{ fontSize: '18px' }}>{getIcon(c.icon, { size: 18 })}</span>
      <p style={{ fontSize: '13.5px', flex: 1, color: 'var(--text-primary)', fontWeight: 500 }}>{message}</p>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer' }}>×</button>
    </div>
  );
}