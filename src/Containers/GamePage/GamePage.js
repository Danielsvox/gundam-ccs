import styles from './GamePage.module.css';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import AnimatedGundamPage from '../AnimatedPage/AnimatedGundamPage';
import NavBar from '../../Components/NavBar/NavBar';
import { ReactComponent as Arrow } from "../../Resources/image/arrow.svg";
import { ReactComponent as Up } from "../../Resources/image/up.svg";
import { ReactComponent as Down } from "../../Resources/image/down.svg";
import { ReactComponent as Like } from "../../Resources/image/like.svg";
import Slider from '../../Components/Slider/Slider';
import gundams from '../../utils/gundams';
import AnimatedText from '../AnimatedPage/AnimatedText';
import { ReactComponent as Add } from "../../Resources/image/add.svg";
import AddedToCartBig from '../../Components/AddedToCart/AddedToCartBig';
import Cart from '../../Components/Cart/Cart';
import templateGundam from '../../utils/templateGame';
import { useTranslation } from 'react-i18next';

const GamePage = props => {
  const { t } = useTranslation();

  const {
    handleHover,
    hoverState,
    handleHome,
    landingPage,
    cartAmount,
    cart,
    search,
    searching,
    handleSearch,
    handleSearchSubmit,
    browsing,
    handleBrowse,
    selectedGundam,
    setSelectedGundam,
    allGundams,
    extended,
    setExtended,
    handleAddToCart,
    handleLike,
    textExtended,
    setTextExtended,
    handleOpenCart,
    handleCloseCart,
    cartDisplayed,
    clearCart,
    handleRemoveFromCart,
    openGundamPage
  } = props;

  let { gundamId } = useParams();
  const location = useLocation();
  const [carouselState, setCarouselState] = useState(0);

  const incrementCarousel = (e) => {
    if (carouselState === 3) {
      setCarouselState(0);
    } else {
      setCarouselState(carouselState + 1);
    }
  }

  const decrementCarousel = (e) => {
    if (carouselState === 0) {
      setCarouselState(3);
    } else {
      setCarouselState(carouselState - 1);
    }
  }

  const extendText = () => {
    setTextExtended(!textExtended);
  }

  const handleExtend = (e) => {
    if (document.getElementById("20").innerHTML === "More") {
      document.getElementById("20").className = "aboutBottom";
    } else if (document.getElementById("20").innerHTML === "Hide") {
      document.getElementById("20").className = "aboutBottomClosed";
    }
    setExtended(!extended);
    if (textExtended === false) {
      setTimeout(extendText, 500);
    } else {
      setTextExtended(!textExtended);
    }
  }

  return (
    <>
      <div className={styles.gamepage}>
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

        <AnimatedGundamPage>
          <div className={styles.gamepageContent}>
            <header>
              <button
                style={{ color: hoverState[19].hovered ? "#92f" : "#cccccc" }}
                className={styles.goBack}
                onMouseEnter={handleHover}
                onMouseLeave={handleHover}
                onClick={handleBrowse}
                id="19"
                aria-label='Back'
              >
                <Arrow style={{ fill: hoverState[19].hovered ? "#92f" : "#cccccc" }} className={styles.arrow} />
                {t('gundamPage.store')}
              </button>

              <h1>{selectedGundam ? selectedGundam.name : templateGundam.name}</h1>
            </header>

            <section className={styles.game}>
              {<Slider
                selectedGundam={selectedGundam}
                setSelectedGundam={setSelectedGundam}
                allGundams={allGundams}
                incrementCarousel={incrementCarousel}
                decrementCarousel={decrementCarousel}
                carouselState={carouselState}
                setCarouselState={setCarouselState}
                hoverState={hoverState}
                handleHover={handleHover}
              />}
              <div className={styles.gameInfo}>
                <div className={styles.about}>
                  <div className={styles.aboutTop}>
                    <h2>{t('gundamPage.about')}</h2>
                    <p>{selectedGundam ? selectedGundam.desc : templateGundam.desc}</p>
                  </div>
                  <div
                    className={extended ? `${styles.conditionalOpen} ${styles.aboutBottom}` : `${styles.conditionalClose} ${styles.aboutBottomClosed}`}
                    id="about"
                  >
                    <AnimatedText>
                      <div className={textExtended ? styles.open : styles.closed}>
                        <a href={selectedGundam ? selectedGundam.link : templateGundam.link} target="_blank">{selectedGundam ? selectedGundam.name : "No"} {t('gundamPage.website')}</a>
                        <h4>{t('gundamPage.released')}: {selectedGundam ? selectedGundam.release : templateGundam.release}</h4>
                        <h4>{t('gundamPage.scale')}: {selectedGundam ? selectedGundam.platforms : templateGundam.scale}</h4>
                        <h4>{t('gundamPage.category')}: {selectedGundam ? selectedGundam.genre : templateGundam.category}</h4>
                        <h4>{t('gundamPage.manufacturer')}: {selectedGundam ? selectedGundam.developers : templateGundam.manufacturer}</h4>
                        <h4 className={styles.lastChild}>{t('gundamPage.publisher')}: {selectedGundam ? selectedGundam.publishers : templateGundam.publisher}</h4>
                      </div>
                    </AnimatedText>

                    <button
                      id="20"
                      onClick={handleExtend}
                      onMouseEnter={handleHover}
                      onMouseLeave={handleHover}
                      className={hoverState[20].hovered ? styles.buttonHovered : styles.buttonNotHovered}
                      aria-label="Extend"
                    >
                      {extended ? t('gundamPage.hide') : t('gundamPage.more')}
                      {extended ? <Up className={styles.up} style={{ fill: hoverState[20].hovered ? "#fff" : "#cccccc" }} /> : <Up className={styles.down} style={{ fill: hoverState[20].hovered ? "#fff" : "#cccccc" }} />}
                    </button>
                  </div>
                </div>

                <div className={styles.addToCart}>
                  <div className={styles.infos}>
                    <h3>${selectedGundam ? selectedGundam.price : templateGundam.price}</h3>
                    <button id={selectedGundam ? selectedGundam.id : templateGundam.id} onClick={handleLike} aria-label="Like">
                      <Like
                        className={selectedGundam ? selectedGundam.isLiked ? styles.liked : styles.like : styles.like}
                      />
                    </button>
                  </div>
                  {selectedGundam ? selectedGundam.inCart ? <AddedToCartBig /> :
                    <button
                      id="21"
                      onMouseEnter={handleHover}
                      onMouseLeave={handleHover}
                      className={styles.addToCartButton}
                      style={{ color: hoverState[21].hovered ? "#92f" : "#999999" }}
                      onClick={handleAddToCart}
                      aria-label="Add"
                    >
                      {t('gundamPage.addToCart')}
                      <Add
                        className={styles.add}
                        style={{ fill: hoverState[21].hovered ? "#92f" : "#999999" }}
                      />
                    </button> :

                    <button
                      id="21"
                      onMouseEnter={handleHover}
                      onMouseLeave={handleHover}
                      style={{ color: hoverState[21].hovered ? "#D2042D" : "#999999" }}
                      onClick={handleAddToCart}
                      aria-label="Add"
                    >
                      {t('gundamPage.notAvailable')}
                      <Add
                        className={styles.add}
                        style={{ fill: hoverState[21].hovered ? "#D2042D" : "#999999" }}
                      />
                    </button>}
                </div>
              </div>
            </section>
          </div>
        </AnimatedGundamPage>
      </div>
    </>
  );
}

export default GamePage;