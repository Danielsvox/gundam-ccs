import styles from './AddedToCartBig.module.css';
import React from 'react';
import { ReactComponent as Added } from "../../Resources/image/added.svg";
import AnimatedCard from '../../Containers/AnimatedPage/AnimatedCard';
import { useTranslation } from 'react-i18next';

const AddedToCartBig = props => {
    const { t } = useTranslation();

    const {
        game
    } = props;

    return (
        <AnimatedCard>
            <div className={styles.addToCart}>
                <h2>{t('card.addedToCart')}</h2>
                <Added className={styles.add} />
            </div>
        </AnimatedCard>
    );
}

export default AddedToCartBig;