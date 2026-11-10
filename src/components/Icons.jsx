const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'square', 'aria-hidden': true, focusable: 'false' };

export const SearchIcon = (p) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l5 5" /></svg>
);
export const MenuIcon = (p) => (
  <svg {...base} {...p}><path d="M3 7h18M3 12h18M3 17h18" /></svg>
);
export const CloseIcon = (p) => (
  <svg {...base} {...p}><path d="M5 5l14 14M19 5L5 19" /></svg>
);
export const SunIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg>
);
export const MoonIcon = (p) => (
  <svg {...base} {...p}><path d="M20.2 15.2A8.5 8.5 0 0 1 8.8 3.8 8.5 8.5 0 1 0 20.2 15.2z" /></svg>
);
export const ClockIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
);
export const SchoolIcon = (p) => (
  <svg {...base} {...p}><path d="M3 10l9-6 9 6M5 10v9h14v-9M10 19v-5h4v5" /></svg>
);
export const NationalIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c3 3 3 14 0 17M12 3.5c-3 3-3 14 0 17" /></svg>
);
export const ArrowLeftIcon = (p) => (
  <svg {...base} {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
);
export const ArrowRightIcon = (p) => (
  <svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const CheckIcon = (p) => (
  <svg {...base} {...p}><path d="M4 12.5l5 5L20 6.5" /></svg>
);
export const StarMark = ({ size = 28, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false" {...p}>
    {[0, 45, 90, 135].map((a, i) => (
      <line key={a} x1="20" y1="4" x2="20" y2="36" stroke={i % 2 ? '#2D3CF0' : '#101426'} strokeWidth="6" strokeLinecap="round" transform={`rotate(${a} 20 20)`} />
    ))}
  </svg>
);
export const HeartIcon = ({ filled, ...p }) => (
  <svg {...base} {...p} fill={filled ? 'currentColor' : 'none'}><path d="M12 20.5s-8-4.8-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 6.2-8 11-8 11z" strokeLinejoin="round" /></svg>
);
export const ShareIcon = (p) => (
  <svg {...base} {...p}><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6" /></svg>
);
export const FacebookIcon = (p) => (
  <svg {...base} {...p} fill="currentColor" stroke="none"><path d="M13.5 21v-8h2.7l.5-3.2h-3.2V7.8c0-.9.4-1.6 1.7-1.6h1.6V3.4c-.3 0-1.3-.2-2.4-.2-2.5 0-4.1 1.5-4.1 4.2v2.4H7.5V13h2.8v8z" /></svg>
);
export const InstagramIcon = (p) => (
  <svg {...base} {...p}><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" /></svg>
);
export const TikTokIcon = (p) => (
  <svg {...base} {...p} fill="currentColor" stroke="none"><path d="M16.6 3c.3 2.3 1.6 3.7 3.9 3.9v2.8c-1.4.1-2.7-.3-3.9-1.1v6.1c0 3.1-2.3 5.3-5.2 5.3-3 0-5.3-2.3-5.3-5.1 0-3.2 2.7-5.5 6-5v3c-1.6-.4-3 .6-3 2 0 1.2.9 2.1 2.1 2.1 1.3 0 2.1-.9 2.1-2.4V3z" /></svg>
);
