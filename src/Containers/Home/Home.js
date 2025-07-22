import React, { useState } from 'react';
import styles from './Home.module.css';
import NavBar from '../../Components/NavBar/NavBar';
import { ReactComponent as GitHubLogo } from "../../Resources/image/githublogo.svg";
import { ReactComponent as Enter } from "../../Resources/image/enter.svg";
import { ReactComponent as Dice } from "../../Resources/image/dice.svg";
import { ReactComponent as LinkedIn } from "../../Resources/image/linkedin.svg";
import { ReactComponent as Browse } from "../../Resources/image/browse.svg";
import { ReactComponent as NotFound } from "../../Resources/image/notfound.svg";
import { ReactComponent as NotFoundQuery } from "../../Resources/image/notfoundquery.svg";
import { ReactComponent as Git } from "../../Resources/image/git.svg";
import { ReactComponent as Performance } from "../../Resources/image/performance.svg";
import { ReactComponent as Sources } from "../../Resources/image/sources.svg";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import Cart from '../../Components/Cart/Cart';

import { useTranslation } from 'react-i18next';

const Home = props => {
  const { t } = useTranslation();

  const {
    cartAmount,
    cart,
    cartDisplayed,
    handleOpenCart,
    handleCloseCart,
    clearCart,
    handleRemoveFromCart,
    hoverState,
    getHoverState,
    handleHover,
    overlap,
    setOverlap,
    openGundamPage,
    allGundams,
    cartError,
    showCartError,
    handleUpdateQuantity,
    onCheckout
  } = props;

  const [browsing, setBrowsing] = useState(false);
  const [landingPage] = useState(true);

  const navigate = useNavigate();

  const handleBrowse = () => {
    setOverlap(true);
    setTimeout(() => {
      setBrowsing(true);
      navigate('/browse');
    }, 1500);
  }

  const handleHome = () => {
    setBrowsing(false);
    navigate('/');
  }

  const handleNavGundamPage = () => {
    navigate('/gundams/rx78-2');
  }

  const handleNavNotFoundPage = () => {
    navigate('/this-page');
  }

  const handleNavNotFoundQuery = () => {
    navigate('/gundams/404');
  }

  const handlePlayDice = () => {
    if (allGundams.length > 0) {
      let randomIndex = Math.floor(Math.random() * allGundams.length);
      let randomSurname = allGundams[randomIndex].surname;
      setOverlap(true);
      setTimeout(() => {
        setBrowsing(true);
        navigate(`/gundams/${randomSurname}`);
      }, 1500);
    }
  }

  const buttonVariants = {
    hidden: { opacity: 0, y: 900 },
    visible: { opacity: 1, y: 0, transition: { y: { type: "tween", duration: 1.5, bounce: 0.3 } } },
  }

  return (
    <div className={styles.main}>
      {overlap ?
        <motion.div
          className={styles.overlap}
          variants={buttonVariants}
          initial="hidden"
          animate="visible"
        >

        </motion.div>
        : null}

      {cartDisplayed ? <Cart
        cartDisplayed={cartDisplayed}
        handleOpenCart={handleOpenCart}
        handleCloseCart={handleCloseCart}
        cart={cart}
        cartAmount={cartAmount}
        handleHover={handleHover}
        hoverState={hoverState}
        getHoverState={getHoverState}
        clearCart={clearCart}
        handleRemoveFromCart={handleRemoveFromCart}
        handleUpdateQuantity={handleUpdateQuantity}
        openGundamPage={openGundamPage}
        cartError={cartError}
        showCartError={showCartError}
        onCheckout={onCheckout}
      /> : null}
      <div className={styles.home}>

        <div className={styles.backgroundImage}></div>

        <NavBar
          handleHover={handleHover}
          hoverState={hoverState}
          getHoverState={getHoverState}
          browsing={browsing}
          handleBrowse={handleBrowse}
          handleHome={handleHome}
          landingPage={landingPage}
          cartAmount={cartAmount}
          handleOpenCart={handleOpenCart}
          handleCloseCart={handleCloseCart}
        />
        <div className={styles.container}>
          <div className={styles.left}>
            <div className={styles.splash}>
              <h1>{t('home.title')}</h1>
              <p className={styles.intro}>{t('home.subtitle')}</p>
            </div>

            <div className={styles.buttons}>
              <button className={`${styles.cta} ${styles.browseBtn}`} onClick={handleBrowse} aria-label={t('home.browse')}>
                <Enter className={styles.ctaSVG} />
                {t('home.browse')}
              </button>
              <button className={styles.cta} onClick={handlePlayDice} aria-label={t('home.playDice')}>
                <Dice className={styles.ctaSVG} />
                {t('home.playDice')}
              </button>
              <a href="https://github.com/Danielsvox" target="_blank" rel="noreferrer"><button className={styles.cta} aria-label="View Repository">
                <GitHubLogo className={styles.ctaSVG} />
                {t('home.github')}
              </button></a>
              <a href="https://www.linkedin.com/in/carlos-daniel-441685161/" target="_blank" rel="noreferrer"><button className={`${styles.cta} ${styles.lastChild}`} aria-label="Open LinkedIn">
                <LinkedIn className={`${styles.ctaSVG} ${styles.linkedin}`} />
                <span>{t('home.linkedin')}</span>
              </button></a>
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.buttonsRight}>
              <h2>{t('home.quickNav')}</h2>
              <button className={styles.cta} onClick={handleNavGundamPage} aria-label="Open a gundam page">
                <Browse className={styles.ctaSVG} />
                {t('home.gundamPage')}
              </button>
              <button className={styles.cta} onClick={handleNavNotFoundPage} aria-label="Open 404 page">
                <NotFound className={styles.ctaSVG} />
                {t('home.notFoundPage')}
              </button>
              <button className={`${styles.cta} ${styles.lastChild}`} onClick={handleNavNotFoundQuery} aria-label="open 404 query page">
                <NotFoundQuery className={`${styles.ctaSVG}`} />
                {t('home.notFoundQuery')}
              </button>
              <a href='https://github.com/Danielsvox/gundam-ccs/commits/main' target="_blank" rel="noreferrer"><button className={styles.cta} aria-label="Open commit log">
                <Git className={styles.ctaSVG} />
                {t('home.commitLog')}
              </button></a>
              <a href="https://github.com/Danielsvox/gundam-ccs/blob/main/README.md#performance" target="_blank" rel="noreferrer"><button className={`${styles.cta} ${styles.lastChild}`} aria-label="Open performance test results">
                <Performance className={`${styles.ctaSVG}`} />
                {t('home.performance')}
              </button></a>
              <a href="https://github.com/Danielsvox/gundam-ccs/blob/main/README.md#technologies-used" target="_blank" rel="noreferrer"><button className={`${styles.cta} ${styles.lastChild}`} aria-label="View technologies used">
                <img className={styles.technologies} src={require("../../Resources/image/whatruns.png")} alt="WhatRuns logo" />
                {t('home.technologies')}
              </button></a>
              <a href="https://github.com/Danielsvox/gundam-ccs/blob/main/README.md#sources" target="_blank" rel="noreferrer"><button className={`${styles.cta} ${styles.lastChild}`} aria-label="View Sources">
                <Sources className={`${styles.ctaSVG}`} />
                {t('home.sources')}
              </button></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;