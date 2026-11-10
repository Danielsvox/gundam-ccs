import { describeApiError, extractMessage, fieldErrors } from './apiError';

const http = (status, data) => ({ response: { status, data } });

describe('describeApiError', () => {
  test('no response means a network problem', () => {
    expect(describeApiError({ message: 'Network Error' }).key).toBe('errors.network');
  });
  test('server errors do not leak internals', () => {
    const e = describeApiError(http(500, { error: 'Traceback ...' }));
    expect(e.key).toBe('errors.server');
    expect(e.detail).toBe('');
  });
  test('401 -> session expired', () => {
    expect(describeApiError(http(401, {})).key).toBe('errors.sessionExpired');
  });
  test('stock limit message is parsed into a translatable count', () => {
    const e = describeApiError(http(400, { error: 'Only 3 items available in stock.' }));
    expect(e).toMatchObject({ key: 'product.stockLimit', params: { count: 3 } });
  });
  test('aborted requests produce no message', () => {
    expect(describeApiError({ code: 'ERR_CANCELED' }).key).toBeNull();
  });
  test('unknown 4xx falls back to generic, keeps detail', () => {
    const e = describeApiError(http(400, { error: 'Product is out of stock.' }));
    expect(e.key).toBe('errors.unknown');
    expect(e.detail).toBe('Product is out of stock.');
  });
});

describe('extractMessage / fieldErrors', () => {
  test('DRF shapes', () => {
    expect(extractMessage({ non_field_errors: ['Bad'] })).toBe('Bad');
    expect(extractMessage({ detail: 'Nope' })).toBe('Nope');
    expect(extractMessage(null)).toBe('');
  });
  test('field errors map', () => {
    expect(fieldErrors(http(400, { email: ['Taken'], username: 'Bad' }))).toEqual({ email: 'Taken', username: 'Bad' });
  });
});
