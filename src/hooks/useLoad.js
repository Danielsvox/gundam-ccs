import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs `loader(signal)` on mount / when `key` changes. Aborts the previous request,
 * ignores aborted results, and exposes `reload`.
 * status: 'loading' | 'ready' | 'error'
 */
export function useLoad(loader, key) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const [attempt, setAttempt] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ status: 'loading', data: prev.data, error: null }));
    Promise.resolve()
      .then(() => loaderRef.current(controller.signal))
      .then((data) => { if (!controller.signal.aborted) setState({ status: 'ready', data, error: null }); })
      .catch((error) => {
        if (controller.signal.aborted || error?.code === 'ERR_CANCELED') return;
        setState({ status: 'error', data: null, error });
      });
    return () => controller.abort();
  }, [key, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, reload };
}
