import { toCents } from './money';

export const LOW_STOCK_THRESHOLD = 3;

/** The API may return media URLs as relative paths ("/media/products/x.jpg"). */
export function resolveMediaUrl(src, apiBaseUrl) {
  if (!src) return '';
  if (/^(https?:)?\/\//i.test(src) || src.startsWith('data:')) return src;
  let origin = '';
  try {
    origin = new URL(apiBaseUrl).origin;
  } catch {
    origin = '';
  }
  return `${origin}${src.startsWith('/') ? '' : '/'}${src}`;
}

/**
 * The backend only has one `in_stock` flag plus a quantity, and a new product defaults to
 * in_stock=true with quantity 0, so both must agree before we advertise availability.
 * There is no preorder field in the data model, therefore no "preorder" state exists here.
 */
export function deriveAvailability(inStockFlag, quantity) {
  const qty = Number.isFinite(Number(quantity)) ? Number(quantity) : 0;
  if (!inStockFlag || qty <= 0) return { state: 'out', quantity: 0 };
  if (qty <= LOW_STOCK_THRESHOLD) return { state: 'low', quantity: qty };
  return { state: 'in', quantity: qty };
}

/**
 * Pick a localized text field. The API has no translation columns today; if
 * `${field}_${lang}` ever appears it is used, otherwise we fall back to the base
 * field and report that it is not localized (we never machine-translate).
 */
export function pickLocalized(product, field, lang) {
  const localized = product?.[`${field}_${lang}`];
  if (localized) return { text: localized, isFallback: false };
  return { text: product?.[field] || '', isFallback: true };
}

const GRADE_NAMES = {
  PG: 'Perfect Grade',
  MG: 'Master Grade',
  RG: 'Real Grade',
  HG: 'High Grade',
  SD: 'Super Deformed',
  FM: 'Full Mechanics',
  RE: 'RE/100',
  NG: 'No Grade',
};

export function gradeName(code) {
  return GRADE_NAMES[code] || '';
}

function mapImage(img, apiBaseUrl, fallbackAlt) {
  if (!img || !img.image) return null;
  return { src: resolveMediaUrl(img.image, apiBaseUrl), alt: img.alt_text || fallbackAlt };
}

export function normalizeProduct(api, apiBaseUrl = '') {
  if (!api || typeof api !== 'object') return null;
  const primary = mapImage(api.primary_image, apiBaseUrl, api.name);
  const gallery = Array.isArray(api.images)
    ? api.images.map((i) => mapImage(i, apiBaseUrl, api.name)).filter(Boolean)
    : [];
  const images = gallery.length ? gallery : primary ? [primary] : [];
  const listCents = toCents(api.price);
  const currentCents = toCents(api.current_price ?? api.price);
  const onSale = Boolean(api.is_on_sale) && listCents !== null && currentCents !== null && currentCents < listCents;

  return {
    id: api.id,
    slug: api.slug,
    name: api.name || '',
    shortDescription: api.short_description || '',
    description: api.description || '',
    description_en: api.description_en,
    description_es: api.description_es,
    grade: api.grade && api.grade !== 'OTHER' ? api.grade : '',
    scale: api.scale || '',
    manufacturer: api.manufacturer || '',
    category: api.category ? { id: api.category.id, name: api.category.name, slug: api.category.slug } : null,
    price: String(api.current_price ?? api.price ?? ''),
    listPrice: String(api.price ?? ''),
    onSale,
    discountPercentage: onSale ? Number(api.discount_percentage) || 0 : 0,
    availability: deriveAvailability(api.in_stock, api.stock_quantity),
    sku: api.sku || '',
    image: images[0] || null,
    images,
    rating: Number(api.rating) || 0,
    reviewCount: Number(api.review_count) || 0,
    releaseDate: api.release_date || '',
    weightGrams: api.weight ? String(api.weight) : '',
    dimensions: api.dimensions || '',
    specifications: Array.isArray(api.specifications)
      ? api.specifications.map((s) => ({ name: s.name, value: s.value }))
      : [],
    isFeatured: Boolean(api.is_featured),
    createdAt: api.created_at || '',
  };
}
