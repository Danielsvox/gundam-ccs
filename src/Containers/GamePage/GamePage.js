import styles from './GamePage.module.css';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AnimatedGundamPage from '../AnimatedPage/AnimatedGundamPage';
import NavBar from '../../Components/NavBar/NavBar';
import { ReactComponent as Arrow } from "../../Resources/image/arrow.svg";
import { ReactComponent as Up } from "../../Resources/image/up.svg";
import { ReactComponent as Like } from "../../Resources/image/like.svg";
import Slider from '../../Components/Slider/Slider';
import AnimatedText from '../AnimatedPage/AnimatedText';
import { ReactComponent as Add } from "../../Resources/image/add.svg";
import AddedToCartBig from '../../Components/AddedToCart/AddedToCartBig';
import Cart from '../../Components/Cart/Cart';
import templateGundam from '../../utils/templateGame';
import { useTranslation } from 'react-i18next';
import productService from '../../services/productService';

const GamePage = props => {
  const { t } = useTranslation();

  const {
    handleHover,
    hoverState,
    getHoverState,
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

  const [carouselState, setCarouselState] = useState(0);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState(null);
  const [detailedProduct, setDetailedProduct] = useState(null);
  const { gundamId } = useParams();

  // Fetch detailed product information when component mounts or slug changes
  useEffect(() => {
    const fetchDetailedProduct = async () => {
      if (!gundamId || gundamId === '404') {
        setDetailedProduct(null);
        return;
      }

      setProductLoading(true);
      setProductError(null);

      try {
        console.log('Fetching detailed product for slug:', gundamId);
        const product = await productService.getProduct(gundamId);
        console.log('Detailed product fetched:', product);
        console.log('Product description:', product?.description);
        console.log('Product desc field:', product?.desc);
        setDetailedProduct(product);
      } catch (error) {
        console.error('Error fetching detailed product:', error);
        setProductError('Failed to load product details');
        setDetailedProduct(null);
      } finally {
        setProductLoading(false);
      }
    };

    fetchDetailedProduct();
  }, [gundamId]);

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

  // Retry function for failed product fetches
  const retryProductFetch = () => {
    setProductError(null);
    if (gundamId && gundamId !== '404') {
      const fetchDetailedProduct = async () => {
        setProductLoading(true);
        try {
          const product = await productService.getProduct(gundamId);
          setDetailedProduct(product);
        } catch (error) {
          console.error('Error retrying product fetch:', error);
          setProductError('Failed to load product details');
        } finally {
          setProductLoading(false);
        }
      };
      fetchDetailedProduct();
    }
  };

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
          getHoverState={getHoverState}
          clearCart={clearCart}
          handleRemoveFromCart={handleRemoveFromCart}
          openGundamPage={openGundamPage}
        /> : null}

        <NavBar
          handleHover={handleHover}
          hoverState={hoverState}
          getHoverState={getHoverState}
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
                style={{ color: getHoverState(19).hovered ? "#92f" : "#cccccc" }}
                className={styles.goBack}
                onMouseEnter={handleHover}
                onMouseLeave={handleHover}
                onClick={handleBrowse}
                id="19"
                aria-label='Back'
              >
                <Arrow style={{ fill: getHoverState(19).hovered ? "#92f" : "#cccccc" }} className={styles.arrow} />
                {t('gundamPage.store')}
              </button>

              <h1>{detailedProduct?.name || selectedGundam?.name || templateGundam.name}</h1>
            </header>

            <section className={styles.game}>
              {<Slider
                selectedGundam={detailedProduct || selectedGundam}
                setSelectedGundam={setSelectedGundam}
                allGundams={allGundams}
                incrementCarousel={incrementCarousel}
                decrementCarousel={decrementCarousel}
                carouselState={carouselState}
                setCarouselState={setCarouselState}
                getHoverState={getHoverState}
                handleHover={handleHover}
              />}
              <div className={styles.gameInfo}>
                <div className={styles.about}>
                  <div className={styles.aboutTop}>
                    <h2>{t('gundamPage.about')}</h2>
                    {productLoading ? (
                      <p>Loading product details...</p>
                    ) : productError ? (
                      <div>
                        <p>Error loading product details. Please try again.</p>
                        <button onClick={retryProductFetch} style={{ marginTop: '10px', padding: '5px 10px' }}>
                          Retry
                        </button>
                      </div>
                    ) : detailedProduct?.description ? (
                      <p>{detailedProduct.description}</p>
                    ) : detailedProduct?.desc ? (
                      <p>{detailedProduct.desc}</p>
                    ) : selectedGundam?.desc ? (
                      <p>{selectedGundam.desc}</p>
                    ) : (
                      <p>{templateGundam.desc}</p>
                    )}
                  </div>
                  <div
                    className={extended ? `${styles.conditionalOpen} ${styles.aboutBottom}` : `${styles.conditionalClose} ${styles.aboutBottomClosed}`}
                    id="about"
                  >
                    <AnimatedText>
                      <div className={textExtended ? styles.open : styles.closed}>
                        <a href={detailedProduct?.link || selectedGundam?.link || templateGundam.link} target="_blank" rel="noreferrer">
                          {detailedProduct?.name || selectedGundam?.name || "No"} {t('gundamPage.website')}
                        </a>
                        <h4>{t('gundamPage.released')}: {detailedProduct?.release || selectedGundam?.release || templateGundam.release}</h4>
                        <h4>{t('gundamPage.scale')}: {detailedProduct?.platforms || selectedGundam?.platforms || templateGundam.scale}</h4>
                        <h4>{t('gundamPage.category')}: {detailedProduct?.genre || selectedGundam?.genre || templateGundam.category}</h4>
                        <h4>{t('gundamPage.manufacturer')}: {detailedProduct?.developers || selectedGundam?.developers || templateGundam.manufacturer}</h4>
                        <h4 className={styles.lastChild}>{t('gundamPage.publisher')}: {detailedProduct?.publishers || selectedGundam?.publishers || templateGundam.publisher}</h4>
                      </div>
                    </AnimatedText>

                    <button
                      id="20"
                      onClick={handleExtend}
                      onMouseEnter={handleHover}
                      onMouseLeave={handleHover}
                      className={getHoverState(20).hovered ? styles.buttonHovered : styles.buttonNotHovered}
                      aria-label="Extend"
                    >
                      {extended ? t('gundamPage.hide') : t('gundamPage.more')}
                      {extended ? <Up className={styles.up} style={{ fill: getHoverState(20).hovered ? "#fff" : "#cccccc" }} /> : <Up className={styles.down} style={{ fill: getHoverState(20).hovered ? "#fff" : "#cccccc" }} />}
                    </button>
                  </div>
                </div>

                <div className={styles.addToCart}>
                  <div className={styles.infos}>
                    <h3>${detailedProduct?.price || selectedGundam?.price || templateGundam.price}</h3>
                    <button id={detailedProduct?.id || selectedGundam?.id || templateGundam.id} onClick={handleLike} aria-label="Like">
                      <Like
                        className={(detailedProduct || selectedGundam)?.isLiked ? styles.liked : styles.like}
                      />
                    </button>
                  </div>
                  {(detailedProduct || selectedGundam)?.inCart ? (
                    <AddedToCartBig />
                  ) : (detailedProduct || selectedGundam)?.in_stock !== false ? (
                    <button
                      id={detailedProduct?.id || selectedGundam?.id || templateGundam.id}
                      onMouseEnter={handleHover}
                      onMouseLeave={handleHover}
                      className={styles.addToCartButton}
                      style={{ color: getHoverState(detailedProduct?.id || selectedGundam?.id || "21").hovered ? "#92f" : "#999999" }}
                      onClick={handleAddToCart}
                      aria-label="Add"
                    >
                      {t('gundamPage.addToCart')}
                      <Add
                        className={styles.add}
                        style={{ fill: getHoverState(detailedProduct?.id || selectedGundam?.id || "21").hovered ? "#92f" : "#999999" }}
                      />
                    </button>
                  ) : (
                    <button
                      id={detailedProduct?.id || selectedGundam?.id || templateGundam.id}
                      onMouseEnter={handleHover}
                      onMouseLeave={handleHover}
                      style={{ color: getHoverState(detailedProduct?.id || selectedGundam?.id || "21").hovered ? "#D2042D" : "#999999" }}
                      onClick={handleAddToCart}
                      aria-label="Add"
                    >
                      {t('gundamPage.notAvailable')}
                      <Add
                        className={styles.add}
                        style={{ fill: getHoverState(detailedProduct?.id || selectedGundam?.id || "21").hovered ? "#D2042D" : "#999999" }}
                      />
                    </button>
                  )}
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