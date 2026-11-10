const Svg = ({ children, size = 20, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...p}>{children}</svg>
);

export const Icons = {
  dashboard: (p) => <Svg {...p}><rect x="3.5" y="3.5" width="7" height="8" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="5" rx="1.5" /><rect x="3.5" y="14.5" width="7" height="6" rx="1.5" /><rect x="13.5" y="11.5" width="7" height="9" rx="1.5" /></Svg>,
  document: (p) => <Svg {...p}><path d="M14 3.5H7.5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V8z" /><path d="M14 3.5V8h4.5M9 13h6M9 16.5h4" /></Svg>,
  lightbulb: (p) => <Svg {...p}><path d="M9.5 18.5h5M10 21h4M12 3.5a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2h5c0-.8.4-1.5 1-2A6 6 0 0 0 12 3.5z" /></Svg>,
  users: (p) => <Svg {...p}><circle cx="9" cy="8.5" r="3.2" /><path d="M3.5 19.5c.4-3.2 2.7-5 5.5-5s5.1 1.8 5.5 5M16 5.6a3.2 3.2 0 0 1 0 5.8M17.5 14.8c1.9.5 3.1 2 3.5 4.7" /></Svg>,
  settings: (p) => <Svg {...p}><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8" /></Svg>,
  notebook: (p) => <Svg {...p}><path d="M6.5 3.5h10a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-10zM6.5 3.5v17M3.5 7.5h3M3.5 12h3M3.5 16.5h3M10.5 8h5M10.5 12h5" /></Svg>,
  trash: (p) => <Svg {...p}><path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7M10 11v5M14 11v5" /></Svg>,
  arrowUp: (p) => <Svg {...p}><path d="M12 19V5M6 11l6-6 6 6" /></Svg>,
  arrowDown: (p) => <Svg {...p}><path d="M12 5v14M6 13l6 6 6-6" /></Svg>,
  image: (p) => <Svg {...p}><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M4 17l5-4.5 4 3.5 3-2.5 4 3.5" /></Svg>,
  edit: (p) => <Svg {...p}><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z" /></Svg>,
  menu: (p) => <Svg {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Svg>,
  close: (p) => <Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>,
  plus: (p) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>,
  chevronRight: (p) => <Svg {...p}><path d="M9 6l6 6-6 6" /></Svg>,
  chevronDown: (p) => <Svg {...p}><path d="M6 9l6 6 6-6" /></Svg>,
  external: (p) => <Svg {...p}><path d="M14 4h6v6M20 4l-9 9M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" /></Svg>,
  logout: (p) => <Svg {...p}><path d="M9 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2H9M15 8l4 4-4 4M19 12H9.5" /></Svg>,
  check: (p) => <Svg {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>,
  alert: (p) => <Svg {...p}><path d="M12 4l9 16H3zM12 10v4.5M12 17.5v.1" /></Svg>,
  inbox: (p) => <Svg {...p}><path d="M4 13.5l2.2-7.2A2 2 0 0 1 8.1 5h7.8a2 2 0 0 1 1.9 1.3L20 13.5M4 13.5V18a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 18v-4.5M4 13.5h4.5l1 2.5h5l1-2.5H20" /></Svg>,
  clock: (p) => <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Svg>,
  refresh: (p) => <Svg {...p}><path d="M20 11a8 8 0 0 0-14.3-4.4L4 8.5M4 4v4.5h4.5M4 13a8 8 0 0 0 14.3 4.4L20 15.5M20 20v-4.5h-4.5" /></Svg>,
};

export function Icon({ name, ...p }) {
  const C = Icons[name];
  return C ? <C {...p} /> : null;
}
