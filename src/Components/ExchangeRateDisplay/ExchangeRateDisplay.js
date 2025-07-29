import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../contexts/CurrencyContext';
import styles from './ExchangeRateDisplay.module.css';

const ExchangeRateDisplay = () => {
    const { t } = useTranslation();
    const { exchangeRate, rateLoading, rateError } = useCurrency();

    if (rateLoading) {
        return (
            <div className={styles.exchangeRateBadge}>
                <span className={styles.loading}>🔄</span>
            </div>
        );
    }

    if (rateError || !exchangeRate) {
        return (
            <div className={styles.exchangeRateBadge} title={t('currency.rateUnavailable')}>
                <span className={styles.error}>⚠️</span>
            </div>
        );
    }

    return (
        <div
            className={styles.exchangeRateBadge}
            title={t('currency.rateTooltip', { rate: exchangeRate.toFixed(2) })}
        >
            <span className={styles.rate}>
                1 USD ≈ {exchangeRate.toFixed(2)} VES
            </span>
        </div>
    );
};

export default ExchangeRateDisplay; 