// The single place that decides where data comes from.
//  - VITE_DEMO_MODE=true        -> temporary repository (in-memory, fictional data).
//  - Firebase configured        -> Firestore repository (loaded lazily).
// Production builds use Firestore unless explicitly built in demo mode.
// UI code only ever calls getRepository(); it never imports Firebase or the seed data directly.
import { isDemoMode, isFirebaseConfigured } from '../firebase/client.js';

const useFirebase = !isDemoMode && (import.meta.env.PROD || isFirebaseConfigured);
let repo;
export function getRepository() {
  if (!repo) {
    repo = useFirebase
      ? import('./firestoreRepository.js').then((m) => m.firestoreRepository)
      : import('./devRepository.js').then((m) => m.devRepository);
  }
  return repo;
}

export const dataMode = useFirebase ? 'firebase' : 'dev';
