import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styles from './Checkout.module.css';
import CartReview from './CartReview';
import ShippingInfo from './ShippingInfo';
import ShippingMethod from './ShippingMethod';
import PaymentMethod from './PaymentMethod';
import OrderSummary from './OrderSummary';
import CheckoutStepper from './CheckoutStepper';
import { orderAPI, cartAPI } from '../../services/api';

const Checkout = ({
    cart,
    cartAmount,
    handleUpdateQuantity,
    handleRemoveFromCart,
    clearCart,
    onClose
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const [shippingData, setShippingData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
    });
    const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const [pendingShippingMethod, setPendingShippingMethod] = useState(null);

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => {
        return sum + (parseFloat(item.total_price) || 0);
    }, 0);

    const discountAmount = appliedDiscount ? (subtotal * appliedDiscount.discount_value / 100) : 0;
    const total = subtotal - discountAmount;

    const handleNext = () => {
        if (currentStep < 5) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleShippingSubmit = (data) => {
        setShippingData(data);
        handleNext();
    };

    const handleShippingMethodSubmit = (method) => {
        console.log('Shipping method selected:', method);
        console.log('Method ID:', method?.id);
        setSelectedShippingMethod(method);
        setPendingShippingMethod(method);
        console.log('State updated, moving to next step');
        handleNext();
    };

    const handlePaymentSubmit = async (paymentData) => {
        setLoading(true);
        setError(null);

        try {
            // Always use manual payment method
            setPaymentMethod('manual');

            // Debug: Check if we have a shipping method
            console.log('Current step:', currentStep);
            console.log('Selected shipping method:', selectedShippingMethod);
            console.log('Shipping method ID:', selectedShippingMethod?.id);
            console.log('Pending shipping method:', pendingShippingMethod);

            // Use the selected shipping method or the pending one
            const effectiveShippingMethod = selectedShippingMethod || pendingShippingMethod || {
                id: 1,
                name: 'Standard Shipping',
                description: '5-7 business days',
                price: '0.00'
            };

            console.log('Effective shipping method for checkout:', effectiveShippingMethod);

            // Create order with shipping and payment data according to backend requirements
            const orderData = {
                shipping_address: {
                    name: `${shippingData.firstName} ${shippingData.lastName}`,
                    line1: shippingData.address,
                    line2: '', // Optional apartment/suite
                    city: shippingData.city,
                    state: shippingData.state,
                    postal_code: shippingData.postalCode,
                    country: shippingData.country,
                    phone: shippingData.phone
                },
                shipping_method_id: effectiveShippingMethod.id,
                payment_method: 'manual', // Explicitly set manual payment
                customer_notes: '' // Optional field
            };

            console.log('Order data being sent:', orderData);

            // Create order using centralized API service
            // The backend will handle the order creation without payment intent
            const response = await orderAPI.createOrder(orderData);
            const order = response.data;
            setOrderDetails(order);

            // Clear cart
            await clearCart();

            // Move to confirmation step
            setCurrentStep(5);
        } catch (err) {
            // Display any 400-level error from the backend clearly to the user
            if (err.response?.status >= 400 && err.response?.status < 500) {
                const errorData = err.response.data;
                if (typeof errorData === 'object') {
                    // Handle structured error responses
                    const errorMessages = Object.entries(errorData)
                        .map(([field, messages]) => {
                            if (Array.isArray(messages)) {
                                return messages.join(', ');
                            }
                            return messages;
                        })
                        .join('. ');
                    setError(errorMessages);
                } else {
                    setError(errorData || 'Invalid request. Please check your information.');
                }
            } else {
                setError(err.message || 'Failed to process order. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await cartAPI.applyCoupon(discountCode);
            setAppliedDiscount(response.data.applied_coupon);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Invalid discount code');
            setAppliedDiscount(null);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveDiscount = async () => {
        try {
            await cartAPI.removeCoupon();
            setAppliedDiscount(null);
            setDiscountCode('');
        } catch (err) {
            console.error('Failed to remove discount:', err);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <CartReview
                        cart={cart}
                        subtotal={subtotal}
                        discountCode={discountCode}
                        setDiscountCode={setDiscountCode}
                        appliedDiscount={appliedDiscount}
                        onApplyDiscount={handleApplyDiscount}
                        onRemoveDiscount={handleRemoveDiscount}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemoveItem={handleRemoveFromCart}
                        onNext={handleNext}
                        loading={loading}
                        error={error}
                    />
                );
            case 2:
                return (
                    <ShippingInfo
                        data={shippingData}
                        onSubmit={handleShippingSubmit}
                        onBack={handleBack}
                    />
                );
            case 3:
                return (
                    <ShippingMethod
                        key="shipping-method-step"
                        selectedMethod={selectedShippingMethod}
                        onMethodSelect={setSelectedShippingMethod}
                        onBack={handleBack}
                        onNext={handleShippingMethodSubmit}
                        loading={loading}
                    />
                );
            case 4:
                return (
                    <PaymentMethod
                        total={total}
                        shippingData={shippingData}
                        selectedShippingMethod={selectedShippingMethod}
                        onSubmit={handlePaymentSubmit}
                        onBack={handleBack}
                        loading={loading}
                        error={error}
                    />
                );
            case 5:
                return (
                    <OrderSummary
                        orderDetails={orderDetails}
                        onClose={onClose}
                    />
                );
            default:
                return null;
        }
    };

    if (cart.length === 0 && currentStep !== 5) {
        return (
            <div className={styles.emptyCart}>
                <h2>{t('checkout.emptyCart')}</h2>
                <p>{t('checkout.emptyCartMessage')}</p>
                <button onClick={() => navigate('/browse')} className={styles.browseButton}>
                    {t('checkout.continueShopping')}
                </button>
            </div>
        );
    }

    return (
        <div className={styles.checkoutContainer}>
            <div className={styles.checkoutHeader}>
                <button onClick={onClose} className={styles.closeButton}>
                    ×
                </button>
                <h1>{t('checkout.title')}</h1>
            </div>

            <CheckoutStepper currentStep={currentStep} />

            <div className={styles.checkoutContent}>
                {renderStep()}
            </div>
        </div>
    );
};

export default Checkout; 