import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../contexts/CurrencyContext';
import styles from './ShippingMethod.module.css';
import { shippingAPI } from '../../services/api';

const ShippingMethod = ({ selectedMethod, onMethodSelect, onBack, onNext, loading, cartTotal }) => {
    const { t } = useTranslation();
    const { currency, convertAmount, formatPrice } = useCurrency();
    const [shippingMethods, setShippingMethods] = useState([]);
    const [loadingMethods, setLoadingMethods] = useState(true);
    const [error, setError] = useState(null);
    const [convertedMethods, setConvertedMethods] = useState([]);

    // Free shipping minimum threshold (in USD)
    const FREE_SHIPPING_MINIMUM = 50;

    useEffect(() => {
        loadShippingMethods();
    }, []);

    // Convert shipping method prices when currency changes
    useEffect(() => {
        const convertShippingMethods = async () => {
            if (shippingMethods.length === 0) return;

            const converted = await Promise.all(
                shippingMethods.map(async (method) => {
                    if (currency === 'VES' && method.price) {
                        const convertedPrice = await convertAmount(parseFloat(method.price), 'USD', 'VES');
                        return { ...method, convertedPrice };
                    } else {
                        return { ...method, convertedPrice: parseFloat(method.price || 0) };
                    }
                })
            );

            setConvertedMethods(converted);
        };

        convertShippingMethods();
    }, [currency, shippingMethods, convertAmount]);


    const loadShippingMethods = async () => {
        try {
            setLoadingMethods(true);
            setError(null);

            const response = await shippingAPI.getShippingMethods();

            // The backend returns paginated data with results array
            const methods = response.data.results || response.data;

            // Only display active methods returned by the backend
            const activeMethods = methods.filter(method => method.is_active !== false);

            setShippingMethods(activeMethods);

            if (activeMethods.length === 0) {
                setError(t('checkout.shippingMethod.errors.noMethodsAvailable'));
            } else {
                // Clear any previous errors when methods are loaded successfully
                setError(null);
            }
        } catch (err) {
            console.error('Failed to load shipping methods:', err);
            setError(t('checkout.shippingMethod.errors.loadFailed'));
            // Provide a default free shipping method when API fails
            setShippingMethods([
                {
                    id: 1,
                    name: 'Standard Shipping',
                    description: '5-7 business days',
                    price: '0.00',
                    estimated_days: '5-7',
                    is_active: true
                }
            ]);
        } finally {
            setLoadingMethods(false);
        }
    };

    const isMethodDisabled = (method) => {
        // Check if this is a free shipping method and cart total is below minimum
        const isFreeShipping = method.price === 0 || method.price === null || method.price === '0.00';
        return isFreeShipping && cartTotal < FREE_SHIPPING_MINIMUM;
    };

    const handleMethodSelect = (method) => {
        // Don't allow selection of disabled methods
        if (isMethodDisabled(method)) {
            return;
        }

        // Debug: Log the selected method details
        console.log('ShippingMethod - Method selected:', method);
        console.log('ShippingMethod - Method price:', method.price);
        console.log('ShippingMethod - Method converted price:', method.convertedPrice);

        onMethodSelect(method);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (selectedMethod) {
            // Validate that the selected method ID is part of the list fetched from the backend
            const isValidMethod = shippingMethods.some(method => method.id === selectedMethod.id);
            if (!isValidMethod) {
                setError(t('checkout.shippingMethod.errors.invalidMethod'));
                return;
            }
            onNext();
        } else {
            // Always require a shipping method selection
            setError(t('checkout.shippingMethod.errors.noMethodSelected'));
        }
    };

    if (loadingMethods) {
        return (
            <div className={styles.shippingMethod}>
                <div className={styles.loading}>
                    <p>{t('checkout.shippingMethod.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.shippingMethod}>
            <div className={styles.section}>
                <h2>{t('checkout.shippingMethod.title')}</h2>
                <p className={styles.description}>{t('checkout.shippingMethod.description')}</p>
            </div>

            {error && (
                <div className={styles.errorSection}>
                    <p className={styles.error}>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.section}>
                    <h3>{t('checkout.shippingMethod.selectMethod')}</h3>

                    <div className={styles.methodOptions}>
                        {shippingMethods.length === 0 ? (
                            <div className={styles.noMethods}>
                                <p>{t('checkout.shippingMethod.noMethodsAvailable')}</p>
                            </div>
                        ) : (
                            convertedMethods.map((method) => {
                                const isDisabled = isMethodDisabled(method);
                                const isFreeShipping = method.price === 0 || method.price === null || method.price === '0.00';

                                return (
                                    <div
                                        key={method.id}
                                        className={`${styles.methodOption} ${selectedMethod?.id === method.id ? styles.selected : ''} ${isDisabled ? styles.disabled : ''}`}
                                        onClick={() => handleMethodSelect(method)}
                                    >
                                        <div className={styles.optionHeader}>
                                            <input
                                                type="radio"
                                                name="shippingMethod"
                                                value={method.id}
                                                checked={selectedMethod?.id === method.id}
                                                onChange={() => handleMethodSelect(method)}
                                                className={styles.radio}
                                                disabled={isDisabled}
                                            />
                                            <div className={styles.optionInfo}>
                                                <h4>{method.name}</h4>
                                                <p>{method.description}</p>
                                                {isDisabled && isFreeShipping && (
                                                    <span className={styles.eligibilityWarning}>
                                                        {t('checkout.shippingMethod.freeShippingMinimum', { minimum: formatPrice(FREE_SHIPPING_MINIMUM, 'USD') })}
                                                    </span>
                                                )}
                                                {method.estimated_days && (
                                                    <span className={styles.estimatedDays}>
                                                        {t('checkout.shippingMethod.estimatedDays', { days: method.estimated_days })}
                                                    </span>
                                                )}
                                            </div>
                                            <div className={styles.optionCost}>
                                                {method.price === 0 || method.price === null ? (
                                                    <span className={`${styles.free} ${isDisabled ? styles.disabledText : ''}`}>
                                                        {t('checkout.shippingMethod.free')}
                                                    </span>
                                                ) : (
                                                    <span className={styles.cost}>{formatPrice(method.convertedPrice)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className={styles.actions}>
                    <button type="button" onClick={onBack} className={styles.backBtn}>
                        {t('checkout.shippingMethod.back')}
                    </button>
                    <button
                        type="submit"
                        className={styles.nextBtn}
                        disabled={!selectedMethod || loading}
                    >
                        {loading ? t('checkout.loading') : t('checkout.shippingMethod.continue')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ShippingMethod; 