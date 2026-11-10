import React, { createContext, useContext, useMemo, useState } from 'react';

const StoreUiContext = createContext(null);
export const useStoreUi = () => useContext(StoreUiContext);

/** Which transactional overlays (checkout, orders) are open. Kept out of the page components. */
export const StoreUiProvider = ({ children }) => {
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [ordersOpen, setOrdersOpen] = useState(false);
    const value = useMemo(() => ({
        checkoutOpen,
        ordersOpen,
        openCheckout: () => setCheckoutOpen(true),
        closeCheckout: () => setCheckoutOpen(false),
        openOrders: () => setOrdersOpen(true),
        closeOrders: () => setOrdersOpen(false),
    }), [checkoutOpen, ordersOpen]);
    return <StoreUiContext.Provider value={value}>{children}</StoreUiContext.Provider>;
};
