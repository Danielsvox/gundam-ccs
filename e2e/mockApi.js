import { PRODUCTS, RATE, USER } from './fixtures';

const json = (route, body, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

const effective = (p) => Number(p.current_price);

/** Mirrors the backend ProductListView filters closely enough for UI tests. */
function listProducts(params) {
  let rows = [...PRODUCTS];
  const g = (k) => params.get(k);
  if (g('grade')) rows = rows.filter((p) => p.grade === g('grade'));
  if (g('scale')) rows = rows.filter((p) => p.scale === g('scale'));
  if (g('manufacturer')) rows = rows.filter((p) => p.manufacturer === g('manufacturer'));
  if (g('category_slug')) rows = rows.filter((p) => p.category.slug === g('category_slug'));
  if (g('available') === 'true') rows = rows.filter((p) => p.in_stock && p.stock_quantity > 0);
  if (g('on_sale') === 'true') rows = rows.filter((p) => p.is_on_sale);
  if (g('min_price')) rows = rows.filter((p) => effective(p) >= Number(g('min_price')));
  if (g('max_price')) rows = rows.filter((p) => effective(p) <= Number(g('max_price')));
  if (g('search')) {
    const q = g('search').toLowerCase();
    rows = rows.filter((p) => [p.name, p.grade, p.manufacturer, p.sku, p.scale].join(' ').toLowerCase().includes(q));
  }
  const ordering = g('ordering') || '-created_at';
  const desc = ordering.startsWith('-');
  const key = ordering.replace('-', '');
  rows.sort((a, b) => {
    const av = key === 'effective_price' ? effective(a) : a[key];
    const bv = key === 'effective_price' ? effective(b) : b[key];
    return (av > bv ? 1 : av < bv ? -1 : 0) * (desc ? -1 : 1);
  });
  const size = Math.min(Number(g('page_size')) || 20, 60);
  const page = Number(g('page')) || 1;
  return { rows, size, page };
}

function facets() {
  const count = (field) => {
    const m = new Map();
    PRODUCTS.forEach((p) => { if (p[field]) m.set(p[field], (m.get(p[field]) || 0) + 1); });
    return [...m.entries()].map(([value, c]) => ({ value, count: c }));
  };
  return {
    grades: count('grade').filter((x) => x.value !== 'OTHER').map((x) => ({ ...x, label: x.value })),
    scales: count('scale'),
    manufacturers: count('manufacturer'),
    categories: [{ id: 1, name: 'Gunpla', slug: 'gunpla', count: PRODUCTS.filter((p) => p.category.slug === 'gunpla').length }],
    price_range: { min: '9.99', max: '240.00' },
  };
}

/**
 * Installs network mocks. Options:
 *   rate: 'fresh' | 'stale' | 'expired' | 'fallback' | 'down'
 *   catalogFails: number of catalog requests to fail with 500 before succeeding (Infinity = always)
 *   auth: true -> seeds a signed-in user (and a cart API)
 */
export async function mockApi(page, { rate = 'fresh', catalogFails = 0, auth = false } = {}) {
  const state = { failuresLeft: catalogFails, cart: { items: [] }, requests: [] };

  if (auth) {
    await page.addInitScript((user) => {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', 'fixture-token');
    }, USER);
  }
  // Language is stored by the app; start in a known state unless a test overrides it.
  await page.addInitScript(() => { if (!localStorage.getItem('i18nextLng')) localStorage.setItem('i18nextLng', 'es'); });

  const cartBody = () => {
    const items = state.cart.items.map((i) => ({
      id: i.id,
      product: PRODUCTS.find((p) => p.id === i.productId),
      quantity: i.quantity,
      total_price: (effective(PRODUCTS.find((p) => p.id === i.productId)) * i.quantity).toFixed(2),
      is_available: true,
    }));
    const total = items.reduce((s, i) => s + Number(i.total_price), 0);
    return { id: 1, items, applied_coupons: [], total_items: items.length, total_price: total.toFixed(2), total_price_with_tax: (total * 1.085).toFixed(2), discount_amount: '0.00', final_price: total.toFixed(2) };
  };

  await page.route('**/api/v1/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname.replace(/^.*\/api\/v1/, '');
    const method = req.method();
    state.requests.push(`${method} ${path}${url.search}`);

    if (path === '/payments/exchange-rate/') {
      if (rate === 'down') return json(route, { detail: 'down' }, 503);
      return json(route, RATE[rate]());
    }
    if (path === '/products/products/facets/') return json(route, facets());
    if (path === '/products/products/' && method === 'GET') {
      if (state.failuresLeft > 0) {
        state.failuresLeft -= 1;
        return json(route, { detail: 'boom' }, 500);
      }
      const { rows, size, page: pg } = listProducts(url.searchParams);
      const start = (pg - 1) * size;
      if (start >= rows.length && pg > 1) return json(route, { detail: 'Invalid page.' }, 404);
      return json(route, { count: rows.length, next: null, previous: null, results: rows.slice(start, start + size) });
    }
    const detail = path.match(/^\/products\/products\/([^/]+)\/$/);
    if (detail && method === 'GET') {
      const p = PRODUCTS.find((x) => x.slug === decodeURIComponent(detail[1]));
      return p ? json(route, p) : json(route, { detail: 'Not found.' }, 404);
    }
    if (path === '/cart/' && method === 'GET') return json(route, cartBody());
    if (path === '/cart/add/' && method === 'POST') {
      const { product_id: productId, quantity } = req.postDataJSON();
      const existing = state.cart.items.find((i) => i.productId === productId);
      if (existing) existing.quantity += quantity;
      else state.cart.items.push({ id: productId * 100, productId, quantity });
      return json(route, cartBody(), 201);
    }
    const item = path.match(/^\/cart\/items\/(\d+)\/$/);
    if (item) {
      const id = Number(item[1]);
      if (method === 'DELETE') state.cart.items = state.cart.items.filter((i) => i.id !== id);
      if (method === 'PUT') state.cart.items.find((i) => i.id === id).quantity = req.postDataJSON().quantity;
      return json(route, cartBody());
    }
    return json(route, { detail: `unmocked ${method} ${path}` }, 404);
  });

  return state;
}
