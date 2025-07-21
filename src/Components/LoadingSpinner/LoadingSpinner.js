import React from 'react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ message = "Loading products..." }) => {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>{message}</p>
        </div>
    );
};

export default LoadingSpinner; 