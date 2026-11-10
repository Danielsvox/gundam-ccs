import { toCents, parseRate, usdCentsToVesCents, formatCents, dualPrice, sumCents, mulCents } from './money';

describe('toCents', () => {
  test('parses decimal strings exactly', () => {
    expect(toCents('24.99')).toBe(BigInt(2499));
    expect(toCents('0.10')).toBe(BigInt(10));
    expect(toCents('7')).toBe(BigInt(700));
    expect(toCents('1234567.89')).toBe(BigInt(123456789));
  });
  test('does not suffer from float artefacts', () => {
    // 0.1 + 0.2 style problems: 1.15 * 100 === 114.99999999999999 in IEEE754
    expect(toCents('1.15')).toBe(BigInt(115));
    expect(toCents('4.35')).toBe(BigInt(435));
  });
  test('rounds unrounded backend decimals half-even (cart tax = subtotal * 1.085)', () => {
    expect(toCents('27.11250')).toBe(BigInt(2711)); // below half
    expect(toCents('27.1150')).toBe(BigInt(2712)); // exact half, 2711 is odd -> up
    expect(toCents('27.1250')).toBe(BigInt(2712)); // exact half, 2712 is even -> stays
    expect(toCents('27.119999')).toBe(BigInt(2712));
    expect(toCents('27.1150001')).toBe(BigInt(2712));
  });
  test('rejects invalid input', () => {
    expect(toCents('abc')).toBeNull();
    expect(toCents('')).toBeNull();
    expect(toCents(null)).toBeNull();
    expect(toCents(undefined)).toBeNull();
    expect(toCents(NaN)).toBeNull();
  });
  test('accepts numbers (2dp)', () => {
    expect(toCents(19.9)).toBe(BigInt(1990));
  });
});

describe('parseRate', () => {
  test('scales to 6 decimals', () => {
    expect(parseRate('36.5')).toBe(BigInt(36500000));
    expect(parseRate(897.5)).toBe(BigInt(897500000));
  });
  test('rejects zero, negatives and garbage', () => {
    expect(parseRate(0)).toBeNull();
    expect(parseRate(-3)).toBeNull();
    expect(parseRate('x')).toBeNull();
    expect(parseRate(null)).toBeNull();
  });
});

describe('usdCentsToVesCents', () => {
  const rate = parseRate('36.5');
  test('converts exactly', () => {
    // $25.00 * 36.5 = Bs 912.50
    expect(usdCentsToVesCents(toCents('25.00'), rate)).toBe(BigInt(91250));
  });
  test('rounds half-even at the 2nd decimal like the backend (Decimal round)', () => {
    // $0.01 * 36.5 = Bs 0.365 -> 0.36 (half-even: 36.5 cents -> 36)
    expect(usdCentsToVesCents(BigInt(1), rate)).toBe(BigInt(36));
    // $0.03 * 36.5 = 1.095 -> 1.10 (109.5 cents -> 110, even)
    expect(usdCentsToVesCents(BigInt(3), rate)).toBe(BigInt(110));
  });
  test('keeps precision with large rates', () => {
    // 897.531234 * $33.00 = 29618.530... -> 2961853 cents
    expect(usdCentsToVesCents(toCents('33.00'), parseRate('897.531234'))).toBe(BigInt(2961853));
  });
  test('returns null when no rate is available', () => {
    expect(usdCentsToVesCents(BigInt(100), null)).toBeNull();
  });
});

describe('cart arithmetic', () => {
  test('sum and multiply stay exact', () => {
    const lines = [mulCents(toCents('24.99'), 3), mulCents(toCents('0.10'), 7), null];
    expect(sumCents(lines)).toBe(BigInt(7497 + 70));
  });
  test('negative quantity is clamped', () => {
    expect(mulCents(BigInt(100), -2)).toBe(BigInt(0));
  });
});

describe('formatCents', () => {
  test('USD in Spanish and English', () => {
    expect(formatCents(BigInt(123456), 'USD', 'en')).toBe('$1,234.56');
    expect(formatCents(BigInt(123456), 'USD', 'es')).toBe('$1.234,56');
  });
  test('VES uses Bs. prefix and Venezuelan separators', () => {
    expect(formatCents(BigInt(2961853), 'VES', 'es')).toBe('Bs. 29.618,53');
    expect(formatCents(BigInt(2961853), 'VES', 'en')).toBe('Bs. 29,618.53');
  });
  test('handles zero and negatives', () => {
    expect(formatCents(BigInt(0), 'USD', 'en')).toBe('$0.00');
    expect(formatCents(BigInt(-500), 'USD', 'en')).toBe('-$5.00');
  });
});

describe('dualPrice', () => {
  test('returns both currencies', () => {
    const p = dualPrice('25.00', parseRate('36.5'), 'es');
    expect(p.usd).toBe('$25,00');
    expect(p.ves).toBe('Bs. 912,50');
  });
  test('VES is null when the rate is unavailable, USD is still shown', () => {
    const p = dualPrice('25.00', null, 'es');
    expect(p.usd).toBe('$25,00');
    expect(p.ves).toBeNull();
  });
  test('invalid USD value yields null', () => {
    expect(dualPrice('n/a', parseRate('36.5'))).toBeNull();
  });
});
