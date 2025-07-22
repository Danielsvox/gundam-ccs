import styles from './Browse.module.css';
import React, { useEffect, useState } from 'react';
import NavBar from '../../Components/NavBar/NavBar';

import AnimatedPage from '../AnimatedPage/AnimatedPage';
import { ReactComponent as Grids } from "../../Resources/image/grid.svg";
import { ReactComponent as Columns } from "../../Resources/image/columns.svg";
import { ReactComponent as BrowseIcon } from "../../Resources/image/browse.svg";
import { ReactComponent as Down } from "../../Resources/image/down.svg";
import Filters from '../../Components/Filters/Filters';
import Grid from '../../Components/Grid/Grid';
import Cart from '../../Components/Cart/Cart';
import Footer from '../../Components/Footer/Footer';
import { useTranslation } from 'react-i18next';

const Browse = props => {
  const { t } = useTranslation();

  const {
    handleHover,
    handleSelect,
    hoverState,
    currentFilter,
    shownGundams,
    setShownGundams,
    clearFilter,
    setReviewDisplay,
    reviewDisplay,
    allGundams,
    handleLike,
    handleHoverGundam,
    cart,
    cartAmount,
    handleAddToCart,
    handleSelectGundam,
    handleSearch,
    handleSearchSubmit,
    search,
    searching,
    browsing,
    handleBrowse,
    handleHome,
    handleOpenCart,
    handleCloseCart,
    cartDisplayed,
    clearCart,
    handleRemoveFromCart,
    handleUpdateQuantity,
    setHoverState,
    openGundamPage,
    getHoverState,
    productsLoading,
    productsError,
    onRetryProducts,
    onCheckout
  } = props;

  const [grid, setGrid] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const categories = [
    { id: "11", name: "High Grade", translationKey: "filters.highGrade" },
    { id: "12", name: "Master Grade", translationKey: "filters.masterGrade" },
    { id: "13", name: "Perfect Grade", translationKey: "filters.perfectGrade" },
    { id: "14", name: "Real Grade", translationKey: "filters.realGrade" },
    { id: "15", name: "Full Mechanics", translationKey: "filters.fullMechanics" },
    { id: "16", name: "Ver.Ka", translationKey: "filters.verKa" }
  ];

  const handleLayoutSwitch = (e) => {
    if (e.target.id === "grid") {
      setGrid(true);
    } else {
      setGrid(false);
    }
  }

  const handleCategorySelect = (category) => {
    handleSelect({ target: { id: category.id } });
    setDropdownOpen(false);
  }

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setDropdownOpen(false);
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest(`.${styles.dropdownContainer}`)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (currentFilter === "none") {
      setShownGundams(allGundams);

    } else if (currentFilter !== "Ratings" && currentFilter !== "Reviews" && currentFilter !== "Wishlist") {
      // Filter by category while maintaining original order
      let filteredShownGundams = allGundams.filter(gundam => gundam.genre === currentFilter);
      setShownGundams(filteredShownGundams);

    } else if (currentFilter === "Ratings") {
      // Only sort by ratings when explicitly requested
      let filteredShownGundams = allGundams.slice(0);
      filteredShownGundams = filteredShownGundams.sort(function (a, b) {
        return b.rating - a.rating;
      })
      setShownGundams(filteredShownGundams);

    } else if (currentFilter === "Reviews") {
      setReviewDisplay(true);

    } else if (currentFilter === "Wishlist") {
      // Filter liked items while maintaining original order
      let filteredShownGundams = allGundams.filter(gundam => gundam.isLiked === true);
      setShownGundams(filteredShownGundams);
    }

    if (currentFilter !== "Reviews") {
      setReviewDisplay(false);
    }
  }, [currentFilter, allGundams]) // Removed setShownGundams and setReviewDisplay from dependencies

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (cartDisplayed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "scroll";
    }
  }, [cartDisplayed])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Reset hover states for elements 0-24 when component mounts
    // Only run this once when the component mounts
    const resetHoverStates = () => {
      let newHoverState = new Map(hoverState);
      for (let i = 0; i < 25; i++) {
        const currentState = newHoverState.get(i.toString()) || { hovered: false, selected: false };
        newHoverState.set(i.toString(), {
          ...currentState,
          hovered: false
        });
      }
      setHoverState(newHoverState);
    };

    resetHoverStates();
  }, []); // Empty dependency array - only run once on mount

  return (
    <section className={styles.Browse} style={{ maxHeight: cartDisplayed ? "100vh" : "1000vh", minHeight: "100vh" }}>
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
        onCheckout={onCheckout}
      /> : null}

      <NavBar
        handleHover={handleHover}
        hoverState={hoverState}
        getHoverState={getHoverState}
        handleBrowse={handleBrowse}
        handleHome={handleHome}
        browsing={browsing}
        landingPage={false}
        cartAmount={cartAmount}
        search={search}
        searching={searching}
        handleSearch={handleSearch}
        handleSearchSubmit={handleSearchSubmit}
        handleOpenCart={handleOpenCart}
      />

      <AnimatedPage exitBeforeEnter>
        <div className={styles.browseContent}>
          <Filters
            hoverState={hoverState}
            getHoverState={getHoverState}
            handleHover={handleHover}
            handleSelect={handleSelect}
            currentFilter={currentFilter}
          />

          <div className={styles.list}>
            <h1>{t('browse.title')}</h1>
            <p>{t('browse.subtitle')}</p>

            <div className={styles.applied}>
              <div className={styles.filterList}>
                <div className={styles.dropdownContainer}>
                  <button
                    className={styles.dropdownButton}
                    onClick={toggleDropdown}
                    onKeyDown={handleKeyDown}
                    aria-label="Select category"
                    aria-expanded={dropdownOpen}
                  >
                    <BrowseIcon className={styles.dropdownIcon} />
                    {currentFilter !== "none" && currentFilter !== "Ratings" && currentFilter !== "Reviews" && currentFilter !== "Wishlist"
                      ? currentFilter
                      : t('filters.categories')
                    }
                    <Down
                      className={styles.dropdownArrow}
                      style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className={styles.dropdownMenu}>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          className={`${styles.dropdownItem} ${currentFilter === category.name ? styles.active : ''}`}
                          onClick={() => handleCategorySelect(category)}
                          aria-label={`Select ${category.name}`}
                        >
                          <BrowseIcon className={styles.dropdownItemIcon} />
                          {t(category.translationKey)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  className={styles.filterButton}
                  aria-label="Current Filter"
                >
                  {t('browse.filterBy')}
                  <span> {currentFilter}</span>
                </button>
                <button
                  className={`${styles.filterButton} ${styles.clearButton}`}
                  onClick={clearFilter}
                  aria-label="Clear Filters"
                >
                  {t('browse.clearFilter')}
                </button>
              </div>

              <div className={styles.displayStyle}>
                <p>{t('browse.displayOptions')}</p>
                <button
                  className={styles.displayBtn}
                  onClick={handleLayoutSwitch}
                  id="grid"
                  aria-label='Display grids'
                >
                  <Grids
                    className={styles.displayItem}
                    style={{ fill: grid ? "#e5e5e5" : "#6f6f6f" }}
                  />
                </button>

                <button
                  className={styles.displayBtn}
                  onClick={handleLayoutSwitch}
                  id="columns"
                  aria-label='Display columns'
                >
                  <Columns
                    className={styles.displayItem}
                    style={{ fill: grid ? "#6f6f6f" : "#e5e5e5" }}
                  />
                </button>
              </div>
            </div>

            <Grid
              shownGundams={shownGundams}
              reviewDisplay={reviewDisplay}
              handleLike={handleLike}
              handleHoverGundam={handleHoverGundam}
              handleAddToCart={handleAddToCart}
              grid={grid}
              search={search}
              searching={searching}
              handleSelectGundam={handleSelectGundam}
              cartDisplayed={cartDisplayed}
              getHoverState={getHoverState}
              loading={productsLoading}
              error={productsError}
              onRetry={onRetryProducts}
            />
          </div>
        </div>
      </AnimatedPage>
      <Footer />
    </section>
  );
}

export default Browse;
