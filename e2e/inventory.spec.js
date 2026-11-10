import { test, expect } from '@playwright/test';
import { mockApi } from './mockApi';

// Test data only (served by route mocks; the real backend enforces the roles).
const row = (o) => ({
  id: 1, slug: 'hg-aerial', sku: 'GUN-000001', name: 'HG Aerial', description: '', short_description: '',
  grade: 'HG', scale: '', manufacturer: 'Bandai', category: 1, category_name: 'HG', price: '39.00',
  sale_price: null, stock_quantity: 2, in_stock: true, is_active: true, image: null, updated_at: '2026-11-10T00:00:00Z', ...o,
});

async function mockInventory(page, role, rows) {
  const calls = { adjust: [], create: [], patch: [] };
  const data = rows.map((r) => ({ ...r }));
  const json = (route, body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  await page.route('**/api/v1/inventory/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname.replace('/api/v1/inventory', '');
    if (path === '/me/') return json(route, { role });
    if (role === null) return json(route, { detail: 'forbidden' }, 403);
    if (path === '/products/' && req.method() === 'GET') return json(route, data);
    if (path === '/products/' && req.method() === 'POST') {
      calls.create.push(req.postData() || '');
      const created = row({ id: 99, name: 'Kit Nuevo', sku: 'GUN-000099', stock_quantity: 3 });
      data.push(created);
      return json(route, created, 201);
    }
    const stock = path.match(/^\/products\/(\d+)\/stock\/$/);
    if (stock && req.method() === 'POST') {
      const body = req.postDataJSON();
      calls.adjust.push(body);
      const p = data.find((d) => d.id === Number(stock[1]));
      p.stock_quantity += body.delta;
      return json(route, p);
    }
    const detail = path.match(/^\/products\/(\d+)\/$/);
    if (detail && req.method() === 'PATCH') {
      calls.patch.push(req.postData() || '');
      const p = data.find((d) => d.id === Number(detail[1]));
      p.is_active = !p.is_active;
      return json(route, p);
    }
    return json(route, {}, 404);
  });
  return calls;
}

const OWNER_ROW = row({ cost_usd: '18.00', investor: 'Carlos' });

test.describe('inventory tool', () => {
  test('owner sees cost/investor, adjusts stock and hides a product', async ({ page }) => {
    await mockApi(page, { auth: true });
    const calls = await mockInventory(page, 'owner', [OWNER_ROW]);
    await page.goto('/inventario');
    await expect(page.getByRole('heading', { level: 1, name: 'Inventario' })).toBeVisible();
    const table = page.getByRole('table');
    await expect(table).toContainText('HG Aerial');
    await expect(table).toContainText('Carlos');
    await expect(table).toContainText('$18,00 (54%)');

    await page.getByRole('button', { name: 'Sumar una unidad a HG Aerial' }).click();
    await expect(page.getByRole('group', { name: 'Existencias' }).locator('output')).toHaveText('3');
    expect(calls.adjust).toEqual([{ delta: 1, reason: 'adjustment' }]);

    await page.getByRole('button', { name: 'Visible', exact: true }).click();
    await expect(page.getByText('No hay productos en esta vista.')).toBeVisible();
    await page.getByRole('button', { name: 'Ocultos' }).click();
    await expect(table).toContainText('HG Aerial');
    expect(calls.patch).toHaveLength(1);
  });

  test('inventory role never sees private columns', async ({ page }) => {
    await mockApi(page, { auth: true });
    await mockInventory(page, 'inventory', [row({})]);
    await page.goto('/inventario');
    const table = page.getByRole('table');
    await expect(table).toContainText('HG Aerial');
    await expect(table.getByRole('columnheader', { name: 'Costo (USD)' })).toHaveCount(0);
    await expect(table.getByRole('columnheader', { name: 'Inversionista' })).toHaveCount(0);
  });

  test('a regular customer gets a clear no-access message', async ({ page }) => {
    await mockApi(page, { auth: true });
    await mockInventory(page, null, []);
    await page.goto('/inventario');
    await expect(page.getByText('Sin acceso')).toBeVisible();
    await expect(page.getByRole('table')).toHaveCount(0);
  });

  test('creating a product sends the form and lists it', async ({ page }) => {
    await mockApi(page, { auth: true });
    const calls = await mockInventory(page, 'inventory', [row({})]);
    await page.goto('/inventario');
    await page.getByRole('button', { name: 'Nuevo producto' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Nombre').fill('Kit Nuevo');
    await dialog.getByLabel('Precio (USD)', { exact: true }).fill('25');
    await dialog.getByLabel('Existencias').fill('3');
    await dialog.getByRole('button', { name: 'Guardar' }).click();
    await expect(page.getByRole('table')).toContainText('Kit Nuevo');
    expect(calls.create[0]).toContain('Kit Nuevo');
    expect(calls.create[0]).toContain('name="price"');
  });
});
