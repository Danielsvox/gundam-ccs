import styles from './Footer.module.css';
import React from 'react';
import { ReactComponent as Logo } from "../../Resources/image/logo.svg";
import { ReactComponent as AppStore } from "../../Resources/image/appstorebadge.svg";
import { useTranslation } from 'react-i18next';

const Footer = props => {
  const { t } = useTranslation();

  const {

  } = props;

  return (
    <div className={styles.footer}>
      <div className={styles.footerTop}>
        <Logo className={styles.logo} />
        <h2>Gundam Ccs</h2>
      </div>
      <div className={styles.sections}>
        <div className={`${styles.section} ${styles.section1}`}>
          <h3 className={styles.first}>{t('footer.company')}</h3>
          <h3>{t('footer.about')}</h3>
          <h3>{t('footer.pressCenter')}</h3>
          <h3>{t('footer.careers')}</h3>
        </div>
        <div className={`${styles.section} ${styles.section2}`}>
          <h3 className={styles.first}>{t('footer.categories')}</h3>
          <h3>{t('footer.masterGrade')}</h3>
          <h3>{t('footer.perfectGrade')}</h3>
          <h3>{t('footer.realGrade')}</h3>
        </div>
        <div className={`${styles.section} ${styles.section3}`}>
          <h3 className={styles.first}>{t('footer.resources')}</h3>
          <h3>{t('footer.helpCenter')}</h3>
          <h3>{t('footer.contact')}</h3>
        </div>
        <div className={`${styles.section} ${styles.section4}`}>
          <h3 className={styles.first}>{t('footer.productHelp')}</h3>
          <h3>{t('footer.support')}</h3>
          <h3>{t('footer.fileABug')}</h3>
        </div>
      </div>

      <div className={styles.footerInfo}>
        <div className={styles.infoLeft}>
          <p>{t('footer.builtBy')} <a href="https://www.linkedin.com/in/carlos-daniel-441685161/" target="_blank" rel="noopener noreferrer">Carlos Daniel</a> {t('footer.withReact')}</p>
          <p>{t('footer.inspiredBy')} <span>Gundam, Bandai</span>. {t('footer.educationalPurposes')}</p>
        </div>
        <div className={styles.infoRight}>
          <img className={styles.google} src={require("../../Resources/image/googleplaybadge.png")} alt="Google Play Badge" />
          <AppStore className={styles.apple} />
        </div>
      </div>

      <div className={styles.footerEnd}>
        <div className={styles.endLeft}>
          <h4>{t('footer.privacy')}</h4>
          <h4>{t('footer.security')}</h4>
          <h4>{t('footer.cookies')}</h4>
          <h4>{t('footer.legal')}</h4>
          <h4>{t('footer.collaborativeGuidelines')}</h4>
        </div>

        <div className={styles.endRight}>
          <a href="https://www.linkedin.com/in/carlos-daniel-441685161/" target="_blank" rel="noopener noreferrer">
            <img className={styles.social} src={require("../../Resources/image/linkedin.svg")} alt="LinkedIn Logo" />
          </a>
          <a href="https://github.com/Danielsvox" target="_blank" rel="noopener noreferrer">
            <img className={styles.social} src={require("../../Resources/image/github.svg")} alt="GitHub Logo" />
          </a>
          <img className={styles.social} src={require("../../Resources/image/twitter.png")} alt="Twitter Logo" />
          <img className={styles.social} src={require("../../Resources/image/instagram.png")} alt="Instagram Logo" />
        </div>
      </div>
    </div>
  );
}

export default Footer;