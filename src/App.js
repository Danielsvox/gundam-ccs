import React, { Suspense, lazy, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import './i18n';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { CartProvider } from './contexts/CartContext';
import { StoreUiProvider, useStoreUi } from './contexts/StoreUiContext';
import Header from './Components/Header/Header';
import Footer from './Components/Footer/Footer';
import CartDrawer from './Components/CartDrawer/CartDrawer';
import Home from './Containers/Home/Home';
import CatalogPage from './Containers/Catalog/CatalogPage';
import ProductPage from './Containers/Product/ProductPage';
import NotFound from './Containers/NotFound/NotFound';

// Rarely-visited surfaces are split out of the main bundle.
const PricesPage = lazy(() => import('./Containers/Prices/PricesPage'));
const Login = lazy(() => import('./Components/Auth/Login'));
const Register = lazy(() => import('./Components/Auth/Register'));
const UserProfile = lazy(() => import('./Components/Auth/UserProfile'));
const ForgotPassword = lazy(() => import('./Components/Auth/ForgotPassword'));
const Checkout = lazy(() => import('./Components/Checkout/Checkout'));
const Orders = lazy(() => import('./Components/Orders/Orders'));
const InventoryPage = lazy(() => import('./Containers/Inventory/InventoryPage'));

/** New page => start at the top (the browser does not do this for client-side navigation). */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const Overlays = () => {
  const { checkoutOpen, closeCheckout, ordersOpen, closeOrders } = useStoreUi();
  return (
    <Suspense fallback={null}>
      {checkoutOpen && <Checkout onClose={closeCheckout} />}
      {ordersOpen && <Orders onClose={closeOrders} />}
    </Suspense>
  );
};

const Layout = () => {
  const { t } = useTranslation();
  return (
    <>
      <a className="skip-link" href="#main">{t('nav.skip')}</a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<p role="status" className="container" style={{ paddingBlock: 'var(--s-7)' }}>{t('common.loading')}</p>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
      <Overlays />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
        <CurrencyProvider>
          <CartProvider>
            <StoreUiProvider>
              <ScrollToTop />
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/browse" element={<CatalogPage />} />
                  <Route path="/gundams/:slug" element={<ProductPage />} />
                  <Route path="/prices" element={<PricesPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/inventario" element={<InventoryPage />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </StoreUiProvider>
          </CartProvider>
        </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
