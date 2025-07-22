import axios from 'axios';

// Use environment variable for API base URL, fallback to localhost:8000 for development
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Centralized endpoint mapping for orders
export const ORDER_ENDPOINTS = {
    create: `${API_BASE_URL}/orders/checkout/`,
    list: `${API_BASE_URL}/orders/orders/`,
    detail: (id) => `${API_BASE_URL}/orders/orders/${id}/`,
    cancel: (id) => `${API_BASE_URL}/orders/orders/${id}/cancel/`,
    track: (id) => `${API_BASE_URL}/orders/orders/${id}/track/`,
};

// Centralized endpoint mapping for cart
export const CART_ENDPOINTS = {
    get: `${API_BASE_URL}/cart/`,
    add: `${API_BASE_URL}/cart/add/`,
    update: `${API_BASE_URL}/cart/update/`,
    remove: `${API_BASE_URL}/cart/remove/`,
    clear: `${API_BASE_URL}/cart/`,
    applyCoupon: `${API_BASE_URL}/cart/apply-coupon/`,
    removeCoupon: `${API_BASE_URL}/cart/remove-coupon/`,
};

// Centralized endpoint mapping for shipping
export const SHIPPING_ENDPOINTS = {
    getMethods: `${API_BASE_URL}/orders/shipping-methods/`,
};

// API service functions
export const orderAPI = {
    createOrder: (orderData) => api.post('/orders/checkout/', orderData),
    getOrders: () => api.get('/orders/orders/'),
    getOrderDetail: (id) => api.get(`/orders/orders/${id}/`),
    cancelOrder: (id) => api.post(`/orders/orders/${id}/cancel/`),
    trackOrder: (id) => api.get(`/orders/orders/${id}/track/`),
};

export const cartAPI = {
    getCart: () => api.get('/cart/'),
    addToCart: (productId, quantity = 1) => api.post('/cart/add/', { product_id: productId, quantity }),
    updateCartItem: (itemId, quantity) => api.put(`/cart/items/${itemId}/`, { quantity }),
    removeFromCart: (itemId) => api.delete(`/cart/items/${itemId}/`),
    clearCart: () => api.delete('/cart/'),
    applyCoupon: (code) => api.post('/cart/apply-coupon/', { code }),
    removeCoupon: () => api.delete('/cart/remove-coupon/'),
};

export const shippingAPI = {
    getShippingMethods: () => api.get('/orders/shipping-methods/'),
};

// Products API endpoints (public - no auth required)
export const productsAPI = {
    getProducts: (params = {}) => api.get('/products/products/', { params }),
    getProduct: (slug) => api.get(`/products/products/${slug}/`),
    getCategories: () => api.get('/products/categories/'),
    getProductsByCategory: (categorySlug) => api.get(`/products/categories/${categorySlug}/products/`),
    searchProducts: (query) => api.get('/products/products/search/', { params: { q: query } }),
};

// Auth API endpoints
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

export default api; 