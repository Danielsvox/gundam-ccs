# Redesign report: findings, decisions, limits

## Decisions that need the store owner (not made by us)

1. **Exchange-rate provider.** The backend has no BCV provider (exchangerate.host / Google Finance scraping / OpenExchangeRates) and silently returns a hard-coded `38.0` with `source: "fallback"` when providers fail. The storefront treats `fallback` as *unavailable* (USD only). Decide the official source and whether a manual, dated rate set by staff is acceptable.
2. **VES rate � RESOLVED (owner):** no markup. Sources in order: **BCV official rate** (bcv.org.ve; its server sends the wrong intermediate certificate, so the correct public Sectigo intermediate is bundled in `payments/certs` and full TLS verification is kept) ? Google Finance (embedded-JSON parser) ? exchangerate.host / Open Exchange Rates (both need API keys, currently failing) ? 38.0 fallback, which hides VES in the storefront. Both scrapers are unofficial and can break if the pages change; tests cover the parsers. The BCV leaf certificate expires 2026-11-20; renewals are fine unless Sectigo changes the intermediate.
3. **Tax � RESOLVED (owner):** keep the backend's fixed 8.5%. The checkout charges `subtotal + tax + shipping - discount`, so the Pago M�vil amount now includes tax (a change from the old flow, which asked for the pre-tax amount).
4. **Pago M�vil order of operations � FIXED.** The old flow created the order only after an *immediate* approval, but approval is manual (admin), so paying customers normally ended with no order. Now the order is created first (`payment_method=pago_movil`), the verification is linked to it (`order` is validated server-side: must be yours and unpaid), and admin approval marks the order paid/confirmed. Open points: the submitted `amount_ves` is still not checked server-side against order total � rate, and abandoning the payment step leaves a pending order (customer can pay later).
5. **Free-shipping minimum ($50) is hard-coded in the client** (`ShippingMethod.js`). Left unchanged; it should come from the shipping-method record.

## Bugs found and fixed

Frontend: expired-token 401 on public catalog calls; relative `/media/...` image URLs; coupon endpoints that never existed on the backend; `page_size` ignored; order history used the *current* product price instead of the price paid (`unit_price`); fabricated fallback shipping method (`id: 1`) submitted to checkout; credentials/tokens written to `console.log`; hard redirect on 401; races in cart/read; silent `Intl`/float money maths; stepper marking all steps done on the Pago Móvil step; `Orders` called the API without its pagination params; auth forms hard-coded in English; profile form showed an address block and editable email the backend does not accept.

Backend (tested, 16 tests): `products/<slug>/` route swallowed `search`, `featured`, `new-arrivals`, `on-sale`; no `scale` filter; price filter/sort used `price` instead of the effective (sale) price; no `page_size`; N+1 queries in list/category counts; `coupons/remove/` route could not identify the coupon; new `products/facets/` endpoint.

## Deferred backend items (recommendations, not changed)

- **Security:** `confirm_manual_payment` does not check ownership/admin — any authenticated user can confirm any order's payment. `payments/exchange-rate/refresh/` is public. `SECRET_KEY`/`DEBUG` defaults are unsafe for production. Password-reset endpoint reveals whether an email exists ("No user found…"). Tokens are kept in `localStorage` (XSS exposure); prefer httpOnly cookies.
- **Data model:** no preorder, series/franchise or translated-description fields (so none are shown); dirty `scale` values exist in the dev data (`1111`, `1:1`) and appear as filter options; no stock reservation at checkout.
- **Broken views:** `products/<id>/images/` and `specifications` views.
- **Caching:** API responses should carry sensible `Cache-Control` (the exchange-rate endpoint in particular).
- **Docs:** the backend and old frontend READMEs describe a Node/Express/Firebase app; the frontend README is replaced, the backend one still needs correcting.

## Verification status

| Check | Result |
|---|---|
| `npm run build` | compiles with no warnings |
| Jest (`npm run test:unit`) | 9 suites, 79 tests passed |
| Playwright (`npm run e2e`, Chromium, mocked API) | 44 passed (home, catalog filters/sort/search/pagination/URL state, empty/error/out-of-range/sold-out, PDP, language switch, USD/VES fresh/stale/expired/fallback/down, anonymous and signed-in cart, mobile filter sheet and menu, overflow + target-size checks at 375/768/1280) |
| Backend `manage.py test products` | 16 passed |
| Backend contract smoke | list/facets endpoints answered correctly from the local dev DB |

**Not verified:** checkout (shipping → payment → confirmation), Pago Móvil, orders list, login/register/profile flows have no automated tests and were not exercised against a running backend end-to-end; only Chromium was run (no Firefox/WebKit, no real device); no screen-reader pass; no Lighthouse/perf measurement; "before" screenshots were not captured (the previous UI is no longer buildable after the rewrite; use `git stash`/older commit to capture them if needed).

## Benchmark disclosure

`okuristore.com/catalogo?serie=gundam` was inspected once, as a desktop accessibility snapshot of the catalog page only. Mobile, product pages and checkout were not inspected. Nothing (layout, copy, assets, typography) was copied. Observed and adopted as *ideas only*: visible grade/scale filters, a result count, prices shown in two currencies.

## Inventory tool (`/inventario`)

- **Who:** staff only. Roles are Django groups: `owner` (also sees cost, investor, margin; superusers count as owner) and `inventory` (stock, price, photos, visibility). Create them with `python manage.py setup_inventory_roles`, then add users to a group in `/admin/` (Users > Groups). Regular customers get a "no access" page, and the API answers 403.
- **What:** list/search, +/- stock buttons, add/edit product with photo upload, hide/show (no delete, so order history stays intact), private cost/investor fields, per-product stock history.
- **Stock rules:** stock is reserved when an order is created (all-or-nothing; 409 `insufficient_stock` if someone else took the last unit) and returned when the order is cancelled. A rejected Pago Móvil verification does **not** release stock (the customer may retry); cancel the order to release it. Every change is logged in `StockMovement`.
- **Fixed on the way:** `POST /orders/orders/<id>/cancel/` always crashed (URL kwarg `pk` vs view `order_id`); new products without SKU could collide on `GUN-000000`.
- **Import:** `python manage.py import_inventory <sheet.csv>` is a dry-run that prints every product, price and its source; `--apply` writes it and archives (not deletes) products that are not in the sheet. Prices come from "Precio 30% UP"; blanks are CALCULATED as round(Valor bruto x 1.69) and flagged for review. HG-prefixed models get grade HG / brand Bandai; everything else grade "Sin grado" / brand "Otro" until staff fix it in the tool. Scale is left empty (not in the sheet).
- **Not covered:** `OrderCreateView` (`/orders/orders/create/`, unused by the storefront) does not reserve stock; order cancellation from Django admin does not restore stock; no audit of price changes.