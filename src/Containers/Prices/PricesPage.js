import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useDocumentTitle } from '../../hooks/hooks';
import { localeFor } from '../../lib/money';
import styles from './PricesPage.module.css';

const PricesPage = () => {
  const { t } = useTranslation();
  const { rate, lang, loading } = useCurrency();
  useDocumentTitle(t('pricesPage.title'));

  const usable = rate.canShowVes;
  const updated = rate.updatedAt
    ? new Intl.DateTimeFormat(localeFor(lang), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(rate.updatedAt))
    : null;

  return (
    <div className={`container ${styles.page}`}>
      <h1>{t('pricesPage.title')}</h1>
      <p className={styles.lead}>{t('pricesPage.lead')}</p>

      <dl className={styles.rate} aria-live="polite">
        <div><dt>{t('pricesPage.currentRate')}</dt><dd>{loading ? t('common.loading') : usable ? t('price.rateLine', { rate: rate.rate }) : t('pricesPage.none')}</dd></div>
        {usable && rate.source && <div><dt>{t('pricesPage.source')}</dt><dd>{rate.source}</dd></div>}
        {updated && <div><dt>{t('pricesPage.updated')}</dt><dd>{updated}</dd></div>}
      </dl>
      {rate.status === 'stale' && <p className={styles.warn} role="status">{t('price.rateStale', { hours: Math.round(rate.ageHours) })}</p>}
      {!loading && !usable && <p className={styles.warn} role="status">{t('price.rateUnavailable')}</p>}

      {['usd', 'ves', 'stale', 'pay'].map((k) => (
        <section key={k} className={styles.block}>
          <h2>{t(`pricesPage.${k}Title`)}</h2>
          <p>{t(`pricesPage.${k}Body`)}</p>
        </section>
      ))}

      <Link to="/browse" className="btn btn-primary">{t('pricesPage.cta')}</Link>
    </div>
  );
};

export default PricesPage;
