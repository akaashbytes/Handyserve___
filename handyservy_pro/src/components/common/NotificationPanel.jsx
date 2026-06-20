import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Badge } from './UI';

export default function NotificationPanel() {
  const { 
    user, 
    leaveRequests, 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead 
  } = useAuth();
  const [open, setOpen] = useState(false);
  
  const pendingLeaveCount = user?.role === 'admin' ? (leaveRequests || []).filter(l => l.status === 'pending').length : 0;
  const unreadCount = (notifications || []).filter(n => !n.read).length + pendingLeaveCount;

  const markAllRead = () => {
    markAllNotificationsRead();
  };

  const markOne = (id) => {
    markNotificationRead(id);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button onClick={() => setOpen(o => !o)}
        style={{
          width: 40, height: 40,
          borderRadius: '50%',
          background: 'var(--bg-elevated)',
          border: '1.5px solid var(--border)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px', cursor: 'pointer',
          position: 'relative',
          transition: 'var(--transition)',
        }}>
        🔔
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: -2, right: -2,
            width: 18, height: 18,
            borderRadius: '50%',
            background: 'var(--danger)',
            color: '#fff',
            fontSize: '10px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--bg-card)',
          }}>{unreadCount}</div>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 998 }} />

          <div style={{
            position: 'absolute',
            top: '48px', right: 0,
            width: '360px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 999,
            animation: 'slideDown 0.2s ease',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              padding: '16px 18px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                  Notifications
                </p>
                {unreadCount > 0 && (
                  <Badge color="danger">{unreadCount} new</Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <button onClick={markAllRead}
                  style={{ background: 'none', border: 'none', color: 'var(--brand)', fontSize: '12.5px', cursor: 'pointer', fontWeight: 600 }}>
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
              {user?.role === 'admin' && (leaveRequests || []).filter(l => l.status === 'pending').map(l => (
                <div key={l.id} 
                  style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex', gap: '12px',
                    background: 'var(--brand-glow)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>🏥</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.3 }}>Leave Request: {l.providerName}</p>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '3px', lineHeight: 1.4 }}>Applied for {l.date}. Reason: {l.reason}</p>
                    <p style={{ fontSize: '11px', color: 'var(--brand)', marginTop: '5px', fontWeight: 600 }}>Action Required</p>
                  </div>
                </div>
              ))}

              {notifications.length === 0 && pendingLeaveCount === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <p style={{ fontSize: '32px', marginBottom: '8px' }}>🔔</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No notifications</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} onClick={() => markOne(n.id)}
                    style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid var(--border-light)',
                      display: 'flex', gap: '12px',
                      background: n.read ? 'transparent' : 'var(--brand-light)',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = n.read ? 'transparent' : 'var(--brand-light)'; }}
                  >
                    <div style={{
                      width: 40, height: 40,
                      borderRadius: '50%',
                      background: 'var(--bg-elevated)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px', flexShrink: 0,
                    }}>{n.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <p style={{ fontWeight: n.read ? 500 : 700, fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.3 }}>{n.title}</p>
                        {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand)', flexShrink: 0, marginTop: '4px' }} />}
                      </div>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '3px', lineHeight: 1.4 }}>{n.message}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>{n.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
              <button style={{ background: 'none', border: 'none', color: 'var(--brand)', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
                View all notifications →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}