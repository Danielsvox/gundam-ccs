/* global BigInt */
/**
 * Money helpers.
 *
 * Pricing contract (verified against the backend):
 *  - USD is the authoritative currency. Product.price / sale_price / orders /
 *    payments are all stored as USD DecimalField(2).
 *  - VES is a *derived, indicative* amount: usd * (usd_to_ves rate), rounded to
 *    2 decimals with ROUND_HALF_EVEN, which is what the backend's
 *    /payments/exchange-rate/convert/ endpoint does (Python's round(Decimal, 2)).
 *
 * All arithmetic is done on integers (BigInt minor units) so we never rely on
 * binary floating point for money.
 */

const RATE_DECIMALS = 6;
const RATE_SCALE = BigInt(10) ** BigInt(RATE_DECIMALS);
const ZERO = BigInt(0);
const ONE = BigInt(1);
const TWO = BigInt(2);
const TEN = BigInt(10);

/** Parse "24.99" | 24.99 | "1,5" -> BigInt cents. Returns null when invalid. */
export function toCents(value) {
  if (value === null || value === undefined || value === '') return null;
  let text;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    text = value.toFixed(2);
  } else {
    text = String(value).trim();
  }
  const match = /^(-)?(\d+)(?:\.(\d+))?$/.exec(text);
  if (!match) return null;
  const [, sign, whole, frac = ''] = match;
  const padded = (frac + '00').slice(0, 2);
  let cents = BigInt(whole) * BigInt(100) + BigInt(padded);
  if (frac.length > 2) {
    // The backend can return unrounded Decimals (e.g. cart total * 1.085 -> "27.11250").
    // Round the remainder half-even, which is how Decimal quantisation behaves server-side.
    const rest = frac.slice(2);
    const half = '5'.padEnd(rest.length, '0');
    if (rest > half || (rest === half && cents % TWO === ONE)) cents += ONE;
  }
  return sign ? -cents : cents;
}

/** Parse an exchange rate into a scaled BigInt (6 decimals). null when invalid or <= 0. */
export function parseRate(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = typeof value === 'number' ? value : Number(String(value).trim());
  if (!Number.isFinite(num) || num <= 0) return null;
  const text = num.toFixed(RATE_DECIMALS);
  const [whole, frac] = text.split('.');
  return BigInt(whole) * RATE_SCALE + BigInt(frac);
}

/** Integer division with ROUND_HALF_EVEN (banker's rounding), for non-negative or negative numerators. */
function divRoundHalfEven(numerator, denominator) {
  const negative = (numerator < ZERO) !== (denominator < ZERO);
  const n = numerator < ZERO ? -numerator : numerator;
  const d = denominator < ZERO ? -denominator : denominator;
  let q = n / d;
  const r = n % d;
  const twice = r * TWO;
  if (twice > d || (twice === d && q % TWO === ONE)) q += ONE;
  return negative ? -q : q;
}

/** USD cents -> VES cents using a scaled rate. */
export function usdCentsToVesCents(usdCents, scaledRate) {
  if (usdCents === null || scaledRate === null) return null;
  return divRoundHalfEven(usdCents * scaledRate, RATE_SCALE);
}

/** Sum of cents values, ignoring nulls. */
export function sumCents(list) {
  return list.reduce((acc, c) => (c === null || c === undefined ? acc : acc + c), ZERO);
}

/** Multiply cents by an integer quantity. */
export function mulCents(cents, qty) {
  if (cents === null) return null;
  return cents * BigInt(Math.max(0, Math.trunc(qty)));
}

const SYMBOLS = { USD: '$', VES: 'Bs.' };

export function localeFor(lang) {
  return lang === 'en' ? 'en-US' : 'es-VE';
}

/** Format cents as "$1,234.56" / "$1.234,56" / "Bs. 1.234,56" depending on UI language. */
export function formatCents(cents, currency, lang = 'es') {
  if (cents === null || cents === undefined) return '';
  const amount = Number(cents) / 100;
  const body = new Intl.NumberFormat(localeFor(lang), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
  const sign = cents < ZERO ? '-' : '';
  const symbol = SYMBOLS[currency] || currency;
  return currency === 'VES' ? `${sign}${symbol} ${body}` : `${sign}${symbol}${body}`;
}

/**
 * Build a dual-currency price view from a USD decimal string.
 * `rate` is the scaled rate from parseRate(), or null when VES must not be shown.
 */
export function dualPrice(usdValue, scaledRate, lang = 'es') {
  const usdCents = toCents(usdValue);
  if (usdCents === null) return null;
  const vesCents = usdCentsToVesCents(usdCents, scaledRate);
  return {
    usdCents,
    vesCents,
    usd: formatCents(usdCents, 'USD', lang),
    ves: vesCents === null ? null : formatCents(vesCents, 'VES', lang),
  };
}

export const __internals = { RATE_SCALE, TEN };
