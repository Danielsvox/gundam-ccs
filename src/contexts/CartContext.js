import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { computeCartTotals } from '../lib/cartTotals';
import { describeApiError } from '../lib/apiError';

const CartContext = createContext(null);

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within a CartProvider');
    return ctx;
};

/**
 * Server cart state. Replaces the cart handlers that used to live in App.js.
 * - mutations are serialised (one at a time) and the cart is re-read afterwards, so the
 *   UI never shows a locally-invented total;
 * - a sequence counter drops responses of superseded reads (race condition guard).
 */
export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const seq = useRef(0);
    const queue = useRef(Promise.resolve());

    const read = useCallback(async () => {
        const mine = ++seq.current;
        const { data } = await cartAPI.getCart();
        if (mine === seq.current) setCart(data);
        return data;
    }, []);

    const refresh = useCallback(async () => {
        if (!isAuthenticated) {
            setCart(null);
            return null;
        }
        setLoading(true);
        setError(null);
        try {
            return await read();
        } catch (e) {
            const info = describeApiError(e);
            if (info.key) setError(info);
            return null;
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, read]);

    useEffect(() => {
        if (isAuthenticated) refresh();
        else {
            seq.current += 1; // invalidate in-flight reads
            setCart(null);
            setDrawerOpen(false);
        }
    }, [isAuthenticated, refresh]);

    // Serialise mutations: rapid +/+/+ clicks must not interleave their re-reads.
    const mutate = useCallback((fn) => {
        const run = async () => {
            setBusy(true);
            setError(null);
            try {
                await fn();
                await read();
                return { ok: true };
            } catch (e) {
                const info = describeApiError(e);
                if (info.key && info.key !== 'errors.sessionExpired') setError(info);
                // Re-sync: the server is the source of truth after a rejected change.
                try { await read(); } catch { /* keep previous state */ }
                return { ok: false, error: info };
            } finally {
                setBusy(false);
            }
        };
        const result = queue.current.then(run, run);
        queue.current = result.then(() => undefined, () => undefined);
        return result;
    }, [read]);

    const requireLogin = useCallback(() => {
        localStorage.setItem('redirectAfterLogin', location.pathname + location.search);
        navigate('/login');
    }, [location.pathname, location.search, navigate]);

    const addItem = useCallback(async (productId, quantity = 1) => {
        if (!isAuthenticated) {
            requireLogin();
            return { ok: false, error: { key: 'product.signInToBuy', params: {} }, needsLogin: true };
        }
        const result = await mutate(() => cartAPI.addToCart(productId, quantity));
        if (result.ok) setDrawerOpen(true);
        return result;
    }, [isAuthenticated, mutate, requireLogin]);

    const setQuantity = useCallback((itemId, quantity) => {
        if (quantity <= 0) return mutate(() => cartAPI.removeFromCart(itemId));
        return mutate(() => cartAPI.updateCartItem(itemId, quantity));
    }, [mutate]);

    const removeItem = useCallback((itemId) => mutate(() => cartAPI.removeFromCart(itemId)), [mutate]);
    const clear = useCallback(() => mutate(() => cartAPI.clearCart()), [mutate]);

    const items = useMemo(() => cart?.items || [], [cart]);
    const count = useMemo(() => items.reduce((n, i) => n + (Number(i.quantity) || 0), 0), [items]);
    const totals = useMemo(() => computeCartTotals(cart), [cart]);
    const quantityOf = useCallback((productId) => items.find((i) => i.product?.id === productId)?.quantity || 0, [items]);

    const value = useMemo(() => ({
        cart, items, count, totals, loading, busy, error,
        drawerOpen,
        openDrawer: () => setDrawerOpen(true),
        closeDrawer: () => setDrawerOpen(false),
        clearError: () => setError(null),
        addItem, setQuantity, removeItem, clear, refresh, quantityOf, isAuthenticated,
    }), [cart, items, count, totals, loading, busy, error, drawerOpen, addItem, setQuantity, removeItem, clear, refresh, quantityOf, isAuthenticated]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
