import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LanguageSwitcher.module.css';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const currentLanguage = i18n.language;

    return (
        <div className={styles.languageSwitcher}>
            <button
                className={`${styles.langButton} ${currentLanguage === 'en' ? styles.active : ''}`}
                onClick={() => changeLanguage('en')}
                aria-label="Switch to English"
            >
                EN
            </button>
            <span className={styles.separator}>|</span>
            <button
                className={`${styles.langButton} ${currentLanguage === 'sp' ? styles.active : ''}`}
                onClick={() => changeLanguage('sp')}
                aria-label="Cambiar a Español"
            >
                SP
            </button>
        </div>
    );
};

export default LanguageSwitcher; 