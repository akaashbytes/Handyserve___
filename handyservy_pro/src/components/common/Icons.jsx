import React from 'react';

function Svg({ children, size = 18, stroke = 1.8, style, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }} {...props}>
      {children}
    </svg>
  );
}

export const IconSun = ({ size, style }) => (
  <Svg size={size} style={style}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v2" />
    <path d="M12 21v2" />
    <path d="M4.2 4.2l1.4 1.4" />
    <path d="M18.4 18.4l1.4 1.4" />
    <path d="M1 12h2" />
    <path d="M21 12h2" />
    <path d="M4.2 19.8l1.4-1.4" />
    <path d="M18.4 5.6l1.4-1.4" />
  </Svg>
);

export const IconMoon = ({ size, style }) => (
  <Svg size={size} style={style}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </Svg>
);

export const IconWrench = ({ size, style }) => (
  <Svg size={size} style={style}>
    <path d="M14.7 9.3a6 6 0 0 1 0 8.5l-4.2-4.2 4.2-4.2z" />
    <path d="M3 21l6-6" />
  </Svg>
);

export const IconBroom = ({ size, style }) => (
  <Svg size={size} style={style}>
    <path d="M7 21l10-10" />
    <path d="M12 21s-2-5 1-8c3-3 6-4 6-4" />
    <path d="M4 19l5-5" />
  </Svg>
);

export const IconHammer = ({ size, style }) => (
  <Svg size={size} style={style}>
    <path d="M3 21l7-7" />
    <path d="M5 13l8-8 4 4-8 8" />
    <path d="M14 5l5 5" />
  </Svg>
);

export const IconBug = ({ size, style }) => (
  <Svg size={size} style={style}>
    <path d="M8 7a4 4 0 0 1 8 0" />
    <path d="M6 12h12" />
    <path d="M8 21a4 4 0 0 1 8 0" />
    <path d="M6 16l-2 2" />
    <path d="M18 16l2 2" />
  </Svg>
);

export const IconBolt = ({ size, style }) => (
  <Svg size={size} style={style}>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </Svg>
);

export const IconStar = ({ size, style }) => (
  <Svg size={size} style={style}>
    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.402 8.173L12 18.897l-7.336 3.872 1.402-8.173L.132 9.21l8.2-1.192L12 .587z" />
  </Svg>
);

export const IconCheck = ({ size, style }) => (
  <Svg size={size} style={style}>
    <path d="M20 6L9 17l-5-5" />
  </Svg>
);

export const IconHome = ({ size, style }) => (
  <Svg size={size} style={style}>
    <path d="M3 10L12 3l9 7v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10z" />
    <path d="M9 21V13h6v8" />
  </Svg>
);

export const IconInfo = ({ size, style }) => (
  <Svg size={size} style={style}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </Svg>
);

export const IconClipboard = ({ size, style }) => (
  <Svg size={size} style={style}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" />
  </Svg>
);

export const IconChart = ({ size, style }) => (
  <Svg size={size} style={style}>
    <path d="M3 3v18h18" />
    <path d="M9 13l3-3 4 4 5-7" />
  </Svg>
);

export const IconHourglass = ({ size, style }) => (
  <Svg size={size} style={style}>
    <path d="M6 2h12" />
    <path d="M6 22h12" />
    <path d="M8 2v6a4 4 0 0 0 2 3.46L12 14l2-2.54A4 4 0 0 0 16 8V2" />
  </Svg>
);

export const IconDollar = ({ size, style }) => (
  <Svg size={size} style={style}>
    <path d="M6 4h12M6 9h12M6 4c8 0 8 10 0 10M6 14h6L18 22" />
  </Svg>
);

export const HSLogo = ({ size = 32, style, variant = 'color' }) => {
  const isWhite = variant === 'white';
  const isDark = variant === 'dark';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: '22%', overflow: 'hidden', ...style }}>
      <defs>
        <linearGradient id="hsLogoGradDef" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      {variant === 'color' ? (
        <rect width="100" height="100" fill="url(#hsLogoGradDef)" />
      ) : isDark ? (
        <rect width="100" height="100" fill="#1E1B4B" />
      ) : isWhite ? (
        <rect width="100" height="100" fill="rgba(255, 255, 255, 0.12)" />
      ) : null}
      
      {/* Symmetrical modern H and S monogram paths */}
      <rect x="25" y="24" width="10" height="52" rx="5" fill={isWhite || variant === 'color' || isDark ? '#FFFFFF' : 'var(--brand)'} />
      <rect x="45" y="24" width="10" height="52" rx="5" fill={isWhite || variant === 'color' || isDark ? '#FFFFFF' : 'var(--brand)'} />
      <rect x="33" y="45" width="14" height="10" rx="2" fill={isWhite || variant === 'color' || isDark ? '#FFFFFF' : 'var(--brand)'} />
      
      <path
        d="M 74 24 H 64 C 55 24, 55 50, 64 50 H 74 C 83 50, 83 76, 74 76 H 64"
        stroke={isWhite || variant === 'color' || isDark ? '#FFFFFF' : 'var(--brand)'}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export const IconSearch = ({ size, style }) => (
  <Svg size={size} style={style}>
    <circle cx="11" cy="11" r="6" />
    <path d="M21 21l-4.35-4.35" />
  </Svg>
);

export const IconMapPin = ({ size, style }) => (
  <Svg size={size} style={style}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </Svg>
);

export const IconCard = ({ size, style }) => (
  <Svg size={size} style={style}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </Svg>
);

export const IconUser = ({ size, style }) => (
  <Svg size={size} style={style}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Svg>
);

export const IconShield = ({ size, style }) => (
  <Svg size={size} style={style}>
    <path d="M12 2l7 4v6c0 5-3.8 9-7 10-3.2-1-7-5-7-10V6l7-4z" />
  </Svg>
);

export const IconSettings = ({ size, style }) => (
  <Svg size={size} style={style}>
    <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 2.47 17.9l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82L4.79 3.47A2 2 0 1 1 7.62.64l.06.06a1.65 1.65 0 0 0 1.82.33H11a1.65 1.65 0 0 0 1-1.51V1a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06A2 2 0 1 1 21.53 6.1l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Svg>
);

export const IconMail = ({ size, style }) => (
  <Svg size={size} style={style}>
    <path d="M4 4h16v16H4z" />
    <path d="M22 6l-10 7L2 6" />
  </Svg>
);

export const IconGrid = ({ size, style }) => (
  <Svg size={size} style={style}>
    <rect x="3" y="3" width="8" height="8" />
    <rect x="13" y="3" width="8" height="8" />
    <rect x="3" y="13" width="8" height="8" />
    <rect x="13" y="13" width="8" height="8" />
  </Svg>
);

export const IconCar = ({ size, style }) => (
  <Svg size={size} style={style}>
    <path d="M3 13l1-5h16l1 5" />
    <path d="M5 13v4" />
    <path d="M19 13v4" />
    <path d="M7 17h.01" />
    <path d="M17 17h.01" />
  </Svg>
);

export const IconSparkles = ({ size, style }) => (
  <Svg size={size} style={style}>
    <path d="M12 2l1.5 3 3 1-3 1L12 10 11 7 8 6l3-1 1-3z" />
    <path d="M5 12l.7 1.4L8 14l-1.3 1.6L6 18l-.8-2.4L3 14l2.2-0.6L5 12z" />
  </Svg>
);

export const IconPhone = ({ size, style }) => (
  <Svg size={size} style={style}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.09 2h3a2 2 0 0 1 2 1.72c.12 1.05.37 2.07.72 3.03a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.05-1.05a2 2 0 0 1 2.11-.45c.96.35 1.98.6 3.03.72A2 2 0 0 1 22 16.92z" />
  </Svg>
);

export const IconWallet = ({ size, style }) => (
  <Svg size={size} style={style}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 3v4" />
  </Svg>
);

export const IconCalendar = ({ size, style }) => (
  <Svg size={size} style={style}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
  </Svg>
);

const ICON_MAP = {
  'logo': HSLogo,
  'HSLogo': HSLogo,
  '☀️': IconSun,
  '🌙': IconMoon,
  '🔧': IconWrench,
  '⚡': IconBolt,
  '⭐': IconStar,
  '✅': IconCheck,
  'ℹ️': IconInfo,
  '📋': IconClipboard,
  '📈': IconChart,
  '⏳': IconHourglass,
  '💰': IconDollar,
  '🚪': IconCheck,
  '🔍': IconSearch,
  '📍': IconMapPin,
  '💳': IconCard,
  '👤': IconUser,
  '🛡️': IconShield,
  '⚙️': IconSettings,
  '📩': IconMail,
  '⊞': IconGrid,
  '📊': IconChart,
  '🏥': IconShield,
  '⚠️': IconInfo,
  '📱': IconPhone,
  '👛': IconWallet,
  '📅': IconCalendar,
  '📧': IconMail,
  '🧑‍🔧': IconWrench,
  '🚗': IconCar,
  '🎉': IconSparkles,
  '🏠': IconHome,
  '🧹': IconBroom,
  '🔨': IconHammer,
  '🐛': IconBug,
};

export function getIcon(key, props = {}) {
  if (!key) return null;
  if (React.isValidElement(key)) return key;
  if (typeof key === 'function') return key(props);
  const K = ICON_MAP[key] || ICON_MAP[String(key).trim()];
  if (K) return <K {...props} />;
  // fallback: simple circle
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8" />
    </Svg>
  );
}

export default {
  IconSun,
  IconMoon,
  IconWrench,
  IconBolt,
  IconStar,
  IconCheck,
  IconInfo,
  IconClipboard,
  IconChart,
  IconHourglass,
  IconDollar,
  HSLogo,
  getIcon,
};
