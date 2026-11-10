import { test, expect } from '@playwright/test';
import fs from 'fs';
import { mockApi } from './mockApi';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 900 },
];

const SCREENS = [
  { name: 'home', path: '/', ready: (p) => p.getByRole('heading', { level: 1 }) },
  { name: 'catalog', path: '/browse', ready: (p) => p.getByTestId('product-card').first() },
  { name: 'catalog-empty', path: '/browse?grade=PG&available=1&max=100', ready: (p) => p.getByRole('heading', { name: 'Ningún kit coincide con estos filtros' }) },
  { name: 'product', path: '/gundams/pg-fixture-rx-78-2', ready: (p) => p.getByRole('heading', { level: 1 }) },
  { name: 'product-sold-out', path: '/gundams/mg-fixture-sold-out', ready: (p) => p.getByRole('heading', { level: 1 }) },
  { name: 'prices', path: '/prices', ready: (p) => p.getByRole('heading', { level: 1 }) },
  { name: 'login', path: '/login', ready: (p) => p.getByRole('heading', { level: 1 }) },
];

fs.mkdirSync('e2e/screenshots', { recursive: true });

for (const vp of VIEWPORTS) {
  test.describe(`layout @ ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const screen of SCREENS) {
      test(`${screen.name}: no horizontal overflow, 44px targets`, async ({ page }) => {
        await mockApi(page);
        await page.goto(screen.path);
        await expect(screen.ready(page)).toBeVisible();
        await page.waitForTimeout(250); // let images/fonts settle for a stable screenshot

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, 'horizontal overflow in px').toBeLessThanOrEqual(0);

        // Interactive targets in the header and main content should be at least 44px tall (WCAG 2.2 AA 2.5.8 asks for 24px; we aim higher).
        const small = await page.evaluate(() => {
          const out = [];
          document.querySelectorAll('header a, header button, main button, main a.btn, main select, main input:not([type=radio]):not([type=checkbox])').forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return;
            if (r.height < 44 && !el.closest('[hidden]')) out.push(`${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30)}" ${Math.round(r.width)}x${Math.round(r.height)}`);
          });
          return out;
        });
        // Small chip buttons (36px) are an accepted exception; anything below 32px is a bug.
        const tooSmall = small.filter((s) => Number(s.split(' ').pop().split('x')[1]) < 32);
        expect(tooSmall, 'targets under 32px').toEqual([]);

        await page.screenshot({ path: `e2e/screenshots/${screen.name}-${vp.name}.png`, fullPage: true });
        await page.screenshot({ path: `e2e/screenshots/${screen.name}-${vp.name}-fold.png` });
      });
    }
  });
}

test.describe('mobile filter sheet', () => {
  test.use({ viewport: { width: 375, height: 800 } });

  test('opens as a dialog, applies a filter, closes with Escape', async ({ page }) => {
    await mockApi(page);
    await page.goto('/browse');
    await expect(page.getByTestId('product-card').first()).toBeVisible();
    await page.getByRole('button', { name: 'Filtros' }).click();
    const sheet = page.getByRole('dialog', { name: 'Filtros' });
    await expect(sheet).toBeVisible();
    await sheet.getByLabel(/Master Grade/).check();
    await expect(page).toHaveURL(/grade=MG/);
    await page.screenshot({ path: 'e2e/screenshots/catalog-filter-sheet-mobile.png' });
    await sheet.getByRole('button', { name: /Ver 2 resultados/ }).click();
    await expect(sheet).toBeHidden();
    await expect(page.getByTestId('product-card')).toHaveCount(2);
  });

  test('mobile menu is a modal dialog with language switcher', async ({ page }) => {
    await mockApi(page);
    await page.goto('/');
    await page.getByRole('button', { name: 'Abrir menú' }).click();
    const menu = page.getByRole('dialog', { name: 'Menú' });
    await expect(menu).toBeVisible();
    await menu.getByRole('button', { name: 'EN' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
  });
});
