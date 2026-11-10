import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProductGrid, { ProductGridSkeleton } from '../../Components/ProductGrid/ProductGrid';
import StateMessage from '../../Components/StateMessage/StateMessage';
import productService from '../../services/productService';
import { useLoad } from '../../hooks/useLoad';
import { useDocumentTitle } from '../../hooks/hooks';
import logo from '../../Resources/image/logo-gc.png';
import styles from './Home.module.css';

// Typical scale per grade line (general Gunpla convention, shown as "typically"; each product shows its own scale).
const GRADES = [
  { code: 'HG', scale: '1/144' },
  { code: 'RG', scale: '1/144' },
  { code: 'MG', scale: '1/100' },
  { code: 'PG', scale: '1/60' },
];

const ProductSection = ({ title, seeAllTo, state, hideWhenEmpty = false }) => {
  const { t } = useTranslation();
  if (state.status === 'ready' && hideWhenEmpty && !state.data?.length) return null;
  return (
    <section className={`container ${styles.section}`} aria-labelledby={`h-${title}`}>
      <div className={styles.sectionHead}>
        <h2 id={`h-${title}`}>{t(title)}</h2>
        <Link to={seeAllTo} className={styles.seeAll}>{t('home.latestAll')}</Link>
      </div>
      {state.status === 'error' ? (
        <StateMessage tone="error" title={t('catalog.errorTitle')} actions={<button type="button" className="btn" onClick={state.reload}>{t('common.retry')}</button>}>
          {t('errors.network')}
        </StateMessage>
      ) : state.data ? (
        <ProductGrid products={state.data} eagerCount={0} />
      ) : (
        <ProductGridSkeleton count={4} />
      )}
    </section>
  );
};

const Home = () => {
  const { t } = useTranslation();
  useDocumentTitle('');

  const facets = useLoad((signal) => productService.getFacets(signal), 'facets');
  const latest = useLoad((signal) => productService.getLatest(8, signal), 'latest');
  const sale = useLoad((signal) => productService.getOnSale(4, signal), 'sale');

  const gradeCount = (code) => facets.data?.grades?.find((g) => g.value === code)?.count;

  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{t('home.eyebrow')}</p>
            <h1 id="hero-title" className={styles.title}>{t('home.title')}</h1>
            <p className={styles.subtitle}>{t('home.subtitle')}</p>
            <div className={styles.cta}>
              <Link to="/browse" className="btn btn-primary">{t('home.browse')}</Link>
              <Link to="/browse?sale=1" className="btn">{t('home.saleCta')}</Link>
            </div>
          </div>
          <div className={styles.logoCard}>
            <img src={logo} alt="Gundam Caracas — El mejor hobby" width="640" height="640" />
          </div>
        </div>
      </section>

      <section className={`container ${styles.perksWrap}`} aria-label={t('nav.brand')}>
        <ul className={styles.perks}>
          {['pago', 'whatsapp', 'lines'].map((k) => (
            <li key={k} className={styles.perk}>
              <h2>{t(`home.perks.${k}.title`)}</h2>
              <p>{t(`home.perks.${k}.body`)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={`container ${styles.section}`} aria-labelledby="grades-title">
        <h2 id="grades-title">{t('home.gradesTitle')}</h2>
        <p className={styles.intro}>{t('home.gradesIntro')}</p>
        <ul className={styles.grades}>
          {GRADES.map(({ code, scale }) => {
            const count = gradeCount(code);
            return (
              <li key={code}>
                <Link to={`/browse?grade=${code}`} className={styles.grade}>
                  <span className={styles.gradeCode}>{code}</span>
                  <span className={styles.gradeName}>{t(`home.grade.${code}`)}</span>
                  <span className={styles.gradeNote}>{t(`home.gradeNote.${code}`)}</span>
                  <span className={styles.gradeMeta}>
                    {t('home.typicalScale', { scale })}
                    {typeof count === 'number' && <> · {t('home.kitsCount', { count })}</>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <ProductSection title="home.latestTitle" seeAllTo="/browse" state={{ ...latest, reload: latest.reload }} />
      <ProductSection title="home.saleTitle" seeAllTo="/browse?sale=1" state={{ ...sale, reload: sale.reload }} hideWhenEmpty />

      <section className={`container ${styles.section}`} aria-labelledby="how-title">
        <h2 id="how-title">{t('home.howTitle')}</h2>
        <ol className={styles.steps}>
          {[1, 2, 3].map((n) => (
            <li key={n} className={styles.step}>
              <span className={styles.stepNo} aria-hidden="true">{String(n).padStart(2, '0')}</span>
              <h3>{t(`home.step${n}Title`)}</h3>
              <p>{t(`home.step${n}Body`)}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className={`container ${styles.section} ${styles.lastSection}`} aria-labelledby="cta-title">
        <div className={styles.band}>
          <div>
            <h2 id="cta-title">{t('home.ctaTitle')}</h2>
            <p>{t('home.ctaBody')}</p>
          </div>
          <Link to="/browse" className="btn btn-primary">{t('home.browse')}</Link>
        </div>
      </section>
    </>
  );
};

export default Home;
