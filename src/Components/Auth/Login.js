import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import authService from '../../services/authService';
import styles from './Auth.module.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // Get the back URL from localStorage or default to home
    const backUrl = localStorage.getItem('redirectAfterLogin') || '/';

    // Redirect if already authenticated
    useEffect(() => {
        if (authService.isUserAuthenticated()) {
            navigate('/');
        }
    }, [navigate]);

    const handleChange = (e) => {
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

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            await authService.login(formData);

            // Check if there's a redirect URL saved
            const redirectUrl = localStorage.getItem('redirectAfterLogin');
            if (redirectUrl) {
                localStorage.removeItem('redirectAfterLogin');
                navigate(redirectUrl);
            } else {
                navigate('/');
            }
        } catch (error) {
            if (error.response?.data) {
                const serverErrors = error.response.data;

                // Handle different error formats from Django backend
                if (serverErrors.email) {
                    setErrors({ email: serverErrors.email[0] });
                } else if (serverErrors.password) {
                    setErrors({ password: serverErrors.password[0] });
                } else if (serverErrors.non_field_errors) {
                    setErrors({ general: serverErrors.non_field_errors[0] });
                } else if (serverErrors.message) {
                    setErrors({ general: serverErrors.message });
                } else {
                    setErrors({ general: 'Login failed. Please try again.' });
                }
            } else {
                setErrors({ general: 'Network error. Please check your connection.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleBackClick = () => {
        // Remove the redirect URL from localStorage
        localStorage.removeItem('redirectAfterLogin');
        // Navigate back to the previous page
        navigate(backUrl);
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
                    <div className={styles.authHeaderTop}>
                        <motion.button
                            className={styles.backButton}
                            onClick={handleBackClick}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Go back"
                        >
                            ← Back
                        </motion.button>
                    </div>
                    <h2>Welcome Back</h2>
                    <p>Sign in to your Gundam CCS account</p>
                </div>

                {errors.general && (
                    <motion.div
                        className={styles.errorMessage}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                    >
                        {errors.general}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className={styles.authForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={errors.email ? styles.error : ''}
                            placeholder="Enter your email"
                            disabled={loading}
                        />
                        {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password">Password</label>
                        <div className={styles.passwordInput}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={errors.password ? styles.error : ''}
                                placeholder="Enter your password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={togglePasswordVisibility}
                                disabled={loading}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        {errors.password && <span className={styles.errorText}>{errors.password}</span>}
                    </div>

                    <div className={styles.formOptions}>
                        <Link to="/forgot-password" className={styles.forgotPassword}>
                            Forgot Password?
                        </Link>
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
                                Signing In...
                            </div>
                        ) : (
                            'Sign In'
                        )}
                    </motion.button>
                </form>

                <div className={styles.authFooter}>
                    <p>
                        Don't have an account?{' '}
                        <Link to="/register" className={styles.authLink}>
                            Sign up here
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login; 