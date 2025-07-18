import styles from './AddedToCart.module.css';
import React from 'react';
import { ReactComponent as Added } from "../../Resources/image/added.svg";
import AnimatedCard from '../../Containers/AnimatedPage/AnimatedCard';
import { useTranslation } from 'react-i18next';

const AddedToCart = props => {
    const { t } = useTranslation();

    const {
        game
    } = props;

    return (
        <AnimatedCard>
            <div className={styles.addToCart}>
                <h4>{t('card.addedToCart')}</h4>
                <Added className={styles.add} />
            </div>
        </AnimatedCard>
    );
}

export default AddedToCart;