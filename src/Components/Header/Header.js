import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon/Icon';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import Dialog from '../Dialog/Dialog';
import LogoutModal from '../Auth/LogoutModal';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useStoreUi } from '../../contexts/StoreUiContext';
import { useInventoryRole } from '../../hooks/useInventoryRole';
import styles from './Header.module.css';

const SearchForm = ({ idSuffix }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const urlQuery = location.pathname === '/browse' ? new URLSearchParams(location.search).get('q') || '' : '';
  const [value, setValue] = useState(urlQuery);

  // Keep the box in sync with the URL (back/forward, "clear filter" chips, other entry points).
  useEffect(() => setValue(urlQuery), [urlQuery]);

  const submit = (event) => {
    event.preventDefault();
    const q = value.trim();
    navigate(q ? `/browse?q=${encodeURIComponent(q)}` : '/browse');
  };

  return (
    <form className={styles.search} role="search" onSubmit={submit}>
      <label htmlFor={`site-search-${idSuffix}`} className="sr-only">{t('nav.searchLabel')}</label>
      <input
        id={`site-search-${idSuffix}`}
        type="search"
        className={styles.searchInput}
        placeholder={t('nav.search')}
        value={value}
        maxLength={80}
        enterKeyHint="search"
        autoComplete="off"
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit" className={styles.searchButton} aria-label={t('nav.searchButton')}>
        <Icon name="search" />
      </button>
    </form>
  );
};

const AccountLinks = ({ onNavigate, variant = 'menu' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openOrders } = useStoreUi();
  const { role: inventoryRole } = useInventoryRole();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const go = (path) => { onNavigate?.(); navigate(path); };

  if (!user) {
    return (
      <button
        type="button"
        className={variant === 'menu' ? styles.menuItem : styles.iconButton}
        onClick={() => {
          localStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
          go('/login');
        }}
      >
        <Icon name="user" />
        <span className={variant === 'menu' ? undefined : styles.iconLabel}>{t('nav.user')}</span>
      </button>
    );
  }

  const name = user.first_name || user.email;
  return (
    <>
      <p className={styles.menuHeading}>{name}</p>
      <button type="button" className={styles.menuItem} onClick={() => go('/profile')}>{t('nav.profile')}</button>
      <button type="button" className={styles.menuItem} onClick={() => { onNavigate?.(); openOrders(); }}>{t('nav.orders')}</button>
      {inventoryRole && <button type="button" className={styles.menuItem} onClick={() => go('/inventario')}>{t('nav.inventory')}</button>}
      <button type="button" className={styles.menuItem} onClick={() => setLogoutOpen(true)}>{t('nav.signOut')}</button>
      <LogoutModal
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onLogoutSuccess={() => { setLogoutOpen(false); onNavigate?.(); }}
      />
    </>
  );
};

const UserDropdown = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) {
    return (
      <button
        type="button"
        className={styles.iconButton}
        onClick={() => {
          localStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
          navigate('/login');
        }}
      >
        <Icon name="user" />
        <span className={styles.iconLabel}>{t('nav.user')}</span>
      </button>
    );
  }

  return (
    <div className={styles.dropdown} ref={wrapRef}>
      <button
        type="button"
        className={styles.iconButton}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="user" />
        <span className={styles.iconLabel}>{user.first_name || t('nav.account')}</span>
        <Icon name="chevronDown" size={14} />
      </button>
      {open && (
        <div className={styles.dropdownPanel}>
          <AccountLinks onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const { t } = useTranslation();
  const { count, openDrawer } = useCart();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu when navigating.
  useEffect(() => setMenuOpen(false), [location.pathname, location.search]);

  const cartLabel = t('nav.cartLabel', { count });

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <button
          type="button"
          className={`${styles.iconButton} ${styles.menuToggle}`}
          aria-label={t('nav.openMenu')}
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <Icon name="menu" />
        </button>

        <Link to="/" className={styles.brand} aria-label={`${t('nav.brand')}`}>
          <span className={styles.brandMark} aria-hidden="true" />
          <span className={styles.brandText}>{t('nav.brand')}</span>
        </Link>

        <nav className={styles.nav} aria-label={t('nav.primary')}>
          <NavLink to="/browse" end className={({ isActive }) => `${styles.navLink} ${isActive ? styles.current : ''}`}>
            {t('nav.catalog')}
          </NavLink>
          <Link to="/browse?sale=1" className={styles.navLink}>{t('nav.onSale')}</Link>
        </nav>

        <div className={styles.searchDesktop}><SearchForm idSuffix="d" /></div>

        <div className={styles.actions}>
          <div className={styles.desktopOnly}><LanguageSwitcher /></div>
          <div className={styles.desktopOnly}><UserDropdown /></div>
          <button type="button" className={styles.cartButton} onClick={openDrawer} aria-label={cartLabel}>
            <Icon name="cart" />
            <span className={styles.cartCount} aria-hidden="true" data-testid="cart-count">{count}</span>
          </button>
        </div>
      </div>

      <div className={`container ${styles.searchMobile}`}><SearchForm idSuffix="m" /></div>

      <Dialog open={menuOpen} onClose={() => setMenuOpen(false)} title={t('nav.menu')} placement="right">
        <nav className={styles.menu} aria-label={t('nav.primary')}>
          <Link to="/browse" className={styles.menuItem}>{t('nav.allKits')}</Link>
          <Link to="/browse?sale=1" className={styles.menuItem}>{t('nav.onSale')}</Link>
          <p className={styles.menuHeading}>{t('nav.grades')}</p>
          {['HG', 'RG', 'MG', 'PG'].map((g) => (
            <Link key={g} to={`/browse?grade=${g}`} className={styles.menuItem}>{t(`home.grade.${g}`)} <span className="tag">{g}</span></Link>
          ))}
          <p className={styles.menuHeading}>{t('nav.account')}</p>
          <AccountLinks onNavigate={() => setMenuOpen(false)} />
          <p className={styles.menuHeading}>{t('language.label')}</p>
          <LanguageSwitcher />
        </nav>
      </Dialog>
    </header>
  );
};

export default Header;
