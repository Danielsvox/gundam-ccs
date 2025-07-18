import React from "react";
import styles from "./Filters.module.css";
import { ReactComponent as Wishlist } from "../../Resources/image/wishlist.svg";
import { ReactComponent as Ratings } from "../../Resources/image/ratings.svg";
import { ReactComponent as Reviews } from "../../Resources/image/reviews.svg";
import { useTranslation } from 'react-i18next';

const Filters = props => {
  const { t } = useTranslation();

  const {
    hoverState,
    handleHover,
    handleSelect,
    currentFilter
  } = props;

  return (
    <div className={styles.filters}>
      <h2>{t('filters.title')}</h2>

      <div className={styles.globalFilters}>
        <div
          className={styles.filterDiv}
          id="8"
          onMouseEnter={handleHover}
          onMouseLeave={handleHover}
          onClick={handleSelect}
        >
          <button
            className={styles.filterBtn}
            style={{ backgroundColor: (hoverState[8].hovered || currentFilter == "Wishlist") ? "#fff" : "#2d2d2d" }}
            aria-label="Open wishlist"
          >
            <Wishlist
              style={{ fill: (hoverState[8].hovered || currentFilter == "Wishlist") ? "#000000" : "#fff" }}
              className={styles.Wishlist}
            />
          </button>
          {t('filters.wishlist')}
        </div>

        <div
          className={styles.filterDiv}
          id="9"
          onMouseEnter={handleHover}
          onMouseLeave={handleHover}
          onClick={handleSelect}
        >
          <button
            className={`${styles.filterBtn2} ${styles.Ratings}`}
            style={{ backgroundColor: (hoverState[9].hovered || currentFilter == "Ratings") ? "#fff" : "#2d2d2d" }}
            aria-label="Sort after ratings"
          >
            <Ratings
              className={`${styles.filterSVG2} ${styles.Ratings}`}
              style={{ fill: (hoverState[9].hovered || currentFilter == "Ratings") ? "#000000" : "#fff" }}
            />
          </button>
          {t('filters.ratings')}
        </div>

        <div
          className={styles.filterDiv}
          id="10"
          onMouseEnter={handleHover}
          onMouseLeave={handleHover}
          onClick={handleSelect}
        >
          <button
            className={`${styles.filterBtn3} ${styles.Reviews}`}
            style={{ backgroundColor: (hoverState[10].hovered || currentFilter == "Reviews") ? "#fff" : "#2d2d2d" }}
            aria-label="Sort after reviews"
          >
            <Reviews
              className={`${styles.filterSVG3} ${styles.Reviews}`}
              viewBox="0 0 48 48"
              style={{ fill: (hoverState[10].hovered || currentFilter == "Reviews") ? "#000000" : "#fff" }}
            />
          </button>
          {t('filters.reviews')}
        </div>
      </div>
    </div>
  )
}

export default Filters;