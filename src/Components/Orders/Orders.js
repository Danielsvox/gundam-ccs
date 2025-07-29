import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { orderAPI } from '../../services/api';
import authService from '../../services/authService';
import { useCurrency } from '../../contexts/CurrencyContext';
import styles from './Orders.module.css';

const Orders = ({ onClose }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { currency, convertAmount, formatPrice } = useCurrency();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [showContactModal, setShowContactModal] = useState(false);
    const [convertedAmounts, setConvertedAmounts] = useState({});

    // Convert order amounts when currency changes
    useEffect(() => {
        const convertOrderAmounts = async () => {
            const newConvertedAmounts = {};

            for (const order of orders) {
                if (currency === 'VES') {
                    const converted = await convertAmount(order.total_amount, 'USD', 'VES');
                    newConvertedAmounts[order.id] = converted;
                } else {
                    newConvertedAmounts[order.id] = order.total_amount;
                }
            }

            setConvertedAmounts(newConvertedAmounts);
        };

        if (orders.length > 0) {
            convertOrderAmounts();
        }
    }, [currency, orders, convertAmount]);

    useEffect(() => {
        if (!authService.isUserAuthenticated()) {
            navigate('/login');
            return;
        }
        loadOrders();
    }, [currentPage, statusFilter]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page: currentPage,
                page_size: 10
            };

            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }

            const response = await orderAPI.getOrders(params);
            setOrders(response.data.results || []);
            setTotalPages(Math.ceil((response.data.count || 0) / 10));
        } catch (err) {
            console.error('Failed to load orders:', err);
            setError(err.response?.data?.message || t('ui.error.loadOrdersFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleOrderClick = async (orderId) => {
        try {
            const response = await orderAPI.getOrderDetail(orderId);
            setSelectedOrder(response.data);
            setShowOrderDetail(true);
        } catch (err) {
            console.error('Failed to load order details:', err);
            setError(t('ui.error.loadOrderDetailsFailed'));
        }
    };

    const handleBackToOrders = () => {
        setShowOrderDetail(false);
        setSelectedOrder(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return styles.statusPending;
            case 'processing':
                return styles.statusProcessing;
            case 'shipped':
                return styles.statusShipped;
            case 'delivered':
                return styles.statusDelivered;
            case 'cancelled':
                return styles.statusCancelled;
            default:
                return styles.statusDefault;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return t('checkout.orders.status.pending');
            case 'processing':
                return t('checkout.orders.status.processing');
            case 'shipped':
                return t('checkout.orders.status.shipped');
            case 'delivered':
                return t('checkout.orders.status.delivered');
            case 'cancelled':
                return t('checkout.orders.status.cancelled');
            default:
                return status;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleContactBusiness = (order) => {
        // Create WhatsApp message with order details
        const orderNumber = order.order_number;
        const total = formatPrice(convertedAmounts[order.id] || order.total_amount);
        const message = t('contact.messages.orderInquiry', {
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

    if (!authService.isUserAuthenticated()) {
        return null;
    }

    if (showOrderDetail && selectedOrder) {
        return (
            <motion.div
                className={styles.ordersContainer}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className={styles.ordersModal}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={styles.header}>
                        <button onClick={handleBackToOrders} className={styles.backButton}>
                            ← Back to Orders
                        </button>
                        <h2>{t('checkout.orders.orderDetails')}</h2>
                        <button onClick={onClose} className={styles.closeButton}>
                            ×
                        </button>
                    </div>

                    <div className={styles.orderDetail}>
                        <motion.div
                            className={styles.orderHeader}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className={styles.orderInfo}>
                                <h3>#{selectedOrder.order_number}</h3>
                                <span className={`${styles.status} ${getStatusColor(selectedOrder.status)}`}>
                                    {getStatusText(selectedOrder.status)}
                                </span>
                            </div>
                            <div className={styles.orderDate}>
                                {formatDate(selectedOrder.created_at)}
                            </div>
                        </motion.div>

                        <motion.div
                            className={styles.orderSections}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className={styles.section}>
                                <h4>{t('checkout.orders.shippingAddress')}</h4>
                                {selectedOrder.shipping_address && (
                                    <div className={styles.address}>
                                        <p>{selectedOrder.shipping_address.name}</p>
                                        <p>{selectedOrder.shipping_address.line1}</p>
                                        {selectedOrder.shipping_address.line2 && (
                                            <p>{selectedOrder.shipping_address.line2}</p>
                                        )}
                                        <p>
                                            {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}
                                        </p>
                                        <p>{selectedOrder.shipping_address.country}</p>
                                    </div>
                                )}
                            </div>

                            <div className={styles.section}>
                                <h4>{t('checkout.orders.items')}</h4>
                                <div className={styles.itemsList}>
                                    {selectedOrder.items?.map((item, index) => (
                                        <motion.div
                                            key={index}
                                            className={styles.orderItem}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.1 * index }}
                                        >
                                            <div className={styles.itemImage}>
                                                <img
                                                    src={item.product?.image_url || '/placeholder-image.jpg'}
                                                    alt={item.product?.name || 'Product'}
                                                />
                                            </div>
                                            <div className={styles.itemDetails}>
                                                <h5>{item.product?.name || 'Product'}</h5>
                                                <p>{t('checkout.orders.quantity')}: {item.quantity}</p>
                                                <p>{t('checkout.orders.price')}: {formatPrice(item.product?.price || 0)}</p>
                                            </div>
                                            <div className={styles.itemTotal}>
                                                {formatPrice((item.product?.price || 0) * item.quantity)}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.section}>
                                <h4>{t('checkout.orders.summary')}</h4>
                                <div className={styles.summary}>
                                    <div className={styles.summaryRow}>
                                        <span>{t('checkout.orders.subtotal')}</span>
                                        <span>{formatPrice(selectedOrder.subtotal || 0)}</span>
                                    </div>
                                    {selectedOrder.discount_amount > 0 && (
                                        <div className={styles.summaryRow}>
                                            <span>{t('checkout.orders.discount')}</span>
                                            <span>-{formatPrice(selectedOrder.discount_amount)}</span>
                                        </div>
                                    )}
                                    <div className={styles.summaryRow}>
                                        <span>{t('checkout.orders.shipping')}</span>
                                        <span>{formatPrice(selectedOrder.shipping_amount || 0)}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <span>{t('checkout.orders.tax')}</span>
                                        <span>{formatPrice(selectedOrder.tax_amount || 0)}</span>
                                    </div>
                                    <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                                        <span>{t('checkout.orders.total')}</span>
                                        <span>{formatPrice(selectedOrder.total_amount || 0)}</span>
                                    </div>
                                </div>
                            </div>

                            {selectedOrder.tracking_number && (
                                <div className={styles.section}>
                                    <h4>{t('checkout.orders.tracking')}</h4>
                                    <div className={styles.tracking}>
                                        <p><strong>{t('checkout.orders.trackingNumber')}:</strong> {selectedOrder.tracking_number}</p>
                                        {selectedOrder.tracking_url && (
                                            <a
                                                href={selectedOrder.tracking_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.trackingLink}
                                            >
                                                {t('checkout.orders.trackPackage')}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className={styles.section}>
                                <h4>{t('checkout.orders.contactStore')}</h4>
                                <p>{t('checkout.orders.contactStoreMessage')}</p>

                                <div className={styles.contactButtons}>
                                    <button
                                        onClick={() => handleContactBusiness(selectedOrder)}
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
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className={styles.ordersContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className={styles.ordersModal}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <div className={styles.headerSpacer}></div>
                    <h2>{t('checkout.orders.title')}</h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        ×
                    </button>
                </div>

                {loading ? (
                    <motion.div
                        className={styles.loading}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className={styles.loadingSpinner}>
                            <div className={styles.spinner}></div>
                        </div>
                        <p>{t('checkout.orders.loading')}</p>
                    </motion.div>
                ) : error ? (
                    <motion.div
                        className={styles.error}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <p>{error}</p>
                        <button onClick={loadOrders} className={styles.retryButton}>
                            {t('checkout.orders.retry')}
                        </button>
                    </motion.div>
                ) : orders.length === 0 ? (
                    <motion.div
                        className={styles.empty}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className={styles.emptyIcon}>📦</div>
                        <p>{t('checkout.orders.noOrders')}</p>
                        <button onClick={() => navigate('/browse')} className={styles.browseButton}>
                            {t('checkout.orders.startShopping')}
                        </button>
                    </motion.div>
                ) : (
                    <>
                        <div className={styles.ordersList}>
                            <AnimatePresence>
                                {orders.map((order, index) => (
                                    <motion.div
                                        key={order.id}
                                        className={styles.orderCard}
                                        onClick={() => handleOrderClick(order.id)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{
                                            scale: 1.02,
                                            y: -4
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className={styles.orderHeader}>
                                            <div className={styles.orderInfo}>
                                                <h3>#{order.order_number}</h3>
                                                <span className={`${styles.status} ${getStatusColor(order.status)}`}>
                                                    {getStatusText(order.status)}
                                                </span>
                                            </div>
                                            <div className={styles.orderDate}>
                                                {formatDate(order.created_at)}
                                            </div>
                                        </div>

                                        <div className={styles.orderDetails}>
                                            <div className={styles.orderSummary}>
                                                <p>{t('checkout.orders.items')}: {order.total_items || 0}</p>
                                                <p>{t('checkout.orders.total')}: {formatPrice(convertedAmounts[order.id] || order.total_amount || 0)}</p>
                                            </div>
                                        </div>

                                        <div className={styles.orderActions}>
                                            <span className={styles.viewDetails}>{t('checkout.orders.viewDetails')}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {totalPages > 1 && (
                            <motion.div
                                className={styles.pagination}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <button
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={styles.paginationButton}
                                >
                                    {t('checkout.orders.previous')}
                                </button>

                                <span className={styles.pageInfo}>
                                    {t('checkout.orders.page')} {currentPage} {t('checkout.orders.of')} {totalPages}
                                </span>

                                <button
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={styles.paginationButton}
                                >
                                    {t('checkout.orders.next')}
                                </button>
                            </motion.div>
                        )}
                    </>
                )}

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
                                    <h4>{t('checkout.confirmation.contactBusiness.howWeCanHelpTitle')}</h4>
                                    <ul>
                                        <li>{t('checkout.confirmation.contactBusiness.help1')}</li>
                                        <li>{t('checkout.confirmation.contactBusiness.help2')}</li>
                                        <li>{t('checkout.confirmation.contactBusiness.help3')}</li>
                                        <li>{t('checkout.confirmation.contactBusiness.help4')}</li>
                                        <li>{t('checkout.confirmation.contactBusiness.help5')}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default Orders; 