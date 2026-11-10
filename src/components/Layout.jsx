import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BRAND } from '../data/brand.js';
import { categories } from '../data/categories.js';
import { CloseIcon, MenuIcon, MoonIcon, SearchIcon, StarMark, SunIcon } from './Icons.jsx';
import { useRouteEffects } from '../lib/hooks.js';
import { PublicAuthProvider, usePublicAuth } from '../lib/publicAuth.jsx';

const THEME_KEY = 'diakmedia.theme';

function getInitialTheme() {
  try {
    const storedTheme = window.localStorage.getItem(THEME_KEY);
    if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
  } catch (error) {
    console.warn('A megjelenítési beállítás nem olvasható a böngésző tárhelyéről.', error);
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const NAV = [
  { to: '/', label: 'Kezdőlap', end: true },
  { to: '/kategoriak', label: 'Kategóriák', match: ['/kategoriak', '/kategoria/'] },
];

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label={`${BRAND.name}, kezdőlap`}>
      <StarMark size={32} className="logo__mark" />
      <span className="logo__text">{BRAND.name}</span>
    </Link>
  );
}

function Header({ theme, onToggleTheme }) {
  const { user, logout } = usePublicAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');
  const [logoutError, setLogoutError] = useState('');
  const inputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = user ? [...NAV, { to: '/diakjavaslat', label: 'Diákjavaslat' }] : NAV;

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [location.pathname, location.search]);
  useEffect(() => { if (searchOpen) inputRef.current?.focus(); }, [searchOpen]);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setMenuOpen(false); setSearchOpen(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isActive = (item) =>
    item.match ? item.match.some((m) => location.pathname.startsWith(m)) : item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);

  const submit = (e) => {
    e.preventDefault();
    navigate(`/kereses?q=${encodeURIComponent(q.trim())}`);
  };

  const handleLogout = () => {
    try {
      logout();
      setLogoutError('');
      navigate('/');
    } catch (error) {
      setLogoutError(error.message);
    }
  };

  return (
    <header className="site-header">
      <div className="demo-strip"><p>{BRAND.demoNoticeShort}</p></div>
      <div className="site-header__bar container">
        <Logo />
        <nav className="main-nav" aria-label="Fő navigáció">
          <ul>
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} className={isActive(item) ? 'main-nav__link is-active' : 'main-nav__link'} aria-current={isActive(item) ? 'page' : undefined}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="site-header__actions">
          {!user && <Link to="/belepes?cel=%2Fdiakjavaslat" className="icon-btn auth-header-link">Bejelentkezés</Link>}
          {user && <button type="button" className="icon-btn auth-header-link" onClick={handleLogout}>Kilépés</button>}
          <button type="button" className="icon-btn theme-toggle" aria-label={theme === 'light' ? 'Sötét mód bekapcsolása' : 'Világos mód bekapcsolása'} aria-pressed={theme === 'dark'} onClick={onToggleTheme} title={theme === 'light' ? 'Sötét mód' : 'Világos mód'}>
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            <span className="icon-btn__label">{theme === 'light' ? 'Sötét mód' : 'Világos mód'}</span>
          </button>
          <button type="button" className="icon-btn" aria-expanded={searchOpen} aria-controls="search-panel" onClick={() => { setSearchOpen((v) => !v); setMenuOpen(false); }}>
            {searchOpen ? <CloseIcon /> : <SearchIcon />}
            <span className="icon-btn__label">Keresés</span>
          </button>
          <button type="button" className="icon-btn icon-btn--menu" aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => { setMenuOpen((v) => !v); setSearchOpen(false); }}>
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
            <span className="visually-hidden">{menuOpen ? 'Menü bezárása' : 'Menü megnyitása'}</span>
          </button>
        </div>
      </div>

      <div id="search-panel" className={`drawer${searchOpen ? ' is-open' : ''}`}>
        <div className="drawer__inner">
          <form className="search-form container" role="search" onSubmit={submit}>
            <label htmlFor="header-search" className="visually-hidden">Keresés a cikkek, rovatok és témák között</label>
            <input id="header-search" ref={inputRef} type="search" lang="hu" spellCheck="true" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Keresés cikkekre és témákra" autoComplete="off" />
            <button type="submit" className="btn btn--primary">Keresés</button>
          </form>
        </div>
      </div>

      <div id="mobile-menu" className={`drawer drawer--menu${menuOpen ? ' is-open' : ''}`}>
        <div className="drawer__inner">
          <nav className="mobile-nav container" aria-label="Mobil navigáció">
            <ul>
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.end} className={isActive(item) ? 'mobile-nav__link is-active' : 'mobile-nav__link'} aria-current={isActive(item) ? 'page' : undefined}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <p className="mobile-nav__context">Pilot lap: <strong>Jedlik Ányos Gimnázium · Szikra</strong></p>
          </nav>
        </div>
      </div>
      {logoutError && <p className="auth-header-error container" role="alert">{logoutError}</p>}
    </header>
  );
}

function Footer() {
  const { user } = usePublicAuth();
  const navItems = user ? [...NAV, { to: '/diakjavaslat', label: 'Diákjavaslat' }] : NAV;
  return (
    <footer className="site-footer torn-top">
      <div className="container site-footer__grid">
        <div>
          <Logo />
          <p className="site-footer__tagline">{BRAND.tagline}</p>
        </div>
        <nav aria-label="Oldaltérkép">
          <h2 className="site-footer__title">Olvasás</h2>
          <ul>
            {navItems.map((n) => (<li key={n.to}><Link to={n.to}>{n.label}</Link></li>))}
          </ul>
        </nav>
        <nav aria-label="Kategóriák">
          <h2 className="site-footer__title">Kategóriák</h2>
          <ul className="site-footer__cols">
            {categories.map((c) => (<li key={c.id}><Link to={`/kategoria/${c.id}`}>{c.name}</Link></li>))}
          </ul>
        </nav>
      </div>
      <div className="container site-footer__note">
        <p>{BRAND.futureNote}</p>
        <p>{BRAND.demoNotice}</p>
      </div>
    </footer>
  );
}

export default function Layout() {
  useRouteEffects();
  const [theme, setTheme] = useState(getInitialTheme);
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      window.localStorage.setItem(THEME_KEY, nextTheme);
    } catch (error) {
      console.warn('A megjelenítési beállítás nem menthető a böngésző tárhelyére.', error);
    }
  };
  return (
    <PublicAuthProvider>
      <div className="public-site" data-theme={theme}>
        <a className="skip-link" href="#main">Ugrás a tartalomra</a>
        <Header theme={theme} onToggleTheme={toggleTheme} />
        <main id="main" tabIndex={-1}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </PublicAuthProvider>
  );
}
