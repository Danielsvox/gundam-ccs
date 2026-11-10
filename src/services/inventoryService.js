import api from './api';

// The shared axios instance defaults to JSON, which would flatten FormData (and drop the photo).
const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } };

/** Staff-only inventory endpoints. The backend enforces roles; the UI only reflects them. */
const inventoryService = {
    me: () => api.get('/inventory/me/').then((r) => r.data),
    list: (params = {}) => api.get('/inventory/products/', { params }).then((r) => r.data),
    create: (formData) => api.post('/inventory/products/', formData, MULTIPART).then((r) => r.data),
    update: (id, formData) => api.patch(`/inventory/products/${id}/`, formData, MULTIPART).then((r) => r.data),
    adjustStock: (id, payload) => api.post(`/inventory/products/${id}/stock/`, payload).then((r) => r.data),
    movements: (id) => api.get(`/inventory/products/${id}/movements/`).then((r) => r.data),
};

export default inventoryService;
