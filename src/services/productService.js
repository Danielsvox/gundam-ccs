import { productsAPI, API_BASE_URL } from './api';
import { normalizeProduct } from '../lib/productMapper';
import { toApiParams } from '../lib/catalog';

const normalize = (p) => normalizeProduct(p, API_BASE_URL);

/**
 * Stateless product API. (The old singleton kept `loading/error/products` fields that
 * nothing read, and duplicated the response mapping five times.)
 * Every call accepts an AbortSignal so superseded requests can be cancelled.
 */
const productService = {
    /** Catalog page for a CatalogState (see lib/catalog.js). */
    async getCatalog(state, signal) {
        const { data } = await productsAPI.getProducts(toApiParams(state), signal);
        return {
            products: (data.results || []).map(normalize).filter(Boolean),
            total: Number(data.count) || 0,
        };
    },

    async getProduct(slug, signal) {
        const { data } = await productsAPI.getProduct(slug, signal);
        return normalize(data);
    },

    async getLatest(limit = 8, signal) {
        const { data } = await productsAPI.getProducts({ page_size: limit, ordering: '-created_at', available: 'true' }, signal);
        return (data.results || []).map(normalize).filter(Boolean);
    },

    async getOnSale(limit = 4, signal) {
        const { data } = await productsAPI.getProducts({ page_size: limit, on_sale: 'true', available: 'true', ordering: '-created_at' }, signal);
        return (data.results || []).map(normalize).filter(Boolean);
    },

    async getFacets(signal) {
        const { data } = await productsAPI.getFacets(signal);
        return {
            grades: data.grades || [],
            scales: data.scales || [],
            manufacturers: data.manufacturers || [],
            categories: data.categories || [],
            priceRange: data.price_range || { min: null, max: null },
        };
    },
};

export default productService;
