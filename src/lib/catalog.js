/**
 * Catalog state <-> URL query string <-> backend query params.
 *
 * Only filters the backend really supports are modelled:
 *   search, grade, scale, manufacturer, category_slug, available, on_sale,
 *   min_price / max_price (effective price), ordering, page.
 * There is deliberately NO series/franchise or preorder filter: the product model
 * has neither field.
 */

export const PAGE_SIZE = 24;

export const SORTS = {
  newest: '-created_at',
  price_asc: 'effective_price',
  price_desc: '-effective_price',
  name: 'name',
};
export const DEFAULT_SORT = 'newest';

export const EMPTY_FILTERS = {
  q: '',
  grade: '',
  scale: '',
  brand: '',
  cat: '',
  available: false,
  sale: false,
  min: '',
  max: '',
  sort: DEFAULT_SORT,
  page: 1,
};

const FILTER_KEYS = ['q', 'grade', 'scale', 'brand', 'cat', 'available', 'sale', 'min', 'max'];

const cleanText = (v, max = 100) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const cleanPrice = (v) => {
  const text = cleanText(v, 12);
  return /^\d{1,7}(\.\d{1,2})?$/.test(text) ? text : '';
};

export function parseCatalogParams(searchParams) {
  const get = (k) => searchParams.get(k);
  const page = Number.parseInt(get('page'), 10);
  const sort = get('sort');
  let min = cleanPrice(get('min'));
  let max = cleanPrice(get('max'));
  if (min && max && Number(min) > Number(max)) [min, max] = [max, min];
  return {
    q: cleanText(get('q'), 80),
    grade: cleanText(get('grade'), 10).toUpperCase(),
    scale: cleanText(get('scale'), 20),
    brand: cleanText(get('brand')),
    cat: cleanText(get('cat')),
    available: get('available') === '1',
    sale: get('sale') === '1',
    min,
    max,
    sort: Object.prototype.hasOwnProperty.call(SORTS, sort) ? sort : DEFAULT_SORT,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/** Serialise state back to a (stable, minimal) query string. Defaults are omitted. */
export function toSearchParams(state) {
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  if (state.grade) params.set('grade', state.grade);
  if (state.scale) params.set('scale', state.scale);
  if (state.brand) params.set('brand', state.brand);
  if (state.cat) params.set('cat', state.cat);
  if (state.available) params.set('available', '1');
  if (state.sale) params.set('sale', '1');
  if (state.min) params.set('min', state.min);
  if (state.max) params.set('max', state.max);
  if (state.sort && state.sort !== DEFAULT_SORT) params.set('sort', state.sort);
  if (state.page > 1) params.set('page', String(state.page));
  return params;
}

export function toApiParams(state, pageSize = PAGE_SIZE) {
  const params = { page: state.page, page_size: pageSize, ordering: SORTS[state.sort] || SORTS[DEFAULT_SORT] };
  if (state.q) params.search = state.q;
  if (state.grade) params.grade = state.grade;
  if (state.scale) params.scale = state.scale;
  if (state.brand) params.manufacturer = state.brand;
  if (state.cat) params.category_slug = state.cat;
  if (state.available) params.available = 'true';
  if (state.sale) params.on_sale = 'true';
  if (state.min) params.min_price = state.min;
  if (state.max) params.max_price = state.max;
  return params;
}

/** Changing any filter must reset pagination, otherwise users land on an empty page 3. */
export function applyFilterChange(state, patch) {
  const next = { ...state, ...patch };
  const touchedFilter = Object.keys(patch).some((k) => FILTER_KEYS.includes(k) || k === 'sort');
  if (touchedFilter && !('page' in patch)) next.page = 1;
  return next;
}

export function activeFilterEntries(state) {
  const entries = [];
  if (state.q) entries.push({ key: 'q', value: state.q });
  if (state.grade) entries.push({ key: 'grade', value: state.grade });
  if (state.scale) entries.push({ key: 'scale', value: state.scale });
  if (state.brand) entries.push({ key: 'brand', value: state.brand });
  if (state.cat) entries.push({ key: 'cat', value: state.cat });
  if (state.available) entries.push({ key: 'available', value: true });
  if (state.sale) entries.push({ key: 'sale', value: true });
  if (state.min || state.max) entries.push({ key: 'price', value: { min: state.min, max: state.max } });
  return entries;
}

export function clearFilter(state, key) {
  if (key === 'price') return applyFilterChange(state, { min: '', max: '' });
  return applyFilterChange(state, { [key]: EMPTY_FILTERS[key] });
}

export function resetFilters(state) {
  return { ...EMPTY_FILTERS, sort: state.sort };
}

export function pageCount(total, pageSize = PAGE_SIZE) {
  return Math.max(1, Math.ceil(total / pageSize));
}
