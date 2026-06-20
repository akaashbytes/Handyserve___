import React, { useState, useMemo } from 'react';
import { Card, SectionHeader, Button, Badge } from '../../components/common/UI';
import { useAuth } from '../../components/context/AuthContext';

const DAYS   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS  = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'];

/** Map JS day index (0=Sun) → DAYS label */
function dayLabel(jsDay) {
  // Mon=1 … Sun=0 → map to index 0..6
  return DAYS[(jsDay + 6) % 7];
}

/** Return start of week (Monday) for a given date */
function weekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Format a Date as YYYY-MM-DD */
function fmt(date) {
  return date.toISOString().split('T')[0];
}

/** Nice label e.g. "02 Jun" */
function shortDate(date) {
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export default function SchedulePage() {
  const { bookings, leaveRequests, user } = useAuth();

  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week
  const today = new Date();
  const baseMonday = weekStart(today);

  /** Dates of the displayed week */
  const weekDates = useMemo(() => {
    return DAYS.map((_, i) => {
      const d = new Date(baseMonday);
      d.setDate(d.getDate() + weekOffset * 7 + i);
      return d;
    });
  }, [weekOffset, baseMonday]);

  const weekLabel = `${shortDate(weekDates[0])} – ${shortDate(weekDates[6])}`;

  /** Bookings that belong to this provider and fall in the displayed week */
  const weekBookings = useMemo(() => {
    const weekFmts = weekDates.map(fmt);
    return bookings.filter(b => {
      const isProvider =
        b.serviceProviderId === user?.id ||
        (!b.serviceProviderId && b.providerName === user?.name);
       return isProvider && weekFmts.includes(b.date) &&
              ['Requested', 'Accepted', 'On the way', 'Destination', 'Reached'].includes(b.status);
    });
  }, [bookings, user, weekDates]);

  /** Approved leave slots in the displayed week */
  const weekLeave = useMemo(() => {
    const weekFmts = weekDates.map(fmt);
    return leaveRequests.filter(l =>
      l.providerId === user?.id &&
      weekFmts.includes(l.date) &&
      l.status === 'approved'
    );
  }, [leaveRequests, user, weekDates]);

  /** Check if a cell (date, hour) is booked */
  function getCellType(date, hour) {
    const dateStr = fmt(date);

    // Check bookings
    const booking = weekBookings.find(b => b.date === dateStr && b.time === hour);
    if (booking) return { type: 'booked', booking };

    // Check leave
    const leave = weekLeave.find(l =>
      l.date === dateStr && Array.isArray(l.timeSlots) && l.timeSlots.includes(hour)
    );
    if (leave) return { type: 'leave', leave };

    // Is it in the past?
    const cellDate = new Date(date);
    if (cellDate < today && fmt(cellDate) !== fmt(today)) return { type: 'past' };

    return { type: 'free' };
  }

  const totalBooked = weekBookings.length;
  const totalLeave  = weekLeave.reduce((sum, l) => sum + (l.timeSlots?.length || 0), 0);

  const isCurrentWeek = weekOffset === 0;

  return (
    <div className="animate-fade-in-up" style={{ padding: '32px 36px', maxWidth: '980px' }}>
      <SectionHeader
        title="My Schedule"
        subtitle={`Week of ${weekLabel}`}
        action={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w - 1)}>
              ← Prev
            </Button>
            {!isCurrentWeek && (
              <Button variant="soft" size="sm" onClick={() => setWeekOffset(0)}>
                Today
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setWeekOffset(w => w + 1)}>
              Next →
            </Button>
          </div>
        }
      />

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '22px' }}>
        {[
          { label: 'Jobs This Week',     value: totalBooked,  icon: '📋', color: 'var(--brand)',   bg: 'var(--brand-light)' },
          { label: 'Leave Slots Taken',  value: totalLeave,   icon: '🏖️', color: '#D97706',        bg: '#FEF3C7' },
          { label: 'Free Slots',         value: Math.max(0, DAYS.length * HOURS.length - totalBooked - totalLeave), icon: '✅', color: 'var(--success)', bg: '#D1FAE5' },
        ].map((kpi, i) => (
          <Card key={i} padding="18px 22px" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '12px', background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
              {kpi.icon}
            </div>
            <div>
              <p style={{ fontSize: '22px', fontWeight: 800, color: kpi.color, lineHeight: 1, fontFamily: 'var(--font-display)' }}>{kpi.value}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{kpi.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Calendar Grid */}
      <Card padding="24px" style={{ overflowX: 'auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `68px repeat(7, 1fr)`,
          gap: '5px',
          minWidth: '700px',
        }}>
          {/* Header row: empty corner + day names */}
          <div />
          {weekDates.map((d, i) => {
            const isToday = fmt(d) === fmt(today);
            return (
              <div key={i} style={{ textAlign: 'center', paddingBottom: '8px' }}>
                <p style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: isToday ? 'var(--brand)' : 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '2px',
                }}>
                  {DAYS[i]}
                </p>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: isToday ? 'var(--brand)' : 'var(--text-primary)',
                  background: isToday ? 'var(--brand-light)' : 'transparent',
                  borderRadius: '50%',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                }}>
                  {d.getDate()}
                </p>
              </div>
            );
          })}

          {/* Body: hour rows × day columns */}
          {HOURS.map(h => (
            <React.Fragment key={h}>
              {/* Hour label */}
              <div style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                paddingTop: '10px',
                textAlign: 'right',
                paddingRight: '10px',
                whiteSpace: 'nowrap',
              }}>
                {h}
              </div>

              {/* Cells */}
              {weekDates.map((d, di) => {
                const cell = getCellType(d, h);
                let bg, border, content, cursor;

                switch (cell.type) {
                  case 'booked':
                    bg     = 'var(--brand-light)';
                    border = '1.5px solid var(--brand)';
                    content = (
                      <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--brand)', textAlign: 'center', lineHeight: 1.2, padding: '0 2px', display: 'block' }}>
                        {cell.booking.customerName?.split(' ')[0] || '●'}
                      </span>
                    );
                    cursor = 'default';
                    break;
                  case 'leave':
                    bg     = 'rgba(245,158,11,0.12)';
                    border = '1.5px solid #F59E0B';
                    content = <span style={{ fontSize: '11px' }}>🏖️</span>;
                    cursor = 'default';
                    break;
                  case 'past':
                    bg     = 'var(--bg-base)';
                    border = '1px solid var(--border-light, var(--border))';
                    content = null;
                    cursor = 'default';
                    break;
                  default: // free
                    bg     = 'var(--bg-elevated)';
                    border = '1.5px solid var(--border)';
                    content = null;
                    cursor = 'default';
                }

                return (
                  <div key={di} title={
                    cell.type === 'booked' ? `Booked: ${cell.booking.service} — ${cell.booking.customerName}` :
                    cell.type === 'leave'  ? 'Leave / Off Day' :
                    cell.type === 'past'   ? 'Past slot' : 'Available'
                  } style={{
                    height: 36,
                    borderRadius: 'var(--radius-sm)',
                    background: bg,
                    border,
                    cursor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'var(--transition)',
                    overflow: 'hidden',
                  }}>
                    {content}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '18px', flexWrap: 'wrap' }}>
          {[
            { color: 'var(--brand-light)',    border: 'var(--brand)',  label: 'Booked Job' },
            { color: 'rgba(245,158,11,0.12)', border: '#F59E0B',       label: 'Leave / Off Day' },
            { color: 'var(--bg-elevated)',    border: 'var(--border)',  label: 'Available' },
            { color: 'var(--bg-base)',        border: 'var(--border)',  label: 'Past' },
          ].map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: l.color, border: `1.5px solid ${l.border}`, flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Upcoming jobs list */}
      {weekBookings.length > 0 && (
        <Card padding="24px" style={{ marginTop: '20px' }}>
          <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '16px' }}>
            📋 Jobs This Week
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {weekBookings.map(b => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: '10px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                  🔧
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '2px' }}>{b.service}</p>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {b.customerName} · {b.date} · {b.time}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <p style={{ fontWeight: 700, color: 'var(--brand)', fontSize: '15px' }}>₹{b.amount}</p>
                  <Badge color={['Accepted', 'On the way', 'Destination', 'Reached'].includes(b.status) ? 'brand' : 'muted'}>
                    {b.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Leave this week */}
      {weekLeave.length > 0 && (
        <Card padding="24px" style={{ marginTop: '16px' }}>
          <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '14px' }}>
            🏖️ Off Days This Week
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {weekLeave.map(l => (
              <div key={l.id} style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(245,158,11,0.08)', border: '1px solid #F59E0B', fontSize: '13.5px', color: '#92400E', fontWeight: 600 }}>
                🗓 {l.date} — slots blocked: {l.timeSlots?.join(', ')}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}