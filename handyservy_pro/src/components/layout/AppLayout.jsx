import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationPanel from '../common/NotificationPanel';
import LocationModal from '../common/LocationModal';
import ProfileDrawer from '../common/ProfileDrawer';
import { Avatar } from '../common/UI';
import { getIcon, HSLogo } from '../common/Icons';

const NAV = {
  customer: [
    { path: '/customer',          icon: '⊞',  label: 'Dashboard' },
    { path: '/customer/discover', icon: '🔍', label: 'Discover' },
    { path: '/customer/bookings', icon: '📋', label: 'My Bookings' },
    { path: '/customer/tracking', icon: '📍', label: 'Live Track' },
    { path: '/customer/payments', icon: '💳', label: 'Payments' },
    { path: '/customer/profile',  icon: '👤', label: 'Profile' },
  ],
  provider: [
    { path: '/provider',          icon: '⊞',  label: 'Dashboard' },
    { path: '/provider/jobs',     icon: '🔧', label: 'My Jobs' },
    { path: '/provider/disputes', icon: '⚠️', label: 'Disputes' },
    { path: '/provider/earnings', icon: '💰', label: 'Earnings' },
    { path: '/provider/leave',    icon: '🏥', label: 'Off Day' },
    { path: '/provider/profile',  icon: '👤', label: 'Profile' },
  ],
  admin: [
    { path: '/admin',             icon: '⊞',  label: 'Dashboard' },
    { path: '/admin/providers',   icon: '🛡️', label: 'Providers' },
    { path: '/admin/leave',       icon: '🏥', label: 'Off Day Req' },
    { path: '/admin/bookings',    icon: '📋', label: 'Bookings' },
    { path: '/admin/analytics',   icon: '📊', label: 'Analytics' },
    { path: '/admin/settings',    icon: '⚙️', label: 'Settings' },
    { path: '/admin/requests',    icon: '📩', label: 'Customer Req' },
  ],
};

