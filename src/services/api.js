import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API endpoints
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Cart API endpoints
export const cartAPI = {
    getCart: () => api.get('/cart'),
    addToCart: (productId, quantity = 1) => api.post('/cart/items', { productId, quantity }),
    updateCartItem: (itemId, quantity) => api.put(`/cart/items/${itemId}`, { quantity }),
    removeFromCart: (itemId) => api.delete(`/cart/items/${itemId}`),
    clearCart: () => api.delete('/cart'),
};

// Products API endpoints
export const productsAPI = {
    getProducts: (params = {}) => api.get('/products', { params }),
    getProduct: (productId) => api.get(`/products/${productId}`),
    searchProducts: (query) => api.get('/products/search', { params: { q: query } }),
    getCategories: () => api.get('/products/categories'),
};

// Orders API endpoints
export const ordersAPI = {
    createOrder: (orderData) => api.post('/orders', orderData),
    getOrders: () => api.get('/orders'),
    getOrder: (orderId) => api.get(`/orders/${orderId}`),
    cancelOrder: (orderId) => api.put(`/orders/${orderId}/cancel`),
};

// Wishlist API endpoints
export const wishlistAPI = {
    getWishlist: () => api.get('/wishlist'),
    addToWishlist: (productId) => api.post('/wishlist', { productId }),
    removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`),
};

// Payment API endpoints
export const paymentAPI = {
    createPaymentIntent: (amount) => api.post('/payments/create-intent', { amount }),
    confirmPayment: (paymentData) => api.post('/payments/confirm', paymentData),
};

export default api; 