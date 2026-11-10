// Deterministic API fixtures for Playwright. These are TEST DATA ONLY: they are served by
// page.route() mocks, never by the real backend, and are not store content.

const svg = (label, bg = '#f2f1ed') =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480"><rect width="480" height="480" fill="${bg}"/><text x="240" y="250" font-family="monospace" font-size="28" text-anchor="middle" fill="#333">${label}</text></svg>`
  )}`;

const cat = (id, name, slug) => ({ id, name, slug });
const CATS = { gunpla: cat(1, 'Gunpla', 'gunpla'), tools: cat(2, 'Tools', 'tools') };

let nextId = 1;
const product = (o) => {
  const id = nextId++;
  const price = o.price;
  const sale = o.sale || null;
  return {
    id,
    slug: o.slug,
    name: o.name,
    short_description: '',
    description: o.description ?? `Fixture description for ${o.name}.`,
    grade: o.grade,
    scale: o.scale,
    manufacturer: o.manufacturer || 'Bandai',
    category: o.category || CATS.gunpla,
    price,
    sale_price: sale,
    current_price: sale || price,
    is_on_sale: Boolean(sale),
    discount_percentage: sale ? Math.round((1 - Number(sale) / Number(price)) * 100) : 0,
    in_stock: o.in_stock ?? true,
    stock_quantity: o.stock ?? 10,
    sku: `FX-${String(id).padStart(3, '0')}`,
    primary_image: { image: svg(o.slug), alt_text: o.name },
    images: [{ image: svg(o.slug), alt_text: o.name }],
    rating: '0.0',
    review_count: 0,
    release_date: o.release_date || null,
    specifications: [],
    created_at: `2025-01-${String(30 - id).padStart(2, '0')}T00:00:00Z`,
  };
};

export const PRODUCTS = [
  product({ slug: 'hg-fixture-rx-78-2', name: 'HG Fixture RX-78-2', grade: 'HG', scale: '1/144', price: '14.99' }),
  product({ slug: 'hg-fixture-zaku-ii', name: 'HG Fixture Zaku II', grade: 'HG', scale: '1/144', price: '16.50', sale: '12.00' }),
  product({ slug: 'rg-fixture-unicorn', name: 'RG Fixture Unicorn', grade: 'RG', scale: '1/144', price: '34.99', stock: 2 }),
  product({ slug: 'mg-fixture-strike', name: 'MG Fixture Strike Freedom', grade: 'MG', scale: '1/100', price: '58.00' }),
  product({ slug: 'mg-fixture-sold-out', name: 'MG Fixture Sold Out Kit', grade: 'MG', scale: '1/100', price: '49.90', in_stock: false, stock: 0 }),
  product({ slug: 'pg-fixture-rx-78-2', name: 'PG Fixture Unleashed RX-78-2 With A Very Long Descriptive Name', grade: 'PG', scale: '1/60', price: '240.00' }),
  product({ slug: 'hg-fixture-kampfer', name: 'HG Fixture Kampfer', grade: 'HG', scale: '1/144', price: '13.25', manufacturer: 'Other Maker' }),
  product({ slug: 'tool-fixture-nipper', name: 'Fixture Precision Nipper', grade: 'OTHER', scale: '', price: '9.99', category: CATS.tools, manufacturer: 'Tool Co' }),
  ...Array.from({ length: 30 }, (_, i) =>
    product({ slug: `hg-fixture-bulk-${i + 1}`, name: `HG Fixture Bulk ${String(i + 1).padStart(2, '0')}`, grade: 'HG', scale: '1/144', price: `${10 + i}.00` })),
];

export const RATE = {
  fresh: () => ({ usd_to_ves: '40.00', last_updated: new Date(Date.now() - 30 * 60_000).toISOString(), source: 'fixture', change_percentage: '0.0' }),
  stale: () => ({ usd_to_ves: '40.00', last_updated: new Date(Date.now() - 12 * 3_600_000).toISOString(), source: 'fixture', change_percentage: '0.0' }),
  expired: () => ({ usd_to_ves: '40.00', last_updated: new Date(Date.now() - 100 * 3_600_000).toISOString(), source: 'fixture', change_percentage: '0.0' }),
  fallback: () => ({ usd_to_ves: '38.00', last_updated: new Date().toISOString(), source: 'fallback', change_percentage: '0.0' }),
};

export const USER = { id: 1, email: 'fixture@example.test', username: 'fixture', first_name: 'Fixture', last_name: 'User' };
