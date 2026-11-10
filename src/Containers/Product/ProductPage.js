import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Price from '../../Components/Price/Price';
import StockBadge from '../../Components/StockBadge/StockBadge';
import StateMessage from '../../Components/StateMessage/StateMessage';
import Icon from '../../Components/Icon/Icon';
import { useCart } from '../../contexts/CartContext';
import { useLoad } from '../../hooks/useLoad';
import { useDocumentTitle } from '../../hooks/hooks';
import productService from '../../services/productService';
import { pickLocalized } from '../../lib/productMapper';
import { localeFor } from '../../lib/money';
import styles from './ProductPage.module.css';

const Gallery = ({ images, name }) => {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [images]);

  if (!images.length) {
    return <div className={styles.stage}><span className={styles.noImage}>{t('product.imageMissing')}</span></div>;
  }
  const current = images[Math.min(index, images.length - 1)];
  return (
    <div className={styles.gallery} role="group" aria-label={t('product.gallery')}>
      <div className={styles.stage}>
        <img src={current.src} alt={current.alt || name} width="720" height="720" decoding="async" />
      </div>
      {images.length > 1 && (
        <ul className={styles.thumbs}>
          {images.map((img, i) => (
            <li key={img.src}>
              <button
                type="button"
                className={`${styles.thumb} ${i === index ? styles.thumbActive : ''}`}
                aria-label={t('product.viewImage', { index: i + 1 })}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => setIndex(i)}
              >
                <img src={img.src} alt="" loading="lazy" width="72" height="72" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const ProductPage = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage || 'es').slice(0, 2);
  const { addItem, busy, quantityOf } = useCart();
  const { status, data: product, error, reload } = useLoad((signal) => productService.getProduct(slug, signal), slug);
  const [qty, setQty] = useState(1);
  const [pending, setPending] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => { setQty(1); setAddError(''); }, [slug]);
  useDocumentTitle(product?.name || '');

  if (status === 'loading' && !product) {
    return <div className="container"><p role="status" className={styles.loading}>{t('product.loading')}</p></div>;
  }
  if (status === 'error') {
    const notFound = error?.response?.status === 404;
    return (
      <div className={`container ${styles.page}`}>
        <StateMessage
          tone={notFound ? 'neutral' : 'error'}
          title={notFound ? t('product.notFoundTitle') : t('product.errorTitle')}
          actions={(
            <>
              {!notFound && <button type="button" className="btn" onClick={reload}>{t('common.retry')}</button>}
              <Link to="/browse" className="btn btn-primary">{t('product.backToCatalog')}</Link>
            </>
          )}
        >
          {notFound ? t('product.notFoundBody') : t('errors.network')}
        </StateMessage>
      </div>
    );
  }
  if (!product) return null;

  const { availability } = product;
  const soldOut = availability.state === 'out';
  const inCart = quantityOf(product.id);
  const maxQty = soldOut ? 0 : Math.max(1, availability.quantity - inCart);
  const atLimit = !soldOut && inCart >= availability.quantity;
  const description = pickLocalized(product, 'description', lang);
  const fmtDate = (iso) => {
    const d = new Date(`${iso}T00:00:00`);
    return Number.isNaN(d.getTime()) ? iso : new Intl.DateTimeFormat(localeFor(lang), { dateStyle: 'long' }).format(d);
  };

  const specs = [
    product.grade && [t('product.grade'), product.grade],
    product.scale && [t('product.scale'), product.scale],
    product.manufacturer && [t('product.manufacturer'), product.manufacturer],
    product.category && [t('product.category'), <Link key="c" to={`/browse?cat=${product.category.slug}`}>{product.category.name}</Link>],
    product.sku && [t('product.sku'), product.sku],
    product.releaseDate && [t('product.released'), fmtDate(product.releaseDate)],
    product.weightGrams && [t('product.weight'), t('product.grams', { value: Number(product.weightGrams).toLocaleString(localeFor(lang)) })],
    product.dimensions && [t('product.dimensions'), product.dimensions],
    ...product.specifications.map((s) => [s.name, s.value]),
  ].filter(Boolean);

  const add = async () => {
    setPending(true);
    setAddError('');
    const result = await addItem(product.id, qty);
    setPending(false);
    if (result.ok) setQty(1);
    else if (!result.needsLogin) setAddError(t(result.error?.key || 'product.addFailed', result.error?.params));
  };

  return (
    <div className={`container ${styles.page}`}>
      <nav aria-label={t('product.breadcrumb')} className={styles.crumbs}>
        <Link to="/browse"><Icon name="chevronLeft" size={16} />{t('product.backToCatalog')}</Link>
        {product.grade && <> <span aria-hidden="true">/</span> <Link to={`/browse?grade=${product.grade}`}>{product.grade}</Link></>}
      </nav>

      <div className={styles.layout}>
        <Gallery images={product.images} name={product.name} />

        <div className={styles.info}>
          <p className={styles.tags}>
            {product.grade && <span className="tag tag-grade">{product.grade}</span>}
            {product.scale && <span className="tag">{product.scale}</span>}
          </p>
          <h1 className={styles.title}>{product.name}</h1>
          {product.manufacturer && <p className={styles.maker}>{product.manufacturer}</p>}

          <div className={styles.priceBlock}>
            <Price usd={product.price} listUsd={product.onSale ? product.listPrice : undefined} size="lg" />
            {product.onSale && <span className={styles.sale}>{t('product.sale', { pct: product.discountPercentage })}</span>}
          </div>

          <p className={styles.stock}>
            <StockBadge availability={availability} />
            {availability.state === 'in' && <span className={styles.stockNote}>{t('product.leftInStock', { count: availability.quantity })}</span>}
          </p>

          <div className={styles.buy}>
            {!soldOut && (
              <div className="field">
                <label htmlFor="qty">{t('cart.quantity')}</label>
                <select id="qty" className="input" value={Math.min(qty, maxQty)} disabled={atLimit} onChange={(e) => setQty(Number(e.target.value))}>
                  {Array.from({ length: Math.min(maxQty, 10) }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            )}
            <button type="button" className="btn btn-primary" disabled={soldOut || atLimit || pending || busy} onClick={add}>
              {soldOut ? t('product.unavailable') : pending ? t('product.adding') : t('product.addToCart')}
            </button>
          </div>
          {atLimit && <p className={styles.note} role="status">{t('product.stockLimit', { count: availability.quantity })}</p>}
          {addError && <p className={styles.error} role="alert">{addError}</p>}
        </div>
      </div>

      <section className={styles.details}>
        <div>
          <h2>{t('product.description')}</h2>
          {description.text ? (
            <>
              <p className={styles.description}>{description.text}</p>
              {description.isFallback && lang !== 'en' && <p className={styles.note}>{t('product.descriptionFallback')}</p>}
            </>
          ) : (
            <p className={styles.note}>{t('product.noDescription')}</p>
          )}
        </div>
        {specs.length > 0 && (
          <div>
            <h2>{t('product.specs')}</h2>
            <dl className={styles.specs}>
              {specs.map(([label, value], i) => (
                <div key={`${label}-${i}`} className={styles.specRow}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductPage;
