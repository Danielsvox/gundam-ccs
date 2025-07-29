import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ message, translationKey = 'ui.loading.default' }) => {
    const { t } = useTranslation();

    // Use custom message if provided, otherwise use translation
    const displayMessage = message || t(translationKey);

    return (
        <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>{displayMessage}</p>
        </div>
    );
};

export default LoadingSpinner; 