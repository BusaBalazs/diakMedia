import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BRAND } from '../data/brand.js';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${BRAND.name}` : BRAND.name;
  }, [title]);
}

// Reveals an element once it scrolls into view (CSS handles the animation and reduced motion).
export function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) {
      setShown(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown];
}

// Scroll to top (or to the hash target) on navigation, and move focus to the main region for screen readers.
export function useRouteEffects() {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
    if (first.current) {
      first.current = false;
      return;
    }
    const main = document.getElementById('main');
    if (main) main.focus({ preventScroll: true });
  }, [pathname]);
}
