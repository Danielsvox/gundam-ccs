import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FilterPanel from '../../Components/Filters/FilterPanel';
import ProductGrid, { ProductGridSkeleton } from '../../Components/ProductGrid/ProductGrid';
import Pagination from '../../Components/Pagination/Pagination';
import StateMessage from '../../Components/StateMessage/StateMessage';
import Dialog from '../../Components/Dialog/Dialog';
import Icon from '../../Components/Icon/Icon';
import { useCatalog, useFacets } from '../../hooks/useCatalog';
import { useDocumentTitle } from '../../hooks/hooks';
import { useCurrency } from '../../contexts/CurrencyContext';
import {
  PAGE_SIZE,
  activeFilterEntries,
  applyFilterChange,
  clearFilter,
  pageCount,
  parseCatalogParams,
  resetFilters,
  toSearchParams,
} from '../../lib/catalog';
import styles from './CatalogPage.module.css';

const SORT_OPTIONS = [
  ['newest', 'catalog.sortNewest'],
  ['price_asc', 'catalog.sortPriceAsc'],
  ['price_desc', 'catalog.sortPriceDesc'],
  ['name', 'catalog.sortName'],
];

const CatalogPage = () => {
  const { t } = useTranslation();
  const { formatUsd } = useCurrency();
  const [searchParams, setSearchParams] = useSearchParams();
  const state = useMemo(() => parseCatalogParams(searchParams), [searchParams]);
  const { status, products, total, error, retry } = useCatalog(state);
  const { facets, failed: facetsFailed, retry: retryFacets } = useFacets();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const headingRef = useRef(null);
  const firstRender = useRef(true);

  const pages = pageCount(total);
  const outOfRange = state.page > 1 && (error?.response?.status === 404 || (status === 'ready' && total > 0 && products.length === 0));

  const title = state.q ? t('catalog.titleSearch', { q: state.q }) : t('catalog.title');
  useDocumentTitle(title);

  const update = useCallback((patch) => {
    setSearchParams(toSearchParams(applyFilterChange(state, patch)));
  }, [state, setSearchParams]);

  // After a page/filter change, bring the user back to the top of the results.
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    window.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [state.page]);

  const chips = activeFilterEntries(state).map((entry) => {
    let label;
    switch (entry.key) {
      case 'q': label = t('catalog.searchChip', { q: entry.value }); break;
      case 'grade': label = t(`home.grade.${entry.value}`, { defaultValue: entry.value }); break;
      case 'cat': label = facets?.categories?.find((c) => c.slug === entry.value)?.name || entry.value; break;
      case 'available': label = t('catalog.availableOnly'); break;
      case 'sale': label = t('catalog.onSaleOnly'); break;
      case 'price': {
        const { min, max } = entry.value;
        label = min && max
          ? t('catalog.priceChip', { min: formatUsd(min), max: formatUsd(max) })
          : min ? t('catalog.priceFrom', { min: formatUsd(min) }) : t('catalog.priceUpTo', { max: formatUsd(max) });
        break;
      }
      default: label = String(entry.value);
    }
    return { ...entry, label };
  });

  const loading = status === 'loading';
  const firstLoad = loading && products.length === 0;
  const from = (state.page - 1) * PAGE_SIZE + 1;
  const to = Math.min(state.page * PAGE_SIZE, total);

  const filters = (prefix) => (
    <FilterPanel
      idPrefix={prefix}
      facets={facets}
      facetsFailed={facetsFailed}
      onRetryFacets={retryFacets}
      state={state}
      onChange={update}
    />
  );

  let results;
  if (status === 'error' && !outOfRange) {
    results = (
      <StateMessage
        tone="error"
        title={t('catalog.errorTitle')}
        actions={<button type="button" className="btn btn-primary" onClick={retry}>{t('common.retry')}</button>}
      >
        {t('catalog.errorBody')}
      </StateMessage>
    );
  } else if (outOfRange) {
    results = (
      <StateMessage title={t('catalog.outOfRange')} actions={<button type="button" className="btn btn-primary" onClick={() => update({ page: 1 })}>{t('catalog.backToFirst')}</button>} />
    );
  } else if (firstLoad) {
    results = <ProductGridSkeleton />;
  } else if (products.length === 0) {
    results = (
      <StateMessage
        title={state.q ? t('catalog.emptySearchTitle', { q: state.q }) : t('catalog.emptyTitle')}
        actions={chips.length > 0 && <button type="button" className="btn btn-primary" onClick={() => setSearchParams(toSearchParams(resetFilters(state)))}>{t('catalog.emptyReset')}</button>}
      >
        {state.q ? t('catalog.emptySearchBody') : t('catalog.emptyBody')}
      </StateMessage>
    );
  } else {
    results = (
      <>
        <ProductGrid products={products} label={title} />
        <Pagination page={state.page} total={pages} onPage={(page) => update({ page })} />
      </>
    );
  }

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.head}>
        <h1 ref={headingRef} tabIndex={-1} className={styles.title}>{title}</h1>
        {status === 'ready' && total > 0 && !outOfRange && (
          <p className={styles.count}>
            {t('catalog.resultsCount', { count: total })} · {t('catalog.range', { from, to, total })}
          </p>
        )}
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {loading ? t('catalog.loadingProducts') : status === 'ready' ? t('catalog.resultsUpdated', { count: total }) : ''}
      </p>

      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label={t('catalog.filters')}>
          {filters('d')}
        </aside>

        <section className={styles.results} aria-busy={loading}>
          <div className={styles.toolbar}>
            <button type="button" className={`btn ${styles.filterButton}`} onClick={() => setSheetOpen(true)} aria-haspopup="dialog">
              <Icon name="filter" />
              {t('catalog.filters')}
              {chips.length > 0 && <span className={styles.badge}>{chips.length}</span>}
            </button>

            <div className={styles.sort}>
              <label htmlFor="catalog-sort">{t('catalog.sort')}</label>
              <select id="catalog-sort" className="input" value={state.sort} onChange={(e) => update({ sort: e.target.value })}>
                {SORT_OPTIONS.map(([value, key]) => <option key={value} value={value}>{t(key)}</option>)}
              </select>
            </div>
          </div>

          {chips.length > 0 && (
            <ul className={styles.chips} aria-label={t('catalog.activeFilters')}>
              {chips.map((chip) => (
                <li key={chip.key}>
                  <button
                    type="button"
                    className={styles.chip}
                    aria-label={t('catalog.clearOne', { label: chip.label })}
                    onClick={() => setSearchParams(toSearchParams(clearFilter(state, chip.key)))}
                  >
                    {chip.label}
                    <Icon name="close" size={14} />
                  </button>
                </li>
              ))}
              <li>
                <button type="button" className={styles.clearAll} onClick={() => setSearchParams(toSearchParams(resetFilters(state)))}>
                  {t('catalog.clearAll')}
                </button>
              </li>
            </ul>
          )}

          <div className={loading && !firstLoad ? styles.dim : undefined}>{results}</div>
        </section>
      </div>

      <Dialog
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={t('catalog.filters')}
        placement="bottom"
        footer={(
          <div className={styles.sheetFooter}>
            {chips.length > 0 && (
              <button type="button" className="btn" onClick={() => setSearchParams(toSearchParams(resetFilters(state)))}>{t('catalog.clearAll')}</button>
            )}
            <button type="button" className="btn btn-primary" onClick={() => setSheetOpen(false)}>
              {t('catalog.applyFilters', { count: total })}
            </button>
          </div>
        )}
      >
        {filters('m')}
      </Dialog>
    </div>
  );
};

export default CatalogPage;
