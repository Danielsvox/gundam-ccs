import { productsAPI } from './api';

class ProductService {
    constructor() {
        this.products = [];
        this.categories = [];
        this.loading = false;
        this.error = null;
        this.pagination = {
            count: 0,
            next: null,
            previous: null,
            currentPage: 1
        };
    }

    // Get all products with optional filters and pagination
    async getProducts(page = 1, filters = {}, pageSize = 20) {
        this.loading = true;
        this.error = null;

        try {
            const params = {
                page,
                page_size: pageSize,
                ...filters
            };

            console.log('Fetching products with params:', params);
            const response = await productsAPI.getProducts(params);
            const { results, count, next, previous } = response.data;

            // Transform API data to match current frontend structure
            const transformedProducts = results.map((product, index) => ({
                id: product.id,
                name: product.name,
                surname: product.slug, // Use slug as surname for routing
                price: product.current_price,
                desc: product.description,
                link: product.primary_image?.image || '',
                release: product.release_date || 'N/A',
                platforms: `${product.scale} Scale, ${product.grade}`,
                genre: product.grade, // Use grade as genre for filtering
                developers: product.manufacturer,
                publishers: product.manufacturer,
                inCart: false,
                selected: false,
                isHovered: false,
                isLiked: false,
                rating: Math.round(parseFloat(product.rating) * 20), // Convert 5-star to 100-point scale
                cover: product.primary_image?.image || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop',
                footage: product.images?.map(img => img.image) || [
                    product.primary_image?.image || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1920&h=1080&fit=crop',
                    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1920&h=1080&fit=crop',
                    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1920&h=1080&fit=crop'
                ],
                // Additional API fields
                slug: product.slug,
                short_description: product.short_description,
                category: product.category,
                scale: product.scale,
                manufacturer: product.manufacturer,
                sale_price: product.sale_price,
                is_on_sale: product.is_on_sale,
                discount_percentage: product.discount_percentage,
                in_stock: product.in_stock,
                stock_quantity: product.stock_quantity,
                review_count: product.review_count,
                is_featured: product.is_featured,
                is_active: product.is_active,
                created_at: product.created_at,
                updated_at: product.updated_at
            }));

            this.products = transformedProducts;
            this.pagination = {
                count,
                next,
                previous,
                currentPage: page
            };

            return {
                products: transformedProducts,
                pagination: this.pagination
            };
        } catch (error) {
            console.error('ProductService Error:', error);
            console.error('Error response:', error.response);
            console.error('Error config:', error.config);
            this.error = error.response?.data?.message || 'Failed to fetch products';
            throw error;
        } finally {
            this.loading = false;
        }
    }

    // Get product by slug
    async getProduct(slug) {
        this.loading = true;
        this.error = null;

        try {
            const response = await productsAPI.getProduct(slug);
            const product = response.data;

            // Transform to match frontend structure
            const transformedProduct = {
                id: product.id,
                name: product.name,
                surname: product.slug,
                price: product.current_price,
                desc: product.description,
                link: product.primary_image?.image || '',
                release: product.release_date || 'N/A',
                platforms: `${product.scale} Scale, ${product.grade}`,
                genre: product.grade,
                developers: product.manufacturer,
                publishers: product.manufacturer,
                inCart: false,
                selected: false,
                isHovered: false,
                isLiked: false,
                rating: Math.round(parseFloat(product.rating) * 20),
                cover: product.primary_image?.image || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop',
                footage: product.images?.map(img => img.image) || [
                    product.primary_image?.image || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1920&h=1080&fit=crop',
                    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1920&h=1080&fit=crop',
                    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1920&h=1080&fit=crop'
                ],
                // Additional API fields
                slug: product.slug,
                short_description: product.short_description,
                category: product.category,
                scale: product.scale,
                manufacturer: product.manufacturer,
                sale_price: product.sale_price,
                is_on_sale: product.is_on_sale,
                discount_percentage: product.discount_percentage,
                in_stock: product.in_stock,
                stock_quantity: product.stock_quantity,
                review_count: product.review_count,
                is_featured: product.is_featured,
                is_active: product.is_active,
                specifications: product.specifications,
                reviews: product.reviews,
                created_at: product.created_at,
                updated_at: product.updated_at
            };

            return transformedProduct;
        } catch (error) {
            this.error = error.response?.data?.message || 'Failed to fetch product';
            throw error;
        } finally {
            this.loading = false;
        }
    }

    // Get all categories
    async getCategories() {
        try {
            const response = await productsAPI.getCategories();
            this.categories = response.data.results;
            return this.categories;
        } catch (error) {
            this.error = error.response?.data?.message || 'Failed to fetch categories';
            throw error;
        }
    }

    // Search products
    async searchProducts(query) {
        this.loading = true;
        this.error = null;

        try {
            const response = await productsAPI.searchProducts(query);
            const { results } = response.data;

            // Transform search results
            const transformedProducts = results.map((product, index) => ({
                id: product.id,
                name: product.name,
                surname: product.slug,
                price: product.current_price,
                desc: product.description,
                link: product.primary_image?.image || '',
                release: product.release_date || 'N/A',
                platforms: `${product.scale} Scale, ${product.grade}`,
                genre: product.grade,
                developers: product.manufacturer,
                publishers: product.manufacturer,
                inCart: false,
                selected: false,
                isHovered: false,
                isLiked: false,
                rating: Math.round(parseFloat(product.rating) * 20),
                cover: product.primary_image?.image || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop',
                footage: product.images?.map(img => img.image) || [
                    product.primary_image?.image || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1920&h=1080&fit=crop',
                    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1920&h=1080&fit=crop',
                    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1920&h=1080&fit=crop'
                ]
            }));

            return transformedProducts;
        } catch (error) {
            this.error = error.response?.data?.message || 'Search failed';
            throw error;
        } finally {
            this.loading = false;
        }
    }

    // Get featured products
    async getFeaturedProducts() {
        try {
            const response = await productsAPI.getProducts({ is_featured: true });
            const { results } = response.data;

            return results.map((product, index) => ({
                id: product.id,
                name: product.name,
                surname: product.slug,
                price: product.current_price,
                desc: product.description,
                link: product.primary_image?.image || '',
                release: product.release_date || 'N/A',
                platforms: `${product.scale} Scale, ${product.grade}`,
                genre: product.grade,
                developers: product.manufacturer,
                publishers: product.manufacturer,
                inCart: false,
                selected: false,
                isHovered: false,
                isLiked: false,
                rating: Math.round(parseFloat(product.rating) * 20),
                cover: product.primary_image?.image || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop',
                footage: product.images?.map(img => img.image) || [
                    product.primary_image?.image || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1920&h=1080&fit=crop',
                    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1920&h=1080&fit=crop',
                    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1920&h=1080&fit=crop'
                ]
            }));
        } catch (error) {
            this.error = error.response?.data?.message || 'Failed to fetch featured products';
            throw error;
        }
    }

    // Get products by category
    async getProductsByCategory(categorySlug) {
        try {
            const response = await productsAPI.getProductsByCategory(categorySlug);
            const { results } = response.data;

            return results.map((product, index) => ({
                id: product.id,
                name: product.name,
                surname: product.slug,
                price: product.current_price,
                desc: product.description,
                link: product.primary_image?.image || '',
                release: product.release_date || 'N/A',
                platforms: `${product.scale} Scale, ${product.grade}`,
                genre: product.grade,
                developers: product.manufacturer,
                publishers: product.manufacturer,
                inCart: false,
                selected: false,
                isHovered: false,
                isLiked: false,
                rating: Math.round(parseFloat(product.rating) * 20),
                cover: product.primary_image?.image || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop',
                footage: product.images?.map(img => img.image) || [
                    product.primary_image?.image || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1920&h=1080&fit=crop',
                    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1920&h=1080&fit=crop',
                    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1920&h=1080&fit=crop'
                ]
            }));
        } catch (error) {
            this.error = error.response?.data?.message || 'Failed to fetch category products';
            throw error;
        }
    }

    // Get current state
    getState() {
        return {
            products: this.products,
            categories: this.categories,
            loading: this.loading,
            error: this.error,
            pagination: this.pagination
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