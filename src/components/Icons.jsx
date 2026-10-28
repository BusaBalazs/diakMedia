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
