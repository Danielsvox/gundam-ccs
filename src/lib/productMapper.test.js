import { normalizeProduct, deriveAvailability, pickLocalized, resolveMediaUrl } from './productMapper';

const API = 'http://localhost:8000/api/v1';

describe('resolveMediaUrl', () => {
  test('relative media paths are resolved against the API origin', () => {
    expect(resolveMediaUrl('/media/products/a.jpg', API)).toBe('http://localhost:8000/media/products/a.jpg');
  });
  test('absolute URLs are untouched', () => {
    expect(resolveMediaUrl('https://cdn.example.com/a.jpg', API)).toBe('https://cdn.example.com/a.jpg');
  });
  test('empty stays empty', () => {
    expect(resolveMediaUrl('', API)).toBe('');
  });
});

describe('deriveAvailability', () => {
  test('flag and quantity must agree', () => {
    expect(deriveAvailability(true, 0).state).toBe('out'); // backend default for new products
    expect(deriveAvailability(false, 10).state).toBe('out');
    expect(deriveAvailability(true, 2)).toEqual({ state: 'low', quantity: 2 });
    expect(deriveAvailability(true, 4)).toEqual({ state: 'in', quantity: 4 });
  });
  test('garbage quantity is treated as out of stock', () => {
    expect(deriveAvailability(true, 'x').state).toBe('out');
  });
});

describe('pickLocalized', () => {
  const product = { description: 'Kit de HG', description_en: undefined };
  test('falls back to the base text and says so', () => {
    expect(pickLocalized(product, 'description', 'en')).toEqual({ text: 'Kit de HG', isFallback: true });
  });
  test('uses a localized field when the API provides one', () => {
    expect(pickLocalized({ ...product, description_en: 'HG kit' }, 'description', 'en')).toEqual({ text: 'HG kit', isFallback: false });
  });
  test('never invents text', () => {
    expect(pickLocalized({}, 'description', 'es').text).toBe('');
  });
});

describe('normalizeProduct', () => {
  const base = {
    id: 1,
    slug: 'rx-78-2',
    name: 'RX-78-2 Gundam',
    price: '30.00',
    sale_price: '25.00',
    current_price: '25.00',
    is_on_sale: true,
    discount_percentage: 16,
    grade: 'MG',
    scale: '1/100',
    manufacturer: 'Bandai',
    in_stock: true,
    stock_quantity: 2,
    category: { id: 3, name: 'Universal Century', slug: 'universal-century' },
    primary_image: { image: '/media/products/rx.jpg', alt_text: '' },
  };

  test('maps pricing, availability and media', () => {
    const p = normalizeProduct(base, API);
    expect(p.price).toBe('25.00');
    expect(p.listPrice).toBe('30.00');
    expect(p.onSale).toBe(true);
    expect(p.availability).toEqual({ state: 'low', quantity: 2 });
    expect(p.image).toEqual({ src: 'http://localhost:8000/media/products/rx.jpg', alt: 'RX-78-2 Gundam' });
  });

  test('does not fabricate an image when none exists', () => {
    const p = normalizeProduct({ ...base, primary_image: null }, API);
    expect(p.image).toBeNull();
    expect(p.images).toEqual([]);
  });

  test('sale flag is ignored if prices do not actually differ', () => {
    const p = normalizeProduct({ ...base, sale_price: '30.00', current_price: '30.00' }, API);
    expect(p.onSale).toBe(false);
    expect(p.discountPercentage).toBe(0);
  });

  test('"OTHER" grade is not displayed as a grade', () => {
    expect(normalizeProduct({ ...base, grade: 'OTHER' }, API).grade).toBe('');
  });

  test('returns null for garbage', () => {
    expect(normalizeProduct(null)).toBeNull();
  });
});
