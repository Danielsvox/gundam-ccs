import React from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../../i18n';
import styles from './LanguageSwitcher.module.css';

const LanguageSwitcher = () => {
    const { t, i18n } = useTranslation();
    const current = (i18n.resolvedLanguage || i18n.language || 'es').slice(0, 2);

    return (
        <div className={styles.switcher} role="group" aria-label={t('language.label')}>
            {SUPPORTED_LANGUAGES.map((code) => {
                const name = t(`language.${code}`, { lng: code });
                const active = current === code;
                return (
                    <button
                        key={code}
                        type="button"
                        lang={code}
                        className={`${styles.option} ${active ? styles.active : ''}`}
                        aria-pressed={active}
                        aria-label={active ? name : t('language.switchTo', { language: name })}
                        onClick={() => !active && i18n.changeLanguage(code)}
                    >
                        {code.toUpperCase()}
                    </button>
                );
            })}
        </div>
    );
};

export default LanguageSwitcher;
