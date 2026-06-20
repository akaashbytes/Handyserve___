import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { num: '01', icon: '🔍', title: 'Choose Your Service', desc: 'Browse our full range of home services and select exactly what your home needs.' },
  { num: '02', icon: '📅', title: 'Pick a Slot', desc: 'Select a date and time that works for you. Same-day and next-day slots available.' },
  { num: '03', icon: '🚗', title: 'Pro Arrives', desc: 'Your verified, background-checked expert shows up on time, fully equipped.' },
  { num: '04', icon: '✅', title: 'Rate & Pay', desc: 'Pay securely only after the job is done. Rate your pro to maintain quality.' }
];

export default function HowItWorksSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section 
      id="how-it-works" 
      ref={sectionRef}
      className="lt-section"
      style={{
        background: 'var(--lt-bg-base)',
        borderTop: '1px solid var(--lt-border)',
        borderBottom: '1px solid var(--lt-border)',
      }}
    >
      <div className="lt-canvas-grid" style={{ opacity: 0.6 }} />

      {/* Centered Ambient Orb */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.015) 0%, transparent 70%)',
        filter: 'blur(90px)',
        animation: 'orb 20s ease-in-out infinite alternate',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Content wrapper */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <p className="tech-mono" style={{
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--lt-secondary)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}>
            How It Works
          </p>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: '16px',
            lineHeight: 1.2,
            fontFamily: 'var(--font-display)',
          }}>
            Simple 4-Step Process
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'var(--lt-secondary)',
            maxWidth: '480px',
            margin: '0 auto',
            lineHeight: 1.7
          }}>
            From booking to completion, we make home services seamless and stress-free.
          </p>
        </div>

        {/* Steps Grid Container */}
        <div style={{ position: 'relative', marginBottom: '60px' }}>
          
          {/* Horizontal Connector Line */}
          <div className="how-it-works-connector" style={{
            position: 'absolute',
            top: '36px',
            left: '12%',
            right: '12%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, var(--lt-border), var(--lt-border), transparent)',
            zIndex: 1,
          }} />

          {/* Steps Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '30px',
            position: 'relative',
            zIndex: 2,
          }}>
            {STEPS.map((step, index) => (
              <div 
                key={index} 
                style={{
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${index * 120}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${index * 120}ms`,
                }}
              >
                {/* Circle Wrapper */}
                <div style={{
                  position: 'relative',
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--lt-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  marginBottom: '24px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}>
                  {step.icon}
                  
                  {/* Number Badge */}
                  <div className="tech-mono" style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    background: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--bg-base)',
                    fontSize: '10px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-code)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}>
                    {step.num}
                  </div>
                </div>

                {/* Title */}
                <h3 style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '10px',
                  lineHeight: 1.3,
                  fontFamily: 'var(--font-display)',
                }}>
                  {step.title}
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: '13px',
                  color: 'var(--lt-secondary)',
                  lineHeight: 1.65,
                  maxWidth: '220px'
                }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <button
            onClick={() => navigate('/login')}
            className="lt-btn lt-btn-primary lt-btn-code"
            style={{
              padding: '14px 32px',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '6px',
              boxShadow: 'none',
            }}
          >
            Book Your First Service
          </button>
        </div>

      </div>

      {/* Small style tag to handle connector line hidden on small screens */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 640px) {
          .how-it-works-connector {
            display: none !important;
          }
        }
      `}} />
    </section>
  );
}
