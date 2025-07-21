import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import authService from '../../services/authService';
import styles from './Auth.module.css';
import LogoutModal from './LogoutModal';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        }
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();

    // Load user profile on component mount
    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const userData = await authService.getProfile();
            setUser(userData);
            setFormData({
                firstName: userData.first_name || '',
                lastName: userData.last_name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                address: {
                    street: userData.address?.street || '',
                    city: userData.address?.city || '',
                    state: userData.address?.state || '',
                    zipCode: userData.address?.zip_code || '',
                    country: userData.address?.country || ''
                }
            });
        } catch (error) {
            console.error('Error loading profile:', error);
            if (error.response?.status === 401) {
                // Save current location before redirecting to login
                localStorage.setItem('redirectAfterLogin', window.location.pathname);
                navigate('/login');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

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
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
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
        setMessage('');

        try {
            const updateData = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address
            };

            const updatedUser = await authService.updateProfile(updateData);
            setUser(updatedUser);
            setIsEditing(false);
            setMessage('Profile updated successfully!');

            // Clear success message after 3 seconds
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            if (error.response?.data) {
                const serverErrors = error.response.data;

                if (serverErrors.email) {
                    setErrors({ email: serverErrors.email[0] });
                } else if (serverErrors.first_name) {
                    setErrors({ firstName: serverErrors.first_name[0] });
                } else if (serverErrors.last_name) {
                    setErrors({ lastName: serverErrors.last_name[0] });
                } else if (serverErrors.message) {
                    setErrors({ general: serverErrors.message });
                } else {
                    setErrors({ general: 'Failed to update profile. Please try again.' });
                }
            } else {
                setErrors({ general: 'Network error. Please check your connection.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleLogoutSuccess = () => {
        setShowLogoutModal(false);
        navigate('/');
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
        setErrors({});
        setMessage('');
    };

    if (!user) {
        return (
            <div className={styles.authContainer}>
                <div className={styles.loadingSpinner}>
                    <div className={styles.spinner}></div>
                    Loading profile...
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={styles.authContainer}>
                <motion.div
                    className={styles.authCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className={styles.authHeader}>
                        <h2>User Profile</h2>
                        <p>Manage your account information</p>
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
                                    disabled={!isEditing || loading}
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
                                    disabled={!isEditing || loading}
                                />
                                {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
                            </div>
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
                                disabled={!isEditing || loading}
                            />
                            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="phone">Phone</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={!isEditing || loading}
                                placeholder="Enter your phone number"
                            />
                        </div>

                        <div className={styles.addressSection}>
                            <h3>Address Information</h3>

                            <div className={styles.formGroup}>
                                <label htmlFor="street">Street Address</label>
                                <input
                                    type="text"
                                    id="street"
                                    name="address.street"
                                    value={formData.address.street}
                                    onChange={handleChange}
                                    disabled={!isEditing || loading}
                                    placeholder="Enter street address"
                                />
                            </div>

                            <div className={styles.addressRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="city">City</label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="address.city"
                                        value={formData.address.city}
                                        onChange={handleChange}
                                        disabled={!isEditing || loading}
                                        placeholder="City"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="state">State</label>
                                    <input
                                        type="text"
                                        id="state"
                                        name="address.state"
                                        value={formData.address.state}
                                        onChange={handleChange}
                                        disabled={!isEditing || loading}
                                        placeholder="State"
                                    />
                                </div>
                            </div>

                            <div className={styles.addressRow}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="zipCode">ZIP Code</label>
                                    <input
                                        type="text"
                                        id="zipCode"
                                        name="address.zipCode"
                                        value={formData.address.zipCode}
                                        onChange={handleChange}
                                        disabled={!isEditing || loading}
                                        placeholder="ZIP Code"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="country">Country</label>
                                    <input
                                        type="text"
                                        id="country"
                                        name="address.country"
                                        value={formData.address.country}
                                        onChange={handleChange}
                                        disabled={!isEditing || loading}
                                        placeholder="Country"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={styles.profileActions}>
                            {isEditing ? (
                                <>
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
                                                Saving...
                                            </div>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </motion.button>
                                    <button
                                        type="button"
                                        className={styles.cancelButton}
                                        onClick={toggleEdit}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    className={styles.editButton}
                                    onClick={toggleEdit}
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </form>

                    <div className={styles.authFooter}>
                        <button
                            onClick={handleLogoutClick}
                            className={styles.logoutButton}
                        >
                            Sign Out
                        </button>
                    </div>
                </motion.div>
            </div>

            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onLogoutSuccess={handleLogoutSuccess}
            />
        </>
    );
};

export default UserProfile; 