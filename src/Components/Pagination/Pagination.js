import React from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon/Icon';
import styles from './Pagination.module.css';

/** [1, '…', 4, 5, 6, '…', 20] — always first, last and current ±1. */
export function pageWindow(current, total) {
  const wanted = new Set([1, total, current - 1, current, current + 1]);
  const pages = [...wanted].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) out.push(p - pages[i - 1] === 2 ? p - 1 : '…');
    out.push(p);
  });
  return out;
}

const Pagination = ({ page, total, onPage }) => {
  const { t } = useTranslation();
  if (total <= 1) return null;

  return (
    <nav className={styles.nav} aria-label={t('catalog.pagination')}>
      <button type="button" className={styles.btn} disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label={t('catalog.previous')}>
        <Icon name="chevronLeft" />
        <span className={styles.word}>{t('catalog.previous')}</span>
      </button>

      <p className={styles.mobileStatus}>{t('catalog.pageOf', { page, total })}</p>

      <ul className={styles.pages}>
        {pageWindow(page, total).map((p, i) => (
          <li key={`${p}-${i}`}>
            {p === '…' ? (
              <span className={styles.gap} aria-hidden="true">…</span>
            ) : (
              <button
                type="button"
                className={`${styles.btn} ${p === page ? styles.current : ''}`}
                aria-current={p === page ? 'page' : undefined}
                aria-label={t('catalog.goToPage', { page: p })}
                onClick={() => p !== page && onPage(p)}
              >
                {p}
              </button>
            )}
          </li>
        ))}
      </ul>

      <button type="button" className={styles.btn} disabled={page >= total} onClick={() => onPage(page + 1)} aria-label={t('catalog.next')}>
        <span className={styles.word}>{t('catalog.next')}</span>
        <Icon name="chevronRight" />
      </button>
    </nav>
  );
};

export default Pagination;
