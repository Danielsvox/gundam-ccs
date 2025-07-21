import React, { useState, useEffect, useRef } from 'react';
import styles from './NavBar.module.css';
import { ReactComponent as Logo } from "../../Resources/image/logo.svg";
import { ReactComponent as Browse } from "../../Resources/image/browse.svg";
import { ReactComponent as Cart } from "../../Resources/image/cart.svg";
import { ReactComponent as Login } from "../../Resources/image/login.svg";
import { ReactComponent as Search } from "../../Resources/image/search.svg";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import authService from '../../services/authService';
import LogoutModal from '../Auth/LogoutModal';

const NavBar = props => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const {
    handleHover,
    hoverState,
    getHoverState,
    handleHome,
    handleBrowse,
    browsing,
    landingPage,
    cart,
    cartAmount,
    search,
    searching,
    handleSearch,
    handleSearchSubmit,
    handleOpenCart,
    handleCloseCart
  } = props;

  // Load user data on component mount
  useEffect(() => {
    const loadUser = () => {
      const currentUser = authService.getCurrentUser();
      const isAuthenticated = authService.isUserAuthenticated();

      // Only set user if actually authenticated
      if (isAuthenticated && currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    };

    loadUser();
  }, []);

  // Handle click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleUserClick = () => {
    if (user) {
      setShowUserMenu(!showUserMenu);
    } else {
      // Save current location before redirecting to login
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
    }
  };

  const handleProfileClick = () => {
    console.log('Profile clicked');
    setShowUserMenu(false);
    navigate('/profile');
  };

  const handleLogoutClick = () => {
    console.log('Logout clicked');
    setShowUserMenu(false);
    setShowLogoutModal(true);
  };

  const handleLogoutSuccess = () => {
    setUser(null);
    setShowUserMenu(false);
    setShowLogoutModal(false);
    // Force reload user state from authService
    const currentUser = authService.getCurrentUser();
    const isAuthenticated = authService.isUserAuthenticated();

    if (isAuthenticated && currentUser) {
      setUser(currentUser);
    } else {
      setUser(null);
    }
  };

  const variants = {
    hidden: { opacity: 1, y: 15 },
    visible: { opacity: 1, y: 0 },
  }

  const searchVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const location = useLocation();

  return (
    <>
      <motion.div
        className={styles.navbar}
        animate="visible"
        initial={landingPage ? "hidden" : "visible"}
        variants={variants}
        transition={{ y: { type: "spring" }, duration: 0.01 }}
      >
        <div className={styles.navbar_left}>
          <div className={styles.logodiv} id="0"
            onMouseEnter={handleHover}
            onMouseLeave={handleHover}
            onClick={handleHome}
          >
            <Logo className={styles.svg} style={{ fill: "#fff" }} />
            <h3>{t('nav.brand')}</h3>
          </div>

          <div className={styles.pathdiv} id="1"
            onMouseEnter={handleHover}
            onMouseLeave={handleHover}
          >
            {browsing ?
              <>
                <motion.div
                  animate="visible"
                  initial={location.pathname === "/react-ecommerce-store/browse" ? "hidden" : "visible"}
                  variants={searchVariants}
                  transition={{ opacity: { type: "spring" }, duration: 0.01, delay: 0.25 }}
                  className={styles.searchdiv}
                >
                  <form onSubmit={handleSearchSubmit}>
                    <input
                      placeholder={t('nav.search')}
                      value={search}
                      onChange={handleSearch}
                    >

                    </input>
                    <input
                      type="submit"
                      hidden
                      className={styles.submit}
                    />
                    <button type="submit">
                      <Search
                        className={styles.svg}
                        style={{ fill: getHoverState(7).hovered ? "#fff" : "#cccccc" }}
                        onMouseEnter={handleHover}
                        onMouseLeave={handleHover}
                        id="7"
                        aria-label='Search'
                      />
                    </button>
                  </form>
                </motion.div>
              </>

              :

              <div className={styles.browsediv}>
                <Browse
                  className={styles.svg}
                  style={{ fill: "#fff" }} />
                <h3 onClick={handleBrowse}>{t('nav.browse')}</h3>
              </div>
            }
          </div>
        </div>

        <div className={styles.navbar_right}>
          <LanguageSwitcher />

          <div
            className={styles.userdiv}
            id="2"
            onMouseEnter={handleHover}
            onMouseLeave={handleHover}
            onClick={handleUserClick}
          >
            {user ? (
              <div className={styles.userAvatar}>
                <span>{user.first_name ? user.first_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}</span>
              </div>
            ) : (
              <Login className={styles.loginIcon} />
            )}
            <h3>{user ? user.first_name || user.email : t('nav.user')}</h3>

            {showUserMenu && user && (
              <motion.div
                ref={userMenuRef}
                className={styles.userMenu}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProfileClick();
                  }}
                  className={styles.menuItem}
                >
                  Profile
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogoutClick();
                  }}
                  className={styles.menuItem}
                >
                  Sign Out
                </button>
              </motion.div>
            )}
          </div>

          <div
            className={styles.cartdiv}
            id="3"
            onMouseEnter={handleHover}
            onMouseLeave={handleHover}
            onClick={handleOpenCart}
          >
            <Cart
              onClick={handleOpenCart}
              className={styles.svg2}
              style={{ fill: cartAmount ? "#90ee90" : "transparent", stroke: cartAmount ? "" : "#fff", strokeWidth: "34px" }}
            />
            <h3 onClick={handleOpenCart}>{t('nav.cart')}: {cartAmount}</h3>
          </div>
        </div>
      </motion.div>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onLogoutSuccess={handleLogoutSuccess}
      />
    </>
  );
}

export default NavBar;