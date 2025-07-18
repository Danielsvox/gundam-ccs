import axios from 'axios';

// Create axios instance with base configuration for Django REST API
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
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
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const response = await api.post('/accounts/token/refresh/', {
                        refresh: refreshToken
                    });

                    const { access } = response.data;
                    localStorage.setItem('accessToken', access);

                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh token failed, redirect to login
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
            } else {
                // No refresh token, redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API endpoints for Django REST API
export const authAPI = {
    register: (userData) => api.post('/accounts/register/', userData),
    login: (credentials) => api.post('/accounts/login/', credentials),
    logout: () => api.post('/accounts/logout/'),
    getProfile: () => api.get('/accounts/profile/'),
    updateProfile: (userData) => api.put('/accounts/profile/', userData),
    refreshToken: (refreshToken) => api.post('/accounts/token/refresh/', { refresh: refreshToken }),
    verifyEmail: (token) => api.post('/accounts/verify-email/', { token }),
    resetPassword: (email) => api.post('/accounts/reset-password/', { email }),
    confirmResetPassword: (token, newPassword) => api.post('/accounts/reset-password/confirm/', { token, new_password: newPassword }),
};

// Cart API endpoints for Django REST API
export const cartAPI = {
    getCart: () => api.get('/cart/cart/'),
    addToCart: (productId, quantity = 1) => api.post('/cart/cart/items/add/', { product: productId, quantity }),
    updateCartItem: (itemId, quantity) => api.put(`/cart/cart/items/${itemId}/update/`, { quantity }),
    removeFromCart: (itemId) => api.delete(`/cart/cart/items/${itemId}/remove/`),
    clearCart: () => api.delete('/cart/cart/'),
    applyCoupon: (code) => api.post('/cart/cart/apply-coupon/', { code }),
    removeCoupon: () => api.delete('/cart/cart/remove-coupon/'),
};

// Products API endpoints for Django REST API
export const productsAPI = {
    getProducts: (params = {}) => api.get('/products/products/', { params }),
    getProduct: (productId) => api.get(`/products/products/${productId}/`),
    searchProducts: (query) => api.get('/products/products/search/', { params: { q: query } }),
    getCategories: () => api.get('/products/categories/'),
    getProductSpecifications: (productId) => api.get(`/products/products/${productId}/specifications/`),
    getProductReviews: (productId) => api.get(`/products/products/${productId}/reviews/`),
    addProductReview: (productId, reviewData) => api.post(`/products/products/${productId}/reviews/`, reviewData),
    getProductsByCategory: (categoryId) => api.get(`/products/categories/${categoryId}/products/`),
    getProductsBySeries: (series) => api.get('/products/products/', { params: { series } }),
    getProductsByGrade: (grade) => api.get('/products/products/', { params: { grade } }),
    getProductsByScale: (scale) => api.get('/products/products/', { params: { scale } }),
};

// Orders API endpoints for Django REST API
export const ordersAPI = {
    createOrder: (orderData) => api.post('/orders/orders/create/', orderData),
    getOrders: () => api.get('/orders/orders/'),
    getOrder: (orderId) => api.get(`/orders/orders/${orderId}/`),
    cancelOrder: (orderId) => api.post(`/orders/orders/${orderId}/cancel/`),
    getOrderStatus: (orderId) => api.get(`/orders/orders/${orderId}/status/`),
    getShippingMethods: () => api.get('/orders/shipping-methods/'),
    getTaxRates: (address) => api.post('/orders/tax-rates/', address),
};

// Wishlist API endpoints for Django REST API
export const wishlistAPI = {
    getWishlists: () => api.get('/wishlist/wishlists/'),
    createWishlist: (wishlistData) => api.post('/wishlist/wishlists/create/', wishlistData),
    getWishlist: (wishlistId) => api.get(`/wishlist/wishlists/${wishlistId}/`),
    addToWishlist: (wishlistId, productId) => api.post(`/wishlist/wishlists/${wishlistId}/items/add/`, { product: productId }),
    removeFromWishlist: (wishlistId, itemId) => api.delete(`/wishlist/wishlists/${wishlistId}/items/${itemId}/remove/`),
    shareWishlist: (wishlistId, email) => api.post(`/wishlist/wishlists/${wishlistId}/share/`, { email }),
    getSharedWishlist: (shareToken) => api.get(`/wishlist/shared/${shareToken}/`),
    createPriceAlert: (productId, targetPrice) => api.post('/wishlist/price-alerts/', { product: productId, target_price: targetPrice }),
    getPriceAlerts: () => api.get('/wishlist/price-alerts/'),
    deletePriceAlert: (alertId) => api.delete(`/wishlist/price-alerts/${alertId}/`),
};

// Payment API endpoints for Django REST API
export const paymentAPI = {
    createPayment: (paymentData) => api.post('/payments/payments/create/', paymentData),
    createPaymentIntent: (amount, currency = 'usd') => api.post('/payments/payment-intent/create/', { amount, currency }),
    confirmPayment: (paymentData) => api.post('/payments/payments/confirm/', paymentData),
    getPaymentMethods: () => api.get('/payments/payment-methods/'),
    savePaymentMethod: (paymentMethodData) => api.post('/payments/payment-methods/', paymentMethodData),
    deletePaymentMethod: (methodId) => api.delete(`/payments/payment-methods/${methodId}/`),
    getPaymentHistory: () => api.get('/payments/payments/'),
    requestRefund: (paymentId, reason) => api.post(`/payments/payments/${paymentId}/refund/`, { reason }),
};

// Health and info endpoints
export const systemAPI = {
    healthCheck: () => api.get('/health/'),
    apiInfo: () => api.get('/info/'),
};

export default api; 