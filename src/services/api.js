import axios from 'axios';

// Create axios instance with base configuration for Django REST API
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
console.log('API Base URL:', baseURL); // Debug log
console.log('Environment variables:', {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    NODE_ENV: process.env.NODE_ENV
});

// Create public API instance (no auth required)
const publicApi = axios.create({
    baseURL: baseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Create authenticated API instance
const api = axios.create({
    baseURL: baseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request logging for debugging
const addRequestLogging = (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
};

publicApi.interceptors.request.use(addRequestLogging);
api.interceptors.request.use(addRequestLogging);

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        console.log('API Request Interceptor - URL:', config.url);
        console.log('API Request Interceptor - Access Token:', accessToken ? 'Present' : 'Missing');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
            console.log('API Request Interceptor - Authorization Header:', `Bearer ${accessToken.substring(0, 20)}...`);
        } else {
            console.log('API Request Interceptor - No Authorization Header');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors and token refresh
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log('API Response Interceptor - 401 Error detected');
            console.log('API Response Interceptor - Original request URL:', originalRequest.url);
            console.log('API Response Interceptor - Original request headers:', originalRequest.headers);

            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refreshToken');
            console.log('API Response Interceptor - Refresh token:', refreshToken ? 'Present' : 'Missing');

            if (refreshToken) {
                try {
                    console.log('API Response Interceptor - Attempting token refresh...');
                    const response = await api.post('/accounts/token/refresh/', {
                        refresh: refreshToken
                    });

                    const { access } = response.data;
                    localStorage.setItem('accessToken', access);
                    console.log('API Response Interceptor - Token refreshed successfully');

                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    console.log('API Response Interceptor - Token refresh failed:', refreshError);
                    console.log('API Response Interceptor - Refresh error response:', refreshError.response?.data);
                    // Refresh token failed, clear auth but don't redirect
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    localStorage.removeItem('cart');
                    sessionStorage.clear();
                    // Don't redirect automatically - let components handle auth requirements
                }
            } else {
                console.log('API Response Interceptor - No refresh token available');
                // No refresh token, clear auth but don't redirect
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                localStorage.removeItem('cart');
                sessionStorage.clear();
                // Don't redirect automatically - let components handle auth requirements
            }
        }
        return Promise.reject(error);
    }
);

// Auth API endpoints for Django REST API
export const authAPI = {
    register: (userData) => api.post('/accounts/register/', userData),
    login: (credentials) => api.post('/accounts/login/', credentials),
    logout: (data) => api.post('/accounts/logout/', data),
    logoutAllDevices: () => api.post('/accounts/logout-all/'),
    getProfile: () => api.get('/accounts/profile/'),
    updateProfile: (userData) => api.put('/accounts/profile/', userData),
    refreshToken: (refreshToken) => api.post('/accounts/token/refresh/', { refresh: refreshToken }),
    verifyEmail: (token) => api.post('/accounts/verify-email/', { token }),
    resetPassword: (email) => api.post('/accounts/reset-password/', { email }),
    confirmResetPassword: (token, newPassword) => api.post('/accounts/reset-password/confirm/', { token, new_password: newPassword }),
};

// Products API endpoints (public - no auth required)
export const productsAPI = {
    getProducts: (params = {}) => publicApi.get('/products/products/', { params }),
    getProduct: (slug) => publicApi.get(`/products/products/${slug}/`),
    getCategories: () => publicApi.get('/products/categories/'),
    getProductsByCategory: (categorySlug) => publicApi.get(`/products/categories/${categorySlug}/products/`),
    searchProducts: (query) => publicApi.get('/products/products/search/', { params: { q: query } }),
};

// Cart API endpoints
export const cartAPI = {
    getCart: () => api.get('/cart/'),
    addToCart: (productId, quantity = 1) => api.post('/cart/add/', { product_id: productId, quantity }),
    updateCartItem: (itemId, quantity) => api.put(`/cart/items/${itemId}/`, { quantity }),
    removeFromCart: (itemId) => api.delete(`/cart/items/${itemId}/`),
    clearCart: () => api.delete('/cart/clear/'),
    applyCoupon: (code) => api.post('/cart/apply-coupon/', { code }),
    removeCoupon: () => api.delete('/cart/remove-coupon/'),
};

export default api; 