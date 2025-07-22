import styles from './Cart.module.css';
import React, { useState } from 'react';
import { ReactComponent as Right } from "../../Resources/image/arrowRight.svg";
import { ReactComponent as Cross } from "../../Resources/image/cross.svg";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedCart from '../../Containers/AnimatedPage/AnimatedCart';
import AnimatedCard from '../../Containers/AnimatedPage/AnimatedCard';
import { useTranslation } from 'react-i18next';

const Cart = props => {
    const { t } = useTranslation();

    const {
        cartAmount,
        cart,
        handleOpenCart,
        handleCloseCart,
        cartDisplayed,
        handleHover,
        hoverState,
        getHoverState,
        clearCart,
        handleRemoveFromCart,
        handleUpdateQuantity,
        openGundamPage,
        cartError,
        showCartError,
        onCheckout
    } = props;

    // Debug cart data
    console.log('Cart component - cartAmount:', cartAmount);
    console.log('Cart component - cart items:', cart);
    console.log('Cart component - cart items length:', cart?.length);

    const [total, setTotal] = useState(0);

    // Calculate total from cart items
    React.useEffect(() => {
        let newTotal = 0;
        cart.forEach((item) => {
            // Use total_price from the cart item (includes quantity)
            let priceAsNumber = parseFloat(item.total_price || 0);
            newTotal += priceAsNumber;
        });
        setTotal(newTotal.toFixed(2));
    }, [cart]);

    const variants = {
        initial: { x: 100 },
        animate: { x: 0, transition: { x: { type: "spring", duration: 1.2, bounce: 0.4 } } },
        exit: { x: 100, transition: { x: { type: "spring", duration: 1.2, bounce: 0.575 } } },
    }

    return (
        <div className={styles.cartWindow}>
            <div className={styles.back} onClick={handleCloseCart}>

            </div>
            <AnimatedCart>
                <div
                    className={styles.cart}
                    style={{ backgroundColor: "#1A1A1A", height: "100vh" }}
                >
                    <div className={styles.top}>
                        {showCartError && cartError && (
                            <div style={{
                                backgroundColor: '#ff4444',
                                color: 'white',
                                padding: '10px',
                                marginBottom: '10px',
                                borderRadius: '5px',
                                fontSize: '14px'
                            }}>
                                {cartError}
                            </div>
                        )}
                        <div className={styles.topHeader}>
                            <h2>{cartAmount >= 1 ? cartAmount > 1 ? `${cartAmount} ${t('cart.gundams')}` : `1 ${t('cart.gundam')}` : t('cart.noGundams')}</h2>
                            {cartAmount >= 1 && (
                                <button
                                    className={styles.clearCartBtn}
                                    onClick={clearCart}
                                    aria-label="Clear cart"
                                >
                                    {t('cart.clear')}
                                </button>
                            )}
                        </div>

                        <div className={styles.topGundams}>
                            {cart.map((item, i) => {
                                return <motion.div
                                    className={styles.item}
                                    key={item.id}
                                    variants={variants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    <h3
                                        id={item.product?.slug}
                                        onClick={openGundamPage}
                                        title={item.product?.name}
                                    >
                                        {item.product?.name || 'Unknown Product'}
                                        {item.quantity > 1 && <span style={{ color: '#888', fontSize: '0.9em' }}> x{item.quantity}</span>}
                                    </h3>
                                    <div className={styles.itemControls}>
                                        <div className={styles.quantityControls}>
                                            <button
                                                className={styles.quantityBtn}
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 0}
                                                aria-label="Decrease quantity"
                                            >
                                                −
                                            </button>
                                            <span className={styles.quantity}>{item.quantity}</span>
                                            <button
                                                className={styles.quantityBtn}
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                aria-label="Increase quantity"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className={styles.itemPrice}>
                                            ${item.total_price}
                                        </div>
                                    </div>
                                </motion.div>
                            })}
                        </div>
                    </div>

                    <div
                        className={styles.bottom}
                        style={{ width: "87.5%", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    >
                        <h3>{t('cart.total')} ${total}</h3>
                        <button
                            id="24"
                            onMouseEnter={handleHover}
                            onMouseLeave={handleHover}
                            onClick={onCheckout}
                            style={{ color: getHoverState(24).hovered ? "#92f" : "#fff" }}
                            aria-label="Checkout"
                            disabled={cart.length === 0}
                        >
                            {t('cart.checkout')}
                            <Right
                                className={styles.right}
                                style={{ fill: getHoverState(24).hovered ? "#92f" : "#fff" }}
                            />
                        </button>
                    </div>
                </div>
            </AnimatedCart>
        </div>
    );
}

export default Cart;