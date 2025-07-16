import styles from './AddToCart.module.css';
import React from 'react';
import { ReactComponent as Add } from "../../Resources/image/add.svg";
import AnimatedCardNoInit from '../../Containers/AnimatedPage/AnimatedCardNoInit';

const AddToCart = props => {
  const {
    gundam,
    handleHoverGundam,
    handleAddToCart
  } = props;

  return (
    <div className={styles.addToCart} onMouseEnter={handleHoverGundam} onMouseLeave={handleHoverGundam} id={gundam.id} onClick={handleAddToCart}>
      <h4 style={{ color: gundam.isHovered ? "#92f" : "#999" }}>Add to cart</h4>
      <Add className={styles.add} style={{ fill: gundam.isHovered ? "#92f" : "#999" }} />
    </div>
  );
}

export default AddToCart;