import { createContext, useCallback, useContext, useMemo, useState } from 'react';

// Demo-only likes: stored in this browser (localStorage). No counts from other visitors exist.
const KEY = 'diakmedia.likes';
const LikesContext = createContext(null);

function read() {
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function LikesProvider({ children }) {
  const [liked, setLiked] = useState(read);
  const toggle = useCallback((id) => {
    setLiked((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable: like lasts for this visit only */ }
      return next;
    });
  }, []);
  const value = useMemo(() => ({ liked, isLiked: (id) => liked.includes(id), toggle }), [liked, toggle]);
  return <LikesContext.Provider value={value}>{children}</LikesContext.Provider>;
}

export const useLikes = () => useContext(LikesContext);
