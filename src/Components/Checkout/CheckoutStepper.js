import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './CheckoutStepper.module.css';

const CheckoutStepper = ({ currentStep }) => {
    const { t } = useTranslation();

    const steps = [
        { id: 1, label: t('checkout.steps.cartReview'), icon: '🛒' },
        { id: 2, label: t('checkout.steps.shipping'), icon: '📍' },
        { id: 3, label: t('checkout.steps.shippingMethod'), icon: '🚚' },
        { id: 4, label: t('checkout.steps.payment'), icon: '💳' },
        { id: 5, label: t('checkout.steps.confirmation'), icon: '✅' }
    ];

    return (
        <div className={styles.stepperContainer}>
            <div className={styles.stepper}>
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        <div className={styles.stepItem}>
                            <div className={`${styles.stepCircle} ${currentStep >= step.id ? styles.active : ''}`}>
                                {currentStep > step.id ? (
                                    <span className={styles.checkmark}>✓</span>
                                ) : (
                                    <span className={styles.stepNumber}>{step.id}</span>
                                )}
                            </div>
                            <span className={`${styles.stepLabel} ${currentStep >= step.id ? styles.active : ''}`}>
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`${styles.stepLine} ${currentStep > step.id ? styles.active : ''}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default CheckoutStepper; 