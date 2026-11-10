import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './StockBadge.module.css';

/**
 * Availability derived from in_stock + stock_quantity (see lib/productMapper.js).
 * There is no preorder state because the product model has no preorder data.
 * Colour is never the only signal: every state has text and a distinct shape marker.
 */
const StockBadge = ({ availability, compact = false }) => {
  const { t } = useTranslation();
  const { state, quantity } = availability;

  if (state === 'in') {
    if (compact) return null; // "in stock" is the default; only exceptions get a badge on cards
    return <span className={`${styles.badge} ${styles.in}`}>{t('product.inStock')}</span>;
  }
  if (state === 'low') {
    return (
      <span className={`${styles.badge} ${styles.low}`}>
        {quantity === 1 ? t('product.lastUnit') : t('product.onlyLeft', { count: quantity })}
      </span>
    );
  }
  return <span className={`${styles.badge} ${styles.out}`}>{t('product.soldOut')}</span>;
};

export default StockBadge;
