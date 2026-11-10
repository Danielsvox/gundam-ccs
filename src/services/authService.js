import { authAPI } from './api';

class AuthService {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
        this.loading = false;
        this.error = null;


        // Load user from localStorage on initialization
        this.loadUserFromStorage();

        // The API layer clears the stored session on a 401 for an authenticated request and
        // announces it; keep this service's in-memory state in sync.
        if (typeof window !== 'undefined') {
            window.addEventListener('auth:expired', () => {
                this.user = null;
                this.isAuthenticated = false;
                this.emitChange();
            });
            // Other tabs signing in/out
            window.addEventListener('storage', (event) => {
                if (event.key === 'accessToken' || event.key === 'user' || event.key === null) {
                    this.user = null;
                    this.isAuthenticated = false;
                    this.loadUserFromStorage();
                    this.emitChange();
                }
            });
        }
    }

    emitChange() {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:changed'));
        }
    }

    // Load user data from localStorage
    loadUserFromStorage() {
        try {
            const userData = localStorage.getItem('user');
            const accessToken = localStorage.getItem('accessToken');


            if (userData && accessToken) {
                this.user = JSON.parse(userData);
                this.isAuthenticated = true;
            } else {
            }
        } catch (error) {
            console.error('Error loading user from storage:', error);
            this.clearAuth();
        }
    }

    // Save user data to localStorage
    saveUserToStorage(user, accessToken, refreshToken) {
        try {

            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('accessToken', accessToken);
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }
            this.emitChange();
        } catch (error) {
            console.error('Error saving user to storage:', error);
        }
    }

    // Clear authentication data
    clearAuth() {
        this.user = null;
        this.isAuthenticated = false;
        this.loading = false;
        this.error = null;

        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        this.emitChange();
    }

    // Clear all local storage and session storage
    clearLocalStorage() {
        // Clear specific items
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('cart');

        // Clear all session storage
        sessionStorage.clear();

        // Also clear auth service state
        this.clearAuth();
    }

    // Register new user
    async register(userData) {
        this.loading = true;
        this.error = null;

        try {
            const response = await authAPI.register(userData);
            const { user, tokens } = response.data;
            const { access, refresh } = tokens;

            this.user = user;
            this.isAuthenticated = true;
            this.saveUserToStorage(user, access, refresh);

            return { success: true, user };
        } catch (error) {
            this.error = error.response?.data?.message || 'Registration failed';
            throw error;
        } finally {
            this.loading = false;
        }
    }

    // Login user
    async login(credentials) {
        this.loading = true;
        this.error = null;


        try {
            const response = await authAPI.login(credentials);
            const { user, tokens } = response.data;
            const { access, refresh } = tokens;


            this.user = user;
            this.isAuthenticated = true;
            this.saveUserToStorage(user, access, refresh);


            return { success: true, user };
        } catch (error) {
            console.error('AuthService: Login failed:', error);
            this.error = error.response?.data?.message || 'Login failed';
            throw error;
        } finally {
            this.loading = false;
        }
    }

    // Standard logout - current device only
    async logout() {
        this.loading = true;

        try {
            if (this.isAuthenticated) {
                const accessToken = localStorage.getItem('accessToken');
                const refreshToken = localStorage.getItem('refreshToken');

                if (accessToken && refreshToken) {
                    await authAPI.logout({
                        refresh_token: refreshToken,
                        access_token: accessToken
                    });
                }
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Continue with logout even if API call fails
        } finally {
            this.clearLocalStorage();
            this.loading = false;
        }
    }

    // Logout from all devices
    async logoutAllDevices() {
        this.loading = true;

        try {
            if (this.isAuthenticated) {
                const accessToken = localStorage.getItem('accessToken');

                if (accessToken) {
                    await authAPI.logoutAllDevices();
                }
            }
        } catch (error) {
            console.error('Logout all devices error:', error);
            // Continue with logout even if API call fails
        } finally {
            this.clearLocalStorage();
            this.loading = false;
        }
    }

    // Get current user profile
    async getProfile() {
        if (!this.isAuthenticated) {
            throw new Error('User not authenticated');
        }

        try {
            const response = await authAPI.getProfile();
            const user = response.data;

            this.user = user;
            this.saveUserToStorage(user, localStorage.getItem('accessToken'));

            return user;
        } catch (error) {
            if (error.response?.status === 401) {
                this.clearAuth();
            }
            throw error;
        }
    }

    // Update user profile
    async updateProfile(userData) {
        if (!this.isAuthenticated) {
            throw new Error('User not authenticated');
        }

        try {
            const response = await authAPI.updateProfile(userData);
            const user = response.data;

            this.user = user;
            this.saveUserToStorage(user, localStorage.getItem('accessToken'));

            return user;
        } catch (error) {
            this.error = error.response?.data?.message || 'Profile update failed';
            throw error;
        }
    }

    // Verify email
    async verifyEmail(token) {
        try {
            const response = await authAPI.verifyEmail(token);
            return response.data;
        } catch (error) {
            this.error = error.response?.data?.message || 'Email verification failed';
            throw error;
        }
    }

    // Request password reset
    async resetPassword(email) {
        try {
            const response = await authAPI.resetPassword(email);
            return response.data;
        } catch (error) {
            this.error = error.response?.data?.message || 'Password reset request failed';
            throw error;
        }
    }

    // Confirm password reset
    async confirmResetPassword(token, newPassword) {
        try {
            const response = await authAPI.confirmResetPassword(token, newPassword);
            return response.data;
        } catch (error) {
            this.error = error.response?.data?.message || 'Password reset confirmation failed';
            throw error;
        }
    }

    // Check if user is authenticated
    isUserAuthenticated() {
        return this.isAuthenticated && this.user !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Get user ID
    getUserId() {
        return this.user?.id;
    }

    // Get user email
    getUserEmail() {
        return this.user?.email;
    }

    // Get user display name
    getUserDisplayName() {
        return this.user?.display_name || this.user?.email;
    }

    // Check if user has specific permission
    hasPermission(permission) {
        return this.user?.permissions?.includes(permission) || false;
    }

    // Check if user has specific role
    hasRole(role) {
        return this.user?.roles?.includes(role) || false;
    }

    // Get authentication state
    getAuthState() {
        return {
            user: this.user,
            isAuthenticated: this.isAuthenticated,
            loading: this.loading,
            error: this.error
        };
    }

    // Clear error
    clearError() {
        this.error = null;
    }
}

// Create singleton instance
const authService = new AuthService();

// Debug: Log when auth service is created

export default authService; 