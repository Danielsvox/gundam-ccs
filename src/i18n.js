import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './translations/en.json';
import esTranslations from './translations/es.json';

export const SUPPORTED_LANGUAGES = ['es', 'en'];
export const DEFAULT_LANGUAGE = 'es';
const STORAGE_KEY = 'i18nextLng';

/**
 * Earlier versions stored 'sp' (not a valid ISO code) in localStorage. Migrate it to 'es'
 * so returning visitors keep their Spanish preference.
 */
function migrateLegacyLanguage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && stored.toLowerCase().startsWith('sp')) {
            localStorage.setItem(STORAGE_KEY, 'es');
        }
    } catch {
        /* storage unavailable (private mode) - fall back to the default */
    }
}
migrateLegacyLanguage();

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            es: { translation: esTranslations },
            en: { translation: enTranslations },
        },
        // Spanish is the storefront default. We intentionally do NOT sniff navigator.language:
        // only an explicit choice (persisted in localStorage) overrides the default.
        fallbackLng: DEFAULT_LANGUAGE,
        supportedLngs: SUPPORTED_LANGUAGES,
        nonExplicitSupportedLngs: true,
        load: 'languageOnly',
        debug: false,
        interpolation: { escapeValue: false },
        detection: {
            order: ['localStorage'],
            lookupLocalStorage: STORAGE_KEY,
            caches: ['localStorage'],
        },
    });

function syncDocumentLanguage(lng) {
    if (typeof document !== 'undefined') {
        document.documentElement.lang = (lng || DEFAULT_LANGUAGE).slice(0, 2);
    }
}
syncDocumentLanguage(i18n.resolvedLanguage || i18n.language);
i18n.on('languageChanged', syncDocumentLanguage);

export default i18n;
