import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './PaymentMethod.module.css';

const PaymentMethod = ({ total, shippingData, selectedShippingMethod, onSubmit, onBack, loading, error }) => {
    const { t } = useTranslation();

    // Debug: Log the selected shipping method
    console.log('PaymentMethod received selectedShippingMethod:', selectedShippingMethod);
    console.log('PaymentMethod received selectedShippingMethod ID:', selectedShippingMethod?.id);

    // Use the selected shipping method or fallback to a default
    const effectiveShippingMethod = selectedShippingMethod || {
        id: 1,
        name: 'Standard Shipping',
        description: '5-7 business days',
        price: '0.00'
    };

    console.log('Effective shipping method:', effectiveShippingMethod);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Submit with manual payment method
        onSubmit({ paymentMethod: 'manual' });
    };

    return (
        <div className={styles.paymentMethod}>
            <div className={styles.section}>
                <h2>{t('checkout.payment.title')}</h2>
                <p className={styles.description}>{t('checkout.payment.description')}</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.section}>
                    <h3>{t('checkout.payment.selectMethod')}</h3>

                    <div className={styles.paymentOptions}>
                        <div className={`${styles.paymentOption} ${styles.selected}`}>
                            <div className={styles.optionHeader}>
                                <div className={styles.optionInfo}>
                                    <h4>{t('checkout.payment.manual.title')}</h4>
                                    <p>{t('checkout.payment.manual.description')}</p>
                                </div>
                                <div className={styles.optionIcon}>📞</div>
                            </div>
                            <div className={styles.manualInfo}>
                                <p>{t('checkout.payment.manual.info')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h3>{t('checkout.payment.orderSummary')}</h3>

                    <div className={styles.summary}>
                        <div className={styles.summaryRow}>
                            <span>{t('checkout.payment.subtotal')}</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>{t('checkout.payment.shipping')}</span>
                            <span>
                                {effectiveShippingMethod.price === 0 || effectiveShippingMethod.price === null ? (
                                    t('checkout.payment.free')
                                ) : (
                                    `$${parseFloat(effectiveShippingMethod.price).toFixed(2)}`
                                )}
                            </span>
                        </div>
                        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                            <span>{t('checkout.payment.total')}</span>
                            <span>
                                ${(total + (effectiveShippingMethod.price ? parseFloat(effectiveShippingMethod.price) : 0)).toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <div className={styles.shippingPreview}>
                        <h4>{t('checkout.payment.shippingTo')}</h4>
                        <p>
                            {shippingData.firstName} {shippingData.lastName}<br />
                            {shippingData.address}<br />
                            {shippingData.city}, {shippingData.state} {shippingData.postalCode}<br />
                            {shippingData.country}
                        </p>
                        <div className={styles.shippingMethodInfo}>
                            <h5>{t('checkout.payment.shippingMethod')}</h5>
                            <p>
                                {effectiveShippingMethod.name} - {effectiveShippingMethod.description}
                            </p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className={styles.errorSection}>
                        <p className={styles.error}>{error}</p>
                    </div>
                )}

                <div className={styles.actions}>
                    <button type="button" onClick={onBack} className={styles.backBtn}>
                        {t('checkout.payment.back')}
                    </button>
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={loading}
                    >
                        {loading ? t('checkout.loading') : t('checkout.payment.placeOrder')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentMethod; 