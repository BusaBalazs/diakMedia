import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { usePublicAuth } from '../lib/publicAuth.jsx';
import { useDocumentTitle } from '../lib/hooks.js';

export default function PublicSignInPage() {
  const { user, login, register } = usePublicAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const destinationParam = new URLSearchParams(location.search).get('cel');
  const destination = destinationParam?.startsWith('/') && !destinationParam.startsWith('//') ? destinationParam : '/diakjavaslat';
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  useDocumentTitle(mode === 'login' ? 'Bejelentkezés' : 'Regisztráció');

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setMessage(null);
  };

  if (user) return <Navigate to={destination} replace />;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      if (mode === 'register') await register(form);
      else await login(form);
      navigate(destination, { replace: true });
    } catch (error) {
      setMessage({ tone: 'error', text: error.message || 'A művelet nem sikerült.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="theme-maxi suggestion-page">
      <section className="section container" aria-label="Bejelentkezés és regisztráció">
        <header className="section-header">
          <div>
            <p className="section-header__kicker"><span className="sticker sticker--pink">Csatlakozz a szerkesztőséghez</span></p>
            <h1 className="section-header__title">Dobj egy témát!</h1>
            <p className="section-header__desc">Jelentkezz be vagy hozz létre egy helyi próba-fiókot a javaslatküldéshez.</p>
          </div>
          <Link to="/" className="text-link">Vissza a kezdőlapra</Link>
        </header>
        <div className="suggestion-layout auth-layout">
          <form className="suggestion-form" onSubmit={submit} aria-label={mode === 'login' ? 'Bejelentkezés' : 'Regisztráció'}>
            <span className="sticker sticker--lime suggestion-form__sticker">{mode === 'login' ? 'Jó újra látni!' : 'Legyél a csapat része!'}</span>
            <div className="auth-tabs" aria-label="Fiókművelet">
              <button type="button" aria-pressed={mode === 'login'} className={`auth-tabs__button${mode === 'login' ? ' is-active' : ''}`} onClick={() => changeMode('login')}>Bejelentkezés</button>
              <button type="button" aria-pressed={mode === 'register'} className={`auth-tabs__button${mode === 'register' ? ' is-active' : ''}`} onClick={() => changeMode('register')}>Regisztráció</button>
            </div>
            {mode === 'register' && (
              <label className="suggestion-field" htmlFor="auth-name">
                <span>Neved <span aria-hidden="true">*</span></span>
                <input id="auth-name" type="text" autoComplete="name" required maxLength={80} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </label>
            )}
            <label className="suggestion-field" htmlFor="auth-email">
              <span>E-mail-cím <span aria-hidden="true">*</span></span>
              <input id="auth-email" type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </label>
            <label className="suggestion-field" htmlFor="auth-password">
              <span>Jelszó <span aria-hidden="true">*</span></span>
              <input id="auth-password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
              {mode === 'register' && <span className="suggestion-field__optional">Legalább 8 karakter.</span>}
            </label>
            <button type="submit" className="btn btn--pill suggestion-form__submit" disabled={busy}>
              {busy ? 'Egy pillanat…' : mode === 'login' ? 'Bejelentkezés' : 'Regisztráció'}
            </button>
            {message && <p className="suggestion-form__message suggestion-form__message--error" role="alert">{message.text}</p>}
          </form>
          <aside className="suggestion-note">
            <span className="sticker sticker--yellow">Próbaüzem</span>
            <h2>Ez még nem éles fiók</h2>
            <p>A fiók adatai csak ezen a böngészőn tárolódnak. Nincs szerveres regisztráció vagy valódi hitelesítés; jelszavad nem kerül elmentésre, csak egy helyi ellenőrző hash.</p>
            <p>Ne használj más szolgáltatásokban használt jelszót!</p>
          </aside>
        </div>
      </section>
    </div>
  );
}
