import styles from './Card.module.css';
import React, { useState, useEffect } from 'react';
import { ReactComponent as Like } from "../../Resources/image/like.svg";
import { motion } from "framer-motion";
import AddToCart from '../AddToCart/AddToCart';
import AddedToCart from '../AddedToCart/AddedToCart';
import { useLocation } from 'react-router-dom';
import { useCurrency } from '../../contexts/CurrencyContext';

const Card = props => {
  const {
    gundam,
    handleHoverGundam,
    handleSelectGundam,
    handleAddToCart,
    handleLike,
    getHoverState
  } = props;

  const { currency, convertAmount, formatPrice } = useCurrency();
  const [convertedPrice, setConvertedPrice] = useState(gundam.price);

  // Convert price when currency changes
  useEffect(() => {
    const convertPrice = async () => {
      if (currency === 'VES') {
        const converted = await convertAmount(gundam.price, 'USD', 'VES');
        setConvertedPrice(converted);
      } else {
        setConvertedPrice(gundam.price);
      }
    };

    convertPrice();
  }, [currency, gundam.price, convertAmount]);

  const variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  }

  const location = useLocation();

  // Only use special positioning classes on the home page
  const isHomePage = location.pathname === '/';

  const getCardClassName = () => {
    if (!isHomePage) {
      return styles.card;
    }

    if (getHoverState(1).selected === false) {
      return styles.card;
    }

    // Special classes only for home page
    if (gundam.id === 26) return styles.fifa;
    if (gundam.id === 12) return styles.tombraider;
    if (gundam.id === 3) return styles.mariokart;
    if (gundam.id === 11) return styles.minecraft;
    return styles.cardHome;
  };

  const handleCardClick = (e) => {
    // Don't navigate if clicking on add to cart or like button
    if (e.target.closest('.addToCart') || e.target.closest('.like')) {
      return;
    }
    handleSelectGundam(e);
  };

  return (
    <motion.div
      className={getCardClassName()}
      onClick={handleCardClick}
      id={gundam.id}
      style={{ margin: 0, padding: 0 }}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <img
        src={gundam.cover || gundam.link || 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop'}
        className={styles.img}
        alt={`${gundam.name} Cover`}
        onError={(e) => {
          e.target.src = 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=500&fit=crop';
        }}
      />

      <div className={styles.price}>
        {gundam.inCart ? <AddedToCart /> : <AddToCart
          gundam={gundam}
          handleHoverGundam={handleHoverGundam}
          handleAddToCart={handleAddToCart}
        />
        }
        {formatPrice(convertedPrice)}
      </div>
      <h2 className={styles.name} title={gundam.name}>{gundam.name}</h2>
      <button
        className={`${styles.like} like`}
        id={gundam.id}
        onClick={handleLike}
        aria-label="Like"
      >
        <Like
          style={{ fill: gundam.isLiked ? "#F53333" : "#cccccc" }}
          className={styles.likeSVG}
        />
      </button>
    </motion.div>
  );
}

export default Card;