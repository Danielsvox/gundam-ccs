import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styles from './Checkout.module.css';
import CartReview from './CartReview';
import ShippingInfo from './ShippingInfo';
import PaymentMethod from './PaymentMethod';
import OrderSummary from './OrderSummary';
import CheckoutStepper from './CheckoutStepper';

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
    const [paymentMethod, setPaymentMethod] = useState('');
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => {
        return sum + (parseFloat(item.total_price) || 0);
    }, 0);

    const discountAmount = appliedDiscount ? (subtotal * appliedDiscount.discount_value / 100) : 0;
    const total = subtotal - discountAmount;

    const handleNext = () => {
        if (currentStep < 4) {
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

    const handlePaymentSubmit = async (paymentData) => {
        setLoading(true);
        setError(null);

        try {
            // Create order with shipping and payment data
            const orderData = {
                shipping_address: {
                    first_name: shippingData.firstName,
                    last_name: shippingData.lastName,
                    email: shippingData.email,
                    phone: shippingData.phone,
                    address: shippingData.address,
                    city: shippingData.city,
                    state: shippingData.state,
                    postal_code: shippingData.postalCode,
                    country: shippingData.country
                },
                payment_method: paymentMethod,
                discount_code: discountCode,
                items: cart.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity
                }))
            };

            // If Stripe payment, handle payment intent
            if (paymentMethod === 'stripe' && paymentData.paymentIntent) {
                orderData.payment_intent_id = paymentData.paymentIntent.id;
            }

            // Create order
            const response = await fetch('/api/v1/orders/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                throw new Error('Failed to create order');
            }

            const order = await response.json();
            setOrderDetails(order);

            // Clear cart
            await clearCart();

            // Move to confirmation step
            setCurrentStep(4);
        } catch (err) {
            setError(err.message || 'Failed to process order');
        } finally {
            setLoading(false);
        }
    };

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/v1/cart/apply-coupon/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({ code: discountCode })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Invalid discount code');
            }

            const data = await response.json();
            setAppliedDiscount(data.applied_coupon);
            setError(null);
        } catch (err) {
            setError(err.message);
            setAppliedDiscount(null);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveDiscount = async () => {
        try {
            await fetch('/api/v1/cart/remove-coupon/', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

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
                    <PaymentMethod
                        total={total}
                        shippingData={shippingData}
                        onSubmit={handlePaymentSubmit}
                        onBack={handleBack}
                        loading={loading}
                        error={error}
                    />
                );
            case 4:
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

    if (cart.length === 0 && currentStep !== 4) {
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