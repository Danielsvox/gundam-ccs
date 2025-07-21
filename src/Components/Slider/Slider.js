import styles from './Slider.module.css';
import React, { useEffect } from 'react';
import { ReactComponent as Left } from "../../Resources/image/left.svg";
import { ReactComponent as Right } from "../../Resources/image/right.svg";
import { useLocation } from 'react-router-dom';
import "react-slideshow-image/dist/styles.css";
import { Slide } from "react-slideshow-image";
import templateGundam from '../../utils/templateGame';

const Slider = props => {
  const {
    selectedGundam,
    setSelectedGundam,
    allGundams,
    carouselState,
    setCarouselState,
    getHoverState,
    handleHover
  } = props;

  const slideRef = React.createRef();
  const location = useLocation();

  useEffect(() => {
    const selectedGundamIndex = allGundams.findIndex(gundam => "/gundams/" + gundam.surname === location.pathname);
    if (selectedGundamIndex !== -1) {
      setSelectedGundam(allGundams[selectedGundamIndex]);
    }
  }, [allGundams, location.pathname, setSelectedGundam]);

  const properties = {
    duration: 6000,
    autoplay: false,
    transitionDuration: 800,
    arrows: false,
    infinite: true,
    easing: "ease"
  };

  const slideImages = [
    selectedGundam ? selectedGundam.footage[0] : null,
    selectedGundam ? selectedGundam.footage[1] : null,
    selectedGundam ? selectedGundam.footage[2] : null,
    selectedGundam ? selectedGundam.footage[3] : null,
  ];

  const templateImages = [
    templateGundam.footage[0],
    templateGundam.footage[1],
    templateGundam.footage[2],
    templateGundam.footage[3]
  ]

  const back = () => {
    if (carouselState > 0) {
      setCarouselState(carouselState - 1);
    } else {
      setCarouselState(3);
    }
    slideRef.current.goBack();
  }

  const next = () => {
    if (carouselState < 3) {
      setCarouselState(carouselState + 1);
    } else {
      setCarouselState(0);
    }
    slideRef.current.goNext();
  }

  const jumpToIndex = (e) => {
    console.log(e.target.id);
    let index = parseInt(e.target.id);
    console.log(index);
    setCarouselState(index);
    slideRef.current.goTo(index);
  }

  return (
    <div className={styles.slider}>
      <Slide ref={slideRef} {...properties}>
        {selectedGundam ? slideImages.map((each, index) => (
          <div
            key={index}
            className={styles.slide}
          >
            <img
              className={styles.currentImg}
              src={each}
              alt="sample"
            />
          </div>
        )) : templateImages.map((each, index) => (
          <div
            key={index}
            className={styles.slide}
          >
            <img
              className={styles.currentImg}
              src={each}
              alt="sample"
            />
          </div>
        ))}
      </Slide>

      <button
        className={styles.backwards}
        onClick={back}
        id="22"
        onMouseEnter={handleHover}
        onMouseLeave={handleHover}
        aria-label="Previous Picture"
      >
        <Left
          className={styles.left}
          style={{ fill: getHoverState(22).hovered ? "#fff" : "#ccc" }}
        />
      </button>

      <button
        className={styles.forward}
        onClick={next} id="23"
        onMouseEnter={handleHover}
        onMouseLeave={handleHover}
        aria-label="Next Picture"
      >
        <Right
          className={styles.right}
          style={{ fill: getHoverState(23).hovered ? "#fff" : "#ccc" }}
        />
      </button>
      <div className={styles.selectorContainer}>
        <button
          id="0"
          onClick={jumpToIndex}
          className={carouselState === 0 ? styles.buttonSelected : styles.button}
          aria-label="Jump to picture"
        >
        </button>
        <button
          id="1"
          onClick={jumpToIndex}
          className={carouselState === 1 ? styles.buttonSelected : styles.button}
          aria-label="Jump to picture"
        >
        </button>
        <button
          id="2"
          onClick={jumpToIndex}
          className={carouselState === 2 ? styles.buttonSelected : styles.button}
          aria-label="Jump to picture"
        >
        </button>
        <button
          id="3"
          onClick={jumpToIndex}
          className={carouselState === 3 ? styles.buttonSelected : styles.button}
          aria-label="Jump to picture"
        >
        </button>
      </div>
    </div>
  );
}

export default Slider;