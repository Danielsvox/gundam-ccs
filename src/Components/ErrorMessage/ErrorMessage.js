import React from 'react';
import styles from './ErrorMessage.module.css';

const ErrorMessage = ({ message = "Something went wrong", onRetry }) => {
    return (
        <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <h3 className={styles.errorTitle}>Oops!</h3>
            <p className={styles.errorMessage}>{message}</p>
            {onRetry && (
                <button className={styles.retryButton} onClick={onRetry}>
                    Try Again
                </button>
            )}
        </div>
    );
};

export default ErrorMessage; 