import React from 'react';
import ProductCard from '../ProductCard/ProductCard';
import styles from './ProductGrid.module.css';

export const ProductGridSkeleton = ({ count = 8 }) => (
  <ul className={styles.grid} aria-hidden="true">
    {Array.from({ length: count }, (_, i) => (
      <li key={i} className={styles.skeleton}>
        <span className={styles.skelPlate} />
        <span className={styles.skelLine} />
        <span className={`${styles.skelLine} ${styles.short}`} />
      </li>
    ))}
  </ul>
);

/** Responsive grid: 2 columns on phones, then auto-fills with a 220px minimum card. */
const ProductGrid = ({ products, eagerCount = 4, label }) => (
  <ul className={styles.grid} aria-label={label}>
    {products.map((product, index) => (
      <li key={product.id} className={styles.item}>
        <ProductCard product={product} priority={index < eagerCount} />
      </li>
    ))}
  </ul>
);

export default ProductGrid;
