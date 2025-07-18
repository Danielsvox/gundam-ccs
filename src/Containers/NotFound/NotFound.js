import styles from './NotFound.module.css';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import Cart from '../../Components/Cart/Cart';
import AnimatedHome from '../AnimatedPage/AnimatedHome';
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';

const NotFound = props => {
  const { t } = useTranslation();

  const {
    cartDisplayed,
    handleCloseCart,
    handleOpenCart,
    cartAmount,
    clearCart,
    hoverState,
    handleHome,
    handleHover,
    handleBrowse,
    cart,
    browsing,
    landingPage,
    search,
    searching,
    handleSearch,
    handleSearchSubmit,
    handleRemoveFromCart,
    openGundamPage
  } = props;
  const location = useLocation();

  const animations = {
    initial: { opacity: 0, y: -225 },
    animate: { opacity: 1, y: 0, transition: { y: { type: "spring", duration: 1.5, bounce: 0.5 } } },
    exit: { opacity: 0, y: -175, transition: { y: { type: "tween", duration: 0.675, bounce: 0.5 }, opacity: { type: "tween", duration: 0.675 } } },
  }

  const progress = {
    initial: { width: 0 },
    animate: { width: 700, transition: { width: { type: "tween", duration: 7 } } },
  }

  useEffect(() => {
    setTimeout(handleBrowse, 6800);
  }, [])

  return (
    <div className={styles.notFound}>
      {cartDisplayed ? <Cart
        cartDisplayed={cartDisplayed}
        handleOpenCart={handleOpenCart}
        handleCloseCart={handleCloseCart}
        cart={cart}
        cartAmount={cartAmount}
        handleHover={handleHover}
        hoverState={hoverState}
        clearCart={clearCart}
        handleRemoveFromCart={handleRemoveFromCart}
        openGundamPage={openGundamPage}
      /> : null}

      <NavBar
        handleHover={handleHover}
        hoverState={hoverState}
        handleHome={handleHome}
        browsing={browsing}
        landingPage={landingPage}
        cartAmount={cartAmount}
        search={search}
        searching={searching}
        handleSearch={handleSearch}
        handleSearchSubmit={handleSearchSubmit}
        handleOpenCart={handleOpenCart}
        handleCloseCart={handleCloseCart}
      />

      <motion.div className={styles.container} variants={animations} initial="initial" animate="animate" exit="exit">
        <div className={styles.notFoundContent}>
          <img className={styles.notFoundImg} src={require("../../Resources/image/404.png")} alt="Not Found Warning" />
          <div className={styles.notFoundText}>
            <h2><span>{location.pathname.substring(22)}</span> {t('notFound.message')}</h2>
            <p>{t('notFound.description')} <span className={styles.contact}>{t('notFound.contact')}</span></p>
          </div>
        </div>
        <motion.div className={styles.progressBar} variants={progress} initial="initial" animate="animate"></motion.div>
      </motion.div>

    </div>
  );
}

export default NotFound;