/**
 * Turn an axios error into something the UI can translate.
 * Returns { key, params, detail } where `key` is an i18n key and `detail` is the raw
 * server message (English) that callers may choose to show as secondary text.
 */
export function describeApiError(error) {
  if (!error) return { key: 'errors.unknown', params: {}, detail: '' };
  if (error.code === 'ERR_CANCELED') return { key: null, params: {}, detail: '' };

  const status = error.response?.status;
  const data = error.response?.data;
  const detail = extractMessage(data);

  if (!error.response) return { key: 'errors.network', params: {}, detail: '' };
  if (status === 401) return { key: 'errors.sessionExpired', params: {}, detail };
  if (status >= 500) return { key: 'errors.server', params: {}, detail: '' };

  const stock = /only (\d+) items? available/i.exec(detail);
  if (stock) return { key: 'product.stockLimit', params: { count: Number(stock[1]) }, detail };

  return { key: 'errors.unknown', params: {}, detail };
}

export function extractMessage(data) {
  if (!data) return '';
  if (typeof data === 'string') return data.length < 200 ? data : '';
  if (typeof data.error === 'string') return data.error;
  if (typeof data.message === 'string') return data.message;
  if (typeof data.detail === 'string') return data.detail;
  const first = Object.values(data)[0];
  if (Array.isArray(first) && typeof first[0] === 'string') return first[0];
  if (typeof first === 'string') return first;
  return '';
}

/** Field-level errors from DRF: { email: ["..."] } -> { email: "..." } */
export function fieldErrors(error) {
  const data = error?.response?.data;
  if (!data || typeof data !== 'object') return {};
  const out = {};
  for (const [field, value] of Object.entries(data)) {
    if (Array.isArray(value) && typeof value[0] === 'string') out[field] = value[0];
    else if (typeof value === 'string') out[field] = value;
  }
  return out;
}

/** Flattens DRF validation errors ({field: ["msg"]}) into one readable string. */
export function flattenErrors(data) {
    if (!data) return '';
    if (typeof data === 'string') return data.length < 300 ? data : '';
    if (Array.isArray(data)) return data.map(flattenErrors).filter(Boolean).join('. ');
    if (typeof data === 'object') return Object.values(data).map(flattenErrors).filter(Boolean).join('. ');
    return String(data);
}
