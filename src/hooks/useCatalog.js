import { useCallback, useEffect, useRef, useState } from 'react';
import productService from '../services/productService';
import { toApiParams } from '../lib/catalog';

/**
 * Loads a catalog page for the given filter state.
 *  - superseded requests are aborted, so a slow earlier response can never overwrite a newer one;
 *  - the previous results stay visible while the next page loads (no flash of empty grid);
 *  - failure keeps the filters (they live in the URL) and offers retry.
 */
export function useCatalog(state) {
  const key = JSON.stringify(toApiParams(state));
  const [result, setResult] = useState({ status: 'loading', products: [], total: 0, error: null });
  const [attempt, setAttempt] = useState(0);
  const latest = useRef(state);
  latest.current = state;

  useEffect(() => {
    const controller = new AbortController();
    setResult((prev) => ({ ...prev, status: 'loading', error: null }));
    productService
      .getCatalog(latest.current, controller.signal)
      .then(({ products, total }) => setResult({ status: 'ready', products, total, error: null }))
      .catch((error) => {
        if (controller.signal.aborted || error?.code === 'ERR_CANCELED') return;
        setResult({ status: 'error', products: [], total: 0, error });
      });
    return () => controller.abort();
  }, [key, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...result, retry };
}

/** Facet values for the filter UI. Loaded once; a failure only disables the facet lists. */
export function useFacets() {
  const [facets, setFacets] = useState(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setFailed(false);
    productService
      .getFacets(controller.signal)
      .then(setFacets)
      .catch((error) => {
        if (controller.signal.aborted || error?.code === 'ERR_CANCELED') return;
        setFailed(true);
      });
    return () => controller.abort();
  }, [attempt]);

  return { facets, failed, retry: () => setAttempt((n) => n + 1) };
}
