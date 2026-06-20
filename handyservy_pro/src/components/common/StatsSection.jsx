import React, { useState, useEffect, useRef } from 'react';

const formatVal = (val) => {
  if (val % 1 !== 0) return val.toFixed(1);
  if (val >= 10000) return Math.floor(val / 1000) + 'K';
  if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
  return Math.floor(val);
};

function AnimatedCounter({ value, active }) {
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    if (!active) return; // only animate when active

    // Check if the value has a decimal point
    const hasDecimal = String(value).includes('.');
    const numPart = hasDecimal 
      ? parseFloat(String(value).replace(/[^0-9.]/g, ''))
      : parseInt(String(value).replace(/[^0-9]/g, ''), 10);
    const suffix = String(value).replace(/[0-9.]/g, '');

    if (isNaN(numPart)) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = numPart;
    const duration = 1200;
    const steps = 40;
    const stepTime = duration / steps;
    const increment = end / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setDisplayValue(formatVal(end) + suffix);
      } else {
        setDisplayValue(formatVal(start) + suffix);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, active]);

  return <span>{displayValue}</span>;
}

export default function StatsSection() {
  const [statsData, setStatsData] = useState({
    customers: '3',
    providers: '5',
    rating: '4.9★',
    services: '8',
  });
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch(`http://${window.location.hostname}:8081/api/auth/public-stats`);
        if (res.ok) {
          const data = await res.json();
          // Ensure rating defaults or formats cleanly
          const rawRating = parseFloat(data.rating || 4.9);
          setStatsData({
            customers: String(data.customers),
            providers: String(data.providers),
            rating: rawRating.toFixed(1) + '★',
            services: String(data.services),
          });
        }
      } catch (e) {
        console.error('Failed to fetch public stats:', e);
      }
    };
    loadStats();
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      });
    }, { threshold: 0.3 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);

  const STATS_ITEMS = [
    { value: statsData.customers, label: 'Trusted Customers' },
    { value: statsData.providers, label: 'Verified Professionals' },
    { value: statsData.rating,    label: 'Average Rating' },
    { value: statsData.services,  label: 'Service Categories' },
  ];

  return (
    <section ref={ref} className="lt-section" style={{
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--lt-bg-base)',
      borderTop: '1px solid var(--lt-border)',
      borderBottom: '1px solid var(--lt-border)',
      padding: '96px 40px 96px',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.10), transparent 26%), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.06), transparent 22%)',
        pointerEvents: 'none',
        opacity: 0.65,
      }} />

      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(0deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.22,
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'absolute',
        inset: 0,
        backdropFilter: 'blur(2px)',
        pointerEvents: 'none',
      }} />

      <div className="lt-canvas-grid" style={{ opacity: 0.5, position: 'relative', zIndex: 1 }} />

      <style>{`
        .premium-stat-item {
          text-align: center;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 20px;
          min-width: 180px;
          flex: 1 1 180px;
        }
        .premium-stat-item:hover {
          transform: translateY(-4px);
        }
      `}</style>

      <div style={{
        position: 'relative',
        zIndex: 2,
        maxWidth: '760px',
        margin: '0 auto 56px',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 3.4vw, 36px)',
          fontWeight: 800,
          lineHeight: 1.05,
          color: 'var(--text-primary)',
          margin: 0,
          marginBottom: '18px',
        }}>
          Trusted by homeowners across Tamil Nadu
        </h2>
        <p style={{
          fontSize: '15px',
          color: 'var(--lt-secondary)',
          lineHeight: 1.8,
          maxWidth: '520px',
          margin: '0 auto',
        }}>
          Reliable professionals, transparent pricing, and trusted service.
        </p>
      </div>

      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'stretch',
        gap: '26px',
        flexWrap: 'wrap',
        maxWidth: '960px',
        margin: '0 auto',
      }}>
        {STATS_ITEMS.map((stat, index) => (
          <div key={index} className="premium-stat-item">
            <p className="tech-mono" style={{
              fontFamily: 'var(--font-code)',
              fontSize: '52px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.02,
              margin: '0 0 10px',
            }}>
              <AnimatedCounter value={stat.value} active={visible} />
            </p>
            <p style={{
              fontSize: '12px',
              color: 'var(--lt-secondary)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontFamily: 'var(--font-code)',
              margin: 0,
            }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}