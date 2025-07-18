import { productsAPI } from './api';
import {
    GUNDAM_GRADES,
    GUNDAM_SCALES,
    GUNDAM_SERIES,
    filterProductsByGrade,
    filterProductsByScale,
    filterProductsBySeries,
    sortProductsByPrice,
    sortProductsByRating,
    sortProductsByReleaseDate
} from '../utils/gundamProducts';

class ProductService {
    constructor() {
        this.products = [];
        this.categories = [];
        this.loading = false;
        this.error = null;
        this.filters = {
            grade: null,
            scale: null,
            series: null,
            price_min: null,
            price_max: null,
            in_stock: false,
            featured: false,
            search: ''
        };
        this.sortBy = 'name';
        this.sortOrder = 'asc';
        this.currentPage = 1;
        this.pageSize = 12;
        this.totalPages = 1;
        this.totalProducts = 0;
    }

    // Load all products from API
    async loadProducts(params = {}) {
        this.loading = true;
        this.error = null;

        try {
            const queryParams = {
                page: this.currentPage,
                page_size: this.pageSize,
                ordering: this.getSortingParam(),
                ...this.filters,
                ...params
            };

            const response = await productsAPI.getProducts(queryParams);
            this.products = response.data.results || response.data;
            this.totalProducts = response.data.count || this.products.length;
            this.totalPages = Math.ceil(this.totalProducts / this.pageSize);

            return this.products;
        } catch (error) {
            this.error = error.response?.data?.message || 'Failed to load products';
            console.error('Error loading products:', error);
            throw error;
        } finally {
            this.loading = false;
        }
    }

    // Load product by ID
    async loadProduct(productId) {
        this.loading = true;
        this.error = null;

        try {
            const response = await productsAPI.getProduct(productId);
            return response.data;
        } catch (error) {
            this.error = error.response?.data?.message || 'Failed to load product';
            console.error('Error loading product:', error);
            throw error;
        } finally {
            this.loading = false;
        }
    }

    // Load product categories
    async loadCategories() {
        try {
            const response = await productsAPI.getCategories();
            this.categories = response.data;
            return this.categories;
        } catch (error) {
            console.error('Error loading categories:', error);
            throw error;
        }
    }

    // Search products
    async searchProducts(query) {
        this.loading = true;
        this.error = null;

        try {
            const response = await productsAPI.searchProducts(query);
            this.products = response.data.results || response.data;
            this.totalProducts = response.data.count || this.products.length;
            this.totalPages = Math.ceil(this.totalProducts / this.pageSize);

            return this.products;
        } catch (error) {
            this.error = error.response?.data?.message || 'Search failed';
            console.error('Error searching products:', error);
            throw error;
        } finally {
            this.loading = false;
        }
    }

    // Load products by category
    async loadProductsByCategory(categoryId) {
        this.loading = true;
        this.error = null;

        try {
            const response = await productsAPI.getProductsByCategory(categoryId);
            this.products = response.data.results || response.data;
            this.totalProducts = response.data.count || this.products.length;
            this.totalPages = Math.ceil(this.totalProducts / this.pageSize);

            return this.products;
        } catch (error) {
            this.error = error.response?.data?.message || 'Failed to load category products';
            console.error('Error loading category products:', error);
            throw error;
        } finally {
            this.loading = false;
        }
    }

    // Load products by series
    async loadProductsBySeries(series) {
        this.loading = true;
        this.error = null;

        try {
            const response = await productsAPI.getProductsBySeries(series);
            this.products = response.data.results || response.data;
            this.totalProducts = response.data.count || this.products.length;
            this.totalPages = Math.ceil(this.totalProducts / this.pageSize);

            return this.products;
        } catch (error) {
            this.error = error.response?.data?.message || 'Failed to load series products';
            console.error('Error loading series products:', error);
            throw error;
        } finally {
            this.loading = false;
        }
    }

    // Load products by grade
    async loadProductsByGrade(grade) {
        this.loading = true;
        this.error = null;

        try {
            const response = await productsAPI.getProductsByGrade(grade);
            this.products = response.data.results || response.data;
            this.totalProducts = response.data.count || this.products.length;
            this.totalPages = Math.ceil(this.totalProducts / this.pageSize);

            return this.products;
        } catch (error) {
            this.error = error.response?.data?.message || 'Failed to load grade products';
            console.error('Error loading grade products:', error);
            throw error;
        } finally {
            this.loading = false;
        }
    }

    // Load products by scale
    async loadProductsByScale(scale) {
        this.loading = true;
        this.error = null;

        try {
            const response = await productsAPI.getProductsByScale(scale);
            this.products = response.data.results || response.data;
            this.totalProducts = response.data.count || this.products.length;
            this.totalPages = Math.ceil(this.totalProducts / this.pageSize);

            return this.products;
        } catch (error) {
            this.error = error.response?.data?.message || 'Failed to load scale products';
            console.error('Error loading scale products:', error);
            throw error;
        } finally {
            this.loading = false;
        }
    }

    // Load product specifications
    async loadProductSpecifications(productId) {
        try {
            const response = await productsAPI.getProductSpecifications(productId);
            return response.data;
        } catch (error) {
            console.error('Error loading product specifications:', error);
            throw error;
        }
    }

    // Load product reviews
    async loadProductReviews(productId) {
        try {
            const response = await productsAPI.getProductReviews(productId);
            return response.data;
        } catch (error) {
            console.error('Error loading product reviews:', error);
            throw error;
        }
    }

