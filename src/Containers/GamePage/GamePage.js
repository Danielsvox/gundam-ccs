import styles from './GamePage.module.css';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import AnimatedGamePage from '../AnimatedPage/AnimatedGamePage';
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
import templateGame from '../../utils/templateGame';

const GamePage = props => {
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

        <AnimatedGamePage>
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
                Store
              </button>

              <h1>{selectedGundam ? selectedGundam.name : templateGame.name}</h1>
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
                    <h2>About</h2>
                    <p>{selectedGundam ? selectedGundam.desc : templateGame.desc}</p>
                  </div>
                  <div
                    className={extended ? `${styles.conditionalOpen} ${styles.aboutBottom}` : `${styles.conditionalClose} ${styles.aboutBottomClosed}`}
                    id="about"
                  >
                    <AnimatedText>
                      <div className={textExtended ? styles.open : styles.closed}>
                        <a href={selectedGundam ? selectedGundam.link : templateGame.link} target="_blank">{selectedGundam ? selectedGundam.name : "No"} Website</a>
                        <h4>Released: {selectedGundam ? selectedGundam.release : templateGame.release}</h4>
                        <h4>Platforms: {selectedGundam ? selectedGundam.platforms : templateGame.platforms}</h4>
                        <h4>Main Genre: {selectedGundam ? selectedGundam.genre : templateGame.genre}</h4>
                        <h4>Developers: {selectedGundam ? selectedGundam.developers : templateGame.developers}</h4>
                        <h4 className={styles.lastChild}>Publishers: {selectedGundam ? selectedGundam.publishers : templateGame.publishers}</h4>
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
                      {extended ? "Hide" : "More"}
                      {extended ? <Up className={styles.up} style={{ fill: hoverState[20].hovered ? "#fff" : "#cccccc" }} /> : <Up className={styles.down} style={{ fill: hoverState[20].hovered ? "#fff" : "#cccccc" }} />}
                    </button>
                  </div>
                </div>

                <div className={styles.addToCart}>
                  <div className={styles.infos}>
                    <h3>${selectedGundam ? selectedGundam.price : templateGame.price}</h3>
                    <button id={selectedGundam ? selectedGundam.id : templateGame.id} onClick={handleLike} aria-label="Like">
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
                      Add to cart
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
                      Not available
                      <Add
                        className={styles.add}
                        style={{ fill: hoverState[21].hovered ? "#D2042D" : "#999999" }}
                      />
                    </button>}
                </div>
              </div>
            </section>
          </div>
        </AnimatedGamePage>
      </div>
    </>
  );
}

export default GamePage;