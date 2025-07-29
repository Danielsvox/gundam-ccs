import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../contexts/CurrencyContext';
import styles from './CartReview.module.css';

const CartReview = ({
    cart,
    subtotal,
    discountCode,
    setDiscountCode,
    appliedDiscount,
    onApplyDiscount,
    onRemoveDiscount,
    onUpdateQuantity,
    onRemoveItem,
    onNext,
    loading,
    error
}) => {
    const { t } = useTranslation();
    const { currency, convertAmount, formatPrice } = useCurrency();
    const [convertedSubtotal, setConvertedSubtotal] = useState(subtotal);
    const [convertedDiscountAmount, setConvertedDiscountAmount] = useState(0);
    const [convertedTotal, setConvertedTotal] = useState(0);

    const discountAmount = appliedDiscount ? (subtotal * appliedDiscount.discount_value / 100) : 0;
    const total = subtotal - discountAmount;

    // Convert amounts when currency changes
    useEffect(() => {
        const convertAmounts = async () => {
            if (currency === 'VES') {
                const convertedSub = await convertAmount(subtotal, 'USD', 'VES');
                const convertedDiscount = await convertAmount(discountAmount, 'USD', 'VES');
                const convertedTotalAmount = await convertAmount(total, 'USD', 'VES');

                setConvertedSubtotal(convertedSub);
                setConvertedDiscountAmount(convertedDiscount);
                setConvertedTotal(convertedTotalAmount);
            } else {
                setConvertedSubtotal(subtotal);
                setConvertedDiscountAmount(discountAmount);
                setConvertedTotal(total);
            }
        };

        convertAmounts();
    }, [currency, subtotal, discountAmount, total, convertAmount]);

    const handleApplyDiscount = (e) => {
        e.preventDefault();
        onApplyDiscount();
    };

    return (
        <div className={styles.cartReview}>
            <div className={styles.section}>
                <h2>{t('checkout.cartReview.title')}</h2>

                <div className={styles.cartItems}>
                    {cart.map((item) => (
                        <div key={item.id} className={styles.cartItem}>
                            <div className={styles.itemImage}>
                                <img
                                    src={item.product.image_url || '/placeholder-image.jpg'}
                                    alt={item.product.name}
                                />
                            </div>

                            <div className={styles.itemDetails}>
                                <h3>{item.product.name}</h3>
                                <p className={styles.itemPrice}>{formatPrice(parseFloat(item.product.price))}</p>
                            </div>

                            <div className={styles.itemQuantity}>
                                <button
                                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    className={styles.quantityBtn}
                                >
                                    −
                                </button>
                                <span>{item.quantity}</span>
                                <button
                                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                    className={styles.quantityBtn}
                                >
                                    +
                                </button>
                            </div>

                            <div className={styles.itemTotal}>
                                {formatPrice(parseFloat(item.total_price))}
                            </div>

                            <button
                                onClick={() => onRemoveItem(item.id)}
                                className={styles.removeBtn}
                                aria-label="Remove item"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.section}>
                <h3>{t('checkout.cartReview.discount')}</h3>

                {!appliedDiscount ? (
                    <form onSubmit={handleApplyDiscount} className={styles.discountForm}>
                        <input
                            type="text"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            placeholder={t('checkout.cartReview.discountPlaceholder')}
                            className={styles.discountInput}
                        />
                        <button
                            type="submit"
                            className={styles.applyBtn}
                            disabled={loading || !discountCode.trim()}
                        >
                            {loading ? t('checkout.loading') : t('checkout.cartReview.apply')}
                        </button>
                    </form>
                ) : (
                    <div className={styles.appliedDiscount}>
                        <span>{appliedDiscount.code} - {appliedDiscount.discount_value}% off</span>
                        <button onClick={onRemoveDiscount} className={styles.removeDiscountBtn}>
                            {t('checkout.cartReview.remove')}
                        </button>
                    </div>
                )}

                {error && <p className={styles.error}>{error}</p>}
            </div>

            <div className={styles.section}>
                <div className={styles.orderSummary}>
                    <div className={styles.summaryRow}>
                        <span>{t('checkout.cartReview.subtotal')}</span>
                        <span>{formatPrice(convertedSubtotal)}</span>
                    </div>

                    {appliedDiscount && (
                        <div className={styles.summaryRow}>
                            <span>{t('checkout.cartReview.discount')}</span>
                            <span>-{formatPrice(convertedDiscountAmount)}</span>
                        </div>
                    )}

                    <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                        <span>{t('checkout.cartReview.total')}</span>
                        <span>{formatPrice(convertedTotal)}</span>
                    </div>
                </div>
            </div>

            <div className={styles.actions}>
                <button
                    onClick={onNext}
                    className={styles.nextBtn}
                    disabled={cart.length === 0}
                >
                    {t('checkout.cartReview.continue')}
                </button>
            </div>
        </div>
    );
};

export default CartReview; 