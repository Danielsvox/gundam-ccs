import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import authService from '../../services/authService';
import styles from './Auth.module.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        agreeToTerms: false
    });
    const [passwordsMatch, setPasswordsMatch] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
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
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Check password matching in real-time
        if (name === 'password' || name === 'confirmPassword') {
            const currentPassword = name === 'password' ? value : formData.password;
            const currentConfirmPassword = name === 'confirmPassword' ? value : formData.confirmPassword;

            if (currentPassword && currentConfirmPassword) {
                setPasswordsMatch(currentPassword === currentConfirmPassword);
            } else {
                setPasswordsMatch(false);
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Username validation
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.trim().length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = 'Username can only contain letters, numbers, and underscores';
        }

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        // First name validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        } else if (formData.firstName.trim().length < 2) {
            newErrors.firstName = 'First name must be at least 2 characters';
        }

        // Last name validation
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (formData.lastName.trim().length < 2) {
            newErrors.lastName = 'Last name must be at least 2 characters';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (!passwordsMatch) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Terms agreement validation
        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree to the terms and conditions';
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
            const userData = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                first_name: formData.firstName,
                last_name: formData.lastName
            };

            await authService.register(userData);
            setSuccessMessage('Account created successfully! Please check your email for verification.');

            // Redirect after a short delay to show the success message
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error) {
            if (error.response?.data) {
                const serverErrors = error.response.data;

                // Handle different error formats from Django backend
                if (serverErrors.username) {
                    setErrors({ username: serverErrors.username[0] });
                } else if (serverErrors.email) {
                    setErrors({ email: serverErrors.email[0] });
                } else if (serverErrors.password) {
                    setErrors({ password: serverErrors.password[0] });
                } else if (serverErrors.first_name) {
                    setErrors({ firstName: serverErrors.first_name[0] });
                } else if (serverErrors.last_name) {
                    setErrors({ lastName: serverErrors.last_name[0] });
                } else if (serverErrors.non_field_errors) {
                    setErrors({ general: serverErrors.non_field_errors[0] });
                } else if (serverErrors.message) {
                    setErrors({ general: serverErrors.message });
                } else {
                    setErrors({ general: 'Registration failed. Please try again.' });
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

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleBackClick = () => {
        // Remove the redirect URL from localStorage
        localStorage.removeItem('redirectAfterLogin');
        // Navigate back to the previous page
        navigate(backUrl);
    };

    // Check if form is valid for submission
    const isFormValid = () => {
        return (
            formData.username.trim() &&
            formData.email &&
            formData.password &&
            formData.confirmPassword &&
            formData.firstName.trim() &&
            formData.lastName.trim() &&
            formData.agreeToTerms &&
            passwordsMatch &&
            Object.keys(errors).length === 0
        );
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
                    <h2>Create Account</h2>
                    <p>Join the Gundam CCS community</p>
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

                {successMessage && (
                    <motion.div
                        className={styles.successMessage}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                    >
                        {successMessage}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className={styles.authForm}>
                    <div className={styles.nameRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="firstName">First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={errors.firstName ? styles.error : ''}
                                placeholder="Enter your first name"
                                disabled={loading}
                            />
                            {errors.firstName && <span className={styles.errorText}>{errors.firstName}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={errors.lastName ? styles.error : ''}
                                placeholder="Enter your last name"
                                disabled={loading}
                            />
                            {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={errors.username ? styles.error : ''}
                            placeholder="Choose a username"
                            disabled={loading}
                        />
                        {errors.username && <span className={styles.errorText}>{errors.username}</span>}
                    </div>

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
                                placeholder="Create a strong password"
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

                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className={styles.passwordInput}>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`${errors.confirmPassword ? styles.error : ''} ${formData.confirmPassword && passwordsMatch ? styles.success : ''}`}
                                placeholder="Confirm your password"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={toggleConfirmPasswordVisibility}
                                disabled={loading}
                            >
                                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
                        {formData.confirmPassword && !errors.confirmPassword && (
                            <span className={`${styles.passwordMatch} ${passwordsMatch ? styles.match : styles.noMatch}`}>
                                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                            </span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="agreeToTerms"
                                checked={formData.agreeToTerms}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            <span className={styles.checkboxText}>
                                I agree to the{' '}
                                <Link to="/terms" className={styles.authLink}>
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link to="/privacy" className={styles.authLink}>
                                    Privacy Policy
                                </Link>
                            </span>
                        </label>
                        {errors.agreeToTerms && <span className={styles.errorText}>{errors.agreeToTerms}</span>}
                    </div>

                    <motion.button
                        type="submit"
                        className={`${styles.submitButton} ${!isFormValid() ? styles.disabled : ''}`}
                        disabled={loading || !isFormValid()}
                        whileHover={isFormValid() ? { scale: 1.02 } : {}}
                        whileTap={isFormValid() ? { scale: 0.98 } : {}}
                    >
                        {loading ? (
                            <div className={styles.loadingSpinner}>
                                <div className={styles.spinner}></div>
                                Creating Account...
                            </div>
                        ) : (
                            'Create Account'
                        )}
                    </motion.button>
                </form>

                <div className={styles.authFooter}>
                    <p>
                        Already have an account?{' '}
                        <Link to="/login" className={styles.authLink}>
                            Sign in here
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register; 