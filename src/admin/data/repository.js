// The single place that decides where data comes from.
//  - Firebase configured (.env)  -> Firestore repository (loaded lazily).
//  - not configured              -> temporary development repository (in-memory, fictional data).
// UI code only ever calls getRepository(); it never imports Firebase or the seed data directly.
import { isFirebaseConfigured } from '../firebase/client.js';

let repo;
export function getRepository() {
  if (!repo) {
    repo = isFirebaseConfigured
      ? import('./firestoreRepository.js').then((m) => m.firestoreRepository)
      : import('./devRepository.js').then((m) => m.devRepository);
  }
  return repo;
}

export const dataMode = isFirebaseConfigured ? 'firebase' : 'dev';
