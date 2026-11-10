import React from 'react';
import Icon from '../Icon/Icon';
import styles from './StateMessage.module.css';

/**
 * One component for empty / error / not-found states so they look and behave alike.
 * `tone="error"` is announced to assistive tech (role="alert"); others are plain regions.
 */
const StateMessage = ({ tone = 'neutral', title, children, actions, headingLevel = 2 }) => {
  const Heading = `h${headingLevel}`;
  return (
    <div className={`${styles.box} ${tone === 'error' ? styles.error : ''}`} role={tone === 'error' ? 'alert' : undefined}>
      {tone === 'error' && <Icon name="alert" size={28} />}
      <Heading className={styles.title}>{title}</Heading>
      {children && <p className={styles.text}>{children}</p>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
};

export default StateMessage;
