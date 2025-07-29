import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styles from './Checkout.module.css';
import CartReview from './CartReview';
import ShippingInfo from './ShippingInfo';
import ShippingMethod from './ShippingMethod';
import PaymentMethod from './PaymentMethod';
import PagoMovilPayment from './PagoMovilPayment/PagoMovilPayment';
import OrderSummary from './OrderSummary';
import CheckoutStepper from './CheckoutStepper';
import { orderAPI, cartAPI } from '../../services/api';

const Checkout = ({
    cart,
    cartAmount,
    handleUpdateQuantity,
    handleRemoveFromCart,
    clearCart,
    clearCartSilently,
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
    const shippingCost = selectedShippingMethod ? (parseFloat(selectedShippingMethod.price) || 0) : 0;
    const total = subtotal - discountAmount + shippingCost;

    // Debug: Log the total calculation
    console.log('Checkout - Cart items:', cart);
    console.log('Checkout - Subtotal:', subtotal);
    console.log('Checkout - Selected shipping method:', selectedShippingMethod);
    console.log('Checkout - Shipping cost:', shippingCost);
    console.log('Checkout - Total:', total);

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

    const handlePagoMovilSuccess = async () => {
        // When Pago Móvil payment is successful, create the order
        try {
            setLoading(true);
            setError(null);

            const effectiveShippingMethod = selectedShippingMethod || pendingShippingMethod || {
                id: 1,
                name: 'Standard Shipping',
                description: '5-7 business days',
                price: '0.00'
            };

            const orderData = {
                shipping_address: {
                    name: `${shippingData.firstName} ${shippingData.lastName}`,
                    line1: shippingData.address,
                    city: shippingData.city,
                    state: shippingData.state,
                    postal_code: shippingData.postalCode,
                    country: shippingData.country
                },
                shipping_method_id: effectiveShippingMethod.id,
                customer_notes: 'Paid via Pago Móvil'
            };

            const response = await orderAPI.createOrder(orderData);
            const order = response.data;

            // Debug: Log the complete order response
            console.log('PagoMovil order creation response:', order);

            // Enhance the order data with frontend-calculated values if backend doesn't provide them
            const enhancedOrder = {
                ...order,
                // Use backend values if available, otherwise use frontend calculations
                subtotal: order.subtotal || subtotal,
                shipping_amount: order.shipping_amount || (parseFloat(effectiveShippingMethod.price) || 0),
                tax_amount: order.tax_amount || 0,
                total_amount: order.total_amount || order.amount || order.total || total,
                // Include shipping method details for OrderSummary
                shipping_method: effectiveShippingMethod
            };

            console.log('PagoMovil enhanced order data:', enhancedOrder);
            setOrderDetails(enhancedOrder);

            // Clear cart silently
            await clearCartSilently();

            // Move to confirmation step
            setCurrentStep(5);
        } catch (err) {
            console.error('Error creating order after Pago Móvil:', err);
            setError('Failed to create order. Please contact support.');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSubmit = async (paymentData) => {
        setLoading(true);
        setError(null);

        try {
            // Set the payment method from the form data
            setPaymentMethod(paymentData.paymentMethod || 'manual');

            // If Pago Móvil is selected, go to Pago Móvil step (step 6)
            if (paymentData.paymentMethod === 'pagomovil') {
                setCurrentStep(6);
                setLoading(false);
                return;
            }

            // For manual payment, proceed with order creation
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

            // Create order with shipping and payment data according to payments checkout requirements
            const orderData = {
                shipping_address: {
                    name: `${shippingData.firstName} ${shippingData.lastName}`,
                    line1: shippingData.address,
                    city: shippingData.city,
                    state: shippingData.state,
                    postal_code: shippingData.postalCode,
                    country: shippingData.country
                },
                shipping_method_id: effectiveShippingMethod.id,
                customer_notes: '' // Optional field
            };

            console.log('Order data being sent:', orderData);

            // Create order using centralized API service
            // The backend will handle the order creation without payment intent
            const response = await orderAPI.createOrder(orderData);
            const order = response.data;

            // Debug: Log the complete order response
            console.log('Order creation response:', order);

            // Enhance the order data with frontend-calculated values if backend doesn't provide them
            const enhancedOrder = {
                ...order,
                // Use backend values if available, otherwise use frontend calculations
                subtotal: order.subtotal || subtotal,
                shipping_amount: order.shipping_amount || (parseFloat(effectiveShippingMethod.price) || 0),
                tax_amount: order.tax_amount || 0,
                total_amount: order.total_amount || order.amount || order.total || total,
                // Include shipping method details for OrderSummary
                shipping_method: effectiveShippingMethod
            };

            console.log('Enhanced order data:', enhancedOrder);
            setOrderDetails(enhancedOrder);

            // Clear cart silently (without showing confirmation modal)
            await clearCartSilently();

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
                        cartTotal={total}
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
                        selectedShippingMethod={selectedShippingMethod || pendingShippingMethod}
                        onClose={onClose}
                    />
                );
            case 6:
                return (
                    <PagoMovilPayment
                        total={total}
                        onBack={handleBack}
                        onSuccess={handlePagoMovilSuccess}
                    />
                );
            default:
                return null;
        }
    };

    if (cart.length === 0 && currentStep !== 5 && currentStep !== 6) {
        return (
            <div className={styles.emptyCart}>
                <h2>{t('checkout.emptyCart')}</h2>
                <p>{t('checkout.emptyCartMessage')}</p>
                <button onClick={onClose} className={styles.closeBtn}>
                    {t('checkout.close')}
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