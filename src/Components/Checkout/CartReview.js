import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Price from '../Price/Price';
import { ProductImage } from '../ProductCard/ProductCard';
import { useCart } from '../../contexts/CartContext';
import { cartAPI, API_BASE_URL } from '../../services/api';
import { normalizeProduct } from '../../lib/productMapper';
import { describeApiError } from '../../lib/apiError';
import styles from './CartReview.module.css';

const Line = ({ item, busy, onQuantity, onRemove }) => {
    const { t } = useTranslation();
    const product = useMemo(() => normalizeProduct(item.product, API_BASE_URL), [item.product]);
    return (
        <div className={styles.cartItem}>
            <div className={styles.itemImage}>
                <ProductImage product={product} />
            </div>
            <div className={styles.itemDetails}>
                <h3>{product.name}</h3>
                <div className={styles.itemPrice}><Price usd={product.price} size="sm" /></div>
            </div>
            <div className={styles.itemQuantity}>
                <button type="button" disabled={busy} onClick={() => onQuantity(item.id, item.quantity - 1)} className={styles.quantityBtn} aria-label={t('cart.decrease', { name: product.name })}>−</button>
                <span>{item.quantity}</span>
                <button type="button" disabled={busy} onClick={() => onQuantity(item.id, item.quantity + 1)} className={styles.quantityBtn} aria-label={t('cart.increase', { name: product.name })}>+</button>
            </div>
            <div className={styles.itemTotal}><Price usd={item.total_price} size="sm" align="end" /></div>
            <button type="button" disabled={busy} onClick={() => onRemove(item.id)} className={styles.removeBtn} aria-label={t('cart.remove', { name: product.name })}>×</button>
        </div>
    );
};

const CartReview = ({ onNext }) => {
    const { t } = useTranslation();
    const { cart, items, totals, busy, setQuantity, removeItem, refresh } = useCart();
    const [code, setCode] = useState('');
    const [couponBusy, setCouponBusy] = useState(false);
    const [error, setError] = useState('');

    const applied = cart?.applied_coupons?.[0] || null;

    const apply = async (e) => {
        e.preventDefault();
        if (!code.trim()) return;
        setCouponBusy(true);
        setError('');
        try {
            await cartAPI.applyCoupon(code.trim());
            await refresh();
            setCode('');
        } catch (err) {
            const info = describeApiError(err);
            setError(info.detail || t(info.key || 'errors.unknown', info.params));
        } finally {
            setCouponBusy(false);
        }
    };

    const remove = async () => {
        setCouponBusy(true);
        setError('');
        try {
            await cartAPI.removeCoupon(applied.id);
            await refresh();
        } catch (err) {
            const info = describeApiError(err);
            setError(info.detail || t(info.key || 'errors.unknown', info.params));
        } finally {
            setCouponBusy(false);
        }
    };

    const couponLabel = applied
        ? `${applied.coupon?.code}${applied.coupon?.coupon_type === 'PERCENTAGE' || applied.coupon?.coupon_type === 'percentage' ? ` - ${Number(applied.coupon.value)}%` : ''}`
        : '';

    return (
        <div className={styles.cartReview}>
            <div className={styles.section}>
                <h2>{t('checkout.cartReview.title')}</h2>
                <div className={styles.cartItems}>
                    {items.map((item) => (
                        <Line key={item.id} item={item} busy={busy} onQuantity={setQuantity} onRemove={removeItem} />
                    ))}
                </div>
            </div>

            <div className={styles.section}>
                <h3>{t('checkout.cartReview.discount')}</h3>
                {!applied ? (
                    <form onSubmit={apply} className={styles.discountForm}>
                        <label htmlFor="coupon" className="sr-only">{t('checkout.cartReview.discount')}</label>
                        <input id="coupon" type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('checkout.cartReview.discountPlaceholder')} className={styles.discountInput} autoComplete="off" />
                        <button type="submit" className={styles.applyBtn} disabled={couponBusy || !code.trim()}>
                            {couponBusy ? t('checkout.loading') : t('checkout.cartReview.apply')}
                        </button>
                    </form>
                ) : (
                    <div className={styles.appliedDiscount}>
                        <span>{couponLabel}</span>
                        <button type="button" onClick={remove} disabled={couponBusy} className={styles.removeDiscountBtn}>{t('checkout.cartReview.remove')}</button>
                    </div>
                )}
                {error && <p className={styles.error} role="alert">{error}</p>}
            </div>

            <div className={styles.section}>
                <div className={styles.orderSummary}>
                    <div className={styles.summaryRow}>
                        <span>{t('checkout.cartReview.subtotal')}</span>
                        <Price usd={totals.subtotal} size="sm" align="end" />
                    </div>
                    {totals.hasDiscount && (
                        <div className={styles.summaryRow}>
                            <span>{t('checkout.cartReview.discount')}</span>
                            <Price usd={totals.discount} size="sm" align="end" negative />
                        </div>
                    )}
                    {totals.hasTax && (
                        <div className={styles.summaryRow}>
                            <span>{t('cart.tax')}</span>
                            <Price usd={totals.tax} size="sm" align="end" />
                        </div>
                    )}
                    <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                        <span>{t('checkout.cartReview.total')}</span>
                        <Price usd={totals.total} size="md" align="end" />
                    </div>
                    <p className={styles.note}>{t('cart.shippingNote')}</p>
                </div>
            </div>

            <div className={styles.actions}>
                <button type="button" onClick={onNext} className={styles.nextBtn} disabled={items.length === 0 || busy}>
                    {t('checkout.cartReview.continue')}
                </button>
            </div>
        </div>
    );
};

export default CartReview;
