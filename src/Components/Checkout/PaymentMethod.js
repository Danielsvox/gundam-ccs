import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './PaymentMethod.module.css';

const PaymentMethod = ({ total, shippingData, onSubmit, onBack, loading, error }) => {
    const { t } = useTranslation();

    const [paymentMethod, setPaymentMethod] = useState('');
    const [stripeLoading, setStripeLoading] = useState(false);

    const handlePaymentMethodSelect = (method) => {
        setPaymentMethod(method);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!paymentMethod) {
            return;
        }

        if (paymentMethod === 'stripe') {
            setStripeLoading(true);
            try {
                // Create payment intent with Stripe
                const response = await fetch('/api/v1/payments/create-payment-intent/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    },
                    body: JSON.stringify({
                        amount: Math.round(total * 100), // Convert to cents
                        currency: 'usd'
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to create payment intent');
                }

                const paymentIntent = await response.json();

                // Submit with payment intent
                onSubmit({ paymentIntent });
            } catch (err) {
                console.error('Stripe error:', err);
                // Continue with manual payment if Stripe fails
                onSubmit({});
            } finally {
                setStripeLoading(false);
            }
        } else {
            // Manual payment
            onSubmit({});
        }
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
                        <div
                            className={`${styles.paymentOption} ${paymentMethod === 'stripe' ? styles.selected : ''}`}
                            onClick={() => handlePaymentMethodSelect('stripe')}
                        >
                            <div className={styles.optionHeader}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="stripe"
                                    checked={paymentMethod === 'stripe'}
                                    onChange={() => handlePaymentMethodSelect('stripe')}
                                    className={styles.radio}
                                />
                                <div className={styles.optionInfo}>
                                    <h4>{t('checkout.payment.stripe.title')}</h4>
                                    <p>{t('checkout.payment.stripe.description')}</p>
                                </div>
                                <div className={styles.optionIcon}>💳</div>
                            </div>
                            {paymentMethod === 'stripe' && (
                                <div className={styles.stripeInfo}>
                                    <p>{t('checkout.payment.stripe.info')}</p>
                                </div>
                            )}
                        </div>

                        <div
                            className={`${styles.paymentOption} ${paymentMethod === 'manual' ? styles.selected : ''}`}
                            onClick={() => handlePaymentMethodSelect('manual')}
                        >
                            <div className={styles.optionHeader}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="manual"
                                    checked={paymentMethod === 'manual'}
                                    onChange={() => handlePaymentMethodSelect('manual')}
                                    className={styles.radio}
                                />
                                <div className={styles.optionInfo}>
                                    <h4>{t('checkout.payment.manual.title')}</h4>
                                    <p>{t('checkout.payment.manual.description')}</p>
                                </div>
                                <div className={styles.optionIcon}>📞</div>
                            </div>
                            {paymentMethod === 'manual' && (
                                <div className={styles.manualInfo}>
                                    <p>{t('checkout.payment.manual.info')}</p>
                                </div>
                            )}
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
                            <span>{t('checkout.payment.free')}</span>
                        </div>
                        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                            <span>{t('checkout.payment.total')}</span>
                            <span>${total.toFixed(2)}</span>
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
                        disabled={!paymentMethod || loading || stripeLoading}
                    >
                        {loading || stripeLoading ? t('checkout.loading') : t('checkout.payment.placeOrder')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentMethod; 