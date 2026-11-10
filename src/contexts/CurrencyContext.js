import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { exchangeRateAPI } from '../services/api';
import { evaluateRate, readThresholds } from '../lib/exchangeRate';
import { dualPrice, formatCents, toCents } from '../lib/money';

const CurrencyContext = createContext(null);

const REFRESH_MS = 15 * 60 * 1000; // matches backend freshness window (it re-fetches after 1h)
const CLOCK_MS = 60 * 1000; // re-evaluate staleness without refetching
const THRESHOLDS = readThresholds();

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};

/**
 * Single source of truth for currency presentation.
 * USD is authoritative; VES is derived from the backend rate and only exposed when
 * the rate is trustworthy (see lib/exchangeRate.js).
 */
export const CurrencyProvider = ({ children }) => {
    const { i18n } = useTranslation();
    const lang = (i18n.resolvedLanguage || i18n.language || 'es').slice(0, 2);

    const [payload, setPayload] = useState(null);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [now, setNow] = useState(() => Date.now());
    const lastFetch = useRef(0);

    const load = useCallback(async (signal) => {
        try {
            const data = await exchangeRateAPI.getCurrentRate(signal);
            setPayload(data);
            setFailed(false);
            lastFetch.current = Date.now();
        } catch (error) {
            if (error?.code === 'ERR_CANCELED' || signal?.aborted) return;
            // Keep the last good payload: staleness rules decide whether it is still usable.
            setFailed(true);
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
                setNow(Date.now());
            }
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        load(controller.signal);
        const refresh = setInterval(() => load(controller.signal), REFRESH_MS);
        const clock = setInterval(() => setNow(Date.now()), CLOCK_MS);
        const onVisible = () => {
            if (document.visibilityState === 'visible' && Date.now() - lastFetch.current > REFRESH_MS / 3) {
                load(controller.signal);
            }
        };
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            controller.abort();
            clearInterval(refresh);
            clearInterval(clock);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [load]);

    const rate = useMemo(() => evaluateRate(payload, now, THRESHOLDS), [payload, now]);

    const dual = useCallback(
        (usd) => dualPrice(usd, rate.canShowVes ? rate.scaledRate : null, lang),
        [rate, lang]
    );

    const formatUsd = useCallback((usd) => {
        const cents = toCents(usd);
        return cents === null ? '' : formatCents(cents, 'USD', lang);
    }, [lang]);

    const value = useMemo(
        () => ({ lang, rate, loading, failed, dual, formatUsd }),
        [lang, rate, loading, failed, dual, formatUsd]
    );

    return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};
