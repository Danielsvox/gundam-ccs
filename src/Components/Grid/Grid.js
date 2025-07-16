import styles from './Grid.module.css';
import React, { useEffect } from 'react';
import Card from '../Card/Card';
import AnimatedPage from '../../Containers/AnimatedPage/AnimatedPage';
import { v4 as uuidv4 } from 'uuid';

const Grid = props => {
    const {
        shownGundams,
        reviewDisplay,
        handleLike,
        handleHoverGundam,
        hoverState,
        handleAddToCart,
        grid,
        search,
        searching,
        handleSelectGundam,
        cartDisplayed
    } = props;

    useEffect(() => {
        const gridContainer = document.getElementById('gridContainer');
        if (gridContainer) {
            if (grid === false) {
                // List view
                gridContainer.className = styles.noGrid;
            } else {
                // Grid view
                gridContainer.className = styles.gridContainer;
            }
        }
    }, [grid, styles.noGrid, styles.gridContainer])

    return (
        <>
            <div className={styles.reviews} style={{ display: reviewDisplay ? "flex" : "none" }}>
                <h2>There are no reviews yet!</h2>
                <h3>You can add some, soon.</h3>
            </div>
            <div className={styles.gridContainer} style={{ display: reviewDisplay ? "none" : "grid" }} id="gridContainer">
                {searching === false ? cartDisplayed ? shownGundams.map((gundam, i) => {
                    if (i <= 7) {
                        return <Card
                            gundam={gundam}
                            key={gundam.name}
                            handleLike={handleLike}
                            handleHoverGundam={handleHoverGundam}
                            handleAddToCart={handleAddToCart}
                            handleSelectGundam={handleSelectGundam}
                            hoverState={hoverState}
                        />
                    }
                    return null;
                }) : shownGundams.map((gundam, i) => {
                    return <Card
                        gundam={gundam}
                        key={gundam.name}
                        handleLike={handleLike}
                        handleHoverGundam={handleHoverGundam}
                        handleAddToCart={handleAddToCart}
                        handleSelectGundam={handleSelectGundam}
                        hoverState={hoverState}
                    />
                }) : shownGundams.map((gundam, i) => {
                    if (gundam.name.toLowerCase().includes(search.toLowerCase())) {
                        return <Card
                            gundam={gundam}
                            key={gundam.name}
                            handleLike={handleLike}
                            handleHoverGundam={handleHoverGundam}
                            handleAddToCart={handleAddToCart}
                            handleSelectGundam={handleSelectGundam}
                            hoverState={hoverState}
                        />
                    }
                    return null;
                })}
            </div>
        </>
    );
}

export default Grid;