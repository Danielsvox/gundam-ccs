import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ErrorMessage.module.css';

const ErrorMessage = ({ message, onRetry, titleKey = 'ui.error.title', retryTextKey = 'ui.error.tryAgain' }) => {
    const { t } = useTranslation();

    // Use custom message if provided, otherwise use default translation
    const displayMessage = message || t('ui.error.default');

    return (
        <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <h3 className={styles.errorTitle}>{t(titleKey)}</h3>
            <p className={styles.errorMessage}>{displayMessage}</p>
            {onRetry && (
                <button className={styles.retryButton} onClick={onRetry}>
                    {t(retryTextKey)}
                </button>
            )}
        </div>
    );
};

export default ErrorMessage; 