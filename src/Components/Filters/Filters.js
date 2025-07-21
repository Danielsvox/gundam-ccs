import React from "react";
import styles from "./Filters.module.css";
import { ReactComponent as Wishlist } from "../../Resources/image/wishlist.svg";
import { ReactComponent as Ratings } from "../../Resources/image/ratings.svg";
import { ReactComponent as Reviews } from "../../Resources/image/reviews.svg";
import { useTranslation } from 'react-i18next';

const Filters = props => {
  const { t } = useTranslation();

  const {
    getHoverState,
    handleHover,
    handleSelect,
    currentFilter
  } = props;

  return (
    <div className={styles.filters}>
      <h2>{t('filters.title')}</h2>

      <div className={styles.globalFilters}>
        <button
          id="8"
          onMouseEnter={handleHover}
          onMouseLeave={handleHover}
          onClick={handleSelect}
          style={{ backgroundColor: (getHoverState(8).hovered || currentFilter === "Wishlist") ? "#fff" : "#2d2d2d" }}
          className={styles.filter}
        >
          <Wishlist
            className={styles.svg}
            style={{ fill: (getHoverState(8).hovered || currentFilter === "Wishlist") ? "#000000" : "#fff" }}
          />
          {t('filters.wishlist')}
        </button>

        <button
          id="9"
          onMouseEnter={handleHover}
          onMouseLeave={handleHover}
          onClick={handleSelect}
          style={{ backgroundColor: (getHoverState(9).hovered || currentFilter === "Ratings") ? "#fff" : "#2d2d2d" }}
          className={styles.filter}
        >
          <Ratings
            className={styles.svg}
            style={{ fill: (getHoverState(9).hovered || currentFilter === "Ratings") ? "#000000" : "#fff" }}
          />
          {t('filters.ratings')}
        </button>

        <button
          id="10"
          onMouseEnter={handleHover}
          onMouseLeave={handleHover}
          onClick={handleSelect}
          style={{ backgroundColor: (getHoverState(10).hovered || currentFilter === "Reviews") ? "#fff" : "#2d2d2d" }}
          className={styles.filter}
        >
          <Reviews
            className={styles.svg}
            style={{ fill: (getHoverState(10).hovered || currentFilter === "Reviews") ? "#000000" : "#fff" }}
          />
          {t('filters.reviews')}
        </button>
      </div>

      <div className={styles.categoryFilters}>
        <h3>{t('filters.categories')}</h3>

        <button
          id="11"
          onMouseEnter={handleHover}
          onMouseLeave={handleHover}
          onClick={handleSelect}
          style={{ backgroundColor: (getHoverState(11).hovered || currentFilter === "High Grade") ? "#fff" : "#2d2d2d" }}
          className={styles.filter}
        >
          <span className={styles.filterText} style={{ color: (getHoverState(11).hovered || currentFilter === "High Grade") ? "#000000" : "#fff" }}>
            {t('filters.highGrade')}
          </span>
        </button>

        <button
          id="12"
          onMouseEnter={handleHover}
          onMouseLeave={handleHover}
          onClick={handleSelect}
          style={{ backgroundColor: (getHoverState(12).hovered || currentFilter === "Master Grade") ? "#fff" : "#2d2d2d" }}
          className={styles.filter}
        >
          <span className={styles.filterText} style={{ color: (getHoverState(12).hovered || currentFilter === "Master Grade") ? "#000000" : "#fff" }}>
            {t('filters.masterGrade')}
          </span>
        </button>

        <button
          id="13"
          onMouseEnter={handleHover}
          onMouseLeave={handleHover}
          onClick={handleSelect}
          style={{ backgroundColor: (getHoverState(13).hovered || currentFilter === "Perfect Grade") ? "#fff" : "#2d2d2d" }}
          className={styles.filter}
        >
          <span className={styles.filterText} style={{ color: (getHoverState(13).hovered || currentFilter === "Perfect Grade") ? "#000000" : "#fff" }}>
            {t('filters.perfectGrade')}
          </span>
        </button>

        <button
          id="14"
          onMouseEnter={handleHover}
          onMouseLeave={handleHover}
          onClick={handleSelect}
          style={{ backgroundColor: (getHoverState(14).hovered || currentFilter === "Real Grade") ? "#fff" : "#2d2d2d" }}
          className={styles.filter}
        >
          <span className={styles.filterText} style={{ color: (getHoverState(14).hovered || currentFilter === "Real Grade") ? "#000000" : "#fff" }}>
            {t('filters.realGrade')}
          </span>
        </button>

        <button
          id="15"
          onMouseEnter={handleHover}
          onMouseLeave={handleHover}
          onClick={handleSelect}
          style={{ backgroundColor: (getHoverState(15).hovered || currentFilter === "Full Mechanics") ? "#fff" : "#2d2d2d" }}
          className={styles.filter}
        >
          <span className={styles.filterText} style={{ color: (getHoverState(15).hovered || currentFilter === "Full Mechanics") ? "#000000" : "#fff" }}>
            {t('filters.fullMechanics')}
          </span>
        </button>

        <button
          id="16"
          onMouseEnter={handleHover}
          onMouseLeave={handleHover}
          onClick={handleSelect}
          style={{ backgroundColor: (getHoverState(16).hovered || currentFilter === "Ver.Ka") ? "#fff" : "#2d2d2d" }}
          className={styles.filter}
        >
          <span className={styles.filterText} style={{ color: (getHoverState(16).hovered || currentFilter === "Ver.Ka") ? "#000000" : "#fff" }}>
            {t('filters.verKa')}
          </span>
        </button>
      </div>
    </div>
  )
}

export default Filters;