import {
  parseCatalogParams,
  toSearchParams,
  toApiParams,
  applyFilterChange,
  clearFilter,
  resetFilters,
  activeFilterEntries,
  pageCount,
  EMPTY_FILTERS,
} from './catalog';

const parse = (qs) => parseCatalogParams(new URLSearchParams(qs));

describe('parseCatalogParams', () => {
  test('empty URL gives defaults', () => {
    expect(parse('')).toEqual(EMPTY_FILTERS);
  });

  test('parses a full combination', () => {
    const s = parse('q=zaku&grade=hg&scale=1/144&brand=Bandai&cat=uc&available=1&sale=1&min=10&max=50.5&sort=price_asc&page=3');
    expect(s).toEqual({
      q: 'zaku',
      grade: 'HG',
      scale: '1/144',
      brand: 'Bandai',
      cat: 'uc',
      available: true,
      sale: true,
      min: '10',
      max: '50.5',
      sort: 'price_asc',
      page: 3,
    });
  });

  test('sanitises hostile or malformed values', () => {
    const s = parse('page=-4&sort=DROP TABLE&min=abc&max=1e9&available=yes');
    expect(s.page).toBe(1);
    expect(s.sort).toBe('newest');
    expect(s.min).toBe('');
    expect(s.max).toBe('');
    expect(s.available).toBe(false);
  });

  test('swaps an inverted price range instead of returning nothing', () => {
    const s = parse('min=80&max=20');
    expect([s.min, s.max]).toEqual(['20', '80']);
  });
});

describe('toSearchParams round trip', () => {
  test('defaults are omitted', () => {
    expect(toSearchParams(EMPTY_FILTERS).toString()).toBe('');
  });
  test('parse(serialise(x)) === x', () => {
    const state = { ...EMPTY_FILTERS, q: 'RX-78', grade: 'MG', scale: '1/100', available: true, min: '20', max: '90', sort: 'price_desc', page: 2 };
    expect(parseCatalogParams(toSearchParams(state))).toEqual(state);
  });
});

describe('toApiParams', () => {
  test('maps filters to the parameters the backend understands', () => {
    const api = toApiParams({ ...EMPTY_FILTERS, q: 'zaku', grade: 'HG', scale: '1/144', brand: 'Bandai', cat: 'uc', available: true, sale: true, min: '10', max: '50', sort: 'price_asc', page: 2 }, 24);
    expect(api).toEqual({
      page: 2,
      page_size: 24,
      ordering: 'effective_price',
      search: 'zaku',
      grade: 'HG',
      scale: '1/144',
      manufacturer: 'Bandai',
      category_slug: 'uc',
      available: 'true',
      on_sale: 'true',
      min_price: '10',
      max_price: '50',
    });
  });
  test('omits unset filters', () => {
    expect(Object.keys(toApiParams(EMPTY_FILTERS))).toEqual(['page', 'page_size', 'ordering']);
  });
});

describe('filter interactions', () => {
  test('changing a filter resets pagination', () => {
    const next = applyFilterChange({ ...EMPTY_FILTERS, page: 4 }, { grade: 'MG' });
    expect(next.page).toBe(1);
    expect(next.grade).toBe('MG');
  });
  test('changing sort resets pagination, explicit page change does not', () => {
    expect(applyFilterChange({ ...EMPTY_FILTERS, page: 4 }, { sort: 'name' }).page).toBe(1);
    expect(applyFilterChange({ ...EMPTY_FILTERS, page: 4 }, { page: 5 }).page).toBe(5);
  });
  test('filters combine and can be removed independently', () => {
    let s = applyFilterChange(EMPTY_FILTERS, { grade: 'MG' });
    s = applyFilterChange(s, { scale: '1/100' });
    s = applyFilterChange(s, { min: '10', max: '60' });
    expect(activeFilterEntries(s).map((e) => e.key)).toEqual(['grade', 'scale', 'price']);
    s = clearFilter(s, 'grade');
    expect(s.grade).toBe('');
    expect(s.scale).toBe('1/100');
    s = clearFilter(s, 'price');
    expect([s.min, s.max]).toEqual(['', '']);
  });
  test('reset keeps the chosen sort', () => {
    const s = resetFilters({ ...EMPTY_FILTERS, grade: 'HG', sort: 'price_desc', page: 3 });
    expect(s).toEqual({ ...EMPTY_FILTERS, sort: 'price_desc' });
  });
});

describe('pageCount', () => {
  test('rounds up and is at least 1', () => {
    expect(pageCount(0)).toBe(1);
    expect(pageCount(24)).toBe(1);
    expect(pageCount(25)).toBe(2);
    expect(pageCount(37, 24)).toBe(2);
  });
});
