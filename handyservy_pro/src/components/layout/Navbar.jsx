import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { getIcon } from '../common/Icons';
import { useAuth } from '../context/AuthContext';


const NAV_LINKS = [
  { label: 'Home',     href: '#home' },
  { label: 'Services', href: '#services' },
  { label: 'About',    href: '#about' },
  { label: 'Contact',  href: '#contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { toggleTheme, isDark } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <style>{`
        .nav-link {
          position: relative;
          color: var(--lt-secondary);
          font-size: 13.5px;
          font-weight: 500;
          font-family: var(--font-body);
          text-decoration: none;
          transition: color 0.3s ease;
          padding: 8px 0;
        }
        .nav-link:hover {
          color: var(--text-primary) !important;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--lt-accent);
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-link:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }
        .premium-login-btn {
          position: relative;
          overflow: hidden;
          background: var(--text-primary) !important;
          color: var(--bg-base) !important;
          border: 1px solid var(--text-primary) !important;
          padding: 10px 22px !important;
          font-weight: 600 !important;
          border-radius: 6px !important;
          font-family: var(--font-code) !important;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .premium-login-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent,
            rgba(255, 255, 255, 0.15),
            transparent
          );
          transition: all 0.55s ease;
        }
        .premium-login-btn:hover::before {
          left: 100%;
        }
        .premium-login-btn:hover {
          transform: scale(1.03) translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(17, 17, 17, 0.15) !important;
          background: var(--bg-surface) !important;
          border-color: var(--text-primary) !important;
          color: var(--text-primary) !important;
        }
      `}</style>
      <nav className={scrolled ? "lt-glass-panel" : ""} style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 1000,
        padding: '0 40px',
        height: '75px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled
          ? 'var(--bg-surface)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled
          ? '1px solid var(--border)'
          : '1px solid transparent',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>

        {/* ── Logo ─────────────────────────────── */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '20px',
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer'
        }} onClick={() => navigate('/')}>
          Handy<span style={{ color: 'var(--lt-accent)', fontWeight: 600, fontFamily: 'var(--font-code)', fontSize: '18px' }}>.serve</span>
        </div>

        {/* ── Nav Links ────────────────────────── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '36px',
        }}>
          {NAV_LINKS.map(link => (
            <a key={link.label} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-primary)',
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '14px',
              padding: 0,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--bg-card)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--bg-surface)';
              e.currentTarget.style.borderColor = 'var(--border-light)';
            }}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {getIcon(isDark ? '☀️' : '🌙', { size: 16 })}
          </button>
        </div>

        {/* ── Login Button ─────────────────────── */}
        <button
          onClick={() => navigate(isAuthenticated ? `/${user?.role}` : '/login')}
          className="premium-login-btn"
        >
          {isAuthenticated ? 'Dashboard' : 'Login'}
        </button>
      </nav>
    </>
  );
}