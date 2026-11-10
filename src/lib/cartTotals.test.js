import { computeCartTotals, centsToDecimalString } from './cartTotals';

describe('centsToDecimalString', () => {
  test('formats with two decimals', () => {
    expect(centsToDecimalString(BigInt(5))).toBe('0.05');
    expect(centsToDecimalString(BigInt(2500))).toBe('25.00');
    expect(centsToDecimalString(BigInt(-1234))).toBe('-12.34');
    expect(centsToDecimalString(null)).toBeNull();
  });
});

describe('computeCartTotals', () => {
  const cart = {
    total_price: '50.00',
    total_price_with_tax: '54.2500', // backend: subtotal * 1.085
    discount_amount: '5.00',
    items: [],
  };

  test('mirrors backend order maths: subtotal + tax + shipping - discount', () => {
    const t = computeCartTotals(cart, '3.50');
    expect(t).toMatchObject({ subtotal: '50.00', tax: '4.25', discount: '5.00', shipping: '3.50', total: '52.75' });
    expect(t.hasTax).toBe(true);
    expect(t.hasDiscount).toBe(true);
  });

  test('no tax/discount information -> plain subtotal', () => {
    const t = computeCartTotals({ total_price: '25.00', items: [] });
    expect(t).toMatchObject({ subtotal: '25.00', tax: '0.00', discount: '0.00', total: '25.00' });
    expect(t.hasTax).toBe(false);
  });

  test('falls back to summing line items when total_price is missing', () => {
    const t = computeCartTotals({ items: [{ total_price: '10.10' }, { total_price: '20.20' }] });
    expect(t.subtotal).toBe('30.30');
  });

  test('unrounded backend tax is rounded to cents', () => {
    const t = computeCartTotals({ total_price: '25.00', total_price_with_tax: '27.1250', items: [] });
    expect(t.tax).toBe('2.12'); // 27.1250 -> 27.12 (half-even), minus 25.00
  });

  test('a discount larger than the order never produces a negative total', () => {
    const t = computeCartTotals({ total_price: '4.00', discount_amount: '9.00', items: [] });
    expect(t.total).toBe('0.00');
  });

  test('empty cart', () => {
    expect(computeCartTotals(null).total).toBe('0.00');
  });
});