export default function AppLayout({ children }) {
  const { user, logout, leaveRequests, isLocationModalOpen, setLocationModalOpen, contactRequests } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const sidebarW = collapsed ? 64 : 240;
  const navItems = NAV[user?.role] || [];
  const adminPendingCount = leaveRequests ? leaveRequests.filter(l => l.status === 'pending').length : 0;
  const adminReqCount = user?.role === 'admin' && contactRequests 
    ? contactRequests.filter(r => r.status === 'pending').length 
    : 0;
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', transition: 'background 0.3s ease' }}>
      <aside style={{ width: sidebarW, minHeight: '100vh', background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)', display: 'flex', flexDirection: 'column', transition: 'width 0.28s ease', flexShrink: 0, position: 'fixed', zIndex: 100, boxShadow: 'var(--shadow-xs)' }}>

        {/* Logo */}
        <div style={{ padding: collapsed ? '18px 15px' : '18px 20px', borderBottom: '1px solid var(--sidebar-border)', display: 'flex', alignItems: 'center', gap: '10px', minHeight: '68px' }}>
          <HSLogo size={34} variant="color" />
          {!collapsed && <div><p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1.2 }}>HandyServe</p><p style={{ fontSize: '10px', color: 'var(--brand)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pro</p></div>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {!collapsed && <p style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 10px 10px' }}>{user?.role === 'customer' ? 'Main Menu' : user?.role === 'provider' ? 'Provider Hub' : 'Admin Panel'}</p>}
          {navItems.map(item => {
            const active = location.pathname === item.path;
            const isRestricted = user?.role === 'provider' && !user?.verified && item.path !== '/provider';
            return (
              <button key={item.path} 
                onClick={() => {
                  if (isRestricted) return;
                  navigate(item.path);
                }} 
                disabled={isRestricted}
                title={collapsed ? item.label : undefined}
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: collapsed ? 0 : '10px', 
                  padding: '9px 10px', 
                  borderRadius: 'var(--radius-md)', 
                  background: active ? 'var(--brand-light)' : 'transparent', 
                  border: 'none', 
                  cursor: isRestricted ? 'not-allowed' : 'pointer', 
                  color: active ? 'var(--brand)' : 'var(--text-secondary)', 
                  fontWeight: active ? 600 : 400, 
                  fontSize: '13.5px', 
                  marginBottom: '2px', 
                  transition: 'var(--transition)', 
                  justifyContent: collapsed ? 'center' : 'flex-start', 
                  position: 'relative',
                  opacity: isRestricted ? 0.45 : 1
                }}
                onMouseLeave={e => { if (!active && !isRestricted) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
              >
                {active && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, borderRadius: '0 3px 3px 0', background: 'var(--brand)' }} />}
                <span style={{ fontSize: '16px', flexShrink: 0 }}>{getIcon(item.icon, { size: 16 })}</span>
                {!collapsed && <span>{item.label}</span>}
                {item.path === '/admin/leave' && adminPendingCount > 0 && (
                   <div style={{ marginLeft: 'auto', background: 'var(--danger)', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '10px' }}>{adminPendingCount}</div>
                )}
                {item.path === '/admin/requests' && adminReqCount > 0 && (
                   <div style={{ marginLeft: 'auto', background: 'var(--brand)', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '10px' }}>{adminReqCount}</div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid var(--sidebar-border)', padding: '10px 8px' }}>
          <button onClick={toggleTheme} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: collapsed ? 0 : '10px', padding: '9px 10px', borderRadius: 'var(--radius-md)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '13.5px', justifyContent: collapsed ? 'center' : 'flex-start', marginBottom: '6px', transition: 'var(--transition)', fontFamily: 'var(--font-body)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--sidebar-item-hover)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ fontSize: '17px', flexShrink: 0 }}>{getIcon(isDark ? '☀️' : '🌙', { size: 17 })}</span>
            {!collapsed && <span style={{ fontWeight: 500 }}>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', marginBottom: '4px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)' }}>
              <Avatar initials={user?.avatar} size={32} />
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</p>
              </div>
            </div>
          )}

          <button onClick={() => { logout(); navigate('/login'); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 10px', borderRadius: 'var(--radius-md)', background: 'transparent', border: 'none', color: 'var(--danger)', fontSize: '13.5px', cursor: 'pointer', justifyContent: collapsed ? 'center' : 'flex-start', transition: 'var(--transition)', fontFamily: 'var(--font-body)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-light)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span>{getIcon('🚪', { size: 16 })}</span>
            {!collapsed && <span style={{ fontWeight: 500 }}>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(c => !c)}
          style={{ position: 'absolute', top: '20px', right: '-13px', width: 26, height: 26, borderRadius: '50%', background: 'var(--sidebar-bg)', border: '1.5px solid var(--sidebar-border)', color: 'var(--text-muted)', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', fontWeight: 700 }}>
          {collapsed ? '›' : '‹'}
        </button>
      </aside>
      
      
      <main style={{ flex: 1, marginLeft: sidebarW, minHeight: '100vh', transition: 'margin-left 0.28s ease, background 0.3s ease', background: 'var(--bg-base)' }}>
        <div style={{
          height: 60,
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 36px',
          position: 'sticky',
          top: 0,
          zIndex: 90,
          boxShadow: 'var(--shadow-xs)',
        }}>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {user?.role === 'customer' && (
              <div 
                onClick={() => setLocationModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '999px',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 4px rgba(15, 23, 42, 0.06)',
                  maxWidth: '420px',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <span style={{ color: '#EF4444', fontSize: 14 }}>{getIcon('📍', { size: 14 })}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.displayAddress || user?.location || user?.city || 'Set your area'}
                </span>
              </div>
            )}
            <NotificationPanel />
            <div 
              onClick={() => setProfileDrawerOpen(true)}
              style={{
                cursor: 'pointer',
                transition: 'var(--transition)',
                borderRadius: '50%',
                padding: '2px'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Avatar initials={user?.avatar} size={36} />
            </div>
          </div>
        </div>  

        {isLocationModalOpen && (
          <LocationModal isOpen={isLocationModalOpen} onClose={() => setLocationModalOpen(false)} />
        )}

        <ProfileDrawer 
          isOpen={profileDrawerOpen}
          onClose={() => setProfileDrawerOpen(false)}
        />
        
        <div style={{ padding: '0' }}>
          {children}
        </div>
      </main>
    </div>
  );
}