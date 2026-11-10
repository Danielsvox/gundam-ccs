import { test, expect } from '@playwright/test';
import { mockApi } from './mockApi';

const cards = (page) => page.getByTestId('product-card');

test.describe('home & navigation', () => {
  test('home renders, links to the catalog and exposes a skip link', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Gunpla');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeAttached();
    await page.getByRole('main').getByRole('link', { name: 'Ver kits' }).first().click();
    await expect(page).toHaveURL(/\/browse$/);
    await expect(cards(page).first()).toBeVisible();
  });

  test('grade card deep-links to a filtered catalog with counts', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
    const mg = page.getByRole('link', { name: /MG.*Master Grade/s });
    await expect(mg).toContainText('2 kits');
    await mg.click();
    await expect(page).toHaveURL(/grade=MG/);
    await expect(cards(page)).toHaveCount(2);
  });

  test('unknown route shows the not-found page', async ({ page }) => {
    await mockApi(page);
    await page.goto('/nope/at-all');
    await expect(page.getByRole('heading', { level: 1, name: 'Página no encontrada' })).toBeVisible();
  });
});

test.describe('catalog', () => {
  test('paginates and keeps state in the URL', async ({ page }) => {
    await mockApi(page);
    await page.goto('/browse');
    await expect(cards(page)).toHaveCount(24);
    await page.getByRole('navigation', { name: 'Paginación' }).getByRole('button', { name: 'Siguiente' }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(cards(page)).toHaveCount(14);
    await page.reload();
    await expect(cards(page)).toHaveCount(14);
  });

  test('filters by grade, resets the page, and shows removable chips', async ({ page }) => {
    await mockApi(page);
    await page.goto('/browse?page=2');
    await page.getByRole('complementary').getByLabel(/Master Grade/).check();
    await expect(page).toHaveURL(/grade=MG/);
    await expect(page).not.toHaveURL(/page=/);
    await expect(cards(page)).toHaveCount(2);
    await page.getByRole('button', { name: /Quitar filtro/ }).first().click();
    await expect(page).not.toHaveURL(/grade=/);
    await expect(cards(page).first()).toBeVisible();
  });

  test('search from the header, sort by price', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
    await page.getByRole('search').first().getByRole('searchbox').fill('Zaku');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/q=Zaku/);
    await expect(cards(page)).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Zaku');

    await page.goto('/browse?grade=HG&sort=price_asc');
    await expect(cards(page).first()).toContainText('HG Fixture Bulk 01'); // 10.00 is the lowest effective HG price
  });

  test('price filter uses the effective (sale) price', async ({ page }) => {
    await mockApi(page);
    await page.goto('/browse?min=11&max=13');
    // Zaku II lists at 16.50 but sells at 12.00; bulk items 11.00,12.00,13.00 also match
    await expect(page.getByRole('main').getByText('HG Fixture Zaku II')).toBeVisible();
  });

  test('empty state offers to clear filters', async ({ page }) => {
    await mockApi(page);
    await page.goto('/browse?grade=PG&available=1&max=100');
    await expect(page.getByRole('heading', { name: 'Ningún kit coincide con estos filtros' })).toBeVisible();
    await page.getByRole('button', { name: 'Borrar todos los filtros' }).click();
    await expect(cards(page).first()).toBeVisible();
  });

  test('API failure shows an error with retry that recovers', async ({ page }) => {
    await mockApi(page, { catalogFails: 1 });
    await page.goto('/browse');
    await expect(page.getByRole('alert').filter({ hasText: 'No pudimos cargar el catálogo' })).toBeVisible();
    await page.getByRole('button', { name: 'Reintentar' }).click();
    await expect(cards(page).first()).toBeVisible();
  });

  test('out-of-range page is explained, not blank', async ({ page }) => {
    await mockApi(page);
    await page.goto('/browse?page=9');
    await expect(page.getByText('Esta página no existe con los filtros actuales.')).toBeVisible();
    await page.getByRole('button', { name: 'Ir a la primera página' }).click();
    await expect(cards(page).first()).toBeVisible();
  });

  test('sold-out kits are labelled and cannot be added', async ({ page }) => {
    await mockApi(page);
    await page.goto('/browse?grade=MG');
    const soldOut = cards(page).filter({ hasText: 'Sold Out Kit' });
    await expect(soldOut.getByText('Agotado').first()).toBeVisible();
    await expect(soldOut.getByRole('button')).toBeDisabled();
  });
});

test.describe('product page', () => {
  test('shows dual price, specs and availability', async ({ page }) => {
    await mockApi(page);
    await page.goto('/gundams/hg-fixture-rx-78-2');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('HG Fixture RX-78-2');
    const main = page.getByRole('main');
    await expect(main).toContainText('$14,99');
    await expect(main).toContainText('Bs. 599,60'); // 14.99 x 40.00, decimal-safe
    await expect(main.getByText('En stock').first()).toBeVisible();
  });

  test('unknown slug shows a not-found state', async ({ page }) => {
    await mockApi(page);
    await page.goto('/gundams/does-not-exist');
    await expect(page.getByRole('heading', { name: 'No encontramos ese kit' })).toBeVisible();
  });
});

test.describe('language', () => {
  test('switching to English persists and localizes number formats', async ({ page }) => {
    await mockApi(page);
    await page.goto('/gundams/hg-fixture-rx-78-2');
    await page.getByRole('group', { name: 'Idioma' }).first().getByRole('button', { name: 'EN' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('main')).toContainText('$14.99');
    await expect(page.getByRole('button', { name: 'Add to cart' })).toBeVisible();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});

test.describe('USD / VES policy', () => {
  const vesText = (page) => page.getByRole('main').getByText(/Bs\./).first();

  test('fresh rate shows VES without approximation marker', async ({ page }) => {
    await mockApi(page, { rate: 'fresh' });
    await page.goto('/gundams/hg-fixture-rx-78-2');
    await expect(vesText(page)).toHaveText(/^Bs\. 599,60/);
  });

  test('stale rate shows VES marked approximate', async ({ page }) => {
    await mockApi(page, { rate: 'stale' });
    await page.goto('/gundams/hg-fixture-rx-78-2');
    await expect(vesText(page)).toHaveText(/^≈ Bs\. 599,60/);
  });

  for (const rate of ['expired', 'fallback', 'down']) {
    test(`${rate} rate hides VES and keeps USD`, async ({ page }) => {
      await mockApi(page, { rate });
      await page.goto('/gundams/hg-fixture-rx-78-2');
      await expect(page.getByRole('main')).toContainText('$14,99');
      await expect(page.getByRole('main').getByText(/Bs\./)).toHaveCount(0);
    });
  }
});

test.describe('cart', () => {
  test('anonymous add-to-cart sends the user to sign in', async ({ page }) => {
    await mockApi(page);
    await page.goto('/gundams/hg-fixture-rx-78-2');
    await page.getByRole('main').getByRole('button', { name: 'Agregar al carrito' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('signed-in user adds, changes quantity and sees tax-inclusive total', async ({ page }) => {
    await mockApi(page, { auth: true });
    await page.goto('/gundams/hg-fixture-rx-78-2');
    await page.getByRole('main').getByRole('button', { name: 'Agregar al carrito' }).click();
    const drawer = page.getByRole('dialog', { name: 'Tu carrito' });
    await expect(drawer).toBeVisible();
    await expect(drawer).toContainText('HG Fixture RX-78-2');
    await drawer.getByRole('button', { name: /Aumentar cantidad/ }).click();
    await expect(drawer).toContainText('$29,98'); // 2 x 14.99
    await expect(drawer).toContainText('Impuesto'); // 29.98 * 1.085 - 29.98 = 2.55 (server-provided)
    await expect(drawer).toContainText('$32,53'); // total incl. tax
    await expect(page.getByTestId('cart-count')).toHaveText('2');
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
  });
});
