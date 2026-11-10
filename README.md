# Gundam CCS — storefront (React)

Customer-facing storefront for a Gunpla / model-kit retailer. React 18 (Create React App), react-router 6, i18next, axios.
It talks to the Django REST backend in `gundam-ccs-backend` (API root `/api/v1`).

## Run it

```bash
npm install
cp .env.example .env     # point REACT_APP_API_BASE_URL at your backend
npm start                # http://localhost:3000
npm run build            # production build
```

| Variable | Default | Meaning |
|---|---|---|
| `REACT_APP_API_BASE_URL` | `http://localhost:8000/api/v1` | Backend API root (legacy alias: `REACT_APP_API_URL`) |
| `REACT_APP_RATE_WARN_HOURS` | `6` | After this age the VES equivalent is shown as approximate (`≈`) |
| `REACT_APP_RATE_HIDE_HOURS` | `48` | After this age the VES equivalent is hidden and only USD is shown |

## Tests

```bash
npm run test:unit        # Jest: money, exchange-rate policy, catalog URL/API mapping, cart maths, API errors, i18n, translation parity
npm run e2e              # Playwright (starts the dev server on :3100; the API is fully mocked, no backend needed)
```

The first time: `npx playwright install chromium`. E2E screenshots (mobile 375 / tablet 768 / desktop 1280) are written to `e2e/screenshots/`.
Backend tests: `cd ../gundam-ccs-backend/gundam-ccs-backend && python manage.py test products`.

## Design system

Tokens and base classes live in `src/index.css` (colour, type scale, spacing, focus ring, buttons, fields, tags).
Breakpoints: 640 / 900 / 1200 px. Shared components: `Price`, `Dialog` (native `<dialog>` drawer/sheet/modal), `StateMessage`, `StockBadge`, `ProductCard`, `ProductGrid`, `FilterPanel`, `Pagination`.

## Money and currency rules

- **USD is authoritative.** Catalog, cart and order totals are USD. VES is only a display equivalent.
- All money maths is integer-cents (`src/lib/money.js`), VES = USD × rate rounded half-even to 2 decimals (same as the backend's `convert` endpoint).
- The rate comes from `GET /payments/exchange-rate/` and is classified by `src/lib/exchangeRate.js`: fresh → shown; stale → shown with `≈`; expired / `source: "fallback"` / unavailable → VES hidden, USD only. No rate is hard-coded in the UI.
- Cart/checkout totals mirror the backend order: `subtotal + tax + shipping − discount`, where tax is derived from the cart response (never hard-coded in the client).

## Language

Spanish (default) and English. Catalogs: `src/translations/{es,en}.json` (parity is enforced by a test). The choice persists in `localStorage` (`i18nextLng`).
Product names are never translated. Product descriptions use `description_<lang>` if the API ever provides it, otherwise the stored text with a visible note.
