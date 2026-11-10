import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../../contexts/CurrencyContext';
import Price from '../Price/Price';
import { localeFor } from '../../lib/money';
import styles from './OrderSummary.module.css';

const OrderSummary = ({ orderDetails, selectedShippingMethod, onClose, paymentSubmitted = false }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { formatUsd } = useCurrency();
    const lang = (i18n.resolvedLanguage || 'es').slice(0, 2);
    const [showContactModal, setShowContactModal] = useState(false);

    const isPagoMovil = orderDetails?.payment_method === 'pago_movil';

    // Get the effective shipping method (from order details or props)
    const embeddedShippingMethod = orderDetails?.shipping_method || selectedShippingMethod;

    // Amounts as received from the server (USD decimal strings). Nothing is converted here:
    // <Price> adds the VES equivalent when the exchange rate is usable.
    const totalAmount = String(orderDetails?.total_amount || orderDetails?.amount || orderDetails?.total || '0');
    const subtotalAmount = String(orderDetails?.subtotal || '0');
    const shippingAmount = String(orderDetails?.shipping_amount || selectedShippingMethod?.price || '0');
    const discountAmount = String(orderDetails?.discount_amount || '0');
    const taxAmount = String(orderDetails?.tax_amount || '0');

    if (!orderDetails) {
        return (
            <div className={styles.orderSummary}>
                <div className={styles.section}>
                    <h2>{t('checkout.confirmation.loading')}</h2>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(localeFor(lang), {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleContinueShopping = () => {
        onClose();
        navigate('/browse');
    };

    const handleContactBusiness = () => {
        // Create WhatsApp message with order details
        const orderNumber = orderDetails.order_number || orderDetails.order_id;
        const total = formatUsd(totalAmount);
        const message = t('contact.messages.newOrderPayment', {
            orderNumber: orderNumber,
            total: total
        });

        // Encode the message for WhatsApp URL
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/584142693743?text=${encodedMessage}`;

        // Open WhatsApp in new tab
        window.open(whatsappUrl, '_blank');
    };

    const handleShowContactInfo = () => {
        setShowContactModal(true);
    };

    const handleCloseContactModal = () => {
        setShowContactModal(false);
    };

    return (
        <div className={styles.orderSummary}>
            <div className={styles.section}>
                <div className={styles.successHeader}>
                    <div className={styles.successIcon}>✅</div>
                    <h2>{t('checkout.confirmation.title')}</h2>
                    <p>{t('checkout.confirmation.message')}</p>
                </div>
            </div>

            <div className={styles.section}>
                <h3>{t('checkout.confirmation.orderDetails')}</h3>

                <div className={styles.orderInfo}>
                    <div className={styles.infoRow}>
                        <span>{t('checkout.confirmation.orderNumber')}</span>
                        <span className={styles.orderNumber}>#{orderDetails.order_number || orderDetails.order_id || 'N/A'}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span>{t('checkout.confirmation.orderDate')}</span>
                        <span>{formatDate(orderDetails.created_at || new Date())}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span>{t('checkout.confirmation.paymentMethod')}</span>
                        <span>{isPagoMovil ? t('checkout.pagoMovil.title') : t('checkout.payment.manual.title')}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span>{t('checkout.confirmation.status')}</span>
                        <span className={styles.status}>{orderDetails.status || 'Pending'}</span>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h3>{t('checkout.confirmation.shippingAddress')}</h3>

                <div className={styles.addressInfo}>
                    {orderDetails.shipping_address ? (
                        <p>
                            {orderDetails.shipping_address.name}<br />
                            {orderDetails.shipping_address.line1}<br />
                            {orderDetails.shipping_address.line2 && `${orderDetails.shipping_address.line2}<br />`}
                            {orderDetails.shipping_address.city}, {orderDetails.shipping_address.state} {orderDetails.shipping_address.postal_code}<br />
                            {orderDetails.shipping_address.country}
                            {orderDetails.shipping_address.phone && `<br />${orderDetails.shipping_address.phone}`}
                        </p>
                    ) : (
                        <p>{t('checkout.confirmation.addressNotAvailable')}</p>
                    )}
                </div>
            </div>

            {orderDetails.items && orderDetails.items.length > 0 && (
                <div className={styles.section}>
                    <h3>{t('checkout.confirmation.items')}</h3>

                    <div className={styles.itemsList}>
                        {orderDetails.items.map((item, index) => (
                            <div key={index} className={styles.orderItem}>
                                <div className={styles.itemImage}>
                                    <img
                                        src={item.product?.image_url || '/placeholder-image.jpg'}
                                        alt={item.product?.name || 'Product'}
                                    />
                                </div>
                                <div className={styles.itemDetails}>
                                    <h4>{item.product?.name || 'Product'}</h4>
                                    <p>Quantity: {item.quantity || 0}</p>
                                    <p>Price: <Price usd={String(item.product?.price || 0)} size="sm" /></p>
                                </div>
                                <div className={styles.itemTotal}>
                                    <Price usd={item.total_price ? String(item.total_price) : String(Number(item.product?.price || 0) * (item.quantity || 0))} size="sm" align="end" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={styles.section}>
                <h3>{t('checkout.confirmation.total')}</h3>

                <div className={styles.totalSummary}>
                    <div className={styles.summaryRow}>
                        <span>{t('checkout.confirmation.subtotal')}</span>
                        <span><Price usd={subtotalAmount} size="sm" align="end" /></span>
                    </div>
                    {Number(discountAmount) > 0 && (
                        <div className={styles.summaryRow}>
                            <span>{t('checkout.confirmation.discount')}</span>
                            <span><Price usd={discountAmount} size="sm" align="end" negative /></span>
                        </div>
                    )}
                    <div className={styles.summaryRow}>
                        <span>{t('checkout.confirmation.shipping')}</span>
                        <span>
                            {Number(shippingAmount) === 0 ?
                                t('checkout.confirmation.free') :
                                <Price usd={shippingAmount} size="sm" align="end" />
                            }
                        </span>
                    </div>
                    {embeddedShippingMethod && (
                        <div className={styles.shippingMethodInfo}>
                            <small>
                                {embeddedShippingMethod.name}
                                {embeddedShippingMethod.estimated_days &&
                                    ` (${embeddedShippingMethod.estimated_days} business days)`
                                }
                            </small>
                        </div>
                    )}
                    {Number(taxAmount) > 0 && (
                        <div className={styles.summaryRow}>
                            <span>{t('checkout.confirmation.tax')}</span>
                            <span><Price usd={taxAmount} size="sm" align="end" /></span>
                        </div>
                    )}
                    <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                        <span>{t('checkout.confirmation.total')}</span>
                        <span><Price usd={totalAmount} size="md" align="end" /></span>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.manualPaymentInfo}>
                    <h3>{t(isPagoMovil ? `checkout.confirmation.${paymentSubmitted ? 'pagoMovilPending' : 'pagoMovilUnpaid'}.title` : 'checkout.confirmation.manualPayment.title')}</h3>
                    <p>{t(isPagoMovil ? `checkout.confirmation.${paymentSubmitted ? 'pagoMovilPending' : 'pagoMovilUnpaid'}.message` : 'checkout.confirmation.manualPayment.message')}</p>

                    <div className={styles.contactButtons}>
                        <button
                            onClick={handleContactBusiness}
                            className={styles.whatsappBtn}
                        >
                            📱 {t('checkout.confirmation.contactBusiness.whatsapp')}
                        </button>
                        <button
                            onClick={handleShowContactInfo}
                            className={styles.contactInfoBtn}
                        >
                            📞 {t('checkout.confirmation.contactBusiness.contactInfo')}
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.actions}>
                <button onClick={handleContinueShopping} className={styles.continueBtn}>
                    {t('checkout.confirmation.continueShopping')}
                </button>
            </div>

            {/* Contact Information Modal */}
            {showContactModal && (
                <div className={styles.modalOverlay} onClick={handleCloseContactModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{t('checkout.confirmation.contactBusiness.contactInfo')}</h3>
                            <button onClick={handleCloseContactModal} className={styles.closeModalBtn}>×</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.contactInfo}>
                                <p><strong>{t('checkout.confirmation.contactBusiness.contactInfoTitle')}</strong></p>
                                <p>{t('checkout.confirmation.contactBusiness.phone')}: +58 414 269 3743</p>
                                <p>{t('checkout.confirmation.contactBusiness.email')}: orders@gundamccs.com</p>
                                <p>{t('checkout.confirmation.contactBusiness.website')}: www.gundamccs.com</p>
                                <p>{t('checkout.confirmation.contactBusiness.hours')}: {t('checkout.confirmation.contactBusiness.hoursText')}</p>
                            </div>
                            <div className={styles.paymentInstructions}>
                                <h4>{t('checkout.confirmation.contactBusiness.paymentInstructions')}</h4>
                                <ul>
                                    <li>{t('checkout.confirmation.contactBusiness.instruction1')}</li>
                                    <li>{t('checkout.confirmation.contactBusiness.instruction2')}</li>
                                    <li>{t('checkout.confirmation.contactBusiness.instruction3')}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderSummary; 