import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { pagoMovilAPI } from '../../../services/api';
import styles from './PagoMovilPayment.module.css';

const PagoMovilPayment = ({ total, onBack, onSuccess }) => {
    const { t } = useTranslation();
    const { currency, convertAmount, formatPrice } = useCurrency();

    // State for payment info
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for amounts
    const [usdAmount, setUsdAmount] = useState(total);
    const [vesAmount, setVesAmount] = useState(0);

    // State for verification form
    const [showVerificationForm, setShowVerificationForm] = useState(false);
    const [verificationData, setVerificationData] = useState({
        sender_id_prefix: 'V',
        sender_id_number: '',
        sender_phone: '',
        bank_code: '',
        recipient: '',
        amount_ves: ''
    });
    const [verificationLoading, setVerificationLoading] = useState(false);
    const [verificationError, setVerificationError] = useState(null);
    const [verificationStatus, setVerificationStatus] = useState(null);

    // State for status checking
    const [statusLoading, setStatusLoading] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(null);

    // Load payment info on component mount
    useEffect(() => {
        loadPaymentInfo();
    }, []);

    // Convert USD to VES when payment info loads
    useEffect(() => {
        if (paymentInfo?.current_exchange_rate) {
            const rate = parseFloat(paymentInfo.current_exchange_rate);
            const convertedAmount = usdAmount * rate;
            setVesAmount(convertedAmount);
            setVerificationData(prev => ({
                ...prev,
                amount_ves: convertedAmount.toFixed(2)
            }));
        }
    }, [paymentInfo, usdAmount]);

    const loadPaymentInfo = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await pagoMovilAPI.getPaymentInfo();
            setPaymentInfo(data);

            // Pre-select first recipient if available
            if (data.recipients && data.recipients.length > 0) {
                setVerificationData(prev => ({
                    ...prev,
                    recipient: data.recipients[0].id.toString()
                }));
            }
        } catch (err) {
            console.error('Error loading payment info:', err);
            setError(t('checkout.pagoMovil.errors.loadInfoFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleVerificationSubmit = async (e) => {
        e.preventDefault();

        try {
            setVerificationLoading(true);
            setVerificationError(null);

            // Combine ID prefix and number
            const fullSenderId = `${verificationData.sender_id_prefix}-${verificationData.sender_id_number}`;

            const submitData = {
                sender_id: fullSenderId,
                sender_phone: verificationData.sender_phone,
                bank_code: parseInt(verificationData.bank_code),
                recipient: parseInt(verificationData.recipient),
                amount_ves: parseFloat(verificationData.amount_ves).toFixed(2)
            };

            const response = await pagoMovilAPI.submitVerification(submitData);
            setVerificationStatus(response);
            setShowVerificationForm(false);

            // Start checking status
            checkVerificationStatus();
        } catch (err) {
            console.error('Error submitting verification:', err);
            if (err.response?.data) {
                setVerificationError(err.response.data);
            } else {
                setVerificationError({ general: [t('checkout.pagoMovil.errors.submitFailed')] });
            }
        } finally {
            setVerificationLoading(false);
        }
    };

    const checkVerificationStatus = async () => {
        try {
            setStatusLoading(true);
            const status = await pagoMovilAPI.checkStatus();
            setCurrentStatus(status);

            if (status.status === 'approved') {
                onSuccess();
            }
        } catch (err) {
            console.error('Error checking status:', err);
        } finally {
            setStatusLoading(false);
        }
    };

    const formatPhoneNumber = (phone) => {
        // Format phone number for display (0412-123-4567)
        if (phone.length === 11) {
            return `${phone.slice(0, 4)}-${phone.slice(4, 7)}-${phone.slice(7)}`;
        }
        return phone;
    };

    const getSelectedRecipient = () => {
        if (!paymentInfo?.recipients || !verificationData.recipient) return null;
        return paymentInfo.recipients.find(r => r.id.toString() === verificationData.recipient);
    };

    const getSelectedBank = () => {
        if (!paymentInfo?.bank_codes || !verificationData.bank_code) return null;
        return paymentInfo.bank_codes.find(b => b.id.toString() === verificationData.bank_code);
    };

    if (loading) {
        return (
            <div className={styles.pagoMovilPayment}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>{t('checkout.pagoMovil.loading')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.pagoMovilPayment}>
                <div className={styles.error}>
                    <h3>{t('checkout.pagoMovil.error')}</h3>
                    <p>{error}</p>
                    <button onClick={loadPaymentInfo} className={styles.retryBtn}>
                        {t('checkout.pagoMovil.retry')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pagoMovilPayment}>
            <div className={styles.section}>
                <h2>{t('checkout.pagoMovil.title')}</h2>
                <p className={styles.description}>{t('checkout.pagoMovil.description')}</p>
            </div>

            {/* Payment Amount */}
            <div className={styles.section}>
                <div className={styles.amountDisplay}>
                    <div className={styles.conversion}>
                        <span className={styles.usdAmount}>USD: {formatPrice(usdAmount, 'USD')}</span>
                        <span className={styles.arrow}>→</span>
                        <span className={styles.vesAmount}>VES: Bs. {vesAmount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className={styles.rate}>
                        {t('checkout.pagoMovil.exchangeRate')}: 1 USD = {paymentInfo?.current_exchange_rate} VES
                    </div>
                </div>
            </div>

            {/* Recipient Information */}
            {paymentInfo?.recipients && paymentInfo.recipients.length > 0 && (
                <div className={styles.section}>
                    <h3>{t('checkout.pagoMovil.recipientInfo')}</h3>
                    {paymentInfo.recipients.map(recipient => (
                        <div key={recipient.id} className={styles.recipientCard}>
                            <div className={styles.recipientDetails}>
                                <h4>{recipient.recipient_name}</h4>
                                <p><strong>{t('checkout.pagoMovil.recipientId')}:</strong> {recipient.recipient_id}</p>
                                <p><strong>{t('checkout.pagoMovil.phone')}:</strong> {formatPhoneNumber(recipient.recipient_phone)}</p>
                                <p><strong>{t('checkout.pagoMovil.bank')}:</strong> {
                                    paymentInfo.bank_codes.find(b => b.id === recipient.bank_code)?.bank_name
                                } ({paymentInfo.bank_codes.find(b => b.id === recipient.bank_code)?.bank_code})</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Instructions */}
            {paymentInfo?.instructions && (
                <div className={styles.section}>
                    <h3>{t('checkout.pagoMovil.instructions')}</h3>
                    <div className={styles.instructionsBox}>
                        <pre className={styles.instructionsText}>{paymentInfo.instructions}</pre>
                    </div>
                </div>
            )}

            {/* Current Status Display */}
            {currentStatus && (
                <div className={styles.section}>
                    <h3>{t('checkout.pagoMovil.currentStatus')}</h3>
                    <div className={`${styles.statusCard} ${styles[currentStatus.status]}`}>
                        <div className={styles.statusIcon}>
                            {currentStatus.status === 'approved' && '✅'}
                            {currentStatus.status === 'rejected' && '❌'}
                            {currentStatus.status === 'pending' && '⏳'}
                        </div>
                        <div className={styles.statusInfo}>
                            <h4>{t(`checkout.pagoMovil.status.${currentStatus.status}`)}</h4>
                            {currentStatus.notes && <p>{currentStatus.notes}</p>}
                            {currentStatus.formatted_amount && (
                                <p>{t('checkout.pagoMovil.amount')}: {currentStatus.formatted_amount}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className={styles.actions}>
                <button onClick={onBack} className={styles.backBtn}>
                    {t('checkout.pagoMovil.back')}
                </button>

                {!showVerificationForm && !currentStatus && (
                    <button
                        onClick={() => setShowVerificationForm(true)}
                        className={styles.verifyBtn}
                    >
                        {t('checkout.pagoMovil.submitVerification')}
                    </button>
                )}

                {currentStatus && currentStatus.status === 'pending' && (
                    <button
                        onClick={checkVerificationStatus}
                        className={styles.checkStatusBtn}
                        disabled={statusLoading}
                    >
                        {statusLoading ? t('checkout.pagoMovil.checking') : t('checkout.pagoMovil.checkStatus')}
                    </button>
                )}
            </div>

            {/* Verification Form Modal */}
            {showVerificationForm && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>{t('checkout.pagoMovil.verificationForm')}</h3>
                            <button
                                onClick={() => setShowVerificationForm(false)}
                                className={styles.closeBtn}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleVerificationSubmit} className={styles.verificationForm}>
                            {verificationError && (
                                <div className={styles.formErrors}>
                                    {Object.entries(verificationError).map(([field, errors]) => (
                                        <div key={field} className={styles.fieldError}>
                                            <strong>{field}:</strong> {Array.isArray(errors) ? errors.join(', ') : errors}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className={styles.formGrid}>
                                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                    <label>{t('checkout.pagoMovil.form.senderId')}</label>
                                    <div className={styles.idInputGroup}>
                                        <select
                                            value={verificationData.sender_id_prefix}
                                            onChange={(e) => setVerificationData(prev => ({ ...prev, sender_id_prefix: e.target.value }))}
                                            className={styles.idPrefix}
                                            required
                                        >
                                            <option value="V">V-</option>
                                            <option value="J">J-</option>
                                            <option value="E">E-</option>
                                            <option value="P">P-</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={verificationData.sender_id_number}
                                            onChange={(e) => setVerificationData(prev => ({ ...prev, sender_id_number: e.target.value }))}
                                            placeholder="12345678"
                                            className={styles.idNumber}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>{t('checkout.pagoMovil.form.senderPhone')}</label>
                                    <input
                                        type="text"
                                        value={verificationData.sender_phone}
                                        onChange={(e) => setVerificationData(prev => ({ ...prev, sender_phone: e.target.value }))}
                                        placeholder="04121234567"
                                        className={styles.fullWidthInput}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>{t('checkout.pagoMovil.form.bank')}</label>
                                    <select
                                        value={verificationData.bank_code}
                                        onChange={(e) => setVerificationData(prev => ({ ...prev, bank_code: e.target.value }))}
                                        className={styles.fullWidthSelect}
                                        required
                                    >
                                        <option value="" disabled>{t('checkout.pagoMovil.form.selectBank')}</option>
                                        {paymentInfo?.bank_codes?.map(bank => (
                                            <option key={bank.id} value={bank.id}>
                                                {bank.bank_name} ({bank.bank_code})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>{t('checkout.pagoMovil.form.recipient')}</label>
                                    <select
                                        value={verificationData.recipient}
                                        onChange={(e) => setVerificationData(prev => ({ ...prev, recipient: e.target.value }))}
                                        className={styles.fullWidthSelect}
                                        required
                                    >
                                        <option value="" disabled>{t('checkout.pagoMovil.form.selectRecipient')}</option>
                                        {paymentInfo?.recipients?.map(recipient => (
                                            <option key={recipient.id} value={recipient.id}>
                                                {recipient.recipient_name} ({recipient.recipient_id})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>{t('checkout.pagoMovil.form.amountVes')}</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={verificationData.amount_ves}
                                        onChange={(e) => setVerificationData(prev => ({ ...prev, amount_ves: e.target.value }))}
                                        className={styles.fullWidthInput}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    onClick={() => setShowVerificationForm(false)}
                                    className={styles.cancelBtn}
                                >
                                    {t('checkout.pagoMovil.form.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className={styles.submitBtn}
                                    disabled={verificationLoading}
                                >
                                    {verificationLoading ? t('checkout.pagoMovil.form.submitting') : t('checkout.pagoMovil.form.submit')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PagoMovilPayment; 