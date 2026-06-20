import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/context/AuthContext';
import { useTheme } from '../../components/context/ThemeContext';
import { getIcon } from '../../components/common/Icons';
const ROLE_CONFIG = {
  customer: {
    icon: '🏠',
    label: 'Customer',
    desc: 'Book home services, track jobs, manage payments',
    color: 'var(--brand)',
    features: [
      'Browse 200+ professionals',
      'Real-time job tracking',
      'Secure payments & invoices',
    ],
  },
  provider: {
    icon: '🔧',
    label: 'Service Provider',
    desc: 'Manage jobs, set schedule, track earnings',
    color: '#059669',
    features: [
      'View & accept job requests',
      'Manage weekly schedule',
      'Track payouts & earnings',
    ],
  },
  admin: {
    icon: '⚙️',
    label: 'Administrator',
    desc: 'Full platform control & analytics',
    color: '#DC2626',
    features: [
      'Platform-wide analytics',
      'Provider verification',
      'Dispute resolution',
    ],
  },
};
export default function RoleSelectionPage() {
  const { pendingUser, selectRole, 
          logout, isPending } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isPending) {
      navigate('/login', { replace: true });
    }
  }, [isPending, navigate]);

  if (!isPending) return null;

  const firstName = pendingUser?.name
    ?.split(' ')[0] || 'User';
  const allowedRole = pendingUser?.role;

const handleConfirm = async () => {
    if (!selected) {
      setError('Please select a role to continue.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      const user = await selectRole(selected);
      navigate(`/${user.role}`, { replace: true });
    } catch (err) {
      setError(err.message);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    logout();
    navigate('/login', { replace: true });
  };

return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      transition: 'background 0.3s ease',
    }}>

      {/* ── Top Bar ───────────────────────── */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: 60,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        zIndex: 100,
        boxShadow: 'var(--shadow-xs)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: 30, height: 30,
            borderRadius: '8px',
            background: 'var(--brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '15px',
          }}>{getIcon('🔧', { size: 15 })}</div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '15px',
            color: 'var(--text-primary)',
          }}>HandyServe Pro</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
            <button onClick={toggleTheme}
            style={{
              width: 38, height: 38,
              borderRadius: '50%',
              background: 'var(--bg-elevated)',
              border: '1.5px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '17px',
              cursor: 'pointer',
            }}>
            {getIcon(isDark ? '☀️' : '🌙', { size: 16 })}
          </button>
          <button onClick={handleBack}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              border: '1.5px solid var(--border)',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
            }}>
            ← Back to Login
          </button>
        </div>
      </div>

      {/* ── Main Content ──────────────────── */}
      <div style={{
        maxWidth: '780px',
        margin: '0 auto',
        padding: '100px 20px 40px',
      }}>

        {/* Step indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '32px',
        }}>
          {/* Step 1 done */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
          }}>
            <div style={{
              width: 28, height: 28,
              borderRadius: '50%',
              background: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              color: '#fff',
              fontWeight: 700,
            }}>✓</div>
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--success)',
            }}>Verified</span>
          </div>

          <div style={{
            width: 48, height: 2,
            background: 'var(--brand)',
            borderRadius: 2,
          }} />

          {/* Step 2 active */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
          }}>
            <div style={{
              width: 28, height: 28,
              borderRadius: '50%',
              background: 'var(--brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              color: '#fff',
              fontWeight: 700,
            }}>2</div>
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--brand)',
            }}>Select Role</span>
          </div>

          <div style={{
            width: 48, height: 2,
            background: 'var(--border)',
            borderRadius: 2,
          }} />

          {/* Step 3 pending */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
          }}>
            <div style={{
              width: 28, height: 28,
              borderRadius: '50%',
              background: 'var(--bg-elevated)',
              border: '2px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              color: 'var(--text-muted)',
              fontWeight: 700,
            }}>3</div>
            <span style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
            }}>Dashboard</span>
          </div>
        </div>

        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '36px',
        }}>
            <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: '8px',
            letterSpacing: '-0.4px',
          }}>
            Hello, {' '}
            <span style={{
              color: 'var(--brand)',
            }}>{firstName}</span> 👋
          </h1>
            
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '15px',
          }}>
            Credentials verified! Choose how
            you'd like to continue.
          </p>
        </div>

        {/* Role Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}>
          {Object.entries(ROLE_CONFIG).map(
            ([roleKey, cfg]) => {
              const isAllowed =
                allowedRole === roleKey;
              const isSelected =
                selected === roleKey;
              return (
                <div key={roleKey}
                  onClick={() =>
                    isAllowed &&
                    setSelected(roleKey)
                  }
                  style={{
                    borderRadius: '20px',
                    border: `2px solid ${
                      isSelected
                        ? cfg.color
                        : isAllowed
                          ? 'var(--border)'
                          : 'var(--border-light)'
                    }`,
                    background: isSelected
                      ? (cfg.color.startsWith('var') ? 'var(--brand-light)' : `${cfg.color}18`)
                      : 'var(--bg-card)',
                    padding: '24px 20px',
                    cursor: isAllowed
                      ? 'pointer'
                      : 'not-allowed',
                    opacity: isAllowed ? 1 : 0.4,
                    transition: 'all 0.22s ease',
                    boxShadow: isSelected
                      ? (cfg.color.startsWith('var') ? '0 4px 20px var(--brand-glow)' : `0 4px 20px ${cfg.color}30`)
                      : 'var(--shadow-xs)',
                    transform: isSelected
                      ? 'translateY(-3px)'
                      : 'none',
                    position: 'relative',
                  }}>

                  {/* Selected checkmark */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: 14, right: 14,
                      width: 24, height: 24,
                      borderRadius: '50%',
                      background: cfg.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: '#fff',
                      fontWeight: 700,
                    }}>✓</div>
                  )}

                  {/* Locked badge */}
                  {!isAllowed && (
                    <div style={{
                      position: 'absolute',
                      top: 12, right: 12,
                      padding: '3px 8px',
                      borderRadius: '20px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      fontSize: '10.5px',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                    }}>🔒 Locked</div>
                  )}

                  {/* Icon */}
                  <div style={{
                    width: 54, height: 54,
                    borderRadius: '14px',
                    background: isSelected
                      ? cfg.color
                      : 'var(--bg-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '26px',
                    marginBottom: '14px',
                    transition: 'var(--transition)',
                  }}>
                    {getIcon(cfg.icon, { size: 22 })}
                  </div>

                  {/* Label */}
                  <p style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '16px',
                    color: isSelected
                      ? cfg.color
                      : 'var(--text-primary)',
                    marginBottom: '6px',
                  }}>{cfg.label}</p>

                  {/* Desc */}
                  <p style={{
                    fontSize: '12.5px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: '14px',
                  }}>{cfg.desc}</p>

                  {/* Features */}
                  {cfg.features.map((f, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      gap: '7px',
                      alignItems: 'flex-start',
                      marginBottom: '5px',
                    }}>
                      <span style={{
                        fontSize: '12px',
                        color: isSelected
                          ? cfg.color
                          : 'var(--text-muted)',
                        marginTop: '1px',
                        flexShrink: 0,
                      }}>✓</span>
                      <span style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                      }}>{f}</span>
                    </div>
                  ))}
                </div>
              );
            }
          )}
        </div>

        {/* RBAC Notice */}
        <div style={{
          padding: '12px 16px',
          background: 'var(--brand-light)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
          marginBottom: '20px',
        }}>
          <span style={{ fontSize: '16px' }}>{getIcon('🛡️', { size: 16 })}</span>
          <div>
            <p style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--brand)',
              marginBottom: '2px',
            }}>
              Role-Based Access Control
            </p>
            <p style={{
              fontSize: '12.5px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}>
              Your account{' '}
              <strong style={{
                color: 'var(--text-primary)',
              }}>
                {pendingUser?.email}
              </strong>
              {' '}is authorised as{' '}
              <strong style={{
                color: 'var(--brand)',
                textTransform: 'capitalize',
              }}>
                {allowedRole}
              </strong>.
              Other roles are locked.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '12px 16px',
            background: 'var(--danger-light)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            gap: '10px',
            marginBottom: '16px',
          }}>
            <span>{getIcon('⚠️', { size: 16 })}</span>
            <p style={{
              fontSize: '13.5px',
              color: 'var(--danger)',
              fontWeight: 500,
            }}>{error}</p>
          </div>
        )}

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={loading || !selected}
          style={{
            width: '100%',
            padding: '14px',
            background: !selected
              ? 'var(--bg-elevated)'
              : 'var(--brand)',
            color: !selected
              ? 'var(--text-muted)'
              : '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '15px',
            fontWeight: 600,
            cursor: !selected
              ? 'not-allowed'
              : 'pointer',
            transition: 'var(--transition)',
            marginBottom: '16px',
          }}>
          {loading
            ? 'Verifying role...'
            : selected
              ? `Continue as ${ROLE_CONFIG[selected]?.label} →`
              : 'Select a role to continue'
          }
        </button>

        {/* Session info */}
        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}>
          🔒 Session active · JWT secured ·{' '}
          <button
            onClick={handleBack}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--brand)',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 600,
            }}>
            Sign in as different user
          </button>
        </p>

      </div>
    </div>
  );
}