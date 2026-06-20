import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HeroSection() {
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (containerRef.current) {
      const reveals = containerRef.current.querySelectorAll('[data-reveal]');
      reveals.forEach((el) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(28px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      });

      reveals.forEach((el, i) => {
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 200 + i * 120);
      });
    }
  }, []);

  return (
    <section 
      id="home" 
      ref={containerRef}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 20px 60px 20px',
        background: 'var(--lt-bg-base)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* Soft elegant background texture */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.10), transparent 24%), radial-gradient(circle at 80% 75%, rgba(255, 255, 255, 0.08), transparent 18%)',
        opacity: 0.55,
        pointerEvents: 'none',
      }} />

      {/* Minimal blur shapes */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '280px',
        height: '280px',
        borderRadius: '50%',
        background: 'rgba(99,102,241,0.08)',
        filter: 'blur(48px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '4%',
        right: '8%',
        width: '220px',
        height: '220px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)',
        filter: 'blur(48px)',
        pointerEvents: 'none',
      }} />

      {/* Dotted canvas Grid pattern overlay */}
      <div className="lt-canvas-grid" style={{ opacity: 0.22 }} />

      {/* Hero Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '840px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
      }}>
        {/* Badge Pill */}
        <div 
          data-reveal 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            background: 'var(--lt-bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(9, 9, 11, 0.02)',
            marginBottom: '24px',
          }}
        >
          <span style={{ 
            width: '6px', 
            height: '6px', 
            borderRadius: '50%', 
            background: 'var(--lt-accent)', 
            display: 'inline-block',
            animation: 'pulse 1.5s ease-in-out infinite',
            boxShadow: '0 0 8px var(--lt-accent)'
          }} />
          <span className="tech-mono" style={{
            color: 'var(--lt-secondary)',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            Trusted by 10,000+ Happy Customers
          </span>
        </div>

        {/* Main Heading */}
        <h1 
          data-reveal 
          style={{
            fontFamily: 'var(--font-display)',
          fontSize: 'clamp(44px, 6vw, 68px)',
          fontWeight: 800,
          color: 'var(--text-primary)',
          lineHeight: 1.08,
          marginBottom: '22px',
          letterSpacing: '-0.04em',
          maxWidth: '680px',
          width: '100%',
        }}
        >
          Premium Home Services,<br />
          <span style={{ 
            display: 'inline-block',
            background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--text-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            WebkitTextFillColor: 'transparent',
            backgroundRepeat: 'no-repeat',
          }}>
            Simplified.
          </span>
        </h1>

        {/* Subtext */}
        <p 
          data-reveal 
          style={{
            fontSize: '16px',
            color: 'var(--lt-secondary)',
            lineHeight: 1.75,
            maxWidth: '560px',
            margin: '0 auto 32px',
          }}
        >
          Book trusted professionals for your home in minutes. Quality work, transparent pricing, zero stress.
        </p>

        {/* Buttons */}
        <div 
          data-reveal 
          style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '40px',
          }}
        >
          {/* Primary Button */}
          <button
            onClick={() => navigate('/login')}
            className="lt-btn lt-btn-primary lt-btn-code"
            style={{
              minWidth: '170px',
              padding: '14px 32px',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '8px',
              boxShadow: 'none',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 18px 30px rgba(17, 17, 17, 0.12)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Book a Service
          </button>

          {/* Secondary Button */}
          <button
            onClick={() => navigate('/login')}
            className="lt-btn lt-btn-secondary lt-btn-code"
            style={{
              minWidth: '170px',
              padding: '14px 32px',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '8px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 18px 30px rgba(17, 17, 17, 0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Become a Pro
          </button>
        </div>

      </div>
    </section>
  );
}