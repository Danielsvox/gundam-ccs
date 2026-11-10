import i18n, { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './i18n';

describe('i18n setup', () => {
  afterEach(async () => {
    localStorage.clear();
    await i18n.changeLanguage(DEFAULT_LANGUAGE);
  });

  test('Spanish is the default and the only supported languages are es/en', () => {
    expect(DEFAULT_LANGUAGE).toBe('es');
    expect(SUPPORTED_LANGUAGES).toEqual(['es', 'en']);
    expect(i18n.resolvedLanguage).toBe('es');
    expect(i18n.t('nav.catalog')).toBe('Catálogo');
  });

  test('changing language updates <html lang> and persists the choice', async () => {
    await i18n.changeLanguage('en');
    expect(document.documentElement.lang).toBe('en');
    expect(localStorage.getItem('i18nextLng')).toBe('en');
    expect(i18n.t('nav.catalog')).toBe('Catalog');
  });

  test('missing keys are not silently invented', () => {
    expect(i18n.t('does.not.exist')).toBe('does.not.exist');
  });

  test('plurals follow the active language', async () => {
    expect(i18n.t('cart.itemsCount', { count: 1 })).toBe('1 artículo');
    expect(i18n.t('cart.itemsCount', { count: 3 })).toBe('3 artículos');
    await i18n.changeLanguage('en');
    expect(i18n.t('cart.itemsCount', { count: 1 })).toBe('1 item');
    expect(i18n.t('cart.itemsCount', { count: 3 })).toBe('3 items');
  });
});
