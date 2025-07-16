import styles from './Card.module.css';
import React from 'react';
import { ReactComponent as Like } from "../../Resources/image/like.svg";
import { ReactComponent as Add } from "../../Resources/image/add.svg";
import { motion } from "framer-motion";
import AddToCart from '../AddToCart/AddToCart';
import AddedToCart from '../AddedToCart/AddedToCart';
import AnimatedCard from '../../Containers/AnimatedPage/AnimatedCard';
import { useLocation } from 'react-router-dom';

const Card = props => {
  const {
    gundam,
    handleAddToCart,
    handleHover,
    hoverState,
    handleLike,
    handleHoverGundam,
    handleSelectGundam
  } = props;

  const variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  }

  const location = useLocation();

  // Only use special positioning classes on the home page
  const isHomePage = location.pathname === '/' || location.pathname === '/react-ecommerce-store';

  const getCardClassName = () => {
    if (!isHomePage) {
      return styles.card;
    }

    if (hoverState[1].selected === false) {
      return styles.card;
    }

    // Special classes only for home page
    if (gundam.id === 26) return styles.fifa;
    if (gundam.id === 12) return styles.tombraider;
    if (gundam.id === 3) return styles.mariokart;
    if (gundam.id === 11) return styles.minecraft;
    return styles.cardHome;
  };

  return (
    <motion.div
      className={getCardClassName()}
      onClick={handleSelectGundam}
      id={gundam.id}
      style={{ margin: 0, padding: 0 }}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <img src={gundam.cover} className={styles.img} alt="Gundam Cover Image" />

      <div className={styles.price}>
        {gundam.inCart ? <AddedToCart /> : <AddToCart
          gundam={gundam}
          handleHoverGundam={handleHoverGundam}
          handleAddToCart={handleAddToCart}
        />
        }
        ${gundam.price}
      </div>
      <h2 className={styles.name} title={gundam.name}>{gundam.name}</h2>
      <button
        className={styles.like}
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