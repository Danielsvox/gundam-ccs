import { cartAPI } from './api';
import authService from './authService';

class CartService {
    constructor() {
        this.cart = null;
        this.loading = false;
        this.error = null;
        this.coupon = null;
        this.subtotal = 0;
        this.tax = 0;
        this.shipping = 0;
        this.total = 0;
    }

    // Load cart from API
    async loadCart() {
        if (!authService.isUserAuthenticated()) {
            this.cart = null;
            return null;
        }

        this.loading = true;
        this.error = null;

        try {
            const response = await cartAPI.getCart();
            this.cart = response.data;
            this.calculateTotals();
            return this.cart;
        } catch (error) {
            this.error = error.response?.data?.message || 'Failed to load cart';
            console.error('Error loading cart:', error);
            throw error;
        } finally {
            this.loading = false;
        }
    }

    // Add item to cart
    async addToCart(productId, quantity = 1) {
        if (!authService.isUserAuthenticated()) {
            throw new Error('User must be authenticated to add items to cart');
        }

        this.loading = true;
        this.error = null;

        try {
            const response = await cartAPI.addToCart(productId, quantity);
            this.cart = response.data;
            this.calculateTotals();
            return this.cart;
        } catch (error) {
            this.error = error.response?.data?.message || 'Failed to add item to cart';
            console.error('Error adding to cart:', error);
            throw error;
        } finally {
            this.loading = false;
        }
    }

    // Update cart item quantity
    async updateCartItem(itemId, quantity) {
        if (!authService.isUserAuthenticated()) {
            throw new Error('User must be authenticated to update cart');
        }

        this.loading = true;
        this.error = null;

        try {
            const response = await cartAPI.updateCartItem(itemId, quantity);
            this.cart = response.data;
            this.calculateTotals();
            return this.cart;
        } catch (error) {
            this.error = error.response?.data?.message || 'Failed to update cart item';
            console.error('Error updating cart item:', error);
            throw error;
        } finally {
            this.loading = false;
        }
    }

    // Remove item from cart
    async removeFromCart(itemId) {
        if (!authService.isUserAuthenticated()) {
            throw new Error('User must be authenticated to remove items from cart');
        }

        this.loading = true;
        this.error = null;

        try {
            const response = await cartAPI.removeFromCart(itemId);
            this.cart = response.data;
            this.calculateTotals();
            return this.cart;
        } catch (error) {
            this.error = error.response?.data?.message || 'Failed to remove item from cart';
            console.error('Error removing from cart:', error);
            throw error;
        } finally {
            this.loading = false;
        }
    }

    // Clear entire cart
    async clearCart() {
        if (!authService.isUserAuthenticated()) {
            throw new Error('User must be authenticated to clear cart');
        }

        this.loading = true;
        this.error = null;

        try {
            await cartAPI.clearCart();
            this.cart = null;
            this.resetTotals();
            return null;
        } catch (error) {
            this.error = error.response?.data?.message || 'Failed to clear cart';
            console.error('Error clearing cart:', error);
            throw error;
        } finally {
            this.loading = false;
        }
    }

    // Apply coupon to cart
    async applyCoupon(code) {
        if (!authService.isUserAuthenticated()) {
            throw new Error('User must be authenticated to apply coupons');
        }

        this.loading = true;
        this.error = null;

        try {
            const response = await cartAPI.applyCoupon(code);
            this.cart = response.data;
            this.coupon = response.data.applied_coupon;
            this.calculateTotals();
            return this.cart;
        } catch (error) {
            this.error = error.response?.data?.message || 'Failed to apply coupon';
            console.error('Error applying coupon:', error);
            throw error;
        } finally {
            this.loading = false;
        }
    }

    // Remove coupon from cart
    async removeCoupon() {
        if (!authService.isUserAuthenticated()) {
            throw new Error('User must be authenticated to remove coupons');
        }

        this.loading = true;
        this.error = null;

        try {
            const response = await cartAPI.removeCoupon();
            this.cart = response.data;
            this.coupon = null;
            this.calculateTotals();
            return this.cart;
        } catch (error) {
            this.error = error.response?.data?.message || 'Failed to remove coupon';
            console.error('Error removing coupon:', error);
            throw error;
        } finally {
            this.loading = false;
        }
    }

    // Calculate cart totals
    calculateTotals() {
        if (!this.cart) {
            this.resetTotals();
            return;
        }

        // Calculate subtotal
        this.subtotal = this.cart.items?.reduce((sum, item) => {
            const price = parseFloat(item.product.sale_price || item.product.price);
            return sum + (price * item.quantity);
        }, 0) || 0;

        // Apply coupon discount
        let discount = 0;
        if (this.cart.applied_coupon) {
            if (this.cart.applied_coupon.discount_type === 'percentage') {
                discount = (this.subtotal * this.cart.applied_coupon.discount_value) / 100;
            } else {
                discount = this.cart.applied_coupon.discount_value;
            }
        }

        // Calculate tax (if available)
        this.tax = this.cart.tax_amount || 0;

        // Calculate shipping (if available)
        this.shipping = this.cart.shipping_cost || 0;

        // Calculate total
        this.total = this.subtotal - discount + this.tax + this.shipping;
    }

    // Reset totals
    resetTotals() {
        this.subtotal = 0;
        this.tax = 0;
        this.shipping = 0;
        this.total = 0;
        this.coupon = null;
    }

    // Get cart item count
    getItemCount() {
        if (!this.cart?.items) return 0;
        return this.cart.items.reduce((count, item) => count + item.quantity, 0);
    }

    // Get cart items
    getCartItems() {
        return this.cart?.items || [];
    }

    // Get cart by ID
    getCartById(itemId) {
        return this.cart?.items?.find(item => item.id === itemId);
    }

    // Check if cart is empty
    isEmpty() {
        return !this.cart?.items || this.cart.items.length === 0;
    }

    // Get cart totals
    getTotals() {
        return {
            subtotal: this.subtotal,
            tax: this.tax,
            shipping: this.shipping,
            total: this.total,
            discount: this.coupon ? this.subtotal - (this.total - this.tax - this.shipping) : 0
        };
    }

    // Get applied coupon
    getAppliedCoupon() {
        return this.coupon;
    }

    // Get cart state
    getCartState() {
        return {
            cart: this.cart,
            loading: this.loading,
            error: this.error,
            itemCount: this.getItemCount(),
            totals: this.getTotals(),
            coupon: this.coupon,
            isEmpty: this.isEmpty()
        };
    }

    // Clear error
    clearError() {
        this.error = null;
    }

    // Check if item is in cart
    isItemInCart(productId) {
        return this.cart?.items?.some(item => item.product.id === productId) || false;
    }

    // Get item quantity in cart
    getItemQuantity(productId) {
        const item = this.cart?.items?.find(item => item.product.id === productId);
        return item ? item.quantity : 0;
    }

    // Update shipping address (for tax calculation)
    async updateShippingAddress(address) {
        // This would typically call an API endpoint to update shipping address
        // and recalculate tax based on the new address
        console.log('Updating shipping address:', address);
        // For now, just reload the cart to get updated totals
        await this.loadCart();
    }

    // Update shipping method
    async updateShippingMethod(methodId) {
        // This would typically call an API endpoint to update shipping method
        // and recalculate shipping cost
        console.log('Updating shipping method:', methodId);
        // For now, just reload the cart to get updated totals
        await this.loadCart();
    }
}

// Create singleton instance
const cartService = new CartService();

export default cartService; 