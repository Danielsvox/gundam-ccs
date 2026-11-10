import { parseRate } from './money';

/**
 * How the storefront treats the USD->VES rate returned by
 * GET /payments/exchange-rate/  ({ usd_to_ves, last_updated, source, change_percentage }).
 *
 * Backend facts that drive these rules:
 *  - the backend silently substitutes a hard-coded constant (source === 'fallback')
 *    when every provider fails, and still returns it with HTTP 200;
 *  - no BCV provider exists today (exchangerate.host, Google Finance scraping, OpenExchangeRates).
 *
 * Therefore:
 *   fresh       age <= warnAfterHours      -> show VES normally
 *   stale       warn < age <= hideAfter    -> show VES, flagged "rate from Xh ago"
 *   expired     age > hideAfterHours       -> hide VES, USD only
 *   fallback    source === 'fallback'      -> hide VES, USD only (the number is not a real market rate)
 *   unavailable no / invalid response      -> hide VES, USD only
 *
 * Thresholds are configurable via REACT_APP_RATE_WARN_HOURS / REACT_APP_RATE_HIDE_HOURS.
 */
export const DEFAULT_THRESHOLDS = { warnAfterHours: 6, hideAfterHours: 48 };

export function readThresholds(env = process.env) {
  const warn = Number(env.REACT_APP_RATE_WARN_HOURS);
  const hide = Number(env.REACT_APP_RATE_HIDE_HOURS);
  return {
    warnAfterHours: Number.isFinite(warn) && warn > 0 ? warn : DEFAULT_THRESHOLDS.warnAfterHours,
    hideAfterHours: Number.isFinite(hide) && hide > 0 ? hide : DEFAULT_THRESHOLDS.hideAfterHours,
  };
}

export function evaluateRate(payload, now = Date.now(), thresholds = DEFAULT_THRESHOLDS) {
  const unavailable = {
    status: 'unavailable',
    scaledRate: null,
    rate: null,
    source: null,
    updatedAt: null,
    ageHours: null,
    canShowVes: false,
  };
  if (!payload || typeof payload !== 'object') return unavailable;

  const scaledRate = parseRate(payload.usd_to_ves);
  if (scaledRate === null) return unavailable;

  const updatedAt = payload.last_updated ? new Date(payload.last_updated) : null;
  const validDate = updatedAt && !Number.isNaN(updatedAt.getTime());
  const ageHours = validDate ? Math.max(0, (now - updatedAt.getTime()) / 3_600_000) : null;
  const base = {
    scaledRate,
    rate: Number(payload.usd_to_ves),
    source: payload.source || null,
    updatedAt: validDate ? updatedAt : null,
    ageHours,
  };

  if (payload.source === 'fallback') return { ...base, status: 'fallback', canShowVes: false };
  // A rate we cannot date cannot be trusted to be current.
  if (ageHours === null) return { ...base, status: 'expired', canShowVes: false };
  if (ageHours > thresholds.hideAfterHours) return { ...base, status: 'expired', canShowVes: false };
  if (ageHours > thresholds.warnAfterHours) return { ...base, status: 'stale', canShowVes: true };
  return { ...base, status: 'fresh', canShowVes: true };
}
