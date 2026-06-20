import React from "react";
import { useNavigate } from "react-router-dom";

export default function CTASection() {
  const navigate = useNavigate();
  return (
    <section className="lt-section" style={{
      background: `radial-gradient( circle at 10% 10%, rgba(99,102,241,0.04), transparent 20% ), linear-gradient(180deg, var(--lt-bg-base) 0%, var(--lt-bg-surface) 100%)`,
      textAlign: 'center',
      borderTop: '1px solid var(--lt-border)',
      borderBottom: '1px solid var(--lt-border)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="lt-line-grid" style={{ opacity: 0.3 }} />

      {/* ── Decorative Circles ───────────────── */}
      <div style={{
        position: 'absolute',
        top: '-60px',
        left: '10%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.01)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'absolute',
        bottom: '-60px',
        right: '10%',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.008)',
        pointerEvents: 'none',
      }} />

      {/* ── Content ──────────────────────────── */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '650px',
        margin: '0 auto',
      }}>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '36px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          marginBottom: '20px',
          letterSpacing: '-0.02em',
        }}>
          Ready to experience<br />
          stress-free home service?
        </h2>

        <p style={{
          fontSize: '14px',
          color: 'var(--lt-secondary)',
          marginBottom: '40px',
          lineHeight: 1.7,
        }}>
          Let us handle the hard work. Book a pro and relax.
        </p>

        {/* Book Now Button */}
        <button
          onClick={() => navigate('/login')}
          className="lt-btn lt-btn-primary lt-btn-code"
          style={{
            padding: '16px 36px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: 'none',
            transition: 'transform 0.22s cubic-bezier(0.16,1,0.3,1), box-shadow 0.22s'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(17,17,17,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          Book Now
        </button>

      </div>
    </section>
  );
}