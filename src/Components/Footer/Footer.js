import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Footer.module.css';

const Footer = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.about}>
          <p className={styles.brand}>{t('nav.brand')}</p>
          <p className={styles.tagline}>{t('footer.tagline')}</p>
        </div>

        <nav aria-label={t('footer.shop')}>
          <h2 className={styles.heading}>{t('footer.shop')}</h2>
          <ul className={styles.list}>
            <li><Link to="/browse">{t('footer.catalog')}</Link></li>
            {['HG', 'RG', 'MG', 'PG'].map((g) => (
              <li key={g}><Link to={`/browse?grade=${g}`}>{t(`home.grade.${g}`)}</Link></li>
            ))}
            <li><Link to="/browse?sale=1">{t('nav.onSale')}</Link></li>
          </ul>
        </nav>

        <nav aria-label={t('footer.account')}>
          <h2 className={styles.heading}>{t('footer.account')}</h2>
          <ul className={styles.list}>
            {isAuthenticated ? (
              <li><Link to="/profile">{t('nav.profile')}</Link></li>
            ) : (
              <>
                <li><Link to="/login">{t('footer.signIn')}</Link></li>
                <li><Link to="/register">{t('footer.register')}</Link></li>
              </>
            )}
          </ul>
        </nav>

        <nav aria-label={t('footer.info')}>
          <h2 className={styles.heading}>{t('footer.info')}</h2>
          <ul className={styles.list}>
            <li><Link to="/prices">{t('footer.pricesPage')}</Link></li>
          </ul>
        </nav>
      </div>
      <div className={`container ${styles.legal}`}>
        <p>{t('footer.rights', { year: new Date().getFullYear() })}</p>
        <p>{t('footer.trademark')}</p>
      </div>
    </footer>
  );
};

export default Footer;
