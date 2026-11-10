import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './FilterPanel.module.css';

const RadioGroup = ({ legend, name, value, options, onChange, allLabel }) => (
  <fieldset className={styles.group}>
    <legend className={styles.legend}>{legend}</legend>
    <ul className={styles.list}>
      <li>
        <label className={styles.option}>
          <input type="radio" name={name} checked={value === ''} onChange={() => onChange('')} />
          <span>{allLabel}</span>
        </label>
      </li>
      {options.map((opt) => (
        <li key={opt.value}>
          <label className={styles.option}>
            <input type="radio" name={name} checked={value === opt.value} onChange={() => onChange(opt.value)} />
            <span className={styles.optionText}>{opt.label}</span>
            {typeof opt.count === 'number' && <span className={styles.count}>{opt.count}</span>}
          </label>
        </li>
      ))}
    </ul>
  </fieldset>
);

const FilterPanel = ({ facets, facetsFailed, onRetryFacets, state, onChange, idPrefix = 'f' }) => {
  const { t } = useTranslation();
  const [min, setMin] = useState(state.min);
  const [max, setMax] = useState(state.max);

  useEffect(() => { setMin(state.min); setMax(state.max); }, [state.min, state.max]);

  const submitPrice = (event) => {
    event.preventDefault();
    onChange({ min: min.trim(), max: max.trim() });
  };

  // Keep an active value selectable even if the facet list does not (yet) contain it,
  // e.g. when arriving from a shared URL while the facets are loading.
  const withActive = (list, active) => (active && !list.some((o) => o.value === active) ? [{ value: active, label: active }, ...list] : list);

  const gradeOptions = withActive((facets?.grades || []).map((g) => ({
    value: g.value,
    label: `${t(`home.grade.${g.value}`, { defaultValue: g.label })} (${g.value})`,
    count: g.count,
  })), state.grade);
  const scaleOptions = withActive((facets?.scales || []).map((s) => ({ value: s.value, label: s.value, count: s.count })), state.scale);
  const brandOptions = withActive((facets?.manufacturers || []).map((m) => ({ value: m.value, label: m.value, count: m.count })), state.brand);
  const catOptions = withActive((facets?.categories || []).map((c) => ({ value: c.slug, label: c.name, count: c.count })), state.cat);

  return (
    <div className={styles.panel}>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>{t('catalog.availability')}</legend>
        <label className={styles.option}>
          <input type="checkbox" checked={state.available} onChange={(e) => onChange({ available: e.target.checked })} />
          <span>{t('catalog.availableOnly')}</span>
        </label>
        <label className={styles.option}>
          <input type="checkbox" checked={state.sale} onChange={(e) => onChange({ sale: e.target.checked })} />
          <span>{t('catalog.onSaleOnly')}</span>
        </label>
      </fieldset>

      {facetsFailed && (
        <p className={styles.notice} role="status">
          {t('catalog.facetsUnavailable')}{' '}
          <button type="button" className={styles.linkButton} onClick={onRetryFacets}>{t('common.retry')}</button>
        </p>
      )}

      {gradeOptions.length > 0 && (
        <RadioGroup legend={t('catalog.grade')} name={`${idPrefix}-grade`} value={state.grade} options={gradeOptions} allLabel={t('catalog.all')} onChange={(grade) => onChange({ grade })} />
      )}
      {scaleOptions.length > 0 && (
        <RadioGroup legend={t('catalog.scale')} name={`${idPrefix}-scale`} value={state.scale} options={scaleOptions} allLabel={t('catalog.all')} onChange={(scale) => onChange({ scale })} />
      )}
      {brandOptions.length > 0 && (
        <RadioGroup legend={t('catalog.manufacturer')} name={`${idPrefix}-brand`} value={state.brand} options={brandOptions} allLabel={t('catalog.all')} onChange={(brand) => onChange({ brand })} />
      )}
      {catOptions.length > 0 && (
        <RadioGroup legend={t('catalog.category')} name={`${idPrefix}-cat`} value={state.cat} options={catOptions} allLabel={t('catalog.all')} onChange={(cat) => onChange({ cat })} />
      )}

      <form className={styles.group} onSubmit={submitPrice}>
        <p className={styles.legend} id={`${idPrefix}-price-legend`}>{t('catalog.price')}</p>
        <div className={styles.priceRow} role="group" aria-labelledby={`${idPrefix}-price-legend`}>
          <div className="field">
            <label htmlFor={`${idPrefix}-min`}>{t('catalog.minPrice')}</label>
            <input id={`${idPrefix}-min`} className="input" inputMode="decimal" pattern="\d{0,7}(\.\d{1,2})?" placeholder="0" value={min} onChange={(e) => setMin(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor={`${idPrefix}-max`}>{t('catalog.maxPrice')}</label>
            <input id={`${idPrefix}-max`} className="input" inputMode="decimal" pattern="\d{0,7}(\.\d{1,2})?" placeholder="∞" value={max} onChange={(e) => setMax(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-sm">{t('catalog.applyPrice')}</button>
        </div>
        <p className={styles.hint}>{t('catalog.priceHint')}</p>
      </form>
    </div>
  );
};

export default FilterPanel;
