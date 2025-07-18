import styles from './AddToCart.module.css';
import React from 'react';
import { ReactComponent as Add } from "../../Resources/image/add.svg";
import AnimatedCardNoInit from '../../Containers/AnimatedPage/AnimatedCardNoInit';
import { useTranslation } from 'react-i18next';

const AddToCart = props => {
  const { t } = useTranslation();

  const {
    gundam,
    handleHoverGundam,
    handleAddToCart
  } = props;

  return (
    <div className={styles.addToCart} onMouseEnter={handleHoverGundam} onMouseLeave={handleHoverGundam} id={gundam.id} onClick={handleAddToCart}>
      <h4 style={{ color: gundam.isHovered ? "#92f" : "#999" }}>{t('card.addToCart')}</h4>
      <Add className={styles.add} style={{ fill: gundam.isHovered ? "#92f" : "#999" }} />
    </div>
  );
}

export default AddToCart;