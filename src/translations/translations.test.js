import en from './en.json';
import es from './es.json';

const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]);

const placeholders = (s) => (String(s).match(/{{\s*\w+\s*}}/g) || []).map((p) => p.replace(/\s/g, '')).sort();

describe('translation catalogs', () => {
  const enFlat = Object.fromEntries(flatten(en));
  const esFlat = Object.fromEntries(flatten(es));

  test('en and es define exactly the same keys', () => {
    const missingInEs = Object.keys(enFlat).filter((k) => !(k in esFlat));
    const missingInEn = Object.keys(esFlat).filter((k) => !(k in enFlat));
    expect({ missingInEs, missingInEn }).toEqual({ missingInEs: [], missingInEn: [] });
  });

  test('no empty strings', () => {
    const empty = [...Object.entries(enFlat), ...Object.entries(esFlat)].filter(([, v]) => typeof v === 'string' && v.trim() === '');
    expect(empty).toEqual([]);
  });

  test('interpolation placeholders match between languages', () => {
    const mismatched = Object.keys(enFlat).filter(
      (k) => k in esFlat && JSON.stringify(placeholders(enFlat[k])) !== JSON.stringify(placeholders(esFlat[k]))
    );
    expect(mismatched).toEqual([]);
  });

  test('plural keys come in _one/_other pairs', () => {
    for (const flat of [enFlat, esFlat]) {
      const keys = Object.keys(flat);
      keys.filter((k) => k.endsWith('_one')).forEach((k) => expect(keys).toContain(k.replace(/_one$/, '_other')));
    }
  });
});
