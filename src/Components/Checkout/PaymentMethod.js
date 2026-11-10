import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Price from '../Price/Price';
import styles from './PaymentMethod.module.css';

const PaymentMethod = ({ totals, shippingData, selectedShippingMethod, onSubmit, onBack, loading, error }) => {
    const { t } = useTranslation();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('manual');
    const shippingMethod = selectedShippingMethod; // always chosen in the previous step (no fabricated default)

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Submit with selected payment method
        onSubmit({ paymentMethod: selectedPaymentMethod });
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
                        {/* Manual Payment Option */}
                        <div
                            className={`${styles.paymentOption} ${selectedPaymentMethod === 'manual' ? styles.selected : ''}`}
                            onClick={() => setSelectedPaymentMethod('manual')}
                        >
                            <div className={styles.optionHeader}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="manual"
                                    checked={selectedPaymentMethod === 'manual'}
                                    onChange={() => setSelectedPaymentMethod('manual')}
                                    className={styles.radio}
                                />
                                <div className={styles.optionInfo}>
                                    <h4>{t('checkout.payment.manual.title')}</h4>
                                    <p>{t('checkout.payment.manual.description')}</p>
                                </div>
                                <div className={styles.optionIcon}>📞</div>
                            </div>
                            {selectedPaymentMethod === 'manual' && (
                                <div className={styles.manualInfo}>
                                    <p>{t('checkout.payment.manual.info')}</p>
                                </div>
                            )}
                        </div>

                        {/* Pago Móvil Option */}
                        <div
                            className={`${styles.paymentOption} ${selectedPaymentMethod === 'pagomovil' ? styles.selected : ''}`}
                            onClick={() => setSelectedPaymentMethod('pagomovil')}
                        >
                            <div className={styles.optionHeader}>
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="pagomovil"
                                    checked={selectedPaymentMethod === 'pagomovil'}
                                    onChange={() => setSelectedPaymentMethod('pagomovil')}
                                    className={styles.radio}
                                />
                                <div className={styles.optionInfo}>
                                    <h4>{t('checkout.pagoMovil.title')} (VES)</h4>
                                    <p>{t('checkout.pagoMovil.description')}</p>
                                </div>
                                <div className={styles.optionIcon}>📱</div>
                            </div>
                            {selectedPaymentMethod === 'pagomovil' && (
                                <div className={styles.pagoMovilInfo}>
                                    <p>💡 {t('checkout.payment.pagoMovil.info')}</p>
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
                            <Price usd={totals.subtotal} size="sm" align="end" />
                        </div>
                        {totals.hasDiscount && (
                            <div className={styles.summaryRow}>
                                <span>{t('cart.discount')}</span>
                                <Price usd={totals.discount} size="sm" align="end" negative />
                            </div>
                        )}
                        {totals.hasTax && (
                            <div className={styles.summaryRow}>
                                <span>{t('cart.tax')}</span>
                                <Price usd={totals.tax} size="sm" align="end" />
                            </div>
                        )}
                        <div className={styles.summaryRow}>
                            <span>{t('checkout.payment.shipping')}</span>
                            {Number(totals.shipping) === 0 ? (
                                <span>{t('checkout.payment.free')}</span>
                            ) : (
                                <Price usd={totals.shipping} size="sm" align="end" />
                            )}
                        </div>
                        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                            <span>{t('checkout.payment.total')}</span>
                            <Price usd={totals.total} size="md" align="end" />
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
                                {shippingMethod.name} - {shippingMethod.description}
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