import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Dialog from '../Dialog/Dialog';
import Price from '../Price/Price';
import { orderAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { describeApiError } from '../../lib/apiError';
import { localeFor } from '../../lib/money';
import styles from './Orders.module.css';

const PAGE_SIZE = 10;
const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const Orders = ({ onClose }) => {
    const { t, i18n } = useTranslation();
    const lang = (i18n.resolvedLanguage || 'es').slice(0, 2);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { formatUsd } = useCurrency();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selected, setSelected] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await orderAPI.getOrders({ page, page_size: PAGE_SIZE });
            setOrders(data.results || []);
            setTotalPages(Math.max(1, Math.ceil((data.count || 0) / PAGE_SIZE)));
        } catch (err) {
            const info = describeApiError(err);
            if (info.key) setError(t(info.key, info.params));
        } finally {
            setLoading(false);
        }
    }, [page, t]);

    useEffect(() => {
        if (!isAuthenticated) { onClose(); navigate('/login'); return; }
        load();
    }, [isAuthenticated, load, navigate, onClose]);

    const openOrder = async (id) => {
        setError('');
        try {
            const { data } = await orderAPI.getOrderDetail(id);
            setSelected(data);
        } catch (err) {
            const info = describeApiError(err);
            setError(t(info.key || 'errors.unknown', info.params));
        }
    };

    const statusText = (status) => (STATUSES.includes(status) ? t(`checkout.orders.status.${status}`) : status);
    const formatDate = (iso) => new Intl.DateTimeFormat(localeFor(lang), { dateStyle: 'long', timeStyle: 'short' }).format(new Date(iso));

    const contactStore = (order) => {
        const message = t('contact.messages.orderInquiry', { orderNumber: order.order_number, total: formatUsd(order.total_amount) });
        window.open(`https://wa.me/584142693743?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
    };

    const Row = ({ label, usd, negative }) => (
        <div className={styles.row}><span>{label}</span><Price usd={String(usd)} size="sm" align="end" negative={negative} /></div>
    );

    let content;
    if (selected) {
        const a = selected.shipping_address;
        content = (
            <div className={styles.detail}>
                <button type="button" className="btn btn-sm" onClick={() => setSelected(null)}>← {t('checkout.orders.title')}</button>
                <header className={styles.detailHead}>
                    <h3>#{selected.order_number}</h3>
                    <span className={styles.status}>{statusText(selected.status)}</span>
                    <time dateTime={selected.created_at}>{formatDate(selected.created_at)}</time>
                </header>

                {a && (
                    <section>
                        <h4>{t('checkout.orders.shippingAddress')}</h4>
                        <p>{a.name}<br />{a.line1}{a.line2 && <><br />{a.line2}</>}<br />{a.city}, {a.state} {a.postal_code}<br />{a.country}</p>
                    </section>
                )}

                <section>
                    <h4>{t('checkout.orders.items')}</h4>
                    <ul className={styles.items}>
                        {(selected.items || []).map((item) => (
                            <li key={item.id} className={styles.item}>
                                <div>
                                    <p className={styles.itemName}>{item.product_name || item.product?.name}</p>
                                    <p className={styles.muted}>{t('checkout.orders.quantity')}: {item.quantity} · {t('checkout.orders.price')}: {formatUsd(item.unit_price)}</p>
                                </div>
                                <Price usd={String(item.total_price)} size="sm" align="end" />
                            </li>
                        ))}
                    </ul>
                </section>

                <section>
                    <h4>{t('checkout.orders.summary')}</h4>
                    <Row label={t('checkout.orders.subtotal')} usd={selected.subtotal || 0} />
                    {Number(selected.discount_amount) > 0 && <Row label={t('checkout.orders.discount')} usd={selected.discount_amount} negative />}
                    <Row label={t('checkout.orders.shipping')} usd={selected.shipping_amount || 0} />
                    <Row label={t('checkout.orders.tax')} usd={selected.tax_amount || 0} />
                    <div className={`${styles.row} ${styles.total}`}><span>{t('checkout.orders.total')}</span><Price usd={String(selected.total_amount || 0)} size="md" align="end" /></div>
                </section>

                {selected.tracking_number && (
                    <section>
                        <h4>{t('checkout.orders.tracking')}</h4>
                        <p>{t('checkout.orders.trackingNumber')}: {selected.tracking_number}</p>
                        {selected.tracking_url && /^https?:\/\//i.test(selected.tracking_url) && (
                            <a href={selected.tracking_url} target="_blank" rel="noopener noreferrer">{t('checkout.orders.trackPackage')}</a>
                        )}
                    </section>
                )}

                <section>
                    <h4>{t('checkout.orders.contactStore')}</h4>
                    <p>{t('checkout.orders.contactStoreMessage')}</p>
                    <button type="button" className="btn btn-primary" onClick={() => contactStore(selected)}>{t('checkout.confirmation.contactBusiness.whatsapp')}</button>
                </section>
            </div>
        );
    } else if (loading) {
        content = <p role="status" className={styles.muted}>{t('checkout.orders.loading')}</p>;
    } else if (error) {
        content = (
            <div role="alert" className={styles.notice}>
                <p>{error}</p>
                <button type="button" className="btn" onClick={load}>{t('checkout.orders.retry')}</button>
            </div>
        );
    } else if (orders.length === 0) {
        content = (
            <div className={styles.notice}>
                <p>{t('checkout.orders.noOrders')}</p>
                <button type="button" className="btn btn-primary" onClick={() => { onClose(); navigate('/browse'); }}>{t('checkout.orders.startShopping')}</button>
            </div>
        );
    } else {
        content = (
            <>
                <ul className={styles.list}>
                    {orders.map((order) => (
                        <li key={order.id}>
                            <button type="button" className={styles.card} onClick={() => openOrder(order.id)}>
                                <span className={styles.cardTop}>
                                    <strong>#{order.order_number}</strong>
                                    <span className={styles.status}>{statusText(order.status)}</span>
                                </span>
                                <span className={styles.muted}>{formatDate(order.created_at)} · {t('checkout.orders.items')}: {order.total_items || 0}</span>
                                <span className={styles.cardTotal}><Price usd={String(order.total_amount || 0)} size="sm" /></span>
                            </button>
                        </li>
                    ))}
                </ul>
                {totalPages > 1 && (
                    <div className={styles.pager}>
                        <button type="button" className="btn btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>{t('checkout.orders.previous')}</button>
                        <span>{t('checkout.orders.page')} {page} {t('checkout.orders.of')} {totalPages}</span>
                        <button type="button" className="btn btn-sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>{t('checkout.orders.next')}</button>
                    </div>
                )}
            </>
        );
    }

    return (
        <Dialog open onClose={onClose} title={selected ? t('checkout.orders.orderDetails') : t('checkout.orders.title')} placement="right">
            {error && selected && <p role="alert" className={styles.notice}>{error}</p>}
            {content}
        </Dialog>
    );
};

export default Orders;
