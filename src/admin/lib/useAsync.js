import { useCallback, useEffect, useRef, useState } from 'react';

// Small loading/error/retry helper for data fetching (no state library needed at this stage).
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const run = useRef(0);
  const load = useCallback(() => {
    const id = ++run.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(fn)
      .then((data) => { if (id === run.current) setState({ data, error: null, loading: false }); })
      .catch((error) => { if (id === run.current) setState({ data: null, error, loading: false }); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => { load(); return () => { run.current += 1; }; }, [load]);
  return { ...state, reload: load };
}
