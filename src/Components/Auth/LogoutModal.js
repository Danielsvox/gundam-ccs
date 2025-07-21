import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import styles from './Auth.module.css';

const LogoutModal = ({ isOpen, onClose, onLogoutSuccess }) => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutType, setLogoutType] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogout = async (type) => {
        setIsLoggingOut(true);
        setLogoutType(type);
        setError('');

        try {
            if (type === 'all') {
                await authService.logoutAllDevices();
            } else {
                await authService.logout();
            }

            // Show success feedback
            setTimeout(() => {
                onLogoutSuccess?.();
                navigate('/');
            }, 1000);

        } catch (error) {
            console.error('Logout error:', error);
            setError('Logout failed. Please try again.');

            // Force logout even if API call fails
            setTimeout(() => {
                authService.clearLocalStorage();
                onLogoutSuccess?.();
                navigate('/');
            }, 2000);
        } finally {
            setIsLoggingOut(false);
            setLogoutType(null);
        }
    };

    const handleClose = () => {
        if (!isLoggingOut) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className={styles.modalOverlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
            >
                <motion.div
                    className={styles.logoutModal}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={styles.logoutHeader}>
                        <h3>Sign Out</h3>
                        <p>Choose how you want to sign out</p>
                    </div>

                    {error && (
                        <motion.div
                            className={styles.errorMessage}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <div className={styles.logoutOptions}>
                        <motion.button
                            className={`${styles.logoutOption} ${logoutType === 'current' ? styles.logoutOptionActive : ''}`}
                            onClick={() => handleLogout('current')}
                            disabled={isLoggingOut}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className={styles.logoutOptionIcon}>📱</div>
                            <div className={styles.logoutOptionContent}>
                                <h4>Sign out from this device</h4>
                                <p>You'll stay signed in on other devices</p>
                            </div>
                            {isLoggingOut && logoutType === 'current' && (
                                <div className={styles.logoutSpinner}>
                                    <div className={styles.spinner}></div>
                                </div>
                            )}
                        </motion.button>

                        <motion.button
                            className={`${styles.logoutOption} ${logoutType === 'all' ? styles.logoutOptionActive : ''}`}
                            onClick={() => handleLogout('all')}
                            disabled={isLoggingOut}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className={styles.logoutOptionIcon}>🌐</div>
                            <div className={styles.logoutOptionContent}>
                                <h4>Sign out from all devices</h4>
                                <p>You'll be signed out everywhere</p>
                            </div>
                            {isLoggingOut && logoutType === 'all' && (
                                <div className={styles.logoutSpinner}>
                                    <div className={styles.spinner}></div>
                                </div>
                            )}
                        </motion.button>
                    </div>

                    <div className={styles.logoutActions}>
                        <motion.button
                            className={styles.cancelButton}
                            onClick={handleClose}
                            disabled={isLoggingOut}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Cancel
                        </motion.button>
                    </div>

                    {isLoggingOut && (
                        <motion.div
                            className={styles.logoutFeedback}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className={styles.logoutFeedbackIcon}>
                                {logoutType === 'all' ? '🌐' : '📱'}
                            </div>
                            <p>
                                {logoutType === 'all'
                                    ? 'Signing out from all devices...'
                                    : 'Signing out from this device...'
                                }
                            </p>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LogoutModal; 