import { createContext, useContext, useMemo, useState } from 'react';

const USERS_KEY = 'diakmedia.public.users';
const SESSION_KEY = 'diakmedia.public.session';
const ITERATIONS = 210000;
const PublicAuthContext = createContext(null);

function readStoredUser() {
  try {
    const email = window.localStorage.getItem(SESSION_KEY);
    if (!email) return null;
    const users = JSON.parse(window.localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((item) => item.email === email);
    return user ? { name: user.name, email: user.email } : null;
  } catch (error) {
    console.warn('A helyi fiók nem olvasható.', error);
    return null;
  }
}

function toBase64(bytes) {
  return window.btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const key = await window.crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await window.crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: Uint8Array.from(atob(salt), (character) => character.charCodeAt(0)), iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    256,
  );
  return toBase64(bits);
}

function readUsers() {
  const users = JSON.parse(window.localStorage.getItem(USERS_KEY) || '[]');
  if (!Array.isArray(users)) throw new Error('A helyi fiókadatok nem olvashatók.');
  return users;
}

export function PublicAuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const value = useMemo(() => ({
    user,
    async register({ name, email, password }) {
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();
      try {
        const users = readUsers();
        if (users.some((item) => item.email === cleanEmail)) throw new Error('Ezzel az e-mail-címmel már van helyi fiók. Jelentkezz be.');
        const salt = toBase64(window.crypto.getRandomValues(new Uint8Array(16)));
        const passwordHash = await hashPassword(password, salt);
        const account = { name: cleanName, email: cleanEmail, salt, passwordHash };
        window.localStorage.setItem(USERS_KEY, JSON.stringify([...users, account]));
        window.localStorage.setItem(SESSION_KEY, cleanEmail);
        setUser({ name: cleanName, email: cleanEmail });
      } catch (error) {
        if (error instanceof Error && (error.message.startsWith('Ezzel az e-mail-címmel') || error.message.startsWith('A helyi fiókadatok'))) throw error;
        throw new Error('A helyi regisztráció nem sikerült. Ellenőrizd a böngésző tárhelyének beállításait.');
      }
    },
    async login({ email, password }) {
      const cleanEmail = email.trim().toLowerCase();
      try {
        const account = readUsers().find((item) => item.email === cleanEmail);
        if (!account || await hashPassword(password, account.salt) !== account.passwordHash) {
          throw new Error('Hibás e-mail-cím vagy jelszó.');
        }
        window.localStorage.setItem(SESSION_KEY, cleanEmail);
        setUser({ name: account.name, email: account.email });
      } catch (error) {
        if (error instanceof Error && error.message === 'Hibás e-mail-cím vagy jelszó.') throw error;
        throw new Error('A helyi bejelentkezés nem sikerült. Ellenőrizd a böngésző tárhelyének beállításait.');
      }
    },
    logout() {
      try {
        window.localStorage.removeItem(SESSION_KEY);
        setUser(null);
      } catch {
        throw new Error('A kijelentkezés nem sikerült a böngésző tárhelyének hibája miatt.');
      }
    },
  }), [user]);

  return <PublicAuthContext.Provider value={value}>{children}</PublicAuthContext.Provider>;
}

export function usePublicAuth() {
  const context = useContext(PublicAuthContext);
  if (!context) throw new Error('A usePublicAuth csak PublicAuthProvider alatt használható.');
  return context;
}
