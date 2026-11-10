import { evaluateRate, readThresholds, DEFAULT_THRESHOLDS } from './exchangeRate';

const NOW = Date.parse('2026-11-09T12:00:00Z');
const hoursAgo = (h) => new Date(NOW - h * 3_600_000).toISOString();

describe('evaluateRate', () => {
  test('fresh rate can be shown', () => {
    const r = evaluateRate({ usd_to_ves: 36.5, last_updated: hoursAgo(1), source: 'exchangerate_host' }, NOW);
    expect(r.status).toBe('fresh');
    expect(r.canShowVes).toBe(true);
    expect(r.scaledRate).toBe(BigInt(36500000));
  });

  test('stale rate is shown but flagged', () => {
    const r = evaluateRate({ usd_to_ves: 36.5, last_updated: hoursAgo(10), source: 'manual' }, NOW);
    expect(r.status).toBe('stale');
    expect(r.canShowVes).toBe(true);
    expect(Math.round(r.ageHours)).toBe(10);
  });

  test('expired rate is hidden', () => {
    const r = evaluateRate({ usd_to_ves: 36.5, last_updated: hoursAgo(72), source: 'manual' }, NOW);
    expect(r.status).toBe('expired');
    expect(r.canShowVes).toBe(false);
  });

  test('backend hard-coded fallback is never presented as a real rate', () => {
    const r = evaluateRate({ usd_to_ves: 38, last_updated: hoursAgo(0), source: 'fallback' }, NOW);
    expect(r.status).toBe('fallback');
    expect(r.canShowVes).toBe(false);
  });

  test('missing/invalid payloads are unavailable', () => {
    for (const payload of [null, undefined, {}, { usd_to_ves: 0 }, { usd_to_ves: 'abc' }, 'x']) {
      const r = evaluateRate(payload, NOW);
      expect(r.status).toBe('unavailable');
      expect(r.canShowVes).toBe(false);
    }
  });

  test('an undated rate cannot be trusted', () => {
    const r = evaluateRate({ usd_to_ves: 36.5, source: 'manual' }, NOW);
    expect(r.canShowVes).toBe(false);
  });

  test('custom thresholds', () => {
    const r = evaluateRate({ usd_to_ves: 36.5, last_updated: hoursAgo(2) }, NOW, { warnAfterHours: 1, hideAfterHours: 3 });
    expect(r.status).toBe('stale');
  });
});

describe('readThresholds', () => {
  test('defaults and env overrides', () => {
    expect(readThresholds({})).toEqual(DEFAULT_THRESHOLDS);
    expect(readThresholds({ REACT_APP_RATE_WARN_HOURS: '2', REACT_APP_RATE_HIDE_HOURS: '12' })).toEqual({
      warnAfterHours: 2,
      hideAfterHours: 12,
    });
    expect(readThresholds({ REACT_APP_RATE_WARN_HOURS: 'x' }).warnAfterHours).toBe(6);
  });
});
