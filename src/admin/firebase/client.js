// Firebase initialisation. Everything is loaded lazily, so the public site (and the admin in development mode)
// never downloads the Firebase SDK unless the project is configured.
const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(cfg.apiKey && cfg.projectId && cfg.appId);

let ready;
export function getFirebase() {
  if (!isFirebaseConfigured) return Promise.reject(new Error('A Firebase nincs beállítva (.env).'));
  if (!ready) {
    ready = Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/firestore')]).then(
      ([{ initializeApp, getApps }, { getAuth }, { getFirestore }]) => {
        const app = getApps()[0] || initializeApp(cfg);
        return { app, auth: getAuth(app), db: getFirestore(app) };
      }
    );
  }
  return ready;
}

// Firebase Storage is loaded only when an image is uploaded.
let storagePromise;
export function getStorageInstance() {
  if (!storagePromise) {
    storagePromise = Promise.all([getFirebase(), import('firebase/storage')]).then(([{ app }, { getStorage }]) => getStorage(app));
  }
  return storagePromise;
}
