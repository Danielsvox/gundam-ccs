import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Checkout.module.css';
import Dialog from '../Dialog/Dialog';
import CartReview from './CartReview';
import ShippingInfo from './ShippingInfo';
import ShippingMethod from './ShippingMethod';
import PaymentMethod from './PaymentMethod';
import PagoMovilPayment from './PagoMovilPayment/PagoMovilPayment';
import OrderSummary from './OrderSummary';
import CheckoutStepper from './CheckoutStepper';
import { orderAPI } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { computeCartTotals } from '../../lib/cartTotals';
import { describeApiError, flattenErrors } from '../../lib/apiError';

const STEP = { REVIEW: 1, SHIPPING: 2, METHOD: 3, PAYMENT: 4, DONE: 5, PAGOMOVIL: 6 };

const Checkout = ({ onClose }) => {
    const { t } = useTranslation();
    const { cart, items, refresh } = useCart();

    const [currentStep, setCurrentStep] = useState(STEP.REVIEW);
    const [shippingData, setShippingData] = useState({
        firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', postalCode: '', country: '',
    });
    const [shippingMethod, setShippingMethod] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const [paymentSubmitted, setPaymentSubmitted] = useState(false);

    // Same arithmetic as the backend order: subtotal + tax + shipping - discount (USD, decimal-safe).
    const totals = useMemo(() => computeCartTotals(cart, shippingMethod?.price || '0'), [cart, shippingMethod]);

    const next = () => setCurrentStep((s) => Math.min(s + 1, STEP.PAYMENT));
    const back = () => setCurrentStep((s) => Math.max(s - 1, STEP.REVIEW));

    /** Creates the order. Pago Móvil orders stay on the payment step; others go to the confirmation. */
    const createOrder = async (notes, paymentMethod = '') => {
        if (!shippingMethod?.id) {
            // Never invent a shipping method: the order must reference one the server returned.
            setError(t('checkout.shippingMethod.errors.noMethodSelected'));
            setCurrentStep(STEP.METHOD);
            return false;
        }
        const payload = {
            shipping_address: {
                name: `${shippingData.firstName} ${shippingData.lastName}`.trim(),
                line1: shippingData.address,
                city: shippingData.city,
                state: shippingData.state,
                postal_code: shippingData.postalCode,
                country: shippingData.country,
            },
            shipping_method_id: shippingMethod.id,
            customer_notes: notes,
            ...(paymentMethod ? { payment_method: paymentMethod } : {}),
        };
        const { data: order } = await orderAPI.createOrder(payload);
        // Prefer what the server says about the order; fall back to the same totals the user saw.
        setOrderDetails({
            ...order,
            subtotal: order.subtotal ?? totals.subtotal,
            shipping_amount: order.shipping_amount ?? totals.shipping,
            tax_amount: order.tax_amount ?? totals.tax,
            discount_amount: order.discount_amount ?? totals.discount,
            total_amount: order.total_amount ?? order.amount ?? order.total ?? totals.total,
            shipping_method: shippingMethod,
        });
        // The server empties the cart when it creates the order; just resync our copy.
        await refresh();
        setCurrentStep(paymentMethod === 'pago_movil' ? STEP.PAGOMOVIL : STEP.DONE);
        return true;
    };

    const failWith = (err) => {
        const status = err.response?.status;
        if (status >= 400 && status < 500) {
            setError(flattenErrors(err.response.data) || t('errors.unknown'));
        } else {
            const info = describeApiError(err);
            setError(t(info.key || 'errors.unknown', info.params));
        }
    };

    // The verification is linked to the already-created order; an admin approves it later.
    const handlePagoMovilSubmitted = () => {
        setPaymentSubmitted(true);
        setCurrentStep(STEP.DONE);
    };

    const handlePayLater = () => {
        setPaymentSubmitted(false);
        setCurrentStep(STEP.DONE);
    };

    const handlePaymentSubmit = async ({ paymentMethod }) => {
        if (loading) return;
        setError(null);
        setLoading(true);
        try {
            if (paymentMethod === 'pagomovil') {
                // Create the order first so the payment can be tied to it (never create twice).
                if (orderDetails?.order_id) setCurrentStep(STEP.PAGOMOVIL);
                else await createOrder('Pago Móvil', 'pago_movil');
            } else {
                await createOrder('');
            }
        } catch (err) {
            failWith(err);
        } finally {
            setLoading(false);
        }
    };

    let body;
    switch (currentStep) {
        case STEP.REVIEW:
            body = <CartReview onNext={next} />;
            break;
        case STEP.SHIPPING:
            body = <ShippingInfo data={shippingData} onSubmit={(data) => { setShippingData(data); next(); }} onBack={back} />;
            break;
        case STEP.METHOD:
            body = (
                <ShippingMethod
                    selectedMethod={shippingMethod}
                    onMethodSelect={setShippingMethod}
                    onBack={back}
                    onNext={next}
                    loading={loading}
                    cartTotal={Number(totals.subtotal) - Number(totals.discount)}
                />
            );
            break;
        case STEP.PAYMENT:
            body = (
                <PaymentMethod
                    totals={totals}
                    shippingData={shippingData}
                    selectedShippingMethod={shippingMethod}
                    onSubmit={handlePaymentSubmit}
                    onBack={back}
                    loading={loading}
                    error={error}
                />
            );
            break;
        case STEP.DONE:
            body = <OrderSummary orderDetails={orderDetails} selectedShippingMethod={shippingMethod} onClose={onClose} paymentSubmitted={paymentSubmitted} />;
            break;
        case STEP.PAGOMOVIL:
            body = <PagoMovilPayment
                    total={String(orderDetails?.total_amount ?? totals.total)}
                    orderId={orderDetails?.order_id}
                    onPayLater={handlePayLater}
                    onSuccess={handlePagoMovilSubmitted}
                />;
            break;
        default:
            body = null;
    }

    const showEmpty = items.length === 0 && currentStep !== STEP.DONE && currentStep !== STEP.PAGOMOVIL;

    return (
        <Dialog open onClose={onClose} title={t('checkout.title')} placement="full">
            <div className={styles.content}>
                {showEmpty ? (
                    <div className={styles.empty}>
                        <h2>{t('checkout.emptyCart')}</h2>
                        <p>{t('checkout.emptyCartMessage')}</p>
                        <button type="button" onClick={onClose} className="btn btn-primary">{t('checkout.close')}</button>
                    </div>
                ) : (
                    <>
                        <CheckoutStepper currentStep={currentStep === STEP.PAGOMOVIL ? STEP.PAYMENT : currentStep} />
                        {error && currentStep !== STEP.PAYMENT && <p className={styles.error} role="alert">{error}</p>}
                        {body}
                    </>
                )}
            </div>
        </Dialog>
    );
};

export default Checkout;
