import React from 'react';

export default function AboutSection() {
  return (
    <section id="about" className="lt-section" style={{
      background: 'var(--lt-bg-surface)',
      borderTop: '1px solid var(--lt-border)',
      borderBottom: '1px solid var(--lt-border)',
    }}>
      <div className="lt-canvas-grid" style={{ opacity: 0.4 }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <div>
          <p className="tech-mono" style={{
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--lt-secondary)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}>
            About Us
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '36px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '24px',
            lineHeight: 1.2
          }}>
            Trusted Excellence in <br />
            <span style={{ color: 'var(--lt-accent)', fontWeight: 600 }}>Home Services</span>
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--lt-secondary)', lineHeight: 1.8, marginBottom: '24px' }}>
            At HANDYSERVE, we bridge the gap between skilled professionals and homeowners. Founded in 2024, our mission is to provide hassle-free, reliable, and high-quality home maintenance solutions at your fingertips.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--lt-accent)', marginBottom: '12px' }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 11 2 2 4-4"/>
              </svg>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>100% Verified</h4>
              <p style={{ fontSize: '13px', color: 'var(--lt-secondary)', lineHeight: 1.6 }}>Every provider undergoes a rigorous background check and skill assessment.</p>
            </div>
            <div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--lt-accent)', marginBottom: '12px' }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Fair Deals</h4>
              <p style={{ fontSize: '13px', color: 'var(--lt-secondary)', lineHeight: 1.6 }}>Transparent quotes and upfront pricing with no hidden surprises.</p>
            </div>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '100%',
            height: '400px',
            background: 'rgba(255,255,255,0.4)',
            border: '1px solid rgba(9, 9, 11, 0.05)',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 15 L85 35 L85 75 L50 95 L15 75 L15 35 Z" stroke="var(--text-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M50 15 L50 95" stroke="rgba(9,9,11,0.08)" strokeWidth="1" strokeDasharray="3 3" />
              <path d="M15 35 L85 75" stroke="rgba(9,9,11,0.08)" strokeWidth="1" strokeDasharray="3 3" />
              <path d="M85 35 L15 75" stroke="rgba(9,9,11,0.08)" strokeWidth="1" strokeDasharray="3 3" />
              <path d="M50 35 L70 47 L70 71 L50 83 L30 71 L30 47 Z" fill="rgba(99,102,241,0.03)" stroke="var(--lt-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="50" cy="59" r="5" fill="var(--lt-accent)" />
            </svg>
          </div>
          <div style={{
            position: 'absolute',
            bottom: '-20px',
            left: '-20px',
            padding: '20px 24px',
            background: 'var(--lt-bg-card)',
            backdropFilter: 'blur(12px)',
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid var(--border-light)',
            maxWidth: '180px'
          }}>
            <p className="tech-mono" style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', fontFamily: 'var(--font-code)' }}>10k+</p>
            <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>Served across the city</p>
          </div>
        </div>
      </div>
    </section>
  );
}
