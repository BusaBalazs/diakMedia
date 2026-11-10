import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { btnPrimary } from '../components/ui.js';
import { useAuth } from './AuthContext.jsx';

const MESSAGES = {
  'auth/invalid-credential': 'Hibás e-mail-cím vagy jelszó.',
  'auth/invalid-email': 'Az e-mail-cím formátuma nem megfelelő.',
  'auth/too-many-requests': 'Túl sok próbálkozás. Várj egy kicsit, és próbáld újra.',
  'auth/network-request-failed': 'Nincs hálózati kapcsolat.',
};

export function LoginPage() {
  const { status, signIn, mode } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (mode === 'dev' || status === 'ready') return <Navigate to={location.state?.from || '/admin'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try { await signIn(email.trim(), password); } catch (err) { setError(MESSAGES[err.code] || 'A belépés nem sikerült.'); setBusy(false); }
  };
  const field = 'h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm focus:border-brand';
  return (
    <div className="min-h-screen grid place-items-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl border border-line bg-surface shadow-card p-6 grid gap-4">
        <div><h1 className="text-lg font-bold">Belépés a szerkesztőségbe</h1><p className="mt-1 text-sm text-muted">DiákMédia admin</p></div>
        <label className="grid gap-1.5 text-sm font-medium">E-mail<input className={field} type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label className="grid gap-1.5 text-sm font-medium">Jelszó<input className={field} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <p role="alert" className="text-sm text-danger-ink">{error}</p>}
        <button type="submit" className={btnPrimary} disabled={busy}>{busy ? 'Belépés…' : 'Belépés'}</button>
      </form>
    </div>
  );
}

export function NoAccess() {
  const { authUser, signOut } = useAuth();
  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="max-w-md rounded-xl border border-line bg-surface shadow-card p-6 grid gap-3">
        <h1 className="text-lg font-bold">Nincs hozzáférésed</h1>
        <p className="text-sm text-muted">A fiókod ({authUser?.email}) még nincs szerepkörhöz és iskolához rendelve. Kérd meg a tanárt, hogy állítsa be.</p>
        {signOut && <button type="button" className={btnPrimary} onClick={signOut}>Kijelentkezés</button>}
      </div>
    </div>
  );
}
