import React from 'react';
import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#contact' },
    ]
  },
  {
    title: 'Services',
    links: [
      { label: 'Plumbing', href: '#services' },
      { label: 'Electrical', href: '#services' },
      { label: 'Cleaning', href: '#services' },
      { label: 'AC Repair', href: '#services' },
    ]
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '#' },
      { label: 'Contact Support', href: '#contact' },
      { label: 'FAQ', href: '#' },
    ]
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ]
  }
];

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--lt-bg-surface)',
      padding: '80px 40px 40px',
      borderTop: '1px solid rgba(9,9,11,0.04)',
      position: 'relative',
      zIndex: 1,
      fontFamily: 'var(--font-body)',
      color: 'var(--lt-muted)'
    }}>
      <div className="lt-canvas-grid" style={{ opacity: 0.3 }} />

      {/* ── Top Grid Section ──────────────────── */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto 60px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '40px',
        position: 'relative',
        zIndex: 2,
      }}>
        {/* Brand column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '18px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
          }}>
            Handy<span style={{ color: 'var(--lt-secondary)', fontWeight: 500, fontFamily: 'var(--font-code)', fontSize: '16px' }}>.serve</span>
          </div>
          <p style={{
            fontSize: '12px',
            color: 'var(--lt-muted)',
            lineHeight: 1.6,
            maxWidth: '220px'
          }}>
            Premium home-services marketplace connecting elite professionals with modern homes.
          </p>
        </div>

        {/* Dynamic Link columns */}
        {SECTIONS.map((section) => (
          <div key={section.title} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-code)',
            }}>
              {section.title}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {section.links.map((link, idx) => {
                const isInternal = link.href.startsWith('/');
                const styleObj = {
                  color: 'var(--lt-secondary)',
                  fontSize: '12.5px',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                };
                const mouseEnter = (e) => { e.target.style.color = 'var(--text-primary)'; };
                const mouseLeave = (e) => { e.target.style.color = 'var(--lt-secondary)'; };
                return isInternal ? (
                  <Link
                    key={idx}
                    to={link.href}
                    style={styleObj}
                    onMouseEnter={mouseEnter}
                    onMouseLeave={mouseLeave}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={idx}
                    href={link.href}
                    style={styleObj}
                    onMouseEnter={mouseEnter}
                    onMouseLeave={mouseLeave}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Divider ──────────────────────────── */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        height: '1px',
        background: 'rgba(255, 255, 255, 0.05)',
      }} />

      {/* ── Bottom Row ───────────────────────── */}
      <div style={{
        maxWidth: '1100px',
        margin: '30px auto 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        position: 'relative',
        zIndex: 2,
      }}>
        <p className="tech-mono" style={{
          color: 'var(--lt-muted)',
          fontSize: '11px',
          fontFamily: 'var(--font-code)',
        }}>
          © 2026 HANDYSERVE. Inspired by luxury design standards. //
        </p>

        {/* Social Icons */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            {
              name: 'Twitter',
              svg: <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
            },
            {
              name: 'GitHub',
              svg: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
            },
            {
              name: 'LinkedIn',
              svg: <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z"/>
            }
          ].map((soc, idx) => (
            <a
              key={idx}
              href="#"
              aria-label={soc.name}
              style={{
                color: 'var(--lt-muted)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--lt-muted)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {soc.svg}
              </svg>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}