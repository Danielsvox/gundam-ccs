import React, { useState } from 'react';
import styles from './Home.module.css';
import NavBar from '../../Components/NavBar/NavBar';
import { ReactComponent as GitHubLogo } from "../../Resources/image/githublogo.svg";
import { ReactComponent as Enter } from "../../Resources/image/enter.svg";
import { ReactComponent as Dice } from "../../Resources/image/dice.svg";
import { ReactComponent as LinkedIn } from "../../Resources/image/linkedin.svg";
import { ReactComponent as Game } from "../../Resources/image/game.svg";
import { ReactComponent as NotFound } from "../../Resources/image/notfound.svg";
import { ReactComponent as NotFoundQuery } from "../../Resources/image/notfoundquery.svg";
import { ReactComponent as Git } from "../../Resources/image/git.svg";
import { ReactComponent as Performance } from "../../Resources/image/performance.svg";
import { ReactComponent as Sources } from "../../Resources/image/sources.svg";
import { motion, AnimatePresence, m } from "framer-motion";
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Cart from '../../Components/Cart/Cart';
import AnimatedScroll from '../AnimatedPage/AnimatedScroll';
import gundams from '../../utils/gundams';
import { useTranslation } from 'react-i18next';

const Home = props => {
  const { t } = useTranslation();

  const {
    shownGundams,
    cartAmount,
    cart,
    cartDisplayed,
    handleOpenCart,
    handleCloseCart,
    clearCart,
    handleRemoveFromCart,
    hoverState,
    setHoverState,
    overlap,
    setOverlap,
    openGundamPage
  } = props;

  const [browsing, setBrowsing] = useState(false);
  const [landingPage, setLandingPage] = useState(true);

  const navigate = useNavigate();

  const handleHover = (e) => {
    let newHoverState = hoverState[e.target.id];
    newHoverState.hovered = !newHoverState.hovered;

    setHoverState([
      ...hoverState, hoverState[e.target.id] = newHoverState
    ]);
  }

  const handleBrowse = () => {
    setOverlap(true);
    setTimeout(() => {
      setBrowsing(true);
      navigate('/react-ecommerce-store/browse');
    }, 1500);
  }

  const handleHome = () => {
    setBrowsing(false);
    navigate('/');
  }

  const handleNavGundamPage = () => {
    setHoverState([...hoverState, hoverState[21].hovered = false]);
    navigate('/react-ecommerce-store/gundams/rx78-2');
  }

  const handleNavNotFoundPage = () => {
    navigate('/react-ecommerce-store/this-page');
  }

  const handleNavNotFoundQuery = () => {
    navigate('/react-ecommerce-store/gundams/404');
  }

  const handlePlayDice = () => {
    let randomIndex = Math.floor(Math.random() * 10);
    let randomSurname = gundams[randomIndex].surname;
    setOverlap(true);
    setTimeout(() => {
      setBrowsing(true);
      navigate(`/react-ecommerce-store/gundams/${randomSurname}`);
    }, 1500);
  }

  const variants = {
    hidden: { opacity: 1, x: -150 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 150 },
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
        clearCart={clearCart}
        handleRemoveFromCart={handleRemoveFromCart}
        openGamePage={openGundamPage}
      /> : null}
      <div className={styles.home}>

        <div className={styles.backgroundImage}></div>

        <NavBar
          handleHover={handleHover}
          hoverState={hoverState}
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
              <a href="https://github.com/gianlucajahn/react-ecommerce-store" target="_blank"><button className={styles.cta} aria-label="View Repository">
                <GitHubLogo className={styles.ctaSVG} />
                {t('home.github')}
              </button></a>
              <a href="https://www.linkedin.com/in/gianlucajahn/" target="_blank"><button className={`${styles.cta} ${styles.lastChild}`} aria-label="Open LinkedIn">
                <LinkedIn className={`${styles.ctaSVG} ${styles.linkedin}`} />
                <span>{t('home.linkedin')}</span>
              </button></a>
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.buttonsRight}>
              <h2>{t('home.quickNav')}</h2>
              <button className={styles.cta} onClick={handleNavGundamPage} aria-label="Open a gundam page">
                <Game className={styles.ctaSVG} />
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
              <a href='https://github.com/gianlucajahn/react-ecommerce-store/commits/main' target="_blank"><button className={styles.cta} aria-label="Open commit log">
                <Git className={styles.ctaSVG} />
                {t('home.commitLog')}
              </button></a>
              <a href="https://github.com/gianlucajahn/react-ecommerce-store/blob/main/README.md#performance" target="_blank"><button className={`${styles.cta} ${styles.lastChild}`} aria-label="Open performance test results">
                <Performance className={`${styles.ctaSVG}`} />
                {t('home.performance')}
              </button></a>
              <a href="https://github.com/gianlucajahn/react-ecommerce-store/blob/main/README.md#technologies-used" target="_blank"><button className={`${styles.cta} ${styles.lastChild}`} aria-label="View technologies used">
                <img className={styles.technologies} src={require("../../Resources/image/whatruns.png")} alt="WhatRuns logo" />
                {t('home.technologies')}
              </button></a>
              <a href="https://github.com/gianlucajahn/react-ecommerce-store/blob/main/README.md#sources" target="_blank"><button className={`${styles.cta} ${styles.lastChild}`} aria-label="View Sources">
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