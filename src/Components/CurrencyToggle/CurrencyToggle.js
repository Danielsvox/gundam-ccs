import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../contexts/CurrencyContext';
import styles from './CurrencyToggle.module.css';

const CurrencyToggle = () => {
    const { t } = useTranslation();
    const { currency, updateCurrency } = useCurrency();

    const handleCurrencyChange = (newCurrency) => {
        updateCurrency(newCurrency);
    };

    return (
        <div className={styles.currencyToggle}>
            <button
                className={`${styles.currencyButton} ${currency === 'USD' ? styles.active : ''}`}
                onClick={() => handleCurrencyChange('USD')}
                aria-label={t('currency.switchToUSD')}
            >
                USD
            </button>
            <button
                className={`${styles.currencyButton} ${currency === 'VES' ? styles.active : ''}`}
                onClick={() => handleCurrencyChange('VES')}
                aria-label={t('currency.switchToVES')}
            >
                VES
            </button>
        </div>
    );
};

export default CurrencyToggle; 