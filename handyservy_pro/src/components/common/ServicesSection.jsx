import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SERVICES = [
  {
    icon: '🔧',
    title: 'Plumbing',
    desc: 'Leak repairs, pipe installation, drain cleaning, and complete plumbing solutions for your home.',
    price: 'From ₹399',
    bgImage: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: '⚡',
    title: 'Electrical',
    desc: 'Wiring, switch repairs, lighting installation, and safe electrical work by certified professionals.',
    price: 'From ₹499',
    bgImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: '🧹',
    title: 'Cleaning',
    desc: 'Deep home cleaning, kitchen sanitation, bathroom scrubbing, and post-renovation cleanup.',
    price: 'From ₹699',
    bgImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: '🔨',
    title: 'Appliance Repair',
    desc: 'AC servicing, refrigerator repair, washing machine fixes, and all home appliance care.',
    price: 'From ₹599',
    bgImage: 'https://images.unsplash.com/photo-1621905252507-b354bc25edac?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: '🐛',
    title: 'Pest Control',
    desc: 'Termite treatment, mosquito control, cockroach elimination, and safe pest-free living.',
    price: 'From ₹799',
    bgImage: 'https://images.unsplash.com/photo-1590856029826-c7a0e047f214?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: '🎨',
    title: 'Painting',
    desc: 'Interior and exterior painting, texture work, and complete home makeover solutions.',
    price: 'From ₹1499',
    bgImage: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
  },
];

export default function ServicesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
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
      id="services" 
      ref={sectionRef}
      className="lt-section"
      style={{
        background: 'var(--lt-bg-base)',
      }}
    >
      <div className="lt-line-grid" style={{ opacity: 0.5 }} />

      {/* ── Section Header ───────────────────── */}
      <div style={{
        textAlign: 'center',
        marginBottom: '80px',
        position: 'relative',
        zIndex: 1,
      }}>
        <p className="tech-mono" style={{
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--lt-secondary)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}>
          What We Offer
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
          Our Services
        </h2>

        <p style={{
          fontSize: '14px',
          color: 'var(--lt-secondary)',
          maxWidth: '480px',
          margin: '0 auto',
          lineHeight: 1.7,
        }}>
          Expert solutions for every corner of your home, delivered by verified professionals.
        </p>
      </div>

      {/* ── Services Grid ─────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '30px',
        maxWidth: '1100px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
      }}>
        {SERVICES.map((service, index) => (
          <div 
            key={index}
            style={{
              background: 'var(--lt-bg-card)',
              padding: '32px 28px',
              cursor: 'pointer',
              borderRadius: '12px',
              border: '1px solid var(--lt-border)',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: hoveredIndex === index 
                ? '0 20px 40px rgba(9, 9, 11, 0.08)' 
                : '0 4px 16px rgba(9, 9, 11, 0.02)',
              opacity: isVisible ? 1 : 0,
              transform: isVisible 
                ? (hoveredIndex === index ? 'translateY(-8px)' : 'translateY(0)') 
                : 'translateY(20px)',
              transitionProperty: 'opacity, transform, box-shadow, background-color',
              transitionDuration: '0.6s, 0.4s, 0.4s, 0.3s',
              transitionDelay: isVisible ? `${index * 80}ms` : '0ms',
              overflow: 'hidden',
            }}
            onClick={() => navigate('/login')}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Header Image Area with dynamic background image and hover zoom */}
            <div style={{
              height: '160px',
              width: 'calc(100% + 56px)',
              marginLeft: '-28px',
              marginTop: '-32px',
              marginBottom: '24px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: '1px solid var(--lt-border)',
            }}>
              {/* Background Image that zooms and shifts */}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${service.bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: hoveredIndex === index ? 'scale(1.08) translate(1px, -1px)' : 'scale(1)',
                zIndex: 0,
              }} />
              {/* Subtle dark overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(9, 9, 11, 0.15) 0%, rgba(9, 9, 11, 0.5) 100%)',
                zIndex: 1,
              }} />
              
            </div>

             <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
              }}>
                {service.title}
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--brand)', fontWeight: 600, background: 'var(--brand-light)', padding: '2px 8px', borderRadius: '12px' }}>
                {service.price}
              </span>
            </div>

            {/* Description */}
            <p style={{
              fontSize: '13px',
              color: 'var(--lt-secondary)',
              lineHeight: 1.7,
            }}>
              {service.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}