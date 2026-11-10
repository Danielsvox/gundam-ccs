import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../contexts/CurrencyContext';
import styles from './Price.module.css';

/**
 * The one way prices are rendered across catalog, product page, cart and checkout.
 * `usd` is the authoritative amount (decimal string); VES is derived, and omitted
 * whenever the exchange rate is unavailable or too old.
 */
const Price = ({ usd, listUsd, size = 'md', align = 'start', negative = false }) => {
    const { t } = useTranslation();
    const { dual, rate, loading } = useCurrency();
    const price = dual(usd);
    if (!price) return null;
    const list = listUsd ? dual(listUsd) : null;

    return (
        <span className={`${styles.price} ${styles[size]} ${align === 'end' ? styles.end : ''}`}>
            <span className={styles.usd}>
                {negative ? '−' : ''}{price.usd}
                <span className="sr-only"> {t('price.usd')}</span>
            </span>
            {list && (
                <s className={styles.was}>
                    <span className="sr-only">{t('price.was', { price: list.usd })}</span>
                    <span aria-hidden="true">{list.usd}</span>
                </s>
            )}
            {price.ves ? (
                <span
                    className={`${styles.ves} ${rate.status === 'stale' ? styles.approx : ''}`}
                    title={rate.status === 'stale' ? t('price.rateStale', { hours: Math.round(rate.ageHours) }) : undefined}
                >
                    {rate.status === 'stale' ? '≈ ' : ''}{negative ? '−' : ''}{price.ves}
                    <span className="sr-only"> {t('price.ves')}</span>
                </span>
            ) : (
                // Reserve the row while the rate loads to avoid layout shift.
                loading && <span className={`${styles.ves} ${styles.placeholder}`} aria-hidden="true">Bs. ——</span>
            )}
        </span>
    );
};

export default Price;
