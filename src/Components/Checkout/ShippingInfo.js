import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './ShippingInfo.module.css';

const ShippingInfo = ({ data, onSubmit, onBack }) => {
    const { t } = useTranslation();

    const [formData, setFormData] = useState(data);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = t('checkout.shipping.errors.firstNameRequired');
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = t('checkout.shipping.errors.lastNameRequired');
        }

        if (!formData.email.trim()) {
            newErrors.email = t('checkout.shipping.errors.emailRequired');
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = t('checkout.shipping.errors.emailInvalid');
        }

        if (!formData.phone.trim()) {
            newErrors.phone = t('checkout.shipping.errors.phoneRequired');
        }

        if (!formData.address.trim()) {
            newErrors.address = t('checkout.shipping.errors.addressRequired');
        }

        if (!formData.city.trim()) {
            newErrors.city = t('checkout.shipping.errors.cityRequired');
        }

        if (!formData.state.trim()) {
            newErrors.state = t('checkout.shipping.errors.stateRequired');
        }

        if (!formData.postalCode.trim()) {
            newErrors.postalCode = t('checkout.shipping.errors.postalCodeRequired');
        }

        if (!formData.country.trim()) {
            newErrors.country = t('checkout.shipping.errors.countryRequired');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return (
        <div className={styles.shippingInfo}>
            <div className={styles.section}>
                <h2>{t('checkout.shipping.title')}</h2>
                <p className={styles.description}>{t('checkout.shipping.description')}</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.section}>
                    <h3>{t('checkout.shipping.personalInfo')}</h3>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="firstName">{t('checkout.shipping.firstName')} *</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className={errors.firstName ? styles.error : ''}
                                placeholder={t('checkout.shipping.firstNamePlaceholder')}
                            />
                            {errors.firstName && <span className={styles.errorText}>{errors.firstName}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="lastName">{t('checkout.shipping.lastName')} *</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className={errors.lastName ? styles.error : ''}
                                placeholder={t('checkout.shipping.lastNamePlaceholder')}
                            />
                            {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">{t('checkout.shipping.email')} *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={errors.email ? styles.error : ''}
                                placeholder={t('checkout.shipping.emailPlaceholder')}
                            />
                            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="phone">{t('checkout.shipping.phone')} *</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className={errors.phone ? styles.error : ''}
                                placeholder={t('checkout.shipping.phonePlaceholder')}
                            />
                            {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h3>{t('checkout.shipping.addressInfo')}</h3>

                    <div className={styles.formGroup}>
                        <label htmlFor="address">{t('checkout.shipping.address')} *</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className={errors.address ? styles.error : ''}
                            placeholder={t('checkout.shipping.addressPlaceholder')}
                        />
                        {errors.address && <span className={styles.errorText}>{errors.address}</span>}
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="city">{t('checkout.shipping.city')} *</label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                className={errors.city ? styles.error : ''}
                                placeholder={t('checkout.shipping.cityPlaceholder')}
                            />
                            {errors.city && <span className={styles.errorText}>{errors.city}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="state">{t('checkout.shipping.state')} *</label>
                            <input
                                type="text"
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                className={errors.state ? styles.error : ''}
                                placeholder={t('checkout.shipping.statePlaceholder')}
                            />
                            {errors.state && <span className={styles.errorText}>{errors.state}</span>}
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="postalCode">{t('checkout.shipping.postalCode')} *</label>
                            <input
                                type="text"
                                id="postalCode"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleInputChange}
                                className={errors.postalCode ? styles.error : ''}
                                placeholder={t('checkout.shipping.postalCodePlaceholder')}
                            />
                            {errors.postalCode && <span className={styles.errorText}>{errors.postalCode}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="country">{t('checkout.shipping.country')} *</label>
                            <input
                                type="text"
                                id="country"
                                name="country"
                                value={formData.country}
                                onChange={handleInputChange}
                                className={errors.country ? styles.error : ''}
                                placeholder={t('checkout.shipping.countryPlaceholder')}
                            />
                            {errors.country && <span className={styles.errorText}>{errors.country}</span>}
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button type="button" onClick={onBack} className={styles.backBtn}>
                        {t('checkout.shipping.back')}
                    </button>
                    <button type="submit" className={styles.nextBtn}>
                        {t('checkout.shipping.continue')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ShippingInfo; 