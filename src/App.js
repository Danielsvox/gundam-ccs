import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import Browse from './Containers/Browse/Browse';
import GamePage from './Containers/GamePage/GamePage';
import NotFound from './Containers/NotFound/NotFound';
import Home from './Containers/Home/Home';
import Login from './Components/Auth/Login';
import Register from './Components/Auth/Register';
import UserProfile from './Components/Auth/UserProfile';
import ForgotPassword from './Components/Auth/ForgotPassword';
import { AnimatePresence } from "framer-motion";
import filterNames from './utils/filterNames';
import templateGame from './utils/templateGame';
import productService from './services/productService';
import authService from './services/authService';
import cartService from './services/cartService';

function App() {
  const [currentFilter, setCurrentFilter] = useState("none");
  const [allGundams, setAllGundams] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartAmount, setCartAmount] = useState(0);
  const [shownGundams, setShownGundams] = useState([]);
  const [reviewDisplay, setReviewDisplay] = useState(false);
  const [cartDisplayed, setCartDisplayed] = useState(false);
  const [search, setSearch] = useState("");
  const [overlap, setOverlap] = useState(false);
  const [searching, setSearching] = useState(false);
  const [browsing, setBrowsing] = useState(true);
  const [selectedGundam, setSelectedGundam] = useState(false);
  const [extended, setExtended] = useState(false);
  const [textExtended, setTextExtended] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState(null);
  const [showCartError, setShowCartError] = useState(false);
  const [hoverState, setHoverState] = useState(() => {
    // Use a Map to handle any ID value dynamically
    const initialState = new Map();
    // Pre-populate with common IDs
    for (let i = 0; i < 100; i++) {
      initialState.set(i.toString(), {
        hovered: false,
        selected: false
      });
    }
    return initialState;
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to safely get hover state
  const getHoverState = (id) => {
    return hoverState.get(id?.toString()) || { hovered: false, selected: false };
  };

  // Load products from API on component mount
  const loadProducts = async () => {
    try {
      setProductsLoading(true);
      setProductsError(null);
      const { products } = await productService.getProducts(1, {}, 50); // Load first 50 products
      setAllGundams(products);
      setShownGundams(products);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProductsError('Failed to load products. Please try again.');
      // Fallback to empty array if API fails
      setAllGundams([]);
      setShownGundams([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // Load cart from API
  const loadCart = async () => {
    try {
      setCartLoading(true);
      setCartError(null);
      const cartData = await cartService.loadCart();
      if (cartData) {
        setCart(cartData.items || []);
        setCartAmount(cartData.items?.length || 0);
      } else {
        // No cart data (user not authenticated)
        setCart([]);
        setCartAmount(0);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);

      // Handle authentication errors gracefully
      if (error.response?.status === 401) {
        console.log('Cart load failed - user not authenticated');
        // Clear any invalid auth data
        authService.clearAuth();
        setCart([]);
        setCartAmount(0);
        return;
      }

      setCartError('Failed to load cart');
      setCart([]);
      setCartAmount(0);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCart();

    // Debug: Log authentication state on app load
    console.log('App loaded - Auth state:', authService.getAuthState());
    console.log('App loaded - Is authenticated:', authService.isUserAuthenticated());
    console.log('App loaded - LocalStorage tokens:', {
      accessToken: localStorage.getItem('accessToken') ? 'Present' : 'Missing',
      refreshToken: localStorage.getItem('refreshToken') ? 'Present' : 'Missing',
      user: localStorage.getItem('user') ? 'Present' : 'Missing'
    });
  }, []);

  // Handle product selection from URL
  useEffect(() => {
    if (location.pathname !== "/" && location.pathname !== "/browse" && selectedGundam === false && !productsLoading) {
      let surname = location.pathname.substring(9); // Remove "/gundams/" prefix
      let currentGundam = allGundams.find(gundam => gundam.surname === surname);
      if (currentGundam !== undefined) {
        setSelectedGundam(currentGundam);
      } else {
        setSelectedGundam(templateGame);
      }
    }
  }, [location.pathname, selectedGundam, allGundams, productsLoading]);

  async function handleBrowse() {
    setExtended(false);
    setTextExtended(false);
    setCartDisplayed(false);

    // Safety check for hoverState[21]
    if (hoverState.has("21")) {
      let newHoverState = new Map(hoverState);
      newHoverState.set("21", { ...newHoverState.get("21"), hovered: false });
      setHoverState(newHoverState);
    }

    navigate('/browse');
  }

  const handleHome = () => {
    setExtended(false);
    setTextExtended(false);
    setCartDisplayed(false);

    // Safety check for hoverState[21]
    if (hoverState.has("21")) {
      let newHoverState = new Map(hoverState);
      newHoverState.set("21", { ...newHoverState.get("21"), hovered: false });
      setHoverState(newHoverState);
    }

    navigate('/');
  }

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setSearching(false);
  }

  const handleSearchSubmit = (e) => {
    setCurrentFilter("none");
    e.preventDefault();
    setSearching(true);

    if (location.pathname !== "/browse") {
      navigate('/browse');
    }
  }

  const handleSelect = (e) => {
    setCurrentFilter(filterNames[e.target.id - 8]);
  }

  const handleSelectGundam = (e) => {
    if (e.target.tagName === "BUTTON") {
      return
    } else if (e.target.classList[0] !== "AddToCart_addToCart__zbJPe") {
      // Try to get the ID from the clicked element or its parent
      const cardElement = e.target.closest('[id]');
      if (cardElement) {
        const gundamId = parseInt(cardElement.id);
        // Find the gundam by ID instead of using ID as index
        const gundam = allGundams.find(g => g.id === gundamId);
        if (gundam) {
          setSelectedGundam(gundam);
          navigate(`/gundams/${gundam.surname}`);
        }
      }
    }
  }

  const handleLike = (e) => {
    const index = parseInt(e.target.id);

    // Safety check to ensure the index exists and is valid
    if (isNaN(index) || index < 0 || index >= allGundams.length) {
      return;
    }

    let handledLike = allGundams.map((gundam, i) => {
      if (index === i) {
        gundam.isLiked = !gundam.isLiked
        return gundam
      } else {
        return gundam;
      }
    });

    setAllGundams(handledLike);
  }

  const clearFilter = () => {
    setCurrentFilter("none");
    setSearch("");
    setReviewDisplay(false);
  }

  const openGundamPage = (e) => {
    setCartDisplayed(false);
    let selectedGundamSurname = e.target.id;
    navigate(`/gundams/${selectedGundamSurname}`);
  }

  const handleHover = (e) => {
    const id = e.target.id;

    // Safety check to ensure the ID is valid
    if (!id || id === "") {
      console.warn(`Invalid hover ID: ${id}`);
      return;
    }

    // Get the current state for this ID, or create a default one
    const currentState = hoverState.get(id) || { hovered: false, selected: false };

    if (currentState.selected) {
      return;
    }

    let newHoverState = new Map(hoverState);
    newHoverState.set(id, {
      ...currentState,
      hovered: !currentState.hovered
    });

    setHoverState(newHoverState);
  }

  const handleHoverGundam = (e) => {
    const index = parseInt(e.target.id);

    // Safety check to ensure the index exists and is valid
    if (isNaN(index) || index < 0 || index >= allGundams.length) {
      return;
    }

    let handledHoveredGundam = allGundams.map((gundam, i) => {
      if (index === i) {
        gundam.isHovered = !gundam.isHovered
        return gundam
      } else {
        return gundam;
      }
    });

    setAllGundams(handledHoveredGundam);
  }

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const productId = parseInt(e.target.id || e.currentTarget.id);
    console.log('Adding to cart, product ID:', productId);
    console.log('Current auth state:', authService.getAuthState());
    console.log('Is user authenticated:', authService.isUserAuthenticated());

    // Safety check to ensure the product ID is valid
    if (isNaN(productId) || productId <= 0) {
      console.error('Invalid product ID:', productId);
      return;
    }

    try {
      setCartLoading(true);
      setCartError(null);

      // Add to cart via API - let the API handle authentication
      const updatedCart = await cartService.addToCart(productId, 1);
      console.log('Cart updated:', updatedCart);

      // Update local state
      if (updatedCart && updatedCart.items) {
        setCart(updatedCart.items);
        setCartAmount(updatedCart.items.length);

        // Update product inCart status
        const updatedGundams = allGundams.map(gundam => ({
          ...gundam,
          inCart: updatedCart.items.some(item => item.product.id === gundam.id)
        }));
        setAllGundams(updatedGundams);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);

      // Handle specific error cases
      if (error.response?.status === 401) {
        console.log('Unauthorized - user needs to login');
        // Clear any invalid auth data
        authService.clearAuth();
        // Redirect to login
        localStorage.setItem('redirectAfterLogin', location.pathname);
        navigate('/login');
        return;
      }

      setCartError('Failed to add item to cart. Please try again.');
      setShowCartError(true);
      // Hide error after 5 seconds
      setTimeout(() => setShowCartError(false), 5000);
    } finally {
      setCartLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setCartLoading(true);
      await cartService.clearCart();

      // Update local state
      setCart([]);
      setCartAmount(0);

      // Update product inCart status
      const updatedGundams = allGundams.map(gundam => ({
        ...gundam,
        inCart: false,
        isHovered: false
      }));
      setAllGundams(updatedGundams);

      // Safety check for hoverState[21]
      if (hoverState.has("21")) {
        let newHoverState = new Map(hoverState);
        newHoverState.set("21", { ...newHoverState.get("21"), hovered: false });
        setHoverState(newHoverState);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);

      // Handle authentication errors
      if (error.response?.status === 401) {
        console.log('Unauthorized - user needs to login');
        authService.clearAuth();
        localStorage.setItem('redirectAfterLogin', location.pathname);
        navigate('/login');
        return;
      }

      setCartError('Failed to clear cart');
    } finally {
      setCartLoading(false);
    }
  };

  const handleRemoveFromCart = async (e) => {
    if (!authService.isUserAuthenticated()) {
      return;
    }

    const itemId = parseInt(e.target.id);
    console.log('Removing from cart, item ID:', itemId);

    if (isNaN(itemId) || itemId <= 0) {
      console.error('Invalid item ID:', itemId);
      return;
    }

    try {
      setCartLoading(true);
      setCartError(null);

      // Remove from cart via API
      const updatedCart = await cartService.removeFromCart(itemId);
      console.log('Cart updated after removal:', updatedCart);

      // Update local state
      if (updatedCart && updatedCart.items) {
        setCart(updatedCart.items);
        setCartAmount(updatedCart.items.length);

        // Update product inCart status
        const updatedGundams = allGundams.map(gundam => ({
          ...gundam,
          inCart: updatedCart.items.some(item => item.product.id === gundam.id)
        }));
        setAllGundams(updatedGundams);
      }

      // Safety check for hoverState[21]
      if (hoverState.has("21")) {
        let newHoverState = new Map(hoverState);
        newHoverState.set("21", { ...newHoverState.get("21"), hovered: false });
        setHoverState(newHoverState);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);

      // Handle authentication errors
      if (error.response?.status === 401) {
        console.log('Unauthorized - user needs to login');
        authService.clearAuth();
        localStorage.setItem('redirectAfterLogin', location.pathname);
        navigate('/login');
        return;
      }

      setCartError('Failed to remove item from cart');
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    setOverlap(false);

    if (location.pathname === "/") {
      setBrowsing(false);
    } else {
      setBrowsing(true);
    }

    if (location.pathname !== "/browse") {
      document.body.style.overflow = "hidden";

    } else if (location.pathname === "/browse") {
      document.body.style.overflow = "scroll";
    }
  }, [location.pathname])

  const handleOpenCart = () => {
    setCartDisplayed(true);
  }

  const handleCloseCart = () => {
    setCartDisplayed(false);
  }

  useEffect(() => {
    if (cartDisplayed) {
      document.body.style.overflow = "hidden !important";
    } else {
      document.body.style.overflow = "scroll !important";
    }
  }, [cartDisplayed])

  return (
    <AnimatePresence exitBeforeEnter>
      <Routes key={location.pathname} location={location}>
        <Route path="/" element={<Home
          handleHover={handleHover}
          hoverState={hoverState}
          getHoverState={getHoverState}
          shownGundams={shownGundams}
          cart={cart}
          cartAmount={cartAmount}
          cartDisplayed={cartDisplayed}
          handleOpenCart={handleOpenCart}
          handleCloseCart={handleCloseCart}
          clearCart={clearCart}
          handleAddToCart={handleAddToCart}
          handleLike={handleLike}
          handleHoverGundam={handleHoverGundam}
          handleSelectGundam={handleSelectGundam}
          handleRemoveFromCart={handleRemoveFromCart}
          setHoverState={setHoverState}
          overlap={overlap}
          setOverlap={setOverlap}
          openGundamPage={openGundamPage}
          allGundams={allGundams}
          cartError={cartError}
          showCartError={showCartError}
        />} />
        <Route path="/browse" element={<Browse
          cart={cart}
          cartAmount={cartAmount}
          handleHover={handleHover}
          handleSelect={handleSelect}
          hoverState={hoverState}
          getHoverState={getHoverState}
          currentFilter={currentFilter}
          shownGundams={shownGundams}
          setShownGundams={setShownGundams}
          clearFilter={clearFilter}
          reviewDisplay={reviewDisplay}
          setReviewDisplay={setReviewDisplay}
          allGundams={allGundams}
          setAllGundams={setAllGundams}
          handleLike={handleLike}
          handleHoverGundam={handleHoverGundam}
          handleAddToCart={handleAddToCart}
          handleSelectGundam={handleSelectGundam}
          handleSearch={handleSearch}
          handleSearchSubmit={handleSearchSubmit}
          search={search}
          searching={searching}
          browsing={browsing}
          handleBrowse={handleBrowse}
          handleHome={handleHome}
          cartDisplayed={cartDisplayed}
          handleOpenCart={handleOpenCart}
          handleCloseCart={handleCloseCart}
          clearCart={clearCart}
          handleRemoveFromCart={handleRemoveFromCart}
          setHoverState={setHoverState}
          openGundamPage={openGundamPage}
          productsLoading={productsLoading}
          productsError={productsError}
          onRetryProducts={loadProducts}
          cartError={cartError}
          showCartError={showCartError}
        />} />
        <Route path="/gundams/:gundamId" element={<GamePage
          cart={cart}
          cartAmount={cartAmount}
          handleHover={handleHover}
          hoverState={hoverState}
          getHoverState={getHoverState}
          handleLike={handleLike}
          handleAddToCart={handleAddToCart}
          handleSelectGundam={handleSelectGundam}
          selectedGundam={selectedGundam}
          setSelectedGundam={setSelectedGundam}
          handleSearch={handleSearch}
          handleSearchSubmit={handleSearchSubmit}
          search={search}
          searching={searching}
          browsing={browsing}
          handleBrowse={handleBrowse}
          handleHome={handleHome}
          setHoverState={setHoverState}
          allGundams={allGundams}
          extended={extended}
          setExtended={setExtended}
          textExtended={textExtended}
          setTextExtended={setTextExtended}
          cartDisplayed={cartDisplayed}
          handleOpenCart={handleOpenCart}
          handleCloseCart={handleCloseCart}
          clearCart={clearCart}
          handleRemoveFromCart={handleRemoveFromCart}
          openGundamPage={openGundamPage}
          cartError={cartError}
          showCartError={showCartError}
        />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<NotFound
          cartDisplayed={cartDisplayed}
          handleCloseCart={handleCloseCart}
          handleOpenCart={handleOpenCart}
          cartAmount={cartAmount}
          clearCart={clearCart}
          hoverState={hoverState}
          getHoverState={getHoverState}
          handleHome={handleHome}
          handleHover={handleHover}
          cart={cart}
          browsing={browsing}
          search={search}
          searching={searching}
          handleSearch={handleSearch}
          handleSearchSubmit={handleSearchSubmit}
          handleBrowse={handleBrowse}
          handleRemoveFromCart={handleRemoveFromCart}
          openGundamPage={openGundamPage}
          cartError={cartError}
          showCartError={showCartError}
        />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