    // Add product review
    async addProductReview(productId, reviewData) {
        try {
            const response = await productsAPI.addProductReview(productId, reviewData);
            return response.data;
        } catch (error) {
            this.error = error.response?.data?.message || 'Failed to add review';
            console.error('Error adding product review:', error);
            throw error;
        }
    }

    // Set filters
    setFilters(filters) {
        this.filters = { ...this.filters, ...filters };
        this.currentPage = 1; // Reset to first page when filters change
    }

    // Clear filters
    clearFilters() {
        this.filters = {
            grade: null,
            scale: null,
            series: null,
            price_min: null,
            price_max: null,
            in_stock: false,
            featured: false,
            search: ''
        };
        this.currentPage = 1;
    }

    // Set sorting
    setSorting(sortBy, sortOrder = 'asc') {
        this.sortBy = sortBy;
        this.sortOrder = sortOrder;
        this.currentPage = 1;
    }

    // Get sorting parameter for API
    getSortingParam() {
        const order = this.sortOrder === 'desc' ? '-' : '';
        return `${order}${this.sortBy}`;
    }

    // Set pagination
    setPagination(page, pageSize = 12) {
        this.currentPage = page;
        this.pageSize = pageSize;
    }

    // Get filtered products (client-side filtering for small datasets)
    getFilteredProducts() {
        let filtered = [...this.products];

        // Apply filters
        if (this.filters.grade) {
            filtered = filterProductsByGrade(filtered, this.filters.grade);
        }

        if (this.filters.scale) {
            filtered = filterProductsByScale(filtered, this.filters.scale);
        }

        if (this.filters.series) {
            filtered = filterProductsBySeries(filtered, this.filters.series);
        }

        if (this.filters.price_min) {
            filtered = filtered.filter(product =>
                parseFloat(product.sale_price || product.price) >= this.filters.price_min
            );
        }

        if (this.filters.price_max) {
            filtered = filtered.filter(product =>
                parseFloat(product.sale_price || product.price) <= this.filters.price_max
            );
        }

        if (this.filters.in_stock) {
            filtered = filtered.filter(product => product.stock_quantity > 0);
        }

        if (this.filters.featured) {
            filtered = filtered.filter(product => product.is_featured);
        }

        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.model_number?.toLowerCase().includes(searchTerm) ||
                product.pilot?.toLowerCase().includes(searchTerm)
            );
        }

        // Apply sorting
        switch (this.sortBy) {
            case 'price':
                filtered = sortProductsByPrice(filtered, this.sortOrder === 'asc');
                break;
            case 'rating':
                filtered = sortProductsByRating(filtered, this.sortOrder === 'asc');
                break;
            case 'release_date':
                filtered = sortProductsByReleaseDate(filtered, this.sortOrder === 'asc');
                break;
            default:
                filtered.sort((a, b) => {
                    const aVal = a[this.sortBy] || '';
                    const bVal = b[this.sortBy] || '';
                    if (this.sortOrder === 'asc') {
                        return aVal.localeCompare(bVal);
                    } else {
                        return bVal.localeCompare(aVal);
                    }
                });
        }

        return filtered;
    }

    // Get featured products
    getFeaturedProducts() {
        return this.products.filter(product => product.is_featured);
    }

    // Get products on sale
    getSaleProducts() {
        return this.products.filter(product => product.sale_price && product.sale_price < product.price);
    }

    // Get products in stock
    getInStockProducts() {
        return this.products.filter(product => product.stock_quantity > 0);
    }

    // Get product by ID
    getProductById(productId) {
        return this.products.find(product => product.id === productId);
    }

    // Get products by grade
    getProductsByGrade(grade) {
        return filterProductsByGrade(this.products, grade);
    }

    // Get products by scale
    getProductsByScale(scale) {
        return filterProductsByScale(this.products, scale);
    }

    // Get products by series
    getProductsBySeries(series) {
        return filterProductsBySeries(this.products, series);
    }

    // Get available grades
    getAvailableGrades() {
        const grades = [...new Set(this.products.map(product => product.grade))];
        return grades.map(grade => ({
            value: grade,
            label: GUNDAM_GRADES[grade] || grade
        }));
    }

    // Get available scales
    getAvailableScales() {
        const scales = [...new Set(this.products.map(product => product.scale))];
        return scales.map(scale => ({
            value: scale,
            label: GUNDAM_SCALES[scale] || scale
        }));
    }

    // Get available series
    getAvailableSeries() {
        const series = [...new Set(this.products.map(product => product.series))];
        return series.map(series => ({
            value: series,
            label: GUNDAM_SERIES[series] || series
        }));
    }

    // Get price range
    getPriceRange() {
        if (this.products.length === 0) return { min: 0, max: 0 };

        const prices = this.products.map(product =>
            parseFloat(product.sale_price || product.price)
        );

        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        };
    }

    // Get product service state
    getProductState() {
        return {
            products: this.products,
            categories: this.categories,
            loading: this.loading,
            error: this.error,
            filters: this.filters,
            sortBy: this.sortBy,
            sortOrder: this.sortOrder,
            currentPage: this.currentPage,
            pageSize: this.pageSize,
            totalPages: this.totalPages,
            totalProducts: this.totalProducts,
            availableGrades: this.getAvailableGrades(),
            availableScales: this.getAvailableScales(),
            availableSeries: this.getAvailableSeries(),
            priceRange: this.getPriceRange()
        };
    }

    // Clear error
    clearError() {
        this.error = null;
    }
}

// Create singleton instance
const productService = new ProductService();

export default productService; 