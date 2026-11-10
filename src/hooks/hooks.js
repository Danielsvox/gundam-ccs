import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

/** Subscribes to a CSS media query. SSR/jsdom-safe (defaults to `false`). */
export function useMediaQuery(query) {
  const get = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/** Sets document.title for the page and restores the store name when the page unmounts. */
export function useDocumentTitle(title) {
  const { t } = useTranslation();
  useEffect(() => {
    const brand = t('nav.brand');
    document.title = title ? `${title} · ${brand}` : brand;
  }, [title, t]);
}

/** Locks body scroll while `active` (used by modal surfaces). */
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    document.body.classList.add('scroll-locked');
    return () => document.body.classList.remove('scroll-locked');
  }, [active]);
}
