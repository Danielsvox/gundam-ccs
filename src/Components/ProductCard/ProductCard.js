import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Price from '../Price/Price';
import StockBadge from '../StockBadge/StockBadge';
import { useCart } from '../../contexts/CartContext';
import styles from './ProductCard.module.css';

export const ProductImage = ({ product, priority = false, sizes }) => {
  const { t } = useTranslation();
  if (!product.image) {
    return (
      <span className={styles.noImage}>
        <span className={styles.noImageMark} aria-hidden="true" />
        <span>{t('product.imageMissing')}</span>
      </span>
    );
  }
  return (
    <img
      className={styles.img}
      src={product.image.src}
      alt={product.image.alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      sizes={sizes}
      width="480"
      height="480"
    />
  );
};

const ProductCard = ({ product, priority = false }) => {
  const { t } = useTranslation();
  const { addItem, busy } = useCart();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const soldOut = product.availability.state === 'out';

  const add = async () => {
    setPending(true);
    setError('');
    const result = await addItem(product.id, 1);
    setPending(false);
    if (!result.ok && !result.needsLogin) {
      setError(t(result.error?.key || 'product.addFailed', result.error?.params));
    }
  };

  const gradeScale = [product.grade, product.scale].filter(Boolean);

  return (
    <article className={`${styles.card} ${soldOut ? styles.soldOut : ''}`} data-testid="product-card" data-slug={product.slug}>
      <div className={styles.plate}>
        <ProductImage product={product} priority={priority} />
        <div className={styles.badges}>
          {product.onSale && <span className={styles.sale}>{t('product.sale', { pct: product.discountPercentage })}</span>}
          <StockBadge availability={product.availability} compact />
        </div>
      </div>

      <div className={styles.body}>
        {gradeScale.length > 0 && (
          <p className={styles.meta}>
            {product.grade && <span className="tag tag-grade">{product.grade}</span>}
            {product.scale && <span className="tag">{product.scale}</span>}
          </p>
        )}
        <h3 className={styles.title}>
          <Link to={`/gundams/${product.slug}`} className={styles.link}>{product.name}</Link>
        </h3>
        {product.manufacturer && <p className={styles.maker}>{product.manufacturer}</p>}

        <div className={styles.foot}>
          <Price usd={product.price} listUsd={product.onSale ? product.listPrice : undefined} size="md" />
          <button
            type="button"
            className={`btn btn-sm ${soldOut ? '' : 'btn-primary'} ${styles.add}`}
            onClick={add}
            disabled={soldOut || pending || busy}
            aria-label={`${soldOut ? t('product.unavailable') : t('product.addToCart')}: ${product.name}`}
          >
            {soldOut ? t('product.unavailable') : pending ? t('product.adding') : t('product.addToCart')}
          </button>
        </div>
        {error && <p className={styles.error} role="alert">{error}</p>}
      </div>
    </article>
  );
};

export default React.memo(ProductCard);
