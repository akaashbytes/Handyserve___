import React, { useState, useEffect } from 'react';
import { getIcon, HSLogo } from './Icons';

export default function SplashScreen({ onDone }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Start fading out after 2200ms
    const fadeTimeout = setTimeout(() => {
      setIsFading(true);
    }, 2200);

    // Call onDone and unmount after 2900ms
    const doneTimeout = setTimeout(() => {
      setIsVisible(false);
      if (onDone) onDone();
    }, 2900);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(doneTimeout);
    };
  }, [onDone]);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'var(--lt-bg-base)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      fontFamily: 'var(--font-body)',
      opacity: isFading ? 0 : 1,
      transition: 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
      pointerEvents: isFading ? 'none' : 'auto',
    }}>
      {/* Two Ambient Orbs */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '-15%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
        filter: 'blur(80px)',
        animation: 'orb 12s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        right: '-15%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)',
        filter: 'blur(80px)',
        animation: 'orb 16s ease-in-out infinite alternate',
        pointerEvents: 'none',
      }} />

      {/* Center content container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 10,
        animation: 'splashLogo 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      }}>
        {/* Icon */}
        <div style={{ marginBottom: '18px' }}>
          <HSLogo size={64} variant="color" />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '30px',
          fontWeight: 800,
          letterSpacing: '0.06em',
          margin: '0 0 6px 0',
          lineHeight: 1,
          fontFamily: 'var(--font-display)',
          color: 'var(--text-primary)',
        }}>
          HANDYSERVE
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '12px',
          color: 'var(--lt-secondary)',
          letterSpacing: '0.06em',
          margin: '0 0 32px 0',
          fontWeight: 600,
          fontFamily: 'var(--font-code)',
        }}>
          Premium Home Services
        </p>

        {/* Progress bar Container */}
        <div style={{
          width: '180px',
          height: '2px',
          background: 'var(--border)',
          borderRadius: '999px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Inner Fill */}
          <div style={{
            height: '100%',
            width: '0%',
            background: 'var(--lt-accent)',
            borderRadius: '999px',
            animation: 'splashBar 2.2s cubic-bezier(0.4, 0, 0.2, 1) forwards',
          }} />
        </div>
      </div>
    </div>
  );
}
