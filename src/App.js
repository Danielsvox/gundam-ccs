import logo from './logo.svg';
import styles from './App.module.css';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import Browse from './Containers/Browse/Browse';
import GamePage from './Containers/GamePage/GamePage';
import NotFound from './Containers/NotFound/NotFound';
import Home from './Containers/Home/Home';
import { AnimatePresence } from "framer-motion";
import filterNames from './utils/filterNames';
import gundams from './utils/gundams';
import templateGame from './utils/templateGame';

function App() {
  const [currentFilter, setCurrentFilter] = useState("none");
  const [allGundams, setAllGundams] = useState(gundams);
  const [cart, setCart] = useState([]);
  const [cartAmount, setCartAmount] = useState(0);
  const [shownGundams, setShownGundams] = useState(allGundams);
  const [reviewDisplay, setReviewDisplay] = useState(false);
  const [cartDisplayed, setCartDisplayed] = useState(false);
  const [search, setSearch] = useState("");
  const [overlap, setOverlap] = useState(false);
  const [searching, setSearching] = useState(false);
  const [browsing, setBrowsing] = useState(true);
  const [selectedGundam, setSelectedGundam] = useState(false);
  const [extended, setExtended] = useState(false);
  const [textExtended, setTextExtended] = useState(false);
  const [hoverState, setHoverState] = useState([
    {
      hovered: false,
      selected: false
    },
    {
      hovered: false,
      selected: false
    },
    {
      hovered: false,
      selected: false
    },
    {
      hovered: false,
      selected: false
    },
    {
      hovered: false,
      selected: false
    },
    {
      hovered: false,
      selected: false
    },
    {
      hovered: false,
      selected: false
    },
    {
      hovered: false,
      selected: false
    },
    {
      hovered: false,
      selected: false
    },
    {
      hovered: false,
      selected: false
    },
    {
      hovered: false,
      selected: false
    },
    {
      hovered: false,
      selected: false
    },
    {
      hovered: false,
      selected: false
    },
    {
      hovered: false,
      selected: false
    },
    {
      hovered: false,
      selected: false
    },
    {
      hovered: false,
      selected: false
    },
    {
      hovered: false,
      selected: false
    },
    {
      hovered: false,
      selected: false
    },
    {
      hovered: false,
      selected: false
    },
    {
      hovered: false,
      selected: false
    },
    {
      hovered: false,
      selected: false
    },
    {
      hovered: false,
      selected: false
    },
    {
      hovered: false,
      selected: false
    },
    {
      hovered: false,
      selected: false
    },
    {
      hovered: false,
      selected: false
    }
  ]);

  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname != "/react-ecommerce-store/" && location.pathname != "/react-ecommerce-store/browse" && selectedGundam === false) {
    let surname = location.pathname.substring(29);
    console.log("test");
    let currentGundam = gundams.find(gundam => gundam.surname === surname);
    if (currentGundam != undefined) {
      setSelectedGundam(currentGundam);
    } else {
      setSelectedGundam(templateGame);
    }
  }

  async function handleBrowse() {
    setExtended(false);
    setTextExtended(false);
    setCartDisplayed(false);
    setHoverState([...hoverState, hoverState[21].hovered = false]);
    navigate('/react-ecommerce-store/browse');
  }

  const handleHome = () => {
    setExtended(false);
    setTextExtended(false);
    setCartDisplayed(false);
    setHoverState([...hoverState, hoverState[21].hovered = false]);
    navigate('/react-ecommerce-store/');
  }

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setSearching(false);
  }

  const handleSearchSubmit = (e) => {
    setCurrentFilter("none");
    e.preventDefault();
    setSearching(true);

    if (location.pathname != "/react-ecommerce-store/browse") {
      navigate('/react-ecommerce-store/browse');
    }
  }

  const handleSelect = (e) => {
    setCurrentFilter(filterNames[e.target.id - 8]);
  }

  const handleSelectGundam = (e) => {
    if (e.target.tagName === "BUTTON") {
      return
    } else if (e.target.classList[0] != "AddToCart_addToCart__zbJPe") {
      setSelectedGundam(gundams[e.target.parentNode.id]);
      navigate(`/react-ecommerce-store/gundams/${gundams[e.target.parentNode.id].surname}`);
    }
  }

  const handleLike = (e) => {
    let handledLike = allGundams.map((gundam, i) => {
      if (e.target.id == i) {
        gundam.isLiked = !gundam.isLiked
        return gundam
      } else {
        return gundam;
      }
    });

    setAllGundams(handledLike);
  }

  const clearFilter = () => {
    setCurrentFilter("none");
    setSearch("");
    setReviewDisplay(false);
  }

  const openGundamPage = (e) => {
    setCartDisplayed(false);
    let selectedGundamSurname = e.target.id;
    navigate(`/react-ecommerce-store/gundams/${selectedGundamSurname}`);
  }

  const handleHover = (e) => {
    if (hoverState[e.target.id].selected) {
      return;
    }

    let newHoverState = hoverState.map((element, i) => {
      if (e.target.id == i) {
        element.hovered = !element.hovered;
        return element
      } else {
        return element;
      }
    });

    setHoverState(newHoverState);
  }

  const handleHoverGundam = (e) => {
    let handledHoveredGundam = allGundams.map((gundam, i) => {
      if (e.target.id == i) {
        gundam.isHovered = !gundam.isHovered
        return gundam
      } else {
        return gundam;
      }
    });

    setAllGundams(handledHoveredGundam);
  }

  const handleAddToCart = (e) => {
    let handledAddedGundam = allGundams.map((gundam, i) => {
      if (location.pathname === "/react-ecommerce-store/browse") {
        if (e.target.id == i) {
          gundam.inCart = true
          let newCart = cart;
          newCart.push(gundam);
          setCart(newCart);
          setCartAmount(cartAmount + 1);
          return gundam
        } else {
          return gundam;
        }
      } else {
        if (selectedGundam.id == i) {
          gundam.inCart = true
          let newCart = cart;
          newCart.push(gundam);
          setCart(newCart);
          setCartAmount(cartAmount + 1);
          return gundam
        } else {
          return gundam;
        }
      }
    });

    setAllGundams(handledAddedGundam);
  }

  const clearCart = () => {
    setCart([]);
    setCartAmount(0);
    const defaultGundams = allGundams.map((gundam, i) => {
      gundam.inCart = false;
      gundam.isHovered = false;
      return gundam;
    });
    setAllGundams(defaultGundams);
    let newHoverState = hoverState[21];
    newHoverState.hovered = false;
    setHoverState([
      ...hoverState, hoverState[21] = newHoverState
    ]);
  }

  const handleRemoveFromCart = (e) => {
    let removedIndex = cart.findIndex(gundam => gundam.id == e.target.id);
    let newAllGundams = allGundams.map((gundam, i) => {
      if (gundam.id == e.target.id) {
        gundam.inCart = false;
        gundam.isHovered = false;
        return gundam;
      } else {
        return gundam;
      }
    });
    setAllGundams(newAllGundams);
    let firstHalf = cart.slice(0, removedIndex);
    let secondHalf = cart.slice(removedIndex + 1);
    let addedUp = firstHalf.concat(secondHalf);
    setCart(addedUp);
    setCartAmount(cartAmount - 1)
    setHoverState([...hoverState, hoverState[21].hovered = false]);
  }

  useEffect(() => {
    setOverlap(false);

    if (location.pathname === "/react-ecommerce-store/") {
      setBrowsing(false);
    } else {
      setBrowsing(true);
    }

    if (location.pathname != "/react-ecommerce-store/browse") {
      document.body.style.overflow = "hidden";

    } else if (location.pathname === "/react-ecommerce-store/browse") {
      document.body.style.overflow = "scroll";
    }
  }, [location.pathname])

  const handleOpenCart = () => {
    setCartDisplayed(true);
  }

  const handleCloseCart = () => {
    setCartDisplayed(false);
  }

  useEffect(() => {
    console.log(selectedGundam);
  }, [selectedGundam])

  useEffect(() => {
    if (cartDisplayed) {
      document.body.style.overflow = "hidden !important";
    } else {
      document.body.style.overflow = "scroll !important";
    }
  }, [cartDisplayed])

  return (
    <AnimatePresence exitBeforeEnter>
      <Routes key={location.pathname} location={location}>
        <Route path="/react-ecommerce-store/" element={<Home
          handleHover={handleHover}
          hoverState={hoverState}
          shownGundams={shownGundams}
          cart={cart}
          cartAmount={cartAmount}
          cartDisplayed={cartDisplayed}
          handleOpenCart={handleOpenCart}
          handleCloseCart={handleCloseCart}
          clearCart={clearCart}
          handleAddToCart={handleAddToCart}
          handleLike={handleLike}
          handleHoverGundam={handleHoverGundam}
          handleSelectGundam={handleSelectGundam}
          handleRemoveFromCart={handleRemoveFromCart}
          setHoverState={setHoverState}
          overlap={overlap}
          setOverlap={setOverlap}
          openGundamPage={openGundamPage}
        />} />
        <Route path="/react-ecommerce-store/browse" element={<Browse
          cart={cart}
          cartAmount={cartAmount}
          handleHover={handleHover}
          handleSelect={handleSelect}
          hoverState={hoverState}
          currentFilter={currentFilter}
          shownGundams={shownGundams}
          setShownGundams={setShownGundams}
          clearFilter={clearFilter}
          reviewDisplay={reviewDisplay}
          setReviewDisplay={setReviewDisplay}
          allGundams={allGundams}
          setAllGundams={setAllGundams}
          handleLike={handleLike}
          handleHoverGundam={handleHoverGundam}
          handleAddToCart={handleAddToCart}
          handleSelectGundam={handleSelectGundam}
          handleSearch={handleSearch}
          handleSearchSubmit={handleSearchSubmit}
          search={search}
          searching={searching}
          browsing={browsing}
          handleBrowse={handleBrowse}
          handleHome={handleHome}
          cartDisplayed={cartDisplayed}
          handleOpenCart={handleOpenCart}
          handleCloseCart={handleCloseCart}
          clearCart={clearCart}
          handleRemoveFromCart={handleRemoveFromCart}
          setHoverState={setHoverState}
          openGundamPage={openGundamPage}
        />} />
        <Route path="/react-ecommerce-store/gundams/:gundamId" element={<GamePage
          cart={cart}
          cartAmount={cartAmount}
          handleHover={handleHover}
          hoverState={hoverState}
          handleLike={handleLike}
          handleAddToCart={handleAddToCart}
          handleSelectGundam={handleSelectGundam}
          selectedGundam={selectedGundam}
          setSelectedGundam={setSelectedGundam}
          handleSearch={handleSearch}
          handleSearchSubmit={handleSearchSubmit}
          search={search}
          searching={searching}
          browsing={browsing}
          handleBrowse={handleBrowse}
          handleHome={handleHome}
          setHoverState={setHoverState}
          allGundams={allGundams}
          extended={extended}
          setExtended={setExtended}
          textExtended={textExtended}
          setTextExtended={setTextExtended}
          cartDisplayed={cartDisplayed}
          handleOpenCart={handleOpenCart}
          handleCloseCart={handleCloseCart}
          clearCart={clearCart}
          handleRemoveFromCart={handleRemoveFromCart}
          openGundamPage={openGundamPage}
        />} />
        <Route path="*" element={<NotFound
          cartDisplayed={cartDisplayed}
          handleCloseCart={handleCloseCart}
          handleOpenCart={handleOpenCart}
          cartAmount={cartAmount}
          clearCart={clearCart}
          hoverState={hoverState}
          handleHome={handleHome}
          handleHover={handleHover}
          cart={cart}
          browsing={browsing}
          search={search}
          searching={searching}
          handleSearch={handleSearch}
          handleSearchSubmit={handleSearchSubmit}
          handleBrowse={handleBrowse}
          handleRemoveFromCart={handleRemoveFromCart}
          openGundamPage={openGundamPage}
        />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
