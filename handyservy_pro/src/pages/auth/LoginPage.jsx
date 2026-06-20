import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../components/context/AuthContext';
import { useTheme } from '../../components/context/ThemeContext';
import { getIcon, HSLogo } from '../../components/common/Icons';
export default function LoginPage() {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  useEffect(() => {
    const verified = searchParams.get('verified');
    const errorMsg = searchParams.get('error');

    if (verified === 'true') {
      setVerifySuccess(true);
      setVerifyError('');
      setSearchParams({}, { replace: true });
    } else if (errorMsg) {
      setVerifyError(errorMsg);
      setVerifySuccess(false);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);
  const validate = () => {
    const e = {};
    if (!email.trim()) {
      e.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = 'Enter a valid email address.';
    }
    if (!password) {
      e.password = 'Password is required.';
    } else if (password.length < 6) {
      e.password = 'Minimum 6 characters.';
    }
    return e;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 700));
      const u = await login(email.trim(), password);
      if (u && u.role) {
        navigate(`/${u.role}`, { replace: true });
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-base)',
      transition: 'background 0.3s ease',
    }}>

      {/* ── Left Brand Panel ───────────────── */}
      <div style={{
        flex: '0 0 44%',
        background: 'linear-gradient(155deg, #09090B 0%, #18181B 55%, #27272A 100%)',
        display: 'flex',
        flexDirection: 'column',
        padding: '48px 52px',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          top: -80, right: -80,
          width: 280, height: 280,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: 60, left: -60,
          width: 200, height: 200,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.02)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '64px',
        }}>
          <HSLogo size={40} variant="white" />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '20px',
            color: '#fff',
          }}>HandyServe Pro</span>
        </div>

        {/* Hero text */}
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '38px',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.2,
            marginBottom: '16px',
            letterSpacing: '-0.5px',
          }}>
            Your home,<br />cared for.
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.72)',
            fontSize: '15px',
            lineHeight: 1.75,
            maxWidth: '300px',
            marginBottom: '40px',
          }}>
            Book trusted professionals for every
            home service — from plumbing to
            deep cleaning.
          </p>

          {/* Feature list */}
          {[
            { text: '200+ verified professionals', icon: '✅' },
            { text: 'Real-time job tracking', icon: '✅' },
            { text: 'Secure UPI & card payments', icon: '✅' },
            { text: 'Rated 4.8 by 10,000+ customers', icon: '✅' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '14px',
            }}>
              <div style={{
                width: 22, height: 22,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>{getIcon(item.icon, { size: 12, style: { color: '#fff' } })}</div>
              <p style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: '14px',
              }}>{item.text}</p>
            </div>
          ))}
        </div>

        {/* Service chips */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginTop: '40px',
        }}>
          {[
            { icon: '🔧', label: 'Plumbing' },
            { icon: '⚡', label: 'Electrical' },
            { icon: '🧹', label: 'Cleaning' },
            { icon: '🔨', label: 'Appliance' },
            { icon: '🐛', label: 'Pest Control' },
          ].map(item => (
            <span key={item.label} style={{
              padding: '5px 12px',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.9)',
              fontSize: '12px',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              {getIcon(item.icon, { size: 14, style: { color: 'rgba(255,255,255,0.9)' } })}
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Right Login Form ──────────────── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 48px',
        position: 'relative',
      }}>

        {/* Theme toggle */}
        <button onClick={toggleTheme}
          style={{
            position: 'absolute',
            top: 24, right: 28,
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

        <div style={{
          width: '100%',
          maxWidth: '400px',
        }}>
          <Link to="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            fontSize: '13.5px',
            fontWeight: 500,
            marginBottom: '24px',
            textDecoration: 'none',
            transition: 'var(--transition)'
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            ← Back to Home
          </Link>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: '6px',
          }}>Welcome back</h2>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '32px',
            fontSize: '14px',
          }}>
            Sign in to continue to HandyServe Pro
          </p>

          {/* Verification success alert */}
          {verifySuccess && (
            <div style={{
              padding: '12px 16px',
              background: 'var(--success-light)',
              border: '1px solid var(--success)',
              borderRadius: '10px',
              marginBottom: '20px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
            }}>
              {getIcon('✅', { size: 16, style: { color: 'var(--success)' } })}
              <p style={{
                fontSize: '13.5px',
                color: 'var(--success)',
                fontWeight: 500,
                margin: 0
              }}>Email verified successfully! You can now log in.</p>
            </div>
          )}

          {/* Verification error alert */}
          {verifyError && (
            <div style={{
              padding: '12px 16px',
              background: 'var(--danger-light)',
              border: '1px solid var(--danger)',
              borderRadius: '10px',
              marginBottom: '20px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
            }}>
              {getIcon('⚠️', { size: 16, style: { color: 'var(--danger)' } })}
              <p style={{
                fontSize: '13.5px',
                color: 'var(--danger)',
                fontWeight: 500,
                margin: 0
              }}>{verifyError}</p>
            </div>
          )}

          {/* Form error */}
          {errors.form && (
            <div style={{
              padding: '12px 16px',
              background: 'var(--danger-light)',
              border: '1px solid var(--danger)',
              borderRadius: '10px',
              marginBottom: '20px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
            }}>
              {getIcon('⚠️', { size: 16, style: { color: 'var(--danger)' } })}
              <p style={{
                fontSize: '13.5px',
                color: 'var(--danger)',
                fontWeight: 500,
              }}>{errors.form}</p>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleLogin}
            noValidate
            autoComplete="off"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}>

            {/* Email */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
            }}>
              <label style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-primary)',
              }}>
                Email Address
                <span style={{
                  color: 'var(--danger)'
                }}> *</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setErrors(p => ({
                    ...p,
                    email: '',
                    form: '',
                  }));
                }}
                placeholder="you@example.com"
                autoComplete="off"
                style={{
                  padding: '10px 14px',
                  background: 'var(--bg-input)',
                  border: `1.5px solid ${errors.email
                    ? 'var(--danger)'
                    : 'var(--border)'}`,
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              {errors.email && (
                <span style={{
                  fontSize: '12px',
                  color: 'var(--danger)',
                }}>
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
            }}>
              <label style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-primary)',
              }}>
                Password
                <span style={{
                  color: 'var(--danger)'
                }}> *</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setErrors(p => ({
                    ...p,
                    password: '',
                    form: '',
                  }));
                }}
                placeholder="Your password"
                autoComplete="new-password"
                style={{
                  padding: '10px 14px',
                  background: 'var(--bg-input)',
                  border: `1.5px solid ${errors.password
                    ? 'var(--danger)'
                    : 'var(--border)'}`,
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              {errors.password && (
                <span style={{
                  fontSize: '12px',
                  color: 'var(--danger)',
                }}>
                  {errors.password}
                </span>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '13px',
                background: loading
                  ? 'var(--text-muted)'
                  : 'var(--brand)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: loading
                  ? 'not-allowed'
                  : 'pointer',
                marginTop: '4px',
              }}>
              {loading
                ? 'Signing in...'
                : 'Sign In →'}
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: '22px',
            fontSize: '13.5px',
            color: 'var(--text-secondary)',
          }}>
            New here?{' '}
            <Link to="/register" style={{
              color: 'var(--brand)',
              fontWeight: 600,
            }}>
              Create an account
            </Link>
          </p>

          <p style={{
            textAlign: 'center',
            marginTop: '32px',
            fontSize: '12.5px',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
          }}>
            By signing in, you agree to our <br />
            <Link to="/terms" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: 500 }}>Terms of Service</Link> and{' '}
            <Link to="/privacy" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: 500 }}>Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}