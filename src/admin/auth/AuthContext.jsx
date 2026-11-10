import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isFirebaseConfigured, getFirebase } from '../firebase/client.js';
import { initials } from '../lib/date.js';

// Auth state for the admin.
//  - dev mode:      no sign-in; a development user can be switched in the user menu (also demonstrates the roles).
//  - firebase mode: Firebase Authentication (email + password) and a profile in users/{uid} { displayName, role, schoolId }.
// status: loading | ready | signedOut | noProfile
const AuthContext = createContext(null);
const DEV_KEY = 'diakmedia.admin.devUser';

function useDevAuth() {
  const [devUsers, setDevUsers] = useState([]);
  const [uid, setUid] = useState(() => { try { return window.localStorage.getItem(DEV_KEY) || 'dev-editor'; } catch { return 'dev-editor'; } });
  useEffect(() => { import('../data/devSeed.js').then((m) => setDevUsers(m.devUsers)); }, []);
  const switchDevUser = useCallback((id) => { setUid(id); try { window.localStorage.setItem(DEV_KEY, id); } catch { /* ignore */ } }, []);
  const profile = devUsers.find((u) => u.uid === uid) || devUsers[0] || null;
  return { status: profile ? 'ready' : 'loading', profile, devUsers, switchDevUser };
}

function useFirebaseAuth() {
  const [state, setState] = useState({ status: 'loading', profile: null });
  useEffect(() => {
    let unsub = () => {};
    let alive = true;
    (async () => {
      try {
        const { auth, db } = await getFirebase();
        const [{ onAuthStateChanged }, { doc, getDoc }] = await Promise.all([import('firebase/auth'), import('firebase/firestore')]);
        unsub = onAuthStateChanged(auth, async (u) => {
          if (!alive) return;
          if (!u) return setState({ status: 'signedOut', profile: null });
          try {
            const snap = await getDoc(doc(db, 'users', u.uid));
            if (!alive) return;
            if (!snap.exists() || !snap.data().role || !snap.data().schoolId) return setState({ status: 'noProfile', profile: { uid: u.uid, email: u.email } });
            setState({ status: 'ready', profile: { uid: u.uid, email: u.email, ...snap.data() } });
          } catch {
            if (alive) setState({ status: 'noProfile', profile: { uid: u.uid, email: u.email } });
          }
        });
      } catch {
        if (alive) setState({ status: 'signedOut', profile: null });
      }
    })();
    return () => { alive = false; unsub(); };
  }, []);
  return state;
}

export function AuthProvider({ children }) {
  // The mode never changes at runtime, so choosing the hook once per module load is safe.
  const dev = isFirebaseConfigured ? null : useDevAuth(); // eslint-disable-line react-hooks/rules-of-hooks
  const fb = isFirebaseConfigured ? useFirebaseAuth() : null; // eslint-disable-line react-hooks/rules-of-hooks
  const base = dev || fb;

  const signIn = useCallback(async (email, password) => {
    const { auth } = await getFirebase();
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    await signInWithEmailAndPassword(auth, email, password);
  }, []);
  const signOut = useCallback(async () => {
    const { auth } = await getFirebase();
    const { signOut: out } = await import('firebase/auth');
    await out(auth);
  }, []);

  const value = useMemo(() => {
    const p = base.profile;
    const user = p && base.status === 'ready' ? { ...p, initials: initials(p.displayName) } : null;
    return {
      mode: isFirebaseConfigured ? 'firebase' : 'dev',
      status: base.status,
      user,
      authUser: p,
      devUsers: dev?.devUsers || [],
      switchDevUser: dev?.switchDevUser,
      signIn: isFirebaseConfigured ? signIn : undefined,
      signOut: isFirebaseConfigured ? signOut : undefined,
    };
  }, [base, dev, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
