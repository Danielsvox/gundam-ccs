import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styles from './OrderSummary.module.css';

const OrderSummary = ({ orderDetails, onClose }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [showContactModal, setShowContactModal] = useState(false);

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
        return new Date(dateString).toLocaleDateString('en-US', {
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
        const total = orderDetails.amount || orderDetails.total;
        const message = `Hi! I just placed an order (#${orderNumber}) for $${total}. I'd like to arrange payment.`;

        // Encode the message for WhatsApp URL
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/15551234567?text=${encodedMessage}`;

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
                        <span className={styles.orderNumber}>#{orderDetails.order_number || orderDetails.order_id}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span>{t('checkout.confirmation.orderDate')}</span>
                        <span>{formatDate(orderDetails.created_at || new Date())}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span>{t('checkout.confirmation.paymentMethod')}</span>
                        <span>Manual Payment</span>
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
                    <p>
                        {orderDetails.shipping_address.name}<br />
                        {orderDetails.shipping_address.line1}<br />
                        {orderDetails.shipping_address.line2 && `${orderDetails.shipping_address.line2}<br />`}
                        {orderDetails.shipping_address.city}, {orderDetails.shipping_address.state} {orderDetails.shipping_address.postal_code}<br />
                        {orderDetails.shipping_address.country}
                        {orderDetails.shipping_address.phone && `<br />${orderDetails.shipping_address.phone}`}
                    </p>
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
                                        src={item.product.image_url || '/placeholder-image.jpg'}
                                        alt={item.product.name}
                                    />
                                </div>
                                <div className={styles.itemDetails}>
                                    <h4>{item.product.name}</h4>
                                    <p>Quantity: {item.quantity}</p>
                                    <p>Price: ${item.product.price}</p>
                                </div>
                                <div className={styles.itemTotal}>
                                    ${(item.product.price * item.quantity).toFixed(2)}
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
                        <span>${orderDetails.subtotal}</span>
                    </div>
                    {orderDetails.discount_amount > 0 && (
                        <div className={styles.summaryRow}>
                            <span>{t('checkout.confirmation.discount')}</span>
                            <span>-${orderDetails.discount_amount}</span>
                        </div>
                    )}
                    <div className={styles.summaryRow}>
                        <span>{t('checkout.confirmation.shipping')}</span>
                        <span>{t('checkout.confirmation.free')}</span>
                    </div>
                    <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                        <span>{t('checkout.confirmation.total')}</span>
                        <span>${orderDetails.amount || orderDetails.total}</span>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.manualPaymentInfo}>
                    <h3>{t('checkout.confirmation.manualPayment.title')}</h3>
                    <p>{t('checkout.confirmation.manualPayment.message')}</p>

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
                                <p><strong>{t('checkout.confirmation.manualPayment.contact')}</strong></p>
                                <p>📞 Phone: +1 (555) 123-4567</p>
                                <p>📧 Email: orders@gundamccs.com</p>
                                <p>🌐 Website: www.gundamccs.com</p>
                                <p>⏰ Business Hours: Mon-Fri 9AM-6PM EST</p>
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