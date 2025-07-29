import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../contexts/CurrencyContext';
import styles from './PaymentMethod.module.css';

const PaymentMethod = ({ total, shippingData, selectedShippingMethod, onSubmit, onBack, loading, error }) => {
    const { t } = useTranslation();
    const { currency, convertAmount, formatPrice } = useCurrency();
    const [convertedTotal, setConvertedTotal] = useState(total);
    const [convertedShippingCost, setConvertedShippingCost] = useState(0);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('manual');

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

    // Convert amounts when currency changes
    useEffect(() => {
        const convertAmounts = async () => {
            // Debug: Log the actual shipping method being used
            console.log('PaymentMethod - Effective shipping method:', effectiveShippingMethod);
            console.log('PaymentMethod - Shipping method price:', effectiveShippingMethod.price);

            const shippingCost = parseFloat(effectiveShippingMethod.price || 0);
            console.log('PaymentMethod - Calculated shipping cost:', shippingCost);

            if (currency === 'VES') {
                const convertedTotalAmount = await convertAmount(total, 'USD', 'VES');
                const convertedShipping = await convertAmount(shippingCost, 'USD', 'VES');

                setConvertedTotal(convertedTotalAmount);
                setConvertedShippingCost(convertedShipping);
            } else {
                setConvertedTotal(total);
                setConvertedShippingCost(shippingCost);
            }
        };

        convertAmounts();
    }, [currency, total, effectiveShippingMethod, convertAmount]);

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
                            <span>{formatPrice(convertedTotal)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>{t('checkout.payment.shipping')}</span>
                            <span>
                                {effectiveShippingMethod.price === 0 || effectiveShippingMethod.price === null ? (
                                    t('checkout.payment.free')
                                ) : (
                                    formatPrice(convertedShippingCost)
                                )}
                            </span>
                        </div>
                        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                            <span>{t('checkout.payment.total')}</span>
                            <span>
                                {formatPrice(convertedTotal + convertedShippingCost)}
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