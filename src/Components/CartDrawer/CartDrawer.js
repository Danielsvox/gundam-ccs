import React, { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Dialog from '../Dialog/Dialog';
import Icon from '../Icon/Icon';
import Price from '../Price/Price';
import { ProductImage } from '../ProductCard/ProductCard';
import { useCart } from '../../contexts/CartContext';
import { useStoreUi } from '../../contexts/StoreUiContext';
import { API_BASE_URL } from '../../services/api';
import { normalizeProduct } from '../../lib/productMapper';
import styles from './CartDrawer.module.css';

const CartLine = ({ item, busy, onQuantity, onRemove }) => {
  const { t } = useTranslation();
  const product = useMemo(() => normalizeProduct(item.product, API_BASE_URL), [item.product]);
  const maxed = product.availability.state !== 'out' && product.availability.quantity != null && item.quantity >= product.availability.quantity;

  return (
    <li className={styles.line}>
      <Link to={`/gundams/${product.slug}`} className={styles.thumb} tabIndex={-1} aria-hidden="true">
        <ProductImage product={product} />
      </Link>
      <div className={styles.info}>
        <Link to={`/gundams/${product.slug}`} className={styles.name}>{product.name}</Link>
        <p className={styles.each}>
          {[product.grade, product.scale].filter(Boolean).join(' · ')}
        </p>
        {item.is_available === false && <p className={styles.warn} role="status">{t('cart.unavailableItem')}</p>}
        <div className={styles.controls}>
          <div className={styles.stepper} role="group" aria-label={t('cart.quantity')}>
            <button type="button" disabled={busy} aria-label={t('cart.decrease', { name: product.name })} onClick={() => onQuantity(item.id, item.quantity - 1)}>
              <Icon name="minus" size={16} />
            </button>
            <span aria-live="polite" aria-atomic="true">{item.quantity}</span>
            <button type="button" disabled={busy || maxed} aria-label={t('cart.increase', { name: product.name })} onClick={() => onQuantity(item.id, item.quantity + 1)}>
              <Icon name="plus" size={16} />
            </button>
          </div>
          <button type="button" className={styles.remove} disabled={busy} aria-label={t('cart.remove', { name: product.name })} onClick={() => onRemove(item.id)}>
            <Icon name="trash" size={18} />
          </button>
        </div>
      </div>
      <div className={styles.lineTotal}>
        <Price usd={item.total_price} size="sm" align="end" />
      </div>
    </li>
  );
};

const Row = ({ label, usd, negative }) => (
  <div className={styles.row}>
    <dt>{label}</dt>
    <dd><Price usd={usd} size="sm" align="end" negative={negative} /></dd>
  </div>
);

const CartDrawer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { drawerOpen, closeDrawer, items, count, totals, loading, busy, error, clearError, setQuantity, removeItem, clear, isAuthenticated } = useCart();
  const { openCheckout } = useStoreUi();

  const close = () => { clearError(); closeDrawer(); };

  let content;
  let footer = null;

  if (!isAuthenticated) {
    content = (
      <div className={styles.empty}>
        <h3>{t('cart.signInTitle')}</h3>
        <p>{t('cart.signInBody')}</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            localStorage.setItem('redirectAfterLogin', location.pathname + location.search);
            closeDrawer();
            navigate('/login');
          }}
        >
          {t('cart.signIn')}
        </button>
      </div>
    );
  } else if (loading && items.length === 0) {
    content = <p role="status" className={styles.status}>{t('cart.loading')}</p>;
  } else if (items.length === 0) {
    content = (
      <div className={styles.empty}>
        <h3>{t('cart.empty')}</h3>
        <p>{t('cart.emptyBody')}</p>
        <Link to="/browse" className="btn btn-primary" onClick={closeDrawer}>{t('cart.continueShopping')}</Link>
      </div>
    );
  } else {
    content = (
      <>
        <p className={styles.summaryCount}>{t('cart.itemsCount', { count })}</p>
        <ul className={styles.lines}>
          {items.map((item) => (
            <CartLine key={item.id} item={item} busy={busy} onQuantity={setQuantity} onRemove={removeItem} />
          ))}
        </ul>
        <button type="button" className={styles.clear} onClick={clear} disabled={busy}>{t('cart.clear')}</button>
      </>
    );
    footer = (
      <div className={styles.footer}>
        <dl className={styles.totals}>
          <Row label={t('cart.subtotal')} usd={totals.subtotal} />
          {totals.hasTax && <Row label={t('cart.tax')} usd={totals.tax} />}
          {totals.hasDiscount && <Row label={t('cart.discount')} usd={totals.discount} negative />}
          <div className={`${styles.row} ${styles.grand}`}>
            <dt>{t('cart.total')}</dt>
            <dd><Price usd={totals.total} size="lg" align="end" /></dd>
          </div>
        </dl>
        <p className={styles.note}>{t('cart.shippingNote')}</p>
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={busy}
          onClick={() => { closeDrawer(); openCheckout(); }}
        >
          {t('cart.checkout')}
        </button>
      </div>
    );
  }

  return (
    <Dialog open={drawerOpen} onClose={close} title={t('cart.title')} placement="right" footer={footer}>
      {error?.key && (
        <p className={styles.error} role="alert">
          {t(error.key, error.params)}
        </p>
      )}
      {content}
    </Dialog>
  );
};

export default CartDrawer;
