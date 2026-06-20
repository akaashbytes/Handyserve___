import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../components/context/AuthContext';
import { useTheme } from '../../components/context/ThemeContext';
import { getIcon, HSLogo } from '../../components/common/Icons';

export default function VerifyOtpPage() {
  const { apiFetch } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  // Cooldown timer logic
  useEffect(() => {
    if (resendCooldown === 0) return;
    const timer = setInterval(() => {
      setResendCooldown(c => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Mask the email for privacy (e.g. sakthivel.s1409@gmail.com -> sa*********@gmail.com)
  const maskEmail = (str) => {
    if (!str || !str.includes('@')) return str;
    const [name, domain] = str.split('@');
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name.substring(0, 2)}***${name.substring(name.length - 1)}@${domain}`;
  };

  // Handle single digit input
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Allow numbers only
    
    const newOtp = [...otp];
    // Keep only the last character entered
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  // Handle backspace key press
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (!newOtp[index] && index > 0) {
        // If current cell is empty, delete previous cell and focus it
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs[index - 1].current.focus();
      } else {
        // Just clear the current cell
        newOtp[index] = '';
        setOtp(newOtp);
      }
      setError('');
    }
  };

  // Handle pasting the 6-digit OTP code
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) return; // Reject if not 6-digit numeric

    const digits = pastedData.split('');
    setOtp(digits);
    setError('');
    // Focus the last input
    inputRefs[5].current.focus();
  };

  // Submit OTP Verification
  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await apiFetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, otp: otpCode })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'OTP verification failed.');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login?verified=true', { replace: true });
      }, 1500);

    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    setError('');
    try {
      const response = await apiFetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to resend OTP.');
      }

      setOtp(['', '', '', '', '', '']);
      setResendCooldown(30);
      inputRefs[0].current.focus();
      setError('');
      // Visual feedback via temporary border highlight can be added, or simple alert
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-base)',
      transition: 'background 0.3s ease',
    }}>
      
      {/* Header bar */}
      <div style={{
        padding: '24px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        transition: 'all 0.3s ease'
      }}>
        <Link to="/" style={{ 
          fontFamily: 'var(--font-display)', 
          fontWeight: 800, 
          fontSize: '20px', 
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none'
        }}>
          <HSLogo size={32} />
          HandyServe
        </Link>
        <button onClick={toggleTheme}
          style={{
            width: 40, height: 40,
            borderRadius: '50%',
            background: 'var(--bg-elevated)',
            border: '1.5px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            cursor: 'pointer',
          }}>
          {getIcon(isDark ? '☀️' : '🌙', { size: 18, style: { color: 'var(--text-primary)' } })}
        </button>
      </div>

      {/* Main card section */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          padding: '48px 40px',
          boxShadow: 'var(--shadow-xl)',
          textAlign: 'center',
          animation: 'fadeInUp 0.4s ease',
          transition: 'all 0.3s ease'
        }}>
          
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: success ? 'var(--success-light)' : 'var(--brand-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            margin: '0 auto 24px',
            transition: 'background 0.3s ease'
          }}>
            {success ? getIcon('✅', { size: 28 }) : getIcon('✉️', { size: 28, style: { color: 'var(--brand)' } })}
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '26px',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: '10px'
          }}>
            {success ? 'OTP Verified!' : 'Enter Verification Code'}
          </h2>
          
          <p style={{
            fontSize: '14.5px',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '32px',
          }}>
            {success 
              ? 'Your email has been verified. Redirecting you to login...'
              : `We have sent a 6-digit verification code to the email address `}
            {!success && <strong style={{ color: 'var(--text-primary)' }}>{maskEmail(email)}</strong>}
          </p>

          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'var(--danger-light)',
              border: '1px solid var(--danger)',
              borderRadius: '12px',
              marginBottom: '24px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'shake 0.3s ease'
            }}>
              {getIcon('⚠️', { size: 16, style: { color: 'var(--danger)' } })}
              <p style={{
                fontSize: '13.5px',
                color: 'var(--danger)',
                fontWeight: 600,
                margin: 0
              }}>{error}</p>
            </div>
          )}

          {!success && (
            <form onSubmit={handleVerify}>
              {/* 6 Digit Inputs */}
              <div 
                onPaste={handlePaste}
                style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center',
                  marginBottom: '36px'
                }}
              >
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    ref={inputRefs[idx]}
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    style={{
                      width: '48px',
                      height: '56px',
                      borderRadius: '12px',
                      border: '2px solid var(--border)',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      fontSize: '22px',
                      fontWeight: 700,
                      textAlign: 'center',
                      outline: 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'var(--brand)';
                      e.target.style.boxShadow = '0 0 0 4px var(--brand-light)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'var(--border)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                ))}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || otp.join('').length < 6}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: (loading || otp.join('').length < 6) ? 'var(--text-muted)' : 'var(--brand)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15.5px',
                  fontWeight: 600,
                  cursor: (loading || otp.join('').length < 6) ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.2s ease, transform 0.1s ease',
                  boxShadow: 'var(--shadow-md)'
                }}
                onMouseEnter={e => {
                  if (!loading && otp.join('').length === 6) e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {loading ? 'Verifying...' : 'Verify OTP Code →'}
              </button>
            </form>
          )}

          {!success && (
            <div style={{ marginTop: '28px' }}>
              {resendCooldown > 0 ? (
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                  Resend code in <strong style={{ color: 'var(--text-primary)' }}>{resendCooldown}s</strong>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    outline: 'none'
                  }}
                >
                  Resend OTP Code
                </button>
              )}
            </div>
          )}

          <div style={{ marginTop: '36px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <Link to="/login" style={{
              fontSize: '13.5px',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontWeight: 500
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              ← Back to Sign In
            </Link>
          </div>

        </div>
      </div>

      {/* Style tag for CSS keyframe animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
