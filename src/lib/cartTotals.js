/* global BigInt */
import { toCents, sumCents, parseRate, usdCentsToVesCents } from './money';

const ZERO = BigInt(0);

export const centsToDecimalString = (cents) => {
  if (cents === null || cents === undefined) return null;
  const negative = cents < ZERO;
  const abs = negative ? -cents : cents;
  const whole = abs / BigInt(100);
  const frac = (abs % BigInt(100)).toString().padStart(2, '0');
  return `${negative ? '-' : ''}${whole}.${frac}`;
};

/**
 * USD decimal string -> VES decimal string ("1234.56") with decimal-safe, half-even rounding.
 * `rate` is the plain decimal rate string from the backend (e.g. "38.5"). Returns null if either is invalid.
 */
export function usdToVesString(usd, rate) {
  const scaled = parseRate(rate);
  const cents = toCents(usd);
  if (scaled === null || cents === null) return null;
  return centsToDecimalString(usdCentsToVesCents(cents, scaled));
}

/**
 * Totals the way the backend computes the order (payments.CheckoutView):
 *   total = subtotal + tax + shipping - discount
 * where tax = cart.total_price_with_tax - cart.total_price (a fixed backend rate; the
 * client never hard-codes it) and discount = sum of applied coupon discounts.
 * Everything is derived from server-provided USD values; nothing is re-computed from a rate.
 */
export function computeCartTotals(cart, shippingUsd = '0') {
  const subtotal = toCents(cart?.total_price) ?? sumCents((cart?.items || []).map((i) => toCents(i.total_price)));
  const withTax = toCents(cart?.total_price_with_tax);
  const tax = withTax === null ? ZERO : withTax - subtotal;
  const discount = toCents(cart?.discount_amount) ?? ZERO;
  const shipping = toCents(shippingUsd) ?? ZERO;
  let total = subtotal + tax + shipping - discount;
  if (total < ZERO) total = ZERO;
  return {
    subtotal: centsToDecimalString(subtotal),
    tax: centsToDecimalString(tax),
    discount: centsToDecimalString(discount),
    shipping: centsToDecimalString(shipping),
    total: centsToDecimalString(total),
    hasTax: tax > ZERO,
    hasDiscount: discount > ZERO,
  };
}
