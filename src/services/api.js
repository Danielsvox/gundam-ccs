import axios from 'axios';

// REACT_APP_API_BASE_URL is the variable used by the code; REACT_APP_API_URL is what the
// README documents. Accept both so existing deployments keep working.
export const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL ||
    process.env.REACT_APP_API_URL ||
    'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 20000,
});

// Endpoints that must never receive (or react to) a bearer token. Catalog data is public:
// the backend rejects an expired token with 401 even on AllowAny endpoints, which used to
// bounce shoppers with a stale session to /login while merely browsing.
const AUTH_ENDPOINT = /^\/accounts\/(login|register|token\/refresh|reset-password|verify-email)/;

api.interceptors.request.use((config) => {
    if (!config.skipAuth) {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const config = error.config || {};
        const hadToken = Boolean(config.headers && config.headers.Authorization);
        if (error.response?.status === 401 && hadToken && !AUTH_ENDPOINT.test(config.url || '')) {
            // Session expired. Clear it and let the app decide what to do (no hard redirect,
            // which would also wipe in-progress form state and failed-login messages).
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.dispatchEvent(new CustomEvent('auth:expired'));
        }
        return Promise.reject(error);
    }
);

const PUBLIC = { skipAuth: true };

// Centralized endpoint mapping for orders
export const ORDER_ENDPOINTS = {
    create: `${API_BASE_URL}/payments/checkout/`,
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

export const orderAPI = {
    createOrder: (orderData) => api.post('/payments/checkout/', orderData),
    getOrders: (params = {}) => api.get('/orders/orders/', { params }),
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
    // The backend routes are /cart/coupons/apply/ (field `coupon_code`) and
    // /cart/coupons/<applied_coupon_id>/remove/. The old /apply-coupon/ and /remove-coupon/
    // paths never existed on the backend.
    applyCoupon: (code) => api.post('/cart/coupons/apply/', { coupon_code: code }),
    removeCoupon: (appliedCouponId) => api.delete(`/cart/coupons/${appliedCouponId}/remove/`),
};

export const shippingAPI = {
    getShippingMethods: () => api.get('/orders/shipping-methods/'),
};

// Products API endpoints (public - no auth required)
export const productsAPI = {
    getProducts: (params = {}, signal) => api.get('/products/products/', { params, signal, ...PUBLIC }),
    getFacets: (signal) => api.get('/products/products/facets/', { signal, ...PUBLIC }),
    getProduct: (slug, signal) => api.get(`/products/products/${encodeURIComponent(slug)}/`, { signal, ...PUBLIC }),
    getFeatured: (params = {}, signal) => api.get('/products/products/', { params: { is_featured: 'true', ...params }, signal, ...PUBLIC }),
    getCategories: (signal) => api.get('/products/categories/', { signal, ...PUBLIC }),
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

// Exchange Rate API (public)
export const exchangeRateAPI = {
    getCurrentRate: async (signal) => {
        const response = await api.get('/payments/exchange-rate/', { signal, ...PUBLIC });
        return response.data;
    },
};

// Pago Móvil API
export const pagoMovilAPI = {
    getPaymentInfo: async () => {
        const response = await api.get('/payments/pagomovil/info/');
        return response.data;
    },

    submitVerification: async (verificationData) => {
        const response = await api.post('/payments/pagomovil/verify/', verificationData);
        return response.data;
    },

    checkStatus: async () => {
        const response = await api.get('/payments/pagomovil/status/');
        return response.data;
    },
};

export default api;
