import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import authService from '../../services/authService';
import styles from './Auth.module.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Email is required');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            await authService.resetPassword(email);
            setMessage('Password reset instructions have been sent to your email address.');
        } catch (error) {
            if (error.response?.data?.email) {
                setError(error.response.data.email[0]);
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError('Failed to send reset email. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <motion.div
                className={styles.authCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className={styles.authHeader}>
                    <h2>Reset Password</h2>
                    <p>Enter your email to receive reset instructions</p>
                </div>

                {message && (
                    <motion.div
                        className={styles.successMessage}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                    >
                        {message}
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        className={styles.errorMessage}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className={styles.authForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                            disabled={loading}
                        />
                    </div>

                    <motion.button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? (
                            <div className={styles.loadingSpinner}>
                                <div className={styles.spinner}></div>
                                Sending...
                            </div>
                        ) : (
                            'Send Reset Email'
                        )}
                    </motion.button>
                </form>

                <div className={styles.authFooter}>
                    <p>
                        Remember your password?{' '}
                        <Link to="/login" className={styles.authLink}>
                            Sign in here
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword; 